// Image uploads → Cloudflare R2 via presigned URLs minted by the API.
// Flow: ask the API for a URL → PUT the file straight to R2 → use the returned
// public CDN URL. Bytes never pass through our server.
import { api } from './apiClient.js';

const EXT_BY_TYPE = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

/**
 * Upload one image file.
 * @param {File} file
 * @param {{ scope: 'listing'|'business'|'avatar', ownerId: string }} opts
 * @returns {Promise<string>} the public CDN URL of the uploaded image
 */
export async function uploadImage(file, { scope, ownerId }) {
  const ext = EXT_BY_TYPE[file.type];
  if (!ext) throw new Error(`Unsupported image type: ${file.type}`);

  const { uploadUrl, publicUrl } = await api.post('/api/uploads/image', {
    scope,
    ownerId,
    contentType: file.type,
    ext,
  });

  const put = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  if (!put.ok) throw new Error('Upload to storage failed');

  return publicUrl;
}

/** Upload many images, preserving order. */
export function uploadImages(files, opts) {
  return Promise.all(Array.from(files).map((f) => uploadImage(f, opts)));
}
