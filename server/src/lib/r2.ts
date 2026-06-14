// Cloudflare R2 — public image storage (listing photos, business logos/covers).
// R2 is S3-compatible, so we use the AWS SDK pointed at the R2 endpoint.
// Browser uploads go DIRECT to R2 via short-lived presigned PUT URLs; the API
// never proxies image bytes.
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env.js';

export const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]);

/**
 * Create a presigned PUT URL for a direct browser → R2 upload.
 * Returns the upload URL and the eventual public CDN URL of the object.
 */
export async function createImageUploadUrl(opts: {
  key: string; // e.g. listings/<id>/<uuid>.webp
  contentType: string;
  expiresInSeconds?: number;
}) {
  if (!ALLOWED_IMAGE_TYPES.has(opts.contentType)) {
    throw Object.assign(new Error('Unsupported image type'), { statusCode: 400 });
  }
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET,
    Key: opts.key,
    ContentType: opts.contentType,
  });
  const uploadUrl = await getSignedUrl(r2, command, {
    expiresIn: opts.expiresInSeconds ?? 300,
  });
  return {
    uploadUrl,
    publicUrl: `${env.R2_PUBLIC_BASE_URL.replace(/\/$/, '')}/${opts.key}`,
    key: opts.key,
  };
}

export async function deleteImage(key: string) {
  await r2.send(new DeleteObjectCommand({ Bucket: env.R2_BUCKET, Key: key }));
}
