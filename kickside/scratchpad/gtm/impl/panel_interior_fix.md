# Workflow builder — panel-interior radius/size fix

Territory: `platform/workflows/ui` + `platform/widgets/ui` (shared FieldMapper). No src Lua,
no app/wippy.lock. Verified live on http://localhost:8085 (admin@wippy.local), builder
shadow-DOM (`kickside-workflow-builder`). Screenshots + per-panel sweeps in
`scratchpad/panelfix/` (session) and `.playwright-mcp/panelfix/` (repo).

Canon (app/frontend/docs/best-practices.md): controls/inputs/icon-buttons 8px · cards 14px ·
chips/tags/badges 6px · count-pills/switches 999px · icon tiles ~11px · alerts 10px.

## Reported defects — root cause (one line each) + fix

1. **Interface-contract tag wrong rounding** — `.wf-boundary-tag` (styles.css:887, the
   "INTERFACE CONTRACT — PINNED" bar in the boundary node config) was `border-radius: 999px`,
   rendering a ~219px-wide stadium; a wide labeled tag is a badge, canon 6px. Fixed → `6px`.

2. **SchemaEditor AI-assist button wrong rounding + size** — `.wf-chip--assist`
   (styles.css:1482, the only consumer is `.wf-sed-go`) was `border-radius: 999px` with a
   leftover `margin-top: 8px` from the dead standalone-assist context; inside the
   `align-items: stretch` assist row that margin pushed the button 8px down and shrank it to
   31px against the 39px input. Fixed → `border-radius: var(--wf-radius-sm)` (8px), removed
   `margin-top`, added `justify-content: center`; button now stretches flush to the input
   (measured 36px == 36px, same top).

3. **Palette empty "Automations" group** — `groupCatalog` (catalog.ts:234) forced every known
   category to render even with zero items (`known.has(cat) || …`); "Automations" holds no
   items until a recipe ext-kind is swept, so it showed a header + count 0 + "None available".
   Fixed → a category renders only when it has items, the sole exception being the synthetic
   `Notes` group (its Sticky Note / Frame entries are added by the palette, not swept). Removed
   the now-unreachable `.wf-palette-empty` "None available" branch in Palette.vue; updated
   catalog.test.ts (2 rewritten + 1 new test for the Notes exception).

## Added live report — lock-icon alignment

4. **Boundary-node lock misaligned** — `.wfn-lock` (styles.css:1138) was `top: 8px; right: 8px`
   while the node padding is `11px 13px`, so the pinned badge floated 3px high / 5px tight into
   the rounded corner, off the header grid. Fixed → `top: 11px; right: 13px`. Verified at high
   zoom: lock right-inset (13px) now mirrors the well left-inset (13px) and lock top aligns with
   the header/well top. Correct at both zoom levels (VueFlow scale). The sibling run-status
   badges `.wfn-check`/`.wfn-fail` (styles.css:1061) shared the same `8px/8px` offset and a
   pinned boundary node can render both — moved them to the same `11px/13px` grid so the
   corner-badge convention stays uniform (the check still cleanly covers the lock during a run).

## Sweep-found (4th) — shared FieldMapper sub-canon radii

`platform/widgets/ui/src/app/field-mapper.css` used a private micro-scale (exactly the drifting
duplicates the canon doc warns against). Rendered in the builder's connection panel. Aligned to
canon:

| element | was | now | canon |
| --- | --- | --- | --- |
| `.fm-col` (source/target column cards) | 12px | 14px | card |
| `.fm-pill` (source field entries) | 7px | 8px | control |
| `.fm-row` (target field rows, container) | 9px | 10px | box (keeps outer > inner) |
| `.fm-mode` (select) | 7px | 8px | control |
| `.fm-input` (input) | 7px | 8px | control |
| `.fm-cell--empty` (dashed button) | 7px | 8px | control |
| `.fm-twist` (icon button) | 5px | 8px | icon-button |
| `.fm-clear` (icon button) | 6px | 8px | icon-button |
| `.fm-req` / `.fm-compat--warn` (badges) | 4px | 6px | badge |
| `.fm code` (inline code chip) | 5px | 6px | chip |

Live-verified: `.fm-col` → 14px, `.fm-pill` → 8px in the connection panel. (`.fm-err`/`.fm-armbar`
inline message bars left at 8px — not a control/card/chip/pill class.)

Also swept-and-fixed: `.wf-row-menu-item` (styles.css:693) 7px → 8px, matching the sibling
`.wf-new-opt` menu-item at 8px.

## Sweep coverage (all canon-clean unless listed above)

palette + canvas nodes/boundary cards · boundary config (SchemaEditor) · branch config ·
connection panel + FieldMapper · run-with-input popover (value-mode SchemaEditor, segmented
views 6px/8px) · version-history popover (rows 8px, version pills 999px) · list view (status
pills / label chips are deliberate 999px compact pills — not violations) · row actions menu ·
publish (surfaced a validation error, nothing published). No dramatic violation beyond the four
above; the many 999px compact status/count pills are canonical and were left as-is.

## Verify

- Tests: workflows 402/402 (40 files), widgets 96/96 (13 files). catalog.test.ts updated
  deliberately (empty-group behavior + Notes exception). No snapshot changes needed
  (run-node-output snap untouched).
- vue-tsc: touched files clean (catalog.ts / Palette.vue / catalog.test.ts). The 3 pre-existing
  errors are in untouched files (widgets ports.ts, WorkflowSetup.vue, workflow_setup.ts).
- Build: `npm run build` green for workflows and widgets. Workflows bundle carries the
  FieldMapper CSS (inline `@import`). Note: other FieldMapper consumers (e.g. transform) will
  pick up the widget CSS on their own next build — out of this task's scope.
- Live re-walk: all four fixes confirmed in the running app; before/after screenshots saved.

Commits scoped to the touched source + the rebuilt `platform/workflows/static`. Not pushed.
