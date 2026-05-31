---
phase: 01-taxonomy-tech-specs
plan: 04
subsystem: listing-creation
tags: [auto-fill, taxonomy, ev-conditional, listing, d-08, d-09]

requires:
  - 01-01 (object variant schema + normalizeTrimEntry)
provides:
  - normalizeTrimEntryLocal helper in create-listing.js (mirrors admin.js normalizeTrimEntry)
  - TAX_FUEL_MAP constant mapping taxonomy EN fuel_type to listing SL fFuel values
  - applyTrimAutoFill function — looks up trim in brandModelData and fills state + live DOM fields
  - Variant select change handler now triggers auto-fill
  - updateVariants normalized to read trim from object variants (Rule 3 fix)
  - _manualFields tracking in renderTechnicalStep — auto-fill respects user edits
  - .cl-autofilled CSS class (blue border + tinted background)
affects:
  - Listing creation Technical step pre-populates from selected trim's tech specs
  - EV variants (fuel_type=Electric) now correctly show range field, hide consumption

tech-stack:
  added: []
  patterns:
    - "Two-set state tracking: _autoFillFields (what was prefilled) + _manualFields (what user touched); auto-fill checks _manualFields before writing"
    - "Cross-step DOM update from Basic step: applyTrimAutoFill writes both state and (if rendered) DOM fields, so user sees prefills upon advancing to Technical step"
    - "EV conditional fired from inside auto-fill (not only via fFuel change) to keep elFields/consumptionFields/hybridFields visibility in sync with auto-filled fuel"

key-files:
  created: []
  modified:
    - src/pages/create-listing.js
    - css/create-listing.css

key-decisions:
  - "Module-level helpers (normalizeTrimEntryLocal, TAX_FUEL_MAP, applyTrimAutoFill) placed right after brandModelData declaration so they share scope and load before initCreateListingPage"
  - "Variant select event listener handles 'change' (Slovenian Plug-in Hybrid maps to 'Hibrid' — closest match in fFuel option list per CONTEXT D-09 fuel mapping)"
  - "Auto-fill also runs from inside updateVariants() to handle draft-restore case where state.variant is non-empty at render time"
  - "Manual-edit tracking uses 'input' event for inputs and 'change' for selects so both keystroke edits and select changes mark fields as manual"
  - "Rule 3 fix: updateVariants previously assigned object variants directly as option.value/textContent which broke on object variants; normalized via normalizeTrimEntryLocal so the change handler reads a string trim that applyTrimAutoFill can look up"

patterns-established:
  - "Auto-filled fields keep cl-autofilled class until user edits them; user input removes the indicator"
  - "Taxonomy EN ↔ listing SL fuel mapping localized in a single constant (TAX_FUEL_MAP) — single source of truth for cross-language mapping"

requirements-completed:
  - REQ-008
  - REQ-009

duration: 2min
completed: 2026-05-28
---

# Phase 01 Plan 04: Listing Auto-Fill from Taxonomy Tech Specs Summary

**Wired the taxonomy object-variant tech specs (D-01 schema) into the listing creation flow: selecting a trim in the Basic step now auto-populates the Technical step fields (fuel, engine cc, consumption, EV range) via applyTrimAutoFill, with EV conditional toggling and manual-edit preservation.**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-05-28T06:07:36Z
- **Completed:** 2026-05-28T06:09:18Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments

- `normalizeTrimEntryLocal(entry)` helper added at module level — handles string and object variants
- `TAX_FUEL_MAP` constant maps the 8 taxonomy fuel_type values to the 7 listing fFuel option values (Plug-in Hybrid → Hibrid)
- `applyTrimAutoFill(selectedTrim, make, model)` implemented:
  - Looks up trim in brandModelData (avto direct-array OR moto/commercial { variants } shape)
  - Skips string variants (no specs to fill)
  - Skips variants with only a `trim` field (no spec data)
  - Fills `state.fuel`, `state.engineCc`, three consumption fields, `state.rangeKm`
  - Writes to live DOM elements if they exist (so cross-step visibility from Basic to Technical works)
  - Adds `cl-autofilled` class to filled DOM fields
  - Skips any field present in `state._manualFields` (preserves user edits)
  - Toggles `elFields` / `consumptionFields` / `hybridFields` visibility when fuel auto-fills
- Wired into `variantSel` change handler (Basic step) — fires immediately on trim selection
- Also runs from `updateVariants()` when `state.variant` is preset (draft restore)
- `renderTechnicalStep` now attaches manual-edit tracking listeners to `fFuel`, `fEngineCC`, `fConsCity`, `fConsHighway`, `fConsCombined`, `fRange` — selects use `change` event, inputs use `input` event
- Manual edits also strip `cl-autofilled` class to remove the visual indicator
- CSS `.cl-autofilled` rule appended to `css/create-listing.css` (blue border #2563eb + 5% alpha background)

## Task Commits

1. **Task 1: Add normalizeTrimEntryLocal + applyTrimAutoFill; wire to variant change event** — `5c24af6` (feat)

## Files Created/Modified

- `src/pages/create-listing.js` — Added module-level helpers (normalizeTrimEntryLocal, TAX_FUEL_MAP, applyTrimAutoFill, ~95 lines) right after brandModelData declaration. Updated `updateVariants` to normalize variant entries before populating option list (Rule 3 prerequisite). Wired auto-fill into `variantSel.addEventListener('change', ...)` and into `updateVariants` initial render. Added manual-edit tracking block in `renderTechnicalStep` after the fFuel change listener.
- `css/create-listing.css` — Appended `.cl-autofilled` rule (blue border + tinted background) at end of file.

## Decisions Made

See key-decisions frontmatter. Most material: `updateVariants` had to be patched (Rule 3) to handle object variants in the dropdown — previously it assigned the raw variant (object or string) as option.value, which would have produced "[object Object]" text once Plan 01-01 introduced object variants into the JSON. Now `normalizeTrimEntryLocal(v).trim` extracts the string trim for the option value, and the change handler still reads a clean string that applyTrimAutoFill can look up.

## Deviations from Plan

**1. [Rule 3 - Blocking] Normalize variant rendering in updateVariants**
- **Found during:** Task 1 read-first review of `updateVariants` (line ~932)
- **Issue:** `updateVariants` populated `<option value="${v}">` with the raw variant element. After Plan 01-01 introduced object variants into brands_models_global.json (e.g., `{ trim: "320d", engine_capacity_cc: 1995, ... }`), the dropdown would have rendered `[object Object]` and the change handler would have written `[object Object]` to state.variant, breaking the auto-fill lookup before it could even run.
- **Fix:** Inside updateVariants, normalize each entry via `normalizeTrimEntryLocal(v).trim` and use that string as both `opt.value` and `opt.textContent`. Also added a fallback for the `{ variants: [...] }` moto/commercial shape so dropdown works for all three categories.
- **Files modified:** `src/pages/create-listing.js`
- **Commit:** `5c24af6`

## Verification Results

- `node --check src/pages/create-listing.js`: SYNTAX_OK
- Task 1 verify script: 11/11 PASS
  - normalizeTrimEntryLocal defined ✓
  - applyTrimAutoFill defined ✓
  - TAX_FUEL_MAP defined ✓
  - Diesel → Dizel mapping present ✓
  - Electric → Elektrika mapping present ✓
  - applyTrimAutoFill referenced ≥3 times (definition + 2 call sites) ✓
  - _manualFields tracking present ✓
  - _autoFillFields tracking present ✓
  - cl-autofilled class applied ✓
  - EV conditional triggered (fuelEl.value === 'Elektrika') ✓
  - fillField helper defined ✓

## Known Stubs

None. Every spec field reads from the taxonomy variant object and writes to a real state property + live DOM element. The auto-fill is a no-op only when there are no specs to fill (string variants, empty-spec objects, or fields the user manually edited) — these are intended outcomes, not stubs.

## Threat Surface Scan

No new endpoints, no new auth paths, no new file/network surface. The brandModelData fetch happens already at line 106 on page init (T-04-03 mitigation: no extra network calls). The cl-autofilled visual indicator exposes only the fact that a field was pre-filled from public taxonomy JSON (T-04-02: accept). Source is static JSON served by the hosting layer (T-04-01: accept).

## Self-Check: PASSED

- FOUND: src/pages/create-listing.js
- FOUND: css/create-listing.css
- FOUND: .planning/phases/01-taxonomy-tech-specs/01-04-SUMMARY.md
- FOUND: 5c24af6
