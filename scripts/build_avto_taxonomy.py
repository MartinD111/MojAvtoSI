# -*- coding: utf-8 -*-
"""
Builds public/json/brands_models_global.json from the admin Excel export
(taksonomija_avto_*.xlsx, 5 columns: Make, Model, Trim, Fuel Type, Engine Capacity (cc)).

Keeps the existing, widely-consumed car structure unchanged:
    { Brand: { Model: [ trim, trim, ... ] } }
(plain array of trim strings — fuel/cc are NOT stored here; they flow into the
collection via the admin Excel import path). Cleaning:
  - Drop exact full-row duplicates.
  - Drop duplicate trims within a model (keep first, preserve order).
  - Sort brands & models alphabetically (case-insensitive) for stable diffs.
"""
import json, sys, os
from collections import OrderedDict
import pandas as pd

SRC = sys.argv[1] if len(sys.argv) > 1 else \
    os.path.join(os.environ.get('TEMP', '.'), 'avto_tax.xlsx')
OUT = sys.argv[2] if len(sys.argv) > 2 else \
    r"c:/Users/marti/AMS d.o.o/MojAvto.si/public/json/brands_models_global.json"

df = pd.read_excel(SRC, header=0)
df.columns = ['make', 'model', 'trim', 'fuel', 'cc']
df = df.fillna('')
for c in df.columns:
    df[c] = df[c].astype(str).str.strip()

raw = len(df)
df = df.drop_duplicates()
deduped = len(df)

data = OrderedDict()
dropped_trims = 0
for _, r in df.iterrows():
    brand = r['make'].strip()
    model = r['model'].strip()
    trim = r['trim'].strip() or model
    if not brand or not model:
        continue
    brand_d = data.setdefault(brand, OrderedDict())
    trims = brand_d.setdefault(model, [])
    if trim in trims:
        dropped_trims += 1
        continue
    trims.append(trim)

out = OrderedDict()
for brand in sorted(data, key=str.lower):
    out[brand] = OrderedDict()
    for model in sorted(data[brand], key=str.lower):
        out[brand][model] = data[brand][model]

with open(OUT, 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=2)

n_models = sum(len(v) for v in out.values())
n_trims = sum(len(t) for b in out.values() for t in b.values())
print('Raw rows           :', raw)
print('After exact dedupe :', deduped, '(removed %d)' % (raw - deduped))
print('Duplicate trims dropped:', dropped_trims)
print('Brands             :', len(out))
print('Models             :', n_models)
print('Trims              :', n_trims)
