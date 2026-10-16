# H1/H2 live browser reverify — interrupted at restart

Date: 2026-07-11

Verdict: **H1 is not a visual-composition pass. H2 is unverified in this pass.** Do not use
this lane as release evidence.

## Method and fixture boundary

- Live source-backed app on `:8085`, Chrome cache disabled through CDP.
- One disposable real workflow, real definition commands, real VueFlow canvas, real Auto
  layout/Fit view actions.
- Production `GET /api/v1/workflows/node-kinds` currently has no declaration above two named
  output ports. To exercise the requested 4/8/12 cardinalities without polluting the product
  registry, the browser locally augmented that response and locally changed six disposable
  agent nodes to those declarative kinds when reading `/state`. All renderer, dagre,
  container, zoom, and CSS code was the served product code. The backend continued to hold
  valid disposable agent nodes.
- The generalized Failed face used a real `agent` with `config.failed_port=true`.
- The 12-port container member used a real `cycle --body--> agent` relationship; only the
  member's client-visible kind metadata was augmented.

## H1 evidence

Six cache-disabled captures completed before the restart:

- `composition_h1_h2_live_reverify/h1-1500-light.png`
- `composition_h1_h2_live_reverify/h1-1500-dark.png`
- `composition_h1_h2_live_reverify/h1-980-light.png`
- `composition_h1_h2_live_reverify/h1-980-dark.png`
- `composition_h1_h2_live_reverify/h1-520-light.png`
- `composition_h1_h2_live_reverify/h1-520-dark.png`

What passes visually:

- 1/2/4/8/12 port rows render with distinct geometry rather than labels stacking inside a
  fixed 216px card.
- The 12-port loop member expands its container; the container is not left at the old
  one-port width.
- The opted-in Failed face remains additive beside the ordinary route.
- Light/dark rendering is consistent.

What fails composition review:

1. **Auto layout + Fit view does not produce a reviewable graph at high cardinality.** At
   1500px the disconnected fixture becomes one extremely wide horizontal band. The first
   node is clipped behind the palette boundary and the far-right nodes/member extend beyond
   the visible canvas. Node-local geometry is correct, but whole-graph composition is not.
2. **The 520px editor is effectively occluded.** Global navigation plus the open 244px step
   palette leave only a narrow canvas strip; the fitted port rows are mostly offscreen. The
   user cannot reason about or manipulate this graph without first discovering how to close
   UI chrome. This is visible in both compact captures.
3. Because the QA process was killed during the H2 transition, its computed rectangle arrays
   were not serialized. The screenshots support the visual findings above, but this pass does
   **not** claim numeric zero-intersection proof.

H1 verdict: **FAIL at whole-canvas composition**, despite the canonical per-node geometry
appearing correct.

## H2 status

The first H2 attempt positioned the viewport before the real handle drag; that moved the
source/target handles outside the interactable view, so no `.wf-intent-input` appeared and
the driver correctly timed out instead of manufacturing a pass. While the retry was being
changed to connect first and pan the still-live overlay, the app was restarted for the
config-assist source change. The parent requested immediate cleanup/finalization rather than
another run.

Therefore this pass provides **no valid H2 boundary/dynamic-resize verdict**. The post-restart
rerun must cover:

- TL/TR/BL/BR for initial, drafting, error, and 14-row preview;
- 14-pair auto-map reveal then trace;
- overlay within `.wf-canvas`, zero overlap with another explanation surface;
- height change after each phase (ResizeObserver evidence), and scroll backstop when the
  preview exceeds available height;
- light and dark, cache disabled.

## Cleanup and runtime integrity

- Cleanup sweep found one remaining `QA — H1 H2 live reverify disposable` workflow and
  deleted it: `019f52e4-5b33-7ddc-9aab-6c883fb01a52` (`DELETE` 200).
- Earlier interrupted fixture(s) had already been removed by the next run's startup sweep.
- No product source or persisted registry declaration was changed by this QA lane.
- Console errors were buffered in the driver but were not serialized before the process was
  interrupted; this report makes no console-clean claim.

## Required follow-up

1. Rerun H2 after the config-assist restart sequence is finished.
2. Treat the compact editor/palette occlusion and high-cardinality Fit view clipping as the
   next visual-composition fixes. Reverify them with the palette both open and collapsed;
   Fit view must fit to the **visible canvas**, not the page or hidden canvas area.
