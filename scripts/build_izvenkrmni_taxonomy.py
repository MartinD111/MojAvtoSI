# -*- coding: utf-8 -*-
"""
Builds public/json/brands_models_izvenkrmni.json from the admin Excel export
(taksonomija_izvenkrmni_*.xlsx, 4 SL columns: Znamka, Model, KM, Razlicica).

Outboard motors are products: each model carries a horsepower (KM) per variant
rather than a vessel body-type.

Output structure (back-compatible with parseTaxData / getModelVariants):
  { Brand: { Model: { type: null, variants: [ { trim, horsepower_km } ] } } }

horsepower_km is an int when numeric (e.g. 40); left off when blank or
non-numeric (e.g. an electric "Spirit 1.0" with KM "Električni").
"""
import json, sys
from collections import OrderedDict
import pandas as pd

SRC = sys.argv[1] if len(sys.argv) > 1 else \
    r"C:/Users/marti/OneDrive/Desktop/Vehicle Taxonomy/taksonomija_izvenkrmni_2026-06-06.xlsx"
OUT = sys.argv[2] if len(sys.argv) > 2 else \
    r"c:/Users/marti/AMS d.o.o/MojAvto.si/public/json/brands_models_izvenkrmni.json"

df = pd.read_excel(SRC, header=0)
df.columns = ['znamka', 'model', 'km', 'razlicica'][:len(df.columns)]
df = df.fillna('')
for c in df.columns:
    df[c] = df[c].astype(str).str.strip()

raw_count = len(df)
df = df.drop_duplicates()
deduped_count = len(df)


def to_km(val):
    s = str(val).strip().replace(',', '.')
    try:
        n = float(s)
        if n <= 0:
            return None
        return int(round(n))
    except ValueError:
        return None


data = OrderedDict()
for _, r in df.iterrows():
    brand = r['znamka'].strip()
    model = r['model'].strip()
    if not brand or not model:
        continue
    trim = (r.get('razlicica', '') or '').strip() or model
    km = to_km(r.get('km', ''))

    variant = OrderedDict([('trim', trim)])
    if km is not None:
        variant['horsepower_km'] = km

    brand_d = data.setdefault(brand, OrderedDict())
    if model not in brand_d:
        brand_d[model] = OrderedDict([('type', None), ('variants', [])])
    if not any(v['trim'] == trim and v.get('horsepower_km') == variant.get('horsepower_km')
               for v in brand_d[model]['variants']):
        brand_d[model]['variants'].append(variant)

# sort brands & models alphabetically for stable diffs
out = OrderedDict()
for brand in sorted(data, key=str.lower):
    out[brand] = OrderedDict()
    for model in sorted(data[brand], key=str.lower):
        out[brand][model] = data[brand][model]

with open(OUT, 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=2)

n_models = sum(len(v) for v in out.values())
n_variants = sum(len(m['variants']) for b in out.values() for m in b.values())
print('Raw rows           :', raw_count)
print('After exact dedupe :', deduped_count, '(removed %d)' % (raw_count - deduped_count))
print('Brands             :', len(out))
print('Models             :', n_models)
print('Variants           :', n_variants)
