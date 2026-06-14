// Search endpoints. The heavy lifting (typeahead, facets) happens in the browser
// talking to Typesense directly with a short-lived scoped key minted here. A
// server-side /search proxy is also provided for SSR / non-browser callers.
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { typesense, LISTINGS_COLLECTION, createScopedSearchKey } from '../lib/typesense.js';

export const searchRoutes: FastifyPluginAsync = async (app) => {
  // Hand the browser a scoped, search-only key locked to one platform.
  app.get('/search/key', async (req) => {
    const { platform } = z
      .object({ platform: z.enum(['avto', 'navtika']).optional() })
      .parse(req.query);
    const key = await createScopedSearchKey(platform ? `platform:=${platform}` : undefined);
    return { apiKey: key, collection: LISTINGS_COLLECTION };
  });

  // Server-side search proxy.
  app.get('/search', async (req) => {
    const params = z
      .object({
        q: z.string().default('*'),
        platform: z.enum(['avto', 'navtika']).optional(),
        filter_by: z.string().optional(),
        sort_by: z.string().optional(),
        page: z.coerce.number().default(1),
        per_page: z.coerce.number().max(50).default(24),
      })
      .parse(req.query);

    const filters = [
      params.platform ? `platform:=${params.platform}` : null,
      params.filter_by ?? null,
    ]
      .filter(Boolean)
      .join(' && ');

    return typesense
      .collections(LISTINGS_COLLECTION)
      .documents()
      .search({
        q: params.q,
        query_by: 'title,brand,model,description',
        ...(filters ? { filter_by: filters } : {}),
        ...(params.sort_by ? { sort_by: params.sort_by } : {}),
        page: params.page,
        per_page: params.per_page,
      });
  });
};
