// Listings — the core marketplace resource. Reads are public; writes require
// auth and are mirrored into the Typesense search index. This is a thin
// scaffold: business rules (boost expiry, auction close) will move here from the
// old Firestore/client logic during migration.
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { supabaseAdmin, supabaseForUser } from '../lib/supabase.js';
import { indexListing, removeListingFromIndex } from '../lib/typesense.js';
import { writeLimiter } from '../plugins/rateLimit.js';
import { assertOwner } from '../lib/ownership.js';
import { audit } from '../lib/audit.js';
import { boundedText, LIMITS } from '../lib/validation.js';
import { isProd } from '../config/env.js';

// `.strip()` drops unknown keys (#10 — blocks prototype-pollution / mass-assign).
const listingInput = z
  .object({
    platform: z.enum(['avto', 'navtika']),
    itemType: z.enum(['vehicle', 'parts', 'auction', 'oprema']).default('vehicle'),
    title: boundedText(3, LIMITS.listingTitle),
    description: boundedText(0, LIMITS.listingDescription).optional(),
    brand: z.string().max(60).optional(),
    model: z.string().max(60).optional(),
    year: z.number().int().min(1900).max(2100).optional(),
    price: z.number().nonnegative().max(100_000_000).optional(),
    images: z.array(z.string().url()).max(40).default([]),
    data: z.record(z.unknown()).default({}), // category-specific fields
  })
  .strip();

// Build the flat document Typesense indexes from a listing row.
function toSearchDoc(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    platform: row.platform,
    itemType: row.item_type,
    title: row.title,
    description: row.description ?? '',
    brand: row.brand ?? '',
    model: row.model ?? '',
    year: row.year ?? 0,
    price: row.price ?? 0,
    status: row.status ?? 'active',
    createdAt: row.created_at ? Math.floor(new Date(row.created_at as string).getTime() / 1000) : 0,
  };
}

export const listingRoutes: FastifyPluginAsync = async (app) => {
  // Public: single listing.
  app.get('/listings/:id', async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const { data, error } = await supabaseAdmin
      .from('listings')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) return reply.code(404).send({ error: 'Not found', statusCode: 404 });
    return data;
  });

  // Create a listing (auth). Writes to Supabase, then indexes for search.
  app.post('/listings', { preHandler: app.requireAuth }, async (req, reply) => {
    if (isProd) {
      const { success } = await writeLimiter.limit(req.user!.id);
      if (!success) return reply.code(429).send({ error: 'Too many requests', statusCode: 429 });
    }
    const input = listingInput.parse(req.body);
    const db = supabaseForUser(req.accessToken!); // RLS enforces owner_id = auth.uid()
    const { data, error } = await db
      .from('listings')
      .insert({
        owner_id: req.user!.id,
        platform: input.platform,
        item_type: input.itemType,
        title: input.title,
        description: input.description,
        brand: input.brand,
        model: input.model,
        year: input.year,
        price: input.price,
        images: input.images,
        data: input.data,
        status: 'active',
      })
      .select('*')
      .single();
    if (error) return reply.code(400).send({ error: error.message, statusCode: 400 });
    await indexListing(toSearchDoc(data));
    return reply.code(201).send(data);
  });

  // Delete (auth). Explicit ownership check (#2 IDOR) on top of RLS, then audit.
  app.delete('/listings/:id', { preHandler: app.requireAuth }, async (req, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).strip().parse(req.params);
    await assertOwner('listings', id, req.user!.id); // throws 403/404

    const db = supabaseForUser(req.accessToken!);
    const { error } = await db.from('listings').delete().eq('id', id);
    if (error) return reply.code(400).send({ error: error.message, statusCode: 400 });

    await removeListingFromIndex(id);
    await audit({ actorId: req.user!.id, action: 'listing.delete', targetType: 'listing', targetId: id });
    return reply.code(204).send();
  });
};
