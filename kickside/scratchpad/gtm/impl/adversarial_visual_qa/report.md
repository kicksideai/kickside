# Adversarial workflow composition QA — 2026-07-11

## Scope and fixture

Read-only product QA against the live app on `localhost:8085`. No source was edited.
The disposable workflow `QA — adversarial visual composition`
(`019f52a6-c71c-7e55-a995-2194b4fc5ca7`) was deleted successfully (`DELETE 200`).
The browser recorded zero console/page errors.

The fixture intentionally exercised composition rather than a happy-path graph:

- 9 steps and 11 connections, including crossing paths and five incomplete mappings;
- Start/Finish/Error boundaries with deliberately long titles;
- CRM merge review with four named outcomes, Brief review with three, and two
  two-outcome component intrinsics;
- two inline agents with long titles/subtitles and a deliberately long required field;
- simultaneous unique auto-map and ambiguous-map gestures;
- selected long-form component panel;
- Run-with-input while an edge-intent prompt was active;
- 1500, 1200, and 980 px viewports in light and dark themes with reduced motion.

Raw measurements are in `result.json`. Screenshots named below are in this directory.

## Confirmed defects

### V1 — Named output labels overprint one another (FAIL, high)

Multi-outcome nodes render every label as an unbounded, absolutely-positioned, nowrap
string beneath a fixed-width card. The four CRM outcomes (`Merge`, `Not Same Person`,
`Merge and Set Primary`, `Skip`) collapse into one illegible line. The same failure is
visible with the three Brief-review outcomes and begins to collide on two-outcome nodes.
It remains broken at 1500, 1200, and 980 px and in both themes.

This is not merely the adversarial long title: the port labels come directly from the
production node-kind registry. Evidence: `light-1500-graph.png`, `dark-1500-graph.png`,
and `light-980-graph.png`.

### V2 — Missing-mapping badges collide with target node content (FAIL, high)

Required-field count badges are placed at edge geometry without excluding node bounds.
On short connections, badges sit inside the two agent cards and on their title/content
line. Computed intersection with each target card was 102.0 and 106.1 px²; the red `1`
and `2` are visibly mixed into the agent text. This reproduced at all six width/theme
combinations. Evidence: every `*-graph.png`; raw overlap entries in `result.json`.

### V3 — Auto-map trace and intent prompt use the same visual territory (FAIL, high)

Creating an obvious connection and immediately creating an ambiguous connection leaves
both surfaces active. The compact “Mapped automatically — view” trace and the
“What should flow here?” prompt overlap by **8,595.6 px²**. The prompt obscures almost the
entire trace, so the first action's feedback is neither readable nor clickable. This
persists at 980 px. Evidence: `light-1500-stacked-edge-overlays.png`,
`light-980-pending-overlay.png`, and the measured overlap in `result.json`.

### V4 — Run dialog opens on top of an unresolved edge prompt (FAIL, high)

Pressing Run while the ambiguous mapping prompt is active opens a second interaction
layer without dismissing, suspending, or relocating the first. The Run-with-input dialog
and mapping prompt overlap; both retain live primary actions. This creates competing focus
and an unclear stacking/order model. Evidence: `light-1500-run-action.png`.

### V5 — Inspector obscures graph state without compensating the viewport (FAIL, medium)

Opening the 312 px inspector overlays the existing canvas instead of reserving space or
reframing the graph. In the 1500 px case it covered portions of four right-side nodes;
measured intersections included 1,595 px² for each agent and 5,347 px² for each boundary.
The selected node remained visible because it happened to be left of the rail, but nodes
being reasoned about downstream disappeared under configuration. Evidence:
`light-1500-selected-panel.png` and overlap entries in `result.json`.

## Passed adversarial states

- **Long node titles/subtitles: PASS for containment.** They ellipsize inside cards without
  escaping or colliding with status/lock controls. The full title remains editable in the
  inspector. The ellipsis is intentional, so raw `scrollWidth > clientWidth` records are
  not counted as defects.
- **Long required-field name: PASS.** The intent prompt keeps the full field readable and
  remains within the viewport at 1500 and 980 px.
- **Narrow toolbar: PASS.** At 980 px secondary action labels collapse to icons while Run
  and Publish remain clear; no toolbar overflow was measured.
- **Dark theme: PASS for the driven graph.** No clipped surfaces, offscreen popovers, or
  console errors appeared in the dark 1500/1200/980 states.
- **Panel form length: PASS.** The long component form scrolls within the inspector rather
  than extending the page.
- **Graph navigation at 980: PASS with caveat.** Canvas pan/zoom and minimap remain
  available. The graph does not auto-fit again after a live viewport resize; that is an
  interaction choice and was not classified as a visual defect here.
- **Cleanup: PASS.** Disposable workflow deletion returned 200.

## Untested

- Completed/failed/awaiting node overlays in this exact adversarial topology. Historical
  run surfaces were covered in earlier verification, but this deliberately invalid graph
  was not published or executed.
- Touch-only pointer interactions and browser zoom above 100%.
- More than four named ports; four is the largest currently declared production node kind.

## Composition direction

These failures share two systemic causes, so they should not be fixed as isolated pixels:

1. Canvas annotations need collision-aware placement with exclusion zones for node cards,
   other annotations, inspector rails, and modal/dialog layers.
2. Named outcomes need a scalable rendering rule: abbreviated on-canvas labels with a
   readable focus/hover expansion, or a stacked/edge-adjacent outcome treatment once the
   count exceeds the card's available width.

The live fixture proves that polishing each individual node panel is insufficient; the
canvas needs one compositor that arbitrates graph labels, mapping feedback, prompts,
panels, and dialogs together.
