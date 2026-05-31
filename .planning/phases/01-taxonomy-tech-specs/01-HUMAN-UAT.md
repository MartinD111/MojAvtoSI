---
status: partial
phase: 01-taxonomy-tech-specs
source: [01-VERIFICATION.md]
started: 2026-05-27T22:15:00Z
updated: 2026-05-27T22:15:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Flat table renders mixed string+object variants without `[object Object]`
expected: All visible rows show readable trim names; cc/EV badges appear next to converted variants
result: [pending]

### 2. Column header sort (Znamka, Model, Različica)
expected: Rows re-sort asc/desc on each click; arrow indicator (▲/▼) appears on active column
result: [pending]

### 3. Type filter on moto/gospodarska tabs
expected: Table filters to only show models matching the picked Vrsta value
result: [pending]

### 4. Edit modal — change fuel type to Electric on a converted variant
expected: Consumption block hides, electric_range_km input appears (D-08 EV conditional)
result: [pending]

### 5. Add Variant modal — invalid engine_capacity_cc = 15
expected: Toast error "Prostornina mora biti med 50 in 10000 cc." appears; modal does not save
result: [pending]

### 6. Unsaved-changes badge after any mutation
expected: Orange "● Nezhranjene spremembe" badge appears after first mutation; persists until export
result: [pending]

### 7. Download 3 Excel templates and open in Excel/LibreOffice
expected: predloga_avto.xlsx, predloga_motorji.xlsx, predloga_gospodarska.xlsx each open cleanly with Notes/OPOMBA row, correct header row, 2-3 example rows, reasonable column widths
result: [pending]

### 8. Upload Excel with invalid row (engine_capacity_cc = 999999)
expected: Import completes with that row in report.errors and shown in error display, not silently dropped (REQ-010)
result: [pending]

### 9. Create-listing auto-fill — BMW Series 3 / 320d
expected: Technical step prefills fFuel='Dizel', fEngineCC=1995, fConsCity=6.8, fConsCombined=5.6 with blue `cl-autofilled` border
result: [pending]

### 10. Create-listing auto-fill — Tesla Model 3 Long Range
expected: fFuel='Elektrika', fRange=629; consumption fields hidden, elFields visible (D-08 + D-09 EV)
result: [pending]

### 11. Manual edit preservation across variant changes
expected: After auto-fill, manually edited fConsCity retains the user's value when switching to another auto-filled trim; other untouched fields update from new trim
result: [pending]

## Summary

total: 11
passed: 0
issues: 0
pending: 11
skipped: 0
blocked: 0

## Gaps
