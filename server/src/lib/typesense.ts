// Typesense — powers search and faceted filtering for listings.
// `admin` client (write key) is used to index documents and manage collections.
// The browser gets a scoped search-only key (see /api/search/key) and queries
// Typesense directly for instant results.
import Typesense from 'typesense';
import { env } from '../config/env.js';

export const typesense = new Typesense.Client({
  nodes: [
    {
      host: env.TYPESENSE_HOST,
      port: env.TYPESENSE_PORT,
      protocol: env.TYPESENSE_PROTOCOL,
    },
  ],
  apiKey: env.TYPESENSE_ADMIN_API_KEY,
  connectionTimeoutSeconds: 5,
});

export const LISTINGS_COLLECTION = 'listings';

/** Upsert a single listing document into the search index. */
export async function indexListing(doc: Record<string, unknown> & { id: string }) {
  return typesense.collections(LISTINGS_COLLECTION).documents().upsert(doc);
}

/** Remove a listing from the index (on delete / sold / expired). */
export async function removeListingFromIndex(id: string) {
  return typesense
    .collections(LISTINGS_COLLECTION)
    .documents(id)
    .delete()
    .catch(() => undefined); // ignore "not found"
}

/**
 * Mint a scoped, search-only API key the browser can use directly. Optionally
 * lock the user into a filter (e.g. platform=avto) so they can't query the
 * other portal's data.
 */
export async function createScopedSearchKey(filterBy?: string) {
  // (#8) Scoped key: short TTL + embedded filters baked into the key itself, so
  // even if a key leaks it expires fast AND can only ever see the allowed slice
  // (e.g. one platform, active listings only). 15-minute TTL; the browser
  // refreshes transparently.
  const embeddedFilters = [filterBy, 'status:=active'].filter(Boolean).join(' && ');
  return typesense.keys().generateScopedSearchKey(env.TYPESENSE_SEARCH_ONLY_API_KEY, {
    filter_by: embeddedFilters,
    expires_at: Math.floor(Date.now() / 1000) + 15 * 60, // 15 minutes
  });
}
