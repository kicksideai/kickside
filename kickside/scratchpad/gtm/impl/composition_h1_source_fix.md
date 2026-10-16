# H1 whole-canvas source fix

Date: 2026-07-11

Status: source + generated build complete, **not restarted or live-QA'd** per coordination.
No commit.

## Outcome geometry

`node-geometry.ts` is now the single contract for renderer and graph math. It returns:

- `width`
- `height`
- `columns`
- `rows`
- `cellWidth`

Policy:

- one/two outcomes remain the common 216x76 compact card;
- three/four outcomes use a readable bounded row (four = 294px);
- more than four outcomes wrap into at most four columns, 64px minimum per cell;
- each additional row adds 26px to the canonical height;
- a generalized Failed face retains its 34px gutter and reduces the success grid to three
  columns when necessary (12 success routes + Failed = 258x154, 3x4 grid);
- maximum node width is 304px; current outcomes resolve to at most 294px without Failed and
  258px with it.

`WorkflowNode.vue` consumes that contract as CSS variables and explicit width/min-height/
padding. `nodes.css` renders the port region as a grid. Labels keep their complete text in
the existing `title` hover while truncating inside their owned cell.

The same `nodeDimensionsFor` path was already used by dagre, container boxes, and member
clamp/drag. The clamp argument is now typed to the width/height projection of the richer
geometry contract, making that ownership explicit.

## Compact canvas

At the <=640px editor tier, Fit view and Auto layout deliberately close the step palette
before navigating the graph. The existing responsive-rail double-rAF reframe then fits to
the canvas width the user actually retains; Fit avoids the old occluded-width fit followed
by a visible second jump. The palette remains available from its toolbar toggle—it is not
hidden or removed.

## Verification

- Targeted: 3 files, 55/55 green.
- Full workflows UI: 66 files, 535/535 green.
- Production build: green, 248 modules transformed.
- `git diff --check`: green.

Coverage includes:

- 1/2/4/8/12 geometry, max width, >=64px cells, rows/columns and exact height;
- pairwise rectangle math proving zero port-cell intersections across those cardinalities;
- DOM rendering assertions for width, height, columns, rows, cell width, padding, hover
  labels, and Failed gutter;
- container bounds and whole-card drag clamp for 1/2/4/8/12;
- narrow Fit/Auto palette-close policy.

## Files attributable to this fix

- `platform/workflows/ui/src/app/mapping/node-geometry.ts`
- `platform/workflows/ui/src/app/mapping/graph-sync.ts`
- `platform/workflows/ui/src/app/mapping/graph-sync.test.ts`
- `platform/workflows/ui/src/app/nodes/WorkflowNode.vue`
- `platform/workflows/ui/src/app/nodes/WorkflowNode.test.ts`
- `platform/workflows/ui/src/app/canvas/use-responsive-rails.ts`
- `platform/workflows/ui/src/app/canvas/WorkflowCanvas.vue`
- `platform/workflows/ui/src/app/responsive-layout.test.ts`
- `platform/workflows/ui/src/styles/nodes.css`
- refreshed `platform/workflows/static/*` from the successful production build

Live browser reverify remains intentionally pending until the parent coordinates a restart
after the config-assist work.
