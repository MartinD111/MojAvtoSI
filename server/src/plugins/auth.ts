// Auth plugin: reads the Bearer token, verifies it, and decorates the request
// with `request.user`. Routes call `app.requireAuth` (a preHandler) to enforce a
// signed-in caller. Anonymous requests pass through so public endpoints keep
// working; protected routes opt in.
//
// JWT verification (#7): when SUPABASE_JWT_SECRET is set we verify LOCALLY with
// jose, pinning `algorithms: ['HS256']`. This is the security-critical bit — a
// fixed allow-list makes the "alg: none" downgrade and RS/HS confusion attacks
// impossible (jose rejects any token whose header alg isn't in the list). It's
// also faster (no network round-trip). Fallback to Supabase's getUser() only
// when the secret isn't configured.
import fp from 'fastify-plugin';
import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { jwtVerify } from 'jose';
import { supabaseAdmin } from '../lib/supabase.js';
import { env } from '../config/env.js';

export interface AuthUser {
  id: string;
  email: string | null;
  isAdmin: boolean;
}

declare module 'fastify' {
  interface FastifyRequest {
    user: AuthUser | null;
    accessToken: string | null;
  }
  interface FastifyInstance {
    requireAuth: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireAdmin: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

const jwtSecret = env.SUPABASE_JWT_SECRET
  ? new TextEncoder().encode(env.SUPABASE_JWT_SECRET)
  : null;

interface SupabaseClaims {
  sub: string;
  email?: string;
  app_metadata?: { role?: string; is_admin?: boolean };
}

function claimsToUser(c: SupabaseClaims): AuthUser {
  return {
    id: c.sub,
    email: c.email ?? null,
    isAdmin: c.app_metadata?.role === 'admin' || c.app_metadata?.is_admin === true,
  };
}

async function verifyToken(token: string): Promise<AuthUser | null> {
  if (jwtSecret) {
    try {
      const { payload } = await jwtVerify(token, jwtSecret, {
        algorithms: ['HS256'], // STRICT allow-list — rejects "none", RS256, etc.
      });
      if (!payload.sub) return null;
      return claimsToUser(payload as unknown as SupabaseClaims);
    } catch {
      return null; // bad signature / expired / wrong alg → anonymous
    }
  }
  // Fallback: ask Supabase (network) when no local secret is configured.
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  return {
    id: data.user.id,
    email: data.user.email ?? null,
    isAdmin:
      data.user.app_metadata?.role === 'admin' ||
      data.user.app_metadata?.is_admin === true,
  };
}

const plugin: FastifyPluginAsync = async (app) => {
  app.decorateRequest('user', null);
  app.decorateRequest('accessToken', null);

  app.addHook('onRequest', async (req) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return;
    const token = header.slice('Bearer '.length);
    const user = await verifyToken(token);
    if (!user) return;
    req.accessToken = token;
    req.user = user;
  });

  app.decorate('requireAuth', async (req: FastifyRequest, reply: FastifyReply) => {
    if (!req.user) {
      reply.code(401).send({ error: 'Authentication required', statusCode: 401 });
    }
  });

  app.decorate('requireAdmin', async (req: FastifyRequest, reply: FastifyReply) => {
    if (!req.user) {
      return reply.code(401).send({ error: 'Authentication required', statusCode: 401 });
    }
    if (!req.user.isAdmin) {
      reply.code(403).send({ error: 'Admin only', statusCode: 403 });
    }
  });
};

export const authPlugin = fp(plugin, { name: 'auth' });
