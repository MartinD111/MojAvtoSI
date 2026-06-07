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
    seen_trims = brand_d.setdefault(model + '_seen', set())
    trims = brand_d.setdefault(model, [])
    
    if trim in seen_trims:
        dropped_trims += 1
        continue
    
    seen_trims.add(trim)
    
    variant = { 'trim': trim }
    fuel = r['fuel'].strip()
    if fuel:
        fuel_lower = fuel.lower()
        fuel_map = {
            'phev': 'Plug-in Hybrid', 'plug-in hybrid': 'Plug-in Hybrid', 'plugin hybrid': 'Plug-in Hybrid',
            'petrol/oil': 'Petrol', 'petrol': 'Petrol', 'bencin': 'Petrol', 'gasoline': 'Petrol',
            'diesel': 'Diesel', 'dizel': 'Diesel',
            'electric': 'Electric', 'električni': 'Electric', 'elektricni': 'Electric', 'ev': 'Electric',
            'hybrid': 'Hybrid', 'hibrid': 'Hybrid',
            'lpg': 'LPG', 'cng': 'CNG', 'hydrogen': 'Hydrogen', 'vodik': 'Hydrogen', 'steam': 'Steam'
        }
        variant['fuel_type'] = fuel_map.get(fuel_lower, fuel)
        
    cc = r['cc'].strip()
    if cc:
        try:
            variant['engine_capacity_cc'] = int(float(cc))
        except ValueError:
            pass
            
    trims.append(variant)

out = OrderedDict()
for brand in sorted(data, key=str.lower):
    out[brand] = OrderedDict()
    for model in sorted(data[brand], key=str.lower):
        if model.endswith('_seen'):
            continue
        out[brand][model] = data[brand][model]

with open(OUT, 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=2)

n_models = sum(1 for b in out.values() for m in b.keys())
n_trims = sum(len(t) for b in out.values() for t in b.values())
print('Raw rows           :', raw)
print('After exact dedupe :', deduped, '(removed %d)' % (raw - deduped))
print('Duplicate trims dropped:', dropped_trims)
print('Brands             :', len(out))
print('Models             :', n_models)
print('Trims              :', n_trims)
