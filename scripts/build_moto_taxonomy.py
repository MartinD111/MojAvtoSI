# -*- coding: utf-8 -*-
"""
Builds public/json/brands_models_moto.json from the admin Excel export
(taksonomija_moto_*.xlsx, 8 SL columns: Znamka, Model, Vrsta, Razlicica,
Prostornina, Takt, Tip motorja, Prenos moci).

Cleaning rules (agreed with product owner 2026-06-04):
  - Drop ONLY exact full-row duplicates.
  - Fix column-leak errors (drivetrain words in "Tip motorja", "Elektromotor"
    in "Prenos moci", takt "0").
  - Normalise Takt -> 2T | 4T | Elektricni | Wankel.
  - Map raw "Tip motorja" code (I1, V2 90, B2, ...) to a friendly engineType
    group for filtering, AND derive cylinders + cylinderLayout for the existing
    "Valji/Konfiguracija" filter. Raw code is preserved for display.
  - Map "Vrsta" to the canonical body-type card value; all electric sub-types
    collapse to "EVozila" but the original label is kept as subType.

Output structure (back-compatible with getModelVariants / getModelBodyType):
  { Brand: { Model: { type, variants: [ {trim, displacement_cc, stroke,
                       engineCode, engineType, cylinders, cylinderLayout,
                       drivetrain, subType} ] } } }
"""
import json, sys, math
from collections import OrderedDict, Counter
import pandas as pd

SRC = sys.argv[1] if len(sys.argv) > 1 else \
    r"C:/Users/marti/OneDrive/Desktop/Vehicle Taxonomy/taksonomija_moto_2026-06-02.xlsx"
OUT = sys.argv[2] if len(sys.argv) > 2 else \
    r"c:/Users/marti/AMS d.o.o/MojAvto.si/public/json/brands_models_moto.json"

df = pd.read_excel(SRC, header=0)
df.columns = ['znamka', 'model', 'vrsta', 'razlicica', 'prostornina', 'takt', 'tip', 'prenos']
df = df.fillna('')
for c in df.columns:
    df[c] = df[c].astype(str).str.strip()

raw_count = len(df)
df = df.drop_duplicates()           # exact full-row dedupe only
deduped_count = len(df)

# ── Takt ────────────────────────────────────────────────────────────────────
def norm_takt(takt, is_electric):
    t = takt.lower()
    if is_electric:
        return 'Električni'
    if t.startswith('4'):
        return '4T'
    if t.startswith('2'):
        return '2T'
    if 'elek' in t:
        return 'Električni'
    if 'wankel' in t:
        return 'Wankel'
    return ''   # '0', '/', blank with no electric signal

# ── Prenos moci (drivetrain) ──────────────────────────────────────────────────
PRENOS_MAP = {
    'veriga': 'veriga',
    'zobati jermen': 'zobati jermen',
    'jekleni jermen': 'jekleni jermen',
    'kardan': 'kardan',
}
def norm_prenos(prenos):
    p = prenos.strip().lower()
    if p in PRENOS_MAP:
        return PRENOS_MAP[p]
    if 'kardan' in p:
        return 'kardan'
    if 'zobati' in p:
        return 'zobati jermen'
    if 'jekleni' in p:
        return 'jekleni jermen'
    if 'verig' in p:
        return 'veriga'
    return ''   # 'Elektromotor' leak, blanks -> unknown

# ── Tip motorja (engine code) -> (friendly group, cylinders, layout) ──────────
# layout values match the existing #moto-cylinder-layout option set.
def parse_engine(code):
    c = code.strip()
    cl = c.lower()
    if cl in ('elektromotor', 'elektrom', 'električni', 'electric'):
        return ('Električni', '', '', True)
    if 'hibrid' in cl:
        return ('Hibridni', '', '', False)
    if 'rotor' in cl or cl == 'wankel':
        return ('Wankel', '', '', False)
    if c in ('', '/', 'veriga'):        # data error / missing
        return ('', '', '', False)

    layout_letter = c[0].upper()
    # find first digit = cylinder count
    digits = ''.join(ch for ch in c if ch.isdigit())
    cyl = ''
    for ch in c:
        if ch.isdigit():
            cyl = ch
            break
    if 'kvadratni' in cl:
        return ('Štirivaljnik (kvadratni)', '4', '', False)

    GROUPS = {
        ('I', '1'): ('Enovaljnik', 'Single'),
        ('I', '2'): ('Dvovaljnik (vrstni)', 'Parallel-twin'),
        ('I', '3'): ('Trivaljnik', 'Inline-three'),
        ('I', '4'): ('Štirivaljnik', 'Inline-four'),
        ('I', '6'): ('Šestvaljnik', 'Inline-six'),
        ('V', '2'): ('Dvovaljnik (V)', 'V-twin'),
        ('V', '3'): ('Trivaljnik (V)', ''),
        ('V', '4'): ('Štirivaljnik (V)', 'V4'),
        ('V', '8'): ('Osemvaljnik (V)', ''),
        ('B', '2'): ('Bokser', 'Boxer'),
        ('B', '4'): ('Bokser', 'Boxer-four'),
        ('B', '6'): ('Bokser', 'Boxer-six'),
    }
    key = (layout_letter, cyl)
    if key in GROUPS:
        group, layout = GROUPS[key]
        # cylinders select only offers 1,2,3,4,6
        cyl_filter = cyl if cyl in ('1', '2', '3', '4', '6') else ''
        return (group, cyl_filter, layout, False)
    return ('', '', '', False)   # unknown code -> display raw only

# ── Vrsta -> canonical card value (+ keep original as subType) ────────────────
ELECTRIC_VRSTA = {
    'e-bike', 'elektricni skiro', 'električni skiro', 'elektricno kolo',
    'električno kolo', 'elektricni motocikel', 'električni motocikel',
    'e-skuter', 'elektricni moped', 'električni moped', 'e-skuter ',
}
VRSTA_MAP = {
    'sportnimotor': 'SportniMotor', 'sportnitourer': 'SportniTourer',
    'adventure': 'Adventure', 'nakedbike': 'NakedBike', 'enduro': 'Enduro',
    'chopper': 'Chopper', 'tourer': 'Tourer', 'supermoto': 'Supermoto',
    'trial': 'Trial', 'cross': 'Cross', 'skuter': 'Skuter',
    'minimoto': 'Minimoto', 'gokart': 'Gocart', 'motorne sani': 'MotorneSani',
    'classic': 'Classic', 'cruiser': 'Cruiser', 'moped': 'Moped',
    'utv': 'UTV', 'atv': 'ATV', 'side-by-side': 'UTV',
    'trikolesnik': 'Trikolesnik', 'scrambler': 'NakedBike',
}
def norm_vrsta(vrsta):
    v = vrsta.strip()
    vl = v.lower()
    if vl in ELECTRIC_VRSTA:
        return 'EVozila', v
    return VRSTA_MAP.get(vl, v), v

def to_cc(val):
    s = str(val).strip().replace(',', '.')
    try:
        n = float(s)
        if n <= 0:
            return None
        return int(round(n))
    except ValueError:
        return None

# ── Build nested structure ────────────────────────────────────────────────────
data = OrderedDict()
group_counter = Counter()
fixed_errors = 0

for _, r in df.iterrows():
    brand = r['znamka'].strip()
    model = r['model'].strip()
    if not brand or not model:
        continue
    trim = r['razlicica'].strip() or model

    engineType, cyl, layout, is_elec = parse_engine(r['tip'])
    stroke = norm_takt(r['takt'], is_elec)
    drivetrain = norm_prenos(r['prenos'])

    # Column-leak fix: drivetrain word landed in the engine column.
    if r['tip'].strip().lower() in ('veriga', 'zobati jermen', 'jekleni jermen', 'kardan') \
            and not drivetrain:
        drivetrain = norm_prenos(r['tip'])
        fixed_errors += 1
    # 'Elektromotor' landed in the drivetrain column -> it's electric, drivetrain unknown
    if r['prenos'].strip().lower().startswith('elektrom'):
        if not is_elec:
            engineType, cyl, layout, is_elec = ('Električni', '', '', True)
            stroke = 'Električni'
        drivetrain = ''   # genuinely unknown; admin can fill later
        fixed_errors += 1

    canon, sub = norm_vrsta(r['vrsta'])
    group_counter[engineType or '(neznano)'] += 1

    # Split slash engine codes (e.g. "I2 270/450°") into multiple variants
    raw_tip = r['tip'].strip()
    engine_codes = []
    if '/' in raw_tip and raw_tip.startswith('I2'):
        # e.g. "I2 270/450°" → ["I2 270°", "I2 450°"]
        parts = raw_tip.split('/')
        prefix = parts[0].rstrip('°').strip()   # "I2 270"
        for p in parts[1:]:
            p = p.strip()
            suffix = p if p.endswith('°') else p + '°'
            base_letter = prefix[:2]             # "I2"
            engine_codes.append(prefix + '°')
            engine_codes.append(base_letter + ' ' + suffix)
        engine_codes = list(dict.fromkeys(engine_codes))  # dedupe, keep order
    else:
        engine_codes = [raw_tip] if raw_tip and engineType else ['']

    for engine_code in engine_codes:
        variant = OrderedDict()
        variant['trim'] = trim
        cc = to_cc(r['prostornina'])
        if cc is not None:
            variant['displacement_cc'] = cc
        if stroke:
            variant['stroke'] = stroke
        if engine_code and engineType:
            variant['engine_code'] = engine_code
        if engineType:
            variant['engine_type'] = engineType
        if cyl:
            variant['cylinders'] = cyl
        if layout:
            variant['cylinder_layout'] = layout
        if drivetrain:
            variant['drivetrain'] = drivetrain
        if canon == 'EVozila' and sub:
            variant['sub_type'] = sub

        brand_d = data.setdefault(brand, OrderedDict())
        if model not in brand_d:
            brand_d[model] = OrderedDict([('type', canon), ('variants', [])])
        brand_d[model]['variants'].append(variant)

# sort brands & models alphabetically for stable diffs
out = OrderedDict()
for brand in sorted(data, key=str.lower):
    out[brand] = OrderedDict()
    for model in sorted(data[brand], key=str.lower):
        out[brand][model] = data[brand][model]

with open(OUT, 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=2)

# ── Report ────────────────────────────────────────────────────────────────────
n_models = sum(len(v) for v in out.values())
n_variants = sum(len(m['variants']) for b in out.values() for m in b.values())
print('Raw rows           :', raw_count)
print('After exact dedupe :', deduped_count, '(removed %d)' % (raw_count - deduped_count))
print('Column-leak fixes  :', fixed_errors)
print('Brands             :', len(out))
print('Models             :', n_models)
print('Variants           :', n_variants)
print('\nengineType groups:')
for g, n in group_counter.most_common():
    print('  %-26s %d' % (g, n))
