# Phase 1: Vehicle Taxonomy Technical Specifications - Context

**Gathered:** 2026-05-09
**Status:** Ready for planning
**Source:** PRD Express Path (user-provided requirements)

<domain>
## Phase Boundary

Extend the taxonomy system (brands_models_global.json, brands_models_moto.json, brands_models_gospodarska.json) so each trim/variant can contain structured technical specifications. Deliver:
1. Updated JSON schemas with backward compatibility
2. Updated Excel import templates with validation per vehicle category
3. Full CRUD admin UI replacing the current view-only + delete-only taxonomy editor
4. Auto-fill integration in listing creation (step 3: basic, step 4: technical)

This phase does NOT change the Firestore data model for brands/models collections (that is a future scalability concern), does NOT change authentication/authorization, and does NOT touch non-taxonomy admin sections.
</domain>

<decisions>
## Implementation Decisions

### D-01: JSON Schema — Cars (brands_models_global.json)
Variants change from simple strings to objects. Backward compat: if a variant is a string, treat it as `{ trim: string }` with no specs.

New variant object structure:
```json
{
  "trim": "M Sport",
  "engine_capacity_cc": 1995,
  "fuel_type": "Diesel",
  "fuel_consumption_city": 6.1,
  "fuel_consumption_highway": 4.5,
  "fuel_consumption_combined": 5.2
}
```

EV variant (fuel_type === "Electric"):
```json
{
  "trim": "Long Range",
  "engine_capacity_cc": null,
  "fuel_type": "Electric",
  "electric_range_km": 629
}
```

Fuel type options: "Petrol", "Diesel", "Electric", "Hybrid", "Plug-in Hybrid", "LPG", "CNG", "Hydrogen"

### D-02: JSON Schema — Motorcycles (brands_models_moto.json)
Variants change from strings to objects inside the existing `{ type, variants[] }` structure.

New variant object:
```json
{
  "trim": "Standard",
  "engine_type": "4-stroke",
  "engine_configuration": "Parallel Twin",
  "engine_capacity_cc": 689
}
```

Engine type options: "4-stroke", "2-stroke", "Electric", "Rotary"
Engine configuration options: "Single", "Parallel Twin", "V-Twin", "Triple", "Inline-4", "Boxer", "V4"

### D-03: JSON Schema — Commercial Vehicles (brands_models_gospodarska.json)
Variants change from strings to objects inside the existing `{ type, variants[] }` structure.

New variant object:
```json
{
  "trim": "314 CDI",
  "fuel_type": "Diesel",
  "fuel_consumption": 8.4,
  "capacity": "3500kg"
}
```

Same fuel_type options as cars (minus Electric range special case — commercial EVs just omit fuel_consumption).

### D-04: Backward Compatibility
- String variants must still render correctly everywhere (create-listing dropdowns, admin tree)
- Helper function `normalizeTrimEntry(entry)` converts string → `{ trim: entry }` at read time
- No migration required for JSON files at runtime; migration is an optional admin action

### D-05: Excel Import Templates
Three separate downloadable templates (one per category), replacing current combined template. Each uses XLSX library (already imported). Templates include:
- Column headers matching D-01/D-02/D-03 fields
- Data validation: dropdown lists for fuel_type, engine_type, engine_configuration
- Numeric validation cells for cc and consumption columns
- Optional columns clearly labeled "(optional)"
- A "Notes" row at top explaining EV logic

Car template columns (exact order):
`Brand | Model | Trim | Fuel Type | Engine Capacity (cc) | Consumption City | Consumption Highway | Consumption Combined | Electric Range (km)`

Motorcycle template columns:
`Brand | Model | Type | Trim | Engine Type | Engine Configuration | Engine Capacity (cc)`

Commercial template columns:
`Brand | Model | Type | Trim | Fuel Type | Fuel Consumption | Capacity`

### D-06: Admin CRUD UI
Replace the current read-only taxonomy tree with a full data table. Implementation within existing `renderTaxonomy()` function area in `src/pages/admin.js`.

Table view requirements:
- Columns: Brand | Model | Type (moto/commercial only) | Trim | [tech specs] | Actions
- Actions per row: Edit (pencil icon) | Delete (trash icon)
- Bulk select checkbox column + "Delete selected" bulk action
- Search bar filters across brand/model/trim
- Type dropdown filter (for moto/commercial tabs)
- Pagination: 50 rows per page with prev/next controls
- Column sorting on Brand, Model, Trim headers (click to toggle asc/desc)

Edit behavior:
- Click Edit → inline edit row OR modal (modal preferred for many fields)
- Modal shows all tech spec fields with appropriate input types
- Validation before save: numeric fields reject non-numbers, required fields flagged
- Save updates in-memory cache (`_taxCache`) and marks unsaved changes indicator
- "Export JSON" button saves to file (existing pattern)

### D-07: Admin Add Variant Enhancement
Existing `openTaxAddVariantModal()` must be extended to include tech spec fields matching D-01/D-02/D-03 for the active category. Currently only prompts for variant name string.

### D-08: EV Conditional Logic
In admin edit modal and in listing creation:
- When fuel_type === "Electric": hide consumption fields, show electric_range_km field
- When fuel_type !== "Electric": show consumption fields, hide electric_range_km field
- This is a UI-only conditional, not enforced at JSON schema level (fields simply absent/null)

### D-09: Listing Creation Auto-Fill
In `src/pages/create-listing.js`, after user selects trim in the Basic step:
1. Look up trim in `brandModelData[make][model]` variants array
2. Find matching trim object (compare `entry.trim` or string equality)
3. If found and has tech specs, auto-populate Technical step fields:
   - `engine_capacity_cc` → engine capacity input
   - `fuel_type` → fuel type dropdown
   - `fuel_consumption_city/highway/combined` → consumption inputs
   - `electric_range_km` → range input (if EV)
   - Motorcycle: `engine_type`, `engine_configuration`, `engine_capacity_cc`
4. Auto-fill fires immediately on trim selection change event
5. User can still modify any auto-filled value — auto-fill only sets defaults
6. Auto-fill does NOT overwrite values user already manually changed in this session

### D-10: Validation Layer
Excel import parser must validate:
- `engine_capacity_cc`: integer 50–10000, or null/empty
- `fuel_consumption_*`: float 0.1–99.9, or null/empty
- `electric_range_km`: integer 1–2000, or null/empty
- `fuel_type`: must be in allowed list or empty
- `engine_type`: must be in allowed list or empty
- `engine_configuration`: must be in allowed list or empty
- `capacity` (commercial): string, max 20 chars
- Invalid rows: collected into error report shown after import, not silently dropped

### D-11: Unsaved Changes Warning
Admin taxonomy editor must show visual indicator ("● Unsaved changes") when in-memory cache differs from last export. Existing pattern already shows toast after delete; extend to all mutations.

### Claude's Discretion
- Exact modal styling (follow existing dark glassmorphic pattern in admin.css)
- Pagination implementation approach (in-memory slice vs virtual scroll — use in-memory slice for simplicity)
- Whether to add a "Save to Firestore" button alongside "Export JSON" (out of scope per PRD)
- Error toast formatting (follow existing toast pattern)
- Whether to split admin.js into sub-files (out of scope — keep in single file per current pattern)
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Taxonomy JSON Files (current structure to extend)
- `json/brands_models_global.json` — Car taxonomy, Brand→Model→[string variants], 56KB
- `json/brands_models_moto.json` — Motorcycle taxonomy, Brand→Model→{type, variants:[strings]}
- `json/brands_models_gospodarska.json` — Commercial taxonomy, same structure as moto

### Core Files to Modify
- `src/pages/admin.js` — 1939 lines, all taxonomy CRUD functions lines 543–1010+
  - `TAX_SOURCES` (line 543), `loadTaxJson` (550), `parseTaxData` (562), `renderTaxonomy` (579)
  - `loadTaxTree` (623), `deleteTaxEntry` (789), `openTaxAddBrandModal` (808)
  - `openTaxAddModelModal` (826), `openTaxAddVariantModal` (858), `exportTaxExcel` (880)
  - `renderVozilaUvoz` (915) — Excel import with deduplication
- `src/pages/create-listing.js` — 2053 lines, taxonomy used in:
  - Init fetch (line 105), `renderBasicStep` (713), brand/model/variant change handlers (899–953)
- `src/services/adminService.js` — 491 lines, `importTaxonomyRows` (275–357)

### Styling Reference
- `css/admin.css` — 1010 lines, dark theme, glassmorphic cards, existing modal patterns

### Libraries Already Available
- XLSX (SheetJS) — already used for `exportTaxExcel`, available for template generation
- Firebase Firestore — adminService.js handles all Firestore operations
- React 19 / no component framework for admin (dynamic DOM rendering pattern)
</canonical_refs>

<specifics>
## Specific Implementation Notes

### Current Export Pattern (reference for new templates)
```javascript
// exportTaxExcel in admin.js line 880
const rows = [["Znamka", "Model", "Vrsta", "Različica"]];
// ... populate rows
const ws = XLSX.utils.aoa_to_sheet(rows);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Taksonomija");
XLSX.writeFile(wb, `taksonomija_${cat}_${date}.xlsx`);
```
New templates must add data validation via `ws['!dataValidation']` or XLSX Pro features — if XLSX community edition doesn't support validation, use color-coded headers and a Notes row instead.

### Current Deduplication Logic (reference for import parser update)
```javascript
// adminService.js line 1058-1070
const brandKey = brandName.toLowerCase() + '|' + category;
const modelKey = modelName.toLowerCase() + '|' + brandId;
```
Must be extended to handle object variants (dedup by trim name, not entire object).

### Moto Type Values (Slovenian in JSON, must preserve)
SportniMotor, SportniTourer, Adventure, NakedBike, Enduro, Chopper, Tourer, Supermoto, Trial, Cross, Skuter, Minimoto, Gocart, MotorneSani, EVozila

### Commercial Type Values (Slovenian in JSON, must preserve)  
Dostavna, Tovorna, Avtobus, TovornePrikolice, Gradbena, Kmetijska, Komunalna, Gozdarska, Vilicarji
</specifics>

<deferred>
## Deferred Ideas

- Firestore schema migration (brands/models collections) — future scalability work
- Real-time sync between JSON files and Firestore via Cloud Functions
- Bulk edit of tech specs across multiple variants
- Public API endpoint for taxonomy data
- Image/photo attachment per trim
</deferred>

---

*Phase: 01-taxonomy-tech-specs*
*Context gathered: 2026-05-09 via PRD Express Path*
