---
phase: 01-taxonomy-tech-specs
plan: 01
subsystem: taxonomy
tags: [json-schema, taxonomy, backward-compat, admin]

requires: []
provides:
  - Object variant schema (D-01/D-02/D-03) proven in all three taxonomy JSON files
  - normalizeTrimEntry helper enabling mixed string + object variants at read time
  - parseTaxData normalization so all downstream code sees canonical objects
  - Spec-aware variant rendering in admin tree (cc / EV range badges)
affects:
  - 01-02 (Excel templates) — schema fields anchor template columns
  - 01-03 (Admin CRUD) — taxModelRow + normalize layer is the seam to extend
  - 01-04 (Listing auto-fill) — uses normalizeTrimEntry to look up specs

tech-stack:
  added: []
  patterns:
    - "Backward-compatible read-time normalization (string | object variants coexist in same array)"
    - "Single helper called everywhere variants are read (parseTaxData, search, delete, export)"

key-files:
  created: []
  modified:
    - json/brands_models_global.json
    - json/brands_models_moto.json
    - json/brands_models_gospodarska.json
    - src/pages/admin.js

key-decisions:
  - "Adapted plan-specified BMW model key '3 Series' to actual file key 'Series 3' (file structure preserved, no rename)"
  - "Tesla Model 3 variants converted in place using existing trim names (RWD, Long Range, Performance) instead of plan-suggested 'Standard Range' which did not exist in source data"
  - "normalizeTrimEntry placed immediately before parseTaxData so single-pass parse normalizes once and all consumers (taxModelRow, exportTaxExcel, search) operate on objects"
  - "Delete identity uses .trim string (matches the value passed through escHtml → onclick → variant param)"

patterns-established:
  - "Mixed-variant arrays: a model's variants array can hold strings AND objects; consumers must normalize"
  - "Spec badges in admin tree: engine_capacity_cc → gray cc badge; electric_range_km → green EV badge"

requirements-completed:
  - REQ-001
  - REQ-002
  - REQ-003

duration: 5min
completed: 2026-05-27
---

# Phase 01 Plan 01: Taxonomy Tech-Spec Schema + Backward-Compat Helper Summary

**Established the object-variant data contract (D-01/D-02/D-03) across all three taxonomy files and shipped the normalizeTrimEntry seam so string and object variants render identically through the admin tree.**

## Performance

- **Duration:** 5 min
- **Started:** 2026-05-27T21:08:22Z
- **Completed:** 2026-05-27T21:13:46Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- 9 BMW Series 3 + Tesla Model 3 variants converted to D-01 object schema (incl. 3 EV variants with electric_range_km)
- 5 moto variants (BMW Motorrad S 1000 RR, Ducati Panigale V4 family) converted to D-02 schema
- 2 commercial variants (Mercedes-Benz Sprinter 314 + eSprinter) converted to D-03 schema
- normalizeTrimEntry helper defined once and wired into 5 consumer sites (parseTaxData × 2, search, deleteTaxEntry × 2, exportTaxExcel, taxModelRow rendering)
- All three JSON files validated as parseable; string variants in same files remain untouched and continue to render via normalization

## Task Commits

1. **Task 1: Convert representative variants to object schema in all three JSON files** — `2e8dc12` (feat)
2. **Task 2: Add normalizeTrimEntry helper and update parseTaxData + variant rendering in admin.js** — `09c3bed` (feat)

## Files Created/Modified

- `json/brands_models_global.json` — 9 trim objects added to BMW Series 3 (Petrol/Diesel/Plug-in Hybrid) and Tesla Model 3 (EV); other variants preserved as strings
- `json/brands_models_moto.json` — 5 trim objects added with engine_type / engine_configuration / engine_capacity_cc
- `json/brands_models_gospodarska.json` — Sprinter 314 (Diesel) and eSprinter (Electric) converted; other Sprinter trims kept as strings
- `src/pages/admin.js` — normalizeTrimEntry inserted at line 563 (before parseTaxData at 573); 5 consumer sites updated to operate on normalized objects; taxModelRow now renders cc/EV spec badges

## Decisions Made

See key-decisions frontmatter. Most significant: plan-specified trim names ("Standard Range") were adapted to match actual source data ("RWD") to keep create-listing dropdowns continuous. The model key "3 Series" was reconciled to the file's actual "Series 3" key (no rename, just convert variants in place).

## Deviations from Plan

None functionally — both deviations were data-name reconciliations (BMW model key + Tesla trim names) inherent to executing against the real JSON files. No deviation rules (1-4) triggered.

## Verification Results

- `JSON.parse` all three files: PASS
- `grep -c '"trim":' global.json`: 9 (>= 9 required)
- `grep -c '"trim":' moto.json`: 5 (>= 5 required)
- `grep -c '"engine_capacity_cc":' moto.json`: 5 (>= 5 required)
- `grep '"electric_range_km":' global.json`: 3 lines (>= 3 required)
- `grep '"fuel_consumption":' gospodarska.json`: 1 line (>= 1 required)
- All 6 Task 2 verify-script checks: PASS
- normalizeTrimEntry line (563) precedes parseTaxData line (573): PASS

## Known Stubs

None. All converted variants carry real values for their schema fields. Remaining string variants are intentional backward-compat samples (proves normalize layer works on mixed arrays).

## Self-Check: PASSED

- FOUND: json/brands_models_global.json
- FOUND: json/brands_models_moto.json
- FOUND: json/brands_models_gospodarska.json
- FOUND: src/pages/admin.js
- FOUND: 2e8dc12
- FOUND: 09c3bed
