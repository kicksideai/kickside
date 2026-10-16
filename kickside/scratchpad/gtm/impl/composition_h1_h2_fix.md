# Composition audit H1/H2 fix

Implemented read/write only in the shared dirty tree; no commit, no reload.

## H1 — one node geometry contract

- Added `mapping/node-geometry.ts` as the canonical source for base size, port cell capacity, gaps and failed-port gutter.
- One/two-output cards remain 216px. Higher-cardinality declarations reserve a real 64px cell per output: 4 = 294px, 8 = 574px, 12 = 854px. There is no 304px squeeze cap.
- `WorkflowNode` renders this geometry.
- Dagre uses the same geometry.
- Container `boxFor`, `clampRegionFor`, and the drag clamp use the same geometry, including the moving node's required width.
- Added coverage for 1/2/4/8/12 outputs, minimum cell capacity, an eight-output node inside a loop container, and whole-card drag clamping.

## H2 — measured edge overlays

- Added `use-overlay-measure.ts`, a small ResizeObserver-backed measurement owner.
- Intent and automatic-map surfaces report their real rendered footprint on mount and whenever async result/error/phase content changes.
- `WorkflowCanvas` keeps per-overlay measurements, hides the first unplaced frame, and recomputes the edge anchor from actual width/height.
- Overlay content is additionally bounded by the visible canvas height through `--wf-overlay-max-height`; large mapping-pair and preview lists scroll inside the surface.
- Placement now accounts for the CSS 14px lifted gap, rather than allowing the rendered top to escape by that amount.
- Added tests proving initial measurement, dynamic growth, observer cleanup, and short/tall rendered rectangles staying inside bounds.

## Verification

- Targeted: 3 files, 43 tests green.
- Full workflows UI: **63 files, 514 tests green**.
- Production build: green, 245 modules transformed.
- Focused `git diff --check`: green.
- Build refreshed workflow generated statics; the app was not restarted, so this report does not claim a new live-browser replay.
