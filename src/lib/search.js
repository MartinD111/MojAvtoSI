// Typesense search client for the browser. Gets a short-lived, search-only,
// platform-scoped key from the API, then queries Typesense directly for instant
// results. The key is cached in-memory and refreshed when it expires.
import Typesense from 'typesense';
import { ENV } from './env.js';
import { api } from './apiClient.js';

let client = null;
let keyFetchedAt = 0;
const KEY_TTL_MS = 13 * 60 * 1000; // refresh before the 15-min server key expiry

async function getClient() {
  const fresh = client && Date.now() - keyFetchedAt < KEY_TTL_MS;
  if (fresh) return client;

  // Scoped key locked to the active platform (avto/navtika).
  const { apiKey } = await api.get(`/api/search/key?platform=${ENV.platform}`, { auth: false });
  client = new Typesense.Client({
    nodes: [{ host: ENV.typesense.host, port: ENV.typesense.port, protocol: ENV.typesense.protocol }],
    apiKey,
    connectionTimeoutSeconds: 5,
  });
  keyFetchedAt = Date.now();
  return client;
}

/**
 * Search listings.
 * @param {{ q?: string, filterBy?: string, sortBy?: string, page?: number, perPage?: number }} opts
 */
export async function searchListings({ q = '*', filterBy, sortBy, page = 1, perPage = 24 } = {}) {
  const ts = await getClient();
  return ts.collections('listings').documents().search({
    q,
    query_by: 'title,brand,model,description',
    ...(filterBy ? { filter_by: filterBy } : {}),
    ...(sortBy ? { sort_by: sortBy } : {}),
    page,
    per_page: perPage,
  });
}
