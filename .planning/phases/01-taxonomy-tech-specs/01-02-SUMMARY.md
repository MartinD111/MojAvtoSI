---
phase: 01-taxonomy-tech-specs
plan: 02
subsystem: taxonomy
tags: [excel, import, validation, admin, xlsx, d-05, d-10]

requires:
  - 01-01 (object variant schema + normalizeTrimEntry)
provides:
  - Three category-specific Excel templates (avto/moto/gospodarska) per D-05 with Notes row and example data
  - Import parser (handleVozFile) extended to read tech-spec columns into parsedRows
  - validateTrimSpecs helper enforcing D-10 ranges/enums on import rows
  - Variant deduplication keyed by (trim + modelId), audit logged to taxonomy_import_log
affects:
  - 01-03 (Admin CRUD) — validateTrimSpecs/ALLOWED_* lists can be reused for inline edit validation
  - 01-04 (Listing auto-fill) — imported variants now carry the same field shape used by the lookup

tech-stack:
  added: []
  patterns:
    - "Excel-template-as-aoa-with-notes-row (SheetJS community edition; bold/fill styles set for Pro compatibility)"
    - "Validation helper returns {valid, specs, errors} so caller chooses to write specs or accumulate errors"
    - "Per-row dedup via Set kept on the report object then deleted before return (private bookkeeping)"

key-files:
  created: []
  modified:
    - src/pages/admin.js
    - src/services/adminService.js

key-decisions:
  - "Used SheetJS aoa_to_sheet + manual cell styling (community edition lacks data-validation API); Notes row rendered as a regular first row rather than merged cells"
  - "validateTrimSpecs returns clean specs even when row has empty fields (allows variant write without specs); errors-only path triggers when explicit invalid values are present"
  - "Variant write goes to a new taxonomy_import_log Firestore collection (audit-only). The canonical JSON taxonomy is updated via the existing admin export/import cycle — out of scope for this plan"
  - "_variantsSeen attached to report object then deleted just before return — avoids a separate parameter and keeps the dedup state colocated with import bookkeeping"
  - "Parser now also accepts legacy lowercase headers (engine_capacity_cc, fuel_type) alongside the human-readable template headers, so re-uploading an export round-trips"

patterns-established:
  - "Excel templates carry a notes hint row at index 0 and headers at index 1; downstream tooling/import does not depend on row 0 content"
  - "Tech-spec import validation accumulates per-row errors into report.errors (REQ-010) instead of throwing or silently dropping"

requirements-completed:
  - REQ-004
  - REQ-007
  - REQ-010

duration: 7min
completed: 2026-05-28
---

# Phase 01 Plan 02: Excel Templates + Import Validation Summary

**Shipped three category-specific Excel import templates (D-05) and the D-10 validation/dedup layer in importTaxonomyRows so the new tech-spec columns can be bulk-loaded without silent drops.**

## Performance

- **Duration:** ~7 min
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- `downloadVozilaTemplate(cat)` rewritten to emit per-category .xlsx files (`predloga_avto.xlsx`, `predloga_motorji.xlsx`, `predloga_gospodarska.xlsx`)
- Each template has: Notes row (OPOMBA), header row, 2–3 example rows; column widths set; header cells styled bold with light-blue fill for XLSX Pro
- handleVozFile parser extended for cars (fuel_type, engine_capacity_cc, three consumption columns, electric_range_km, capacity, legacy fuel_consumption) and for moto (engine_type, engine_configuration, engine_capacity_cc)
- `validateTrimSpecs(row, rowLabel)` added to adminService.js, enforcing D-10 ranges (cc 50–10000, consumption 0.1–99.9, range 1–2000) and enum membership (ALLOWED_FUEL_TYPES / ALLOWED_ENGINE_TYPES / ALLOWED_ENGINE_CONFIGS) and capacity ≤ 20 chars
- `importTaxonomyRows` now also processes variants: dedups by trim+modelId, writes a record to a new `taxonomy_import_log` Firestore collection per valid variant, accumulates all spec errors into `report.errors`
- `_variantsSeen` Set scoped to the per-import report; cleaned up before return

## Task Commits

1. **Task 1: Per-category templates + parser tech-spec columns** — `67a9981` (feat)
2. **Task 2: validateTrimSpecs + variant dedup/import-log in importTaxonomyRows** — `8da026c` (feat)

## Files Created/Modified

- `src/pages/admin.js` — `downloadVozilaTemplate` rewritten (~85 lines, was ~42); avto/moto branches of handleVozFile parser extended with tech-spec field mapping
- `src/services/adminService.js` — Added `ALLOWED_*` enum constants and `validateTrimSpecs` helper before `importTaxonomyRows`; added variant dedup + import-log write block inside the row loop; added `delete report._variantsSeen` before return

## Decisions Made

See key-decisions frontmatter. Most material: writing variants to `taxonomy_import_log` rather than back into the canonical JSON keeps this plan's scope strictly Firestore-side (the JSON remains the source of truth managed via the admin export/import cycle).

## Deviations from Plan

None. Plan executed exactly as written. All acceptance checks (Task 1 + Task 2 verify scripts, line-order check) passed on first run.

## Verification Results

- Task 1 verify script: 9/9 PASS
- Task 2 verify script: 12/12 PASS
- `grep -c "function downloadVozilaTemplate" src/pages/admin.js`: 1
- `grep -c "function validateTrimSpecs" src/services/adminService.js`: 1
- `validateTrimSpecs` defined at line 279 — precedes `importTaxonomyRows` at line 366

## Known Stubs

None. The `taxonomy_import_log` collection is new but intentional (audit trail). All validation paths return real values or push real errors into `report.errors`.

## Self-Check: PASSED

- FOUND: src/pages/admin.js
- FOUND: src/services/adminService.js
- FOUND: 67a9981
- FOUND: 8da026c
