# Workflow surface composition audit (source verified)

Date: 2026-07-11  
Scope: `platform/workflows/ui`, `platform/widgets/ui`, `platform/automation/ui`  
Method: read-only census of Vue/CSS composition paths: fixed/absolute overlays, responsive
rails, generated node/port rendering, modal/picker stacking, scroll ownership, text/object
bounds, focus containment, and dark-theme token use. Findings below are verified against
current source. They are not inferred from prior lane reports.

## Executive finding

The remaining visual risk is **composition between independently-correct surfaces**. The
canvas rails, edge-intent overlays, toolbar popovers, shared pickers, table menus, and nested
automation builder each own positioning locally. There is no common collision/overlay policy,
so combinations and boundary positions can overlap, clip, or leave controls unreachable even
when every individual component looks polished in its resting state.

## Ranked findings

### P1 — Compact editor can show two full-height rails on top of each other

- `WorkflowCanvas.vue:65-66` initializes both `panelOpen` and `paletteOpen` to `true`.
- `WorkflowCanvas.vue:737-850` renders the palette and, after a selection, the inspector at
  the same time.
- `styles/vueflow.css:140-143` turns both into absolute overlays below 1180px, gives both
  `z-index: 30`, and does not coordinate their open states.
- At a 400px host the left rail is 244px wide and the right rail is 312px wide, so they overlap
  by roughly 156px. DOM order makes the inspector cover the palette, leaving a visually broken
  double drawer rather than a deliberate narrow-layout mode.

**Systemic fix:** one responsive rail state (`none | palette | inspector`) below the overlay
breakpoint, with opening one closing the other and a scrim/close affordance owned by the canvas.

### P1 — Edge overlays are not viewport- or surface-clamped and can stack indefinitely

- `WorkflowCanvas.vue:525-559` converts the raw edge midpoint directly to viewport `left/top`;
  it does not clamp against viewport edges, the 48px toolbar, palette, inspector, or banners.
- `styles/canvas.css:53-107` positions the auto-map reveal and intent prompt as fixed 200–300px
  surfaces lifted left/up from that raw point. An edge near the top or either side can put part
  of the surface off-screen.
- These fixed overlays use z-index 66/70 while responsive rails use 30, so a canvas prompt can
  paint over the inspector or palette instead of relocating into the visible canvas region.
- `canvas-connect.ts:140-147, 205-217` retains every auto-mapped edge in a map until explicitly
  opened/dismissed. `WorkflowCanvas.vue:801-810` renders all retained entries. Nearby edges can
  therefore create several same-z overlays on the same pixels; there is no collision layout or
  single-reveal queue.
- The drag hint at `WorkflowCanvas.vue:793-797` is likewise placed at `clientX/Y + 14` without
  right/bottom collision handling.

**Systemic fix:** one canvas overlay placer with safe bounds, flip/shift behavior, rail-aware
available rect, and a transient reveal queue. Persistent traces may remain per-edge, but only
one expanded card/prompt should own the midpoint layer at once.

### P1 — Declarative nodes accept unbounded outgoing ports but the card has a fixed 216px layout

- `catalog/catalog.ts:126-133` accepts every registry-declared port with no visual-capacity
  validation or presentation hint.
- `nodes/WorkflowNode.vue:70-80` renders every outgoing port in one row.
- `styles/nodes.css:5` fixes the card at 216px wide; `nodes.css:308-318` distributes all ports
  across that row and absolutely positions nowrap labels below it.
- Two ports fit. Four or more long business labels necessarily collide with siblings or extend
  outside the card; generated intrinsics are precisely the path most likely to introduce those
  shapes.
- Current bundled workflow-node declarations found by the source census expose at most two
  outgoing ports, so this is a **contract-capacity edge case**, not a claim that a currently
  shipped two-port card is already colliding. The public catalog normalization nevertheless
  permits the failing shape with no warning.

**Systemic fix:** declare a port presentation contract. Keep two ports inline; for larger sets,
grow the node to a capped width or render a labeled port rail/list. Validate maximum label/count
at catalog normalization and provide an explicit overflow representation rather than relying on
`space-around`.

### P1 — Automation rows cannot compose at compact widths and the overflow is hidden

- `automation/styles.css:14-18` sets the page root to `overflow-x: hidden`.
- `automation/styles.css:82-87` gives each row four columns: fixed 38px icon, flexible identity,
  auto badge, auto action group.
- `automations.vue:1131-1168` can render five 32px action controls plus gaps, in addition to the
  status badge. There is no row-level compact breakpoint.
- The existing media rules at `styles.css:151-152` only change the expanded details grid; they
  do not change the main row. On a phone/compact component host the fixed controls consume the
  width before the name does, and the root clips the excess rather than scrolling or folding it.

**Systemic fix:** collapse secondary actions into one menu below a row breakpoint and move the
status into the identity stack; never use page-level `overflow-x:hidden` to hide unresolved row
composition.

### P1 — Workflow row menus are inside the table scroll/clipping region

- `styles/list.css:68` and `list.css:154-160` make `.wf-table` the `overflow:auto` scroll region.
- `WorkflowTable.vue:190-228` mounts the row menu inside the final table cell.
- `styles/list.css:277-284` absolutely positions the menu below the row button. The fixed
  backdrop is outside the table, but the menu itself is still clipped by the table scrollport.
- Opening the menu on a bottom row can cut off Share/Export/Delete; scrolling the table also
  moves the supposedly-open menu while the full-screen backdrop remains fixed.

**Systemic fix:** mount row actions through the shared anchored overlay layer (or a top-layer
menu host) and recompute on table scroll. Backdrop and menu must share the same overlay owner.

### P1 — Modal semantics are declared, but focus and scroll are not contained

- Workflow create/delete/templates/import dialogs declare `aria-modal`, but only the New
  workflow text fields handle Escape (`WorkflowList.vue:225-305`). Templates and Import have no
  keyboard dismissal or initial focus (`TemplatesModal.vue:112+`, `ImportModal.vue:68+`).
- Automation supplies a global Escape priority chain (`automations.vue:1004-1013`) but none of
  its five modal variants moves focus into the dialog, traps Tab, restores focus, or marks the
  background inert (`automations.vue:1188-1390`).
- Add Trigger declares a modal but has no Escape/focus containment (`AddTriggerPanel.vue:34+`).
- Body/page scrolling is not locked by either mask implementation.

This is also a visual-composition defect: keyboard focus can remain visibly behind a dimmed
mask, and Tab can scroll/reveal the background while the dialog is open.

**Systemic fix:** one shared modal shell that owns initial focus, focus trap, Escape, focus
restore, inert/background scroll lock, and nested-overlay handoff.

### P2 — Shared fixed pickers use incompatible sizing and z-index policies

- `IconPicker.vue:57-62` always requests 304px and `ModelPicker.vue:77-83` always requests
  320px; their CSS has no viewport max-width (`widgets/styles.css:29-34`,
  `model-picker/styles.css:26-31`). Viewports narrower than 320/336px overflow horizontally.
- Their 360/380px vertical estimates are constants rather than measured panel heights and do
  not cap the rendered panel to the actual available height.
- `AnchoredPanel.vue:42-75` clamps horizontal origin but not requested width and uses available
  height only to choose above/below; it does not set the panel's available max-height.
- `AnchoredPanel.vue:61` assigns z-index `2147483000`, while older pickers use 2000 and product
  modals use 1000. This makes a shared picker effectively sovereign over every application
  overlay, including any confirmation/error modal opened while it is present.
- Multiselect already implements the missing available-height cap (`MultiSelect.vue:170-196`),
  so the shared system currently has two incompatible placement contracts.

**Systemic fix:** move all pickers onto one measured AnchoredPanel contract: clamp width to
`viewport - 16px`, publish available height to the child, and use named overlay tiers rather
than a near-maximum integer.

### P2 — The automation two-pane modal becomes two unconstrained grid rows on small screens

- Desktop uses a fixed 320px catalog column (`automation/styles.css:269-273`).
- At 760px, `styles.css:304-309` changes only `grid-template-columns: 1fr`; the catalog and setup
  become implicit rows inside a flex child with `overflow:hidden` and no explicit row sizing.
- Both left and right panes independently request scrolling/flex space. A large catalog plus a
  schema-heavy setup can consume/collapse the shared 90vh modal unpredictably; there is no
  mobile stepper, tab, or `minmax(0, ...)` row contract.

**Systemic fix:** on compact widths, show catalog and setup as explicit steps/tabs. If both must
remain visible, define bounded grid rows and a single scroll owner rather than two nested ones.

### P2 — Compact workflow toolbar has no overflow/compression strategy below 1024px

- `WorkflowCanvas.vue:612-720` can render Back, palette, undo, redo, fit, layout, direction,
  runs, Add trigger, Share, Run, Export, History, and Publish in one fixed 48px row.
- `styles/canvas.css:164-173` only removes three labels and the count at <=1024px. Run and
  Publish remain full buttons; all icon actions remain; there is no overflow menu, wrapping, or
  horizontal scrolling.
- This collides with the component's stated universal/embed use: a host can be much narrower
  than a page viewport even on desktop.

**Systemic fix:** prioritize Back/Run/Publish and move layout/history/export/share/trigger into
one responsive More menu based on container width, not window width.

### P2 — Long mapping expressions and machine errors still have unbounded token paths

- `styles/canvas.css:140` renders an AI-drafted raw mapping with `white-space:pre-wrap`, but no
  `overflow-wrap:anywhere`, max height, or horizontal overflow. A long unspaced path/string can
  push outside the fixed 300px intent card.
- `EdgeIntentPopover.vue:73` joins all unresolved target names into one sentence; arbitrary
  registry field names are not bounded.
- Automation `.kx-err` (`automation/styles.css:54-58`) has no `overflow-wrap`; API/registry ids
  and correlation strings can widen a modal/footer.
- Positive contrast: run payloads and timeline raw data are already bounded and wrap anywhere
  (`workflows/styles/runs.css:55-60, 93-97, 182-189`), so that pattern can be reused.

**Systemic fix:** establish a shared `machine-text` containment rule (`min-width:0`,
`overflow-wrap:anywhere`, bounded block scrolling) and apply it to every registry/API-derived
message and expression surface.

### P3 — Large workflow tables force a 900px internal canvas rather than offering a compact view

- `styles/list.css:146-151, 210-216` requires 900px for table rows and group headers.
- Horizontal scrolling is functional, but Location/Status/Last run/Updated/Actions remain far
  off-screen in embedded and compact hosts; the primary action is not discoverable until the
  user scrolls to the far right.

**Systemic fix:** switch to a compact row/card composition below a container breakpoint, with
name/status/last run visible and secondary metadata/actions disclosed in place.

## Dark-composition result

No new dark-only raw surface leak was verified in this scope. Workflow accents use explicit
semantic hue tokens and surfaces/shadows derive from theme tokens; Automation and shared widgets
mostly use `--p-*` plus `color-mix`. The remaining dark risk is therefore the same overlay and
clipping hierarchy above, not a separate hardcoded light background. Visual QA should still
exercise the overlapping-rail, edge-near-boundary, picker-over-modal, and bottom-row-menu cases in
both themes because shadows and masks amplify stacking mistakes in dark mode.

## Recommended fix order

1. Introduce shared canvas overlay placement and narrow rail exclusivity.
2. Make node port rendering capacity-aware at the declarative catalog boundary.
3. Repair automation compact rows and the compact two-pane flow.
4. Move row menus and all pickers onto one bounded overlay host/tier system.
5. Introduce the shared modal shell/focus contract.
6. Add container-driven toolbar/table compact compositions and machine-text containment.

## Verification cases required after fixes

- 360/400/640/980/1440px component widths, not only browser viewport widths.
- Palette + selected-node inspector; palette + run inspector; each rail opened/closed by keyboard.
- Intent edge at all four canvas boundaries, with inspector open, and three nearby auto-maps.
- Declarative nodes with 1, 2, 4, 8 ports and 40-character labels.
- Automation row with all five actions, long title/error, expanded details, both themes.
- Bottom workflow row menu after vertical and horizontal table scroll.
- Picker inside Automation inside Add Trigger; then open/close a confirmation surface.
- Tab/Escape/focus restoration for every modal, including nested custom-element content.
- 2KB unbroken field name/expression/error text and a 100-field mapper schema.
