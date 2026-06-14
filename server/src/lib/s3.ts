// AWS S3 — PRIVATE system storage: generated invoices/PDFs, data exports,
// CSV imports, backups. Not public; access is always via short-lived presigned
// GET URLs. (Public images live in R2 instead — see r2.ts.)
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env.js';

export const s3 = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

/** Upload a private object (e.g. an invoice PDF generated server-side). */
export async function putPrivateObject(opts: {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType: string;
}) {
  await s3.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: opts.key,
      Body: opts.body,
      ContentType: opts.contentType,
    }),
  );
  return { key: opts.key };
}

/** Short-lived download URL for a private object. */
export async function getPrivateDownloadUrl(key: string, expiresInSeconds = 300) {
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: key }),
    { expiresIn: expiresInSeconds },
  );
}
