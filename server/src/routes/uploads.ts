// Presigned upload endpoints. The browser asks for a URL, then PUTs the file
// bytes straight to R2 (public images) or S3 (private docs). Keeps large
// payloads off the API and out of Fargate's memory.
//
// Hardening: very low per-IP rate limit (#9), ownership checks so a user can't
// mint upload URLs against someone else's listing/business (#2 IDOR), and
// `.strip()` schemas to drop unknown keys / block prototype pollution (#10).
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { createImageUploadUrl } from '../lib/r2.js';
import { getPrivateDownloadUrl } from '../lib/s3.js';
import { assertOwner } from '../lib/ownership.js';
import { enforceIpLimit, ipUploadLimiter } from '../plugins/rateLimit.js';

const imageBody = z
  .object({
    scope: z.enum(['listing', 'business', 'avatar']),
    ownerId: z.string().min(1).max(64),
    contentType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
    ext: z.enum(['jpg', 'png', 'webp', 'avif']).default('webp'),
  })
  .strip(); // drop any unexpected keys (incl. __proto__ vectors)

export const uploadRoutes: FastifyPluginAsync = async (app) => {
  // Public image upload → R2. Auth + low per-IP limit + ownership.
  app.post('/uploads/image', { preHandler: app.requireAuth }, async (req) => {
    await enforceIpLimit(ipUploadLimiter, req.ip); // throws 429 on limit
    const { scope, ownerId, contentType, ext } = imageBody.parse(req.body);
    const uid = req.user!.id;

    // The caller must own the thing they're uploading for.
    if (scope === 'listing') await assertOwner('listings', ownerId, uid);
    else if (scope === 'business') await assertOwner('businesses', ownerId, uid);
    else if (ownerId !== uid) {
      throw Object.assign(new Error('Dostop zavrnjen'), { statusCode: 403 }); // avatar
    }

    const key = `${scope}s/${ownerId}/${randomUUID()}.${ext}`;
    return createImageUploadUrl({ key, contentType });
  });

  // Private system file download (e.g. an invoice the user owns) → S3.
  app.get('/uploads/private-url', { preHandler: app.requireAuth }, async (req) => {
    const { key } = z.object({ key: z.string().min(1).max(256) }).strip().parse(req.query);
    // Only allow keys scoped to this user's own prefix (no traversal to others').
    if (!key.startsWith(`users/${req.user!.id}/`)) {
      throw Object.assign(new Error('Dostop zavrnjen'), { statusCode: 403 });
    }
    return { url: await getPrivateDownloadUrl(key) };
  });
};
