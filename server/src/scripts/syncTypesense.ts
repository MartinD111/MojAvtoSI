// One-shot script: (re)create the Typesense `listings` collection and backfill
// it from Supabase. Run after schema changes or to rebuild the index:
//   npm run typesense:sync
import { typesense, LISTINGS_COLLECTION, indexListing } from '../lib/typesense.js';
import { supabaseAdmin } from '../lib/supabase.js';

const schema = {
  name: LISTINGS_COLLECTION,
  fields: [
    { name: 'platform', type: 'string' as const, facet: true },
    { name: 'itemType', type: 'string' as const, facet: true },
    { name: 'title', type: 'string' as const },
    { name: 'description', type: 'string' as const, optional: true },
    { name: 'brand', type: 'string' as const, facet: true, optional: true },
    { name: 'model', type: 'string' as const, facet: true, optional: true },
    { name: 'year', type: 'int32' as const, facet: true, optional: true },
    { name: 'price', type: 'int64' as const, facet: true, optional: true },
    { name: 'status', type: 'string' as const, facet: true },
    { name: 'createdAt', type: 'int64' as const },
  ],
  default_sorting_field: 'createdAt',
};

async function main() {
  await typesense.collections(LISTINGS_COLLECTION).delete().catch(() => undefined);
  await typesense.collections().create(schema);
  console.log(`✓ collection ${LISTINGS_COLLECTION} created`);

  const { data, error } = await supabaseAdmin
    .from('listings')
    .select('*')
    .eq('status', 'active');
  if (error) throw error;

  for (const row of data ?? []) {
    await indexListing({
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
      createdAt: row.created_at ? Math.floor(new Date(row.created_at).getTime() / 1000) : 0,
    });
  }
  console.log(`✓ indexed ${data?.length ?? 0} listings`);
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
