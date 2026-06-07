# -*- coding: utf-8 -*-
"""
Builds public/json/brands_models_plovila.json from the admin Excel export
(taksonomija_plovila_*.xlsx, 5 SL columns: Znamka, Model, Različica, Vrsta, Kategorija).

Output structure (back-compatible with parseTaxData / getModelVariants):
  { Brand: { Model: { type: <Vrsta>, category: <Kategorija>, variants: [ { trim } ] } } }
"""
import json, sys
from collections import OrderedDict
import pandas as pd

SRC = sys.argv[1] if len(sys.argv) > 1 else \
    r"C:/Users/marti/OneDrive/Desktop/Vehicle Taxonomy/taksonomija_plovila_2026-06-06.xlsx"
OUT = sys.argv[2] if len(sys.argv) > 2 else \
    r"c:/Users/marti/AMS d.o.o/MojAvto.si/public/json/brands_models_plovila.json"

df = pd.read_excel(SRC, header=0)
df = df.fillna('')
for c in df.columns:
    df[c] = df[c].astype(str).str.strip()

# Normalise column names to lowercase-ascii keys
col_map = {}
for c in df.columns:
    cl = c.lower().strip()
    if 'znamka' in cl:       col_map[c] = 'znamka'
    elif 'model' in cl:      col_map[c] = 'model'
    elif 'razli' in cl:      col_map[c] = 'razlicica'
    elif 'vrsta' in cl:      col_map[c] = 'vrsta'
    elif 'kateg' in cl:      col_map[c] = 'kategorija'
df = df.rename(columns=col_map)

required = {'znamka', 'model'}
for r in required:
    if r not in df.columns:
        sys.exit(f"Missing required column: {r} (got {list(df.columns)})")

raw_count = len(df)
df = df.drop_duplicates()
deduped_count = len(df)

data = OrderedDict()
for _, r in df.iterrows():
    brand = str(r.get('znamka', '')).strip()
    model = str(r.get('model', '')).strip()
    if not brand or not model:
        continue
    trim      = str(r.get('razlicica', '')).strip() or model
    vrsta     = str(r.get('vrsta',     '')).strip() or None
    kategorija = str(r.get('kategorija', '')).strip() or None

    brand_d = data.setdefault(brand, OrderedDict())
    if model not in brand_d:
        brand_d[model] = OrderedDict([
            ('type',     vrsta),
            ('category', kategorija),
            ('variants', []),
        ])
    if vrsta and not brand_d[model]['type']:
        brand_d[model]['type'] = vrsta
    if kategorija and not brand_d[model]['category']:
        brand_d[model]['category'] = kategorija
    if not any(v['trim'] == trim for v in brand_d[model]['variants']):
        brand_d[model]['variants'].append(OrderedDict([('trim', trim)]))

out = OrderedDict()
for brand in sorted(data, key=str.lower):
    out[brand] = OrderedDict()
    for model in sorted(data[brand], key=str.lower):
        out[brand][model] = data[brand][model]

with open(OUT, 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=2)

n_models   = sum(len(v) for v in out.values())
n_variants = sum(len(m['variants']) for b in out.values() for m in b.values())
print('Raw rows           :', raw_count)
print('After exact dedupe :', deduped_count, '(removed %d)' % (raw_count - deduped_count))
print('Brands             :', len(out))
print('Models             :', n_models)
print('Variants           :', n_variants)
