// Thin fetch wrapper for the Fastify API. Automatically attaches the Supabase
// access token and surfaces API errors as thrown Errors with a .status.
import { ENV } from './env.js';
import { getAccessToken } from './supabase.js';

async function request(path, { method = 'GET', body, auth = true, headers = {} } = {}) {
  const h = { ...headers };
  if (body !== undefined) h['Content-Type'] = 'application/json';
  if (auth) {
    const token = await getAccessToken();
    if (token) h['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${ENV.apiBaseUrl}${path}`, {
    method,
    headers: h,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const err = new Error(data?.error || `API ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
};
