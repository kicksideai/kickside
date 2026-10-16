# Workflow composition live re-verification — 2026-07-11

## Scope and ground truth

Fresh headless-Chrome replay against `http://localhost:8085`, using the currently served
workflow bundle (`styles-CUVsJOms.js`). The disposable workflow
`QA — composition live reverify` was created through the public API, driven in the UI,
and deleted successfully (`DELETE 200`). The final compact-list measurements are in
`result.json`; the final V1/V2/V5 measurements are preserved in
`result-final-v1-v5-summary.json`; the preceding consolidated pass is in
`result-consolidated-summary.json`. Screenshots are beside this report.

The fixture carried real registry intrinsics with 2, 3 and 4 outputs, deliberately short
incomplete edges, unique and ambiguous mapping gestures, every conflicting toolbar surface,
and inspector states at 1500/1180/980/520 px. Workflow-list and automation rows were driven
at 860/760/520 px in light and dark themes.

## Remaining composition defects

### 1. Short-edge completeness badges can still intersect node cards — FAIL, medium

The final renderer adjustment substantially reduced the collision, but the mapping-count
compositor still does not fully exclude node bounds. After the perpendicular offset changed
from 18 to 30, a fresh isolated Resolve → Agent fixture measured the badge at
`x=974.20..1004.25` and the Agent card beginning at `x=1003.32`; the remaining intersection
is **27.33 px²**, not zero. See `07-final-badge-geometry.png` and
`result-final-badge.json`.

This is the original V2 class and remains a real product defect.

## Passed adversarial states

- **V1 output labels: PASS after final renderer adjustment.** Fresh measurement against
  the latest build found zero label intersections across the 2-, 3- and 4-output nodes,
  including the prior `Skip` / `Resolved` cross-node case. Long labels ellipsize and retain
  the full value in `title`.
- **V3 explanation arbitration: PASS.** Auto-map followed immediately by an ambiguous edge
  left exactly one active explanation (`.wf-intent`), with no auto-map trace/card and zero
  explanation overlap. See `02-v3-single-explanation.png`.
- **V4 competing interaction layers: PASS.** An unresolved intent was recreated before each
  action. Run, History, Share and Add trigger each closed the intent first and displayed one
  corresponding dialog only. See the four `03-v4-*.png` captures.
- **V5 inspector at 1500/1180/980: PASS.** The inspector owns 312 px of real layout width;
  canvas right edge equals panel left edge and measured panel/node overlap is zero at all
  three widths. VueFlow reframed the graph after opening.
- **V5 at 520: PASS as deliberate drawer.** The 292 px inspector intentionally overlays the
  336 px canvas behind a scrim. The scrim was present and clickable; clicking it removed the
  panel successfully (`narrowScrimClose: true`). See `04-v5-inspector-520.png` and
  `04-v5-inspector-520-closed.png`.
- **Workflow row menu: PASS.** At 860 and 520 in both themes it is fixed-positioned, uses
  z-index 901 over its backdrop, remains within the viewport, and is not a table descendant.
- **Compact workflow rows: PASS after final flex fix.** Fresh hard reload against
  `styles-CVc7SRfF.js` measured intrinsic row heights of **124.3 px** at 860 and **178.5 px**
  at 520 (formerly 58 px). Content no longer overprints adjacent rows; horizontal geometry
  remains exact (`scrollWidth === clientWidth`) in light and dark themes.
- **Automation rows: PASS.** At 760 and 520 in both themes, all measured rows/actions have
  `scrollWidth === clientWidth`; all three or four available action buttons remain visible
  and the cluster reflows below identity/status without clipping. See `06-automation-*.png`.
- **Fixture cleanup: PASS.** Disposable workflow deletion returned 200.

## Console evidence

The focused post-rebuild V5 run had zero console/page errors. The consolidated run recorded
18 errors while navigating Share/list/automation, all rooted in the external
`https://web-host.wippy.ai/webcomponents-1.0.39` fetch failing with
`ERR_CERT_VERIFIER_CHANGED` / dynamic-import failure; the subsequent `No PrimeVue Toast
provided` error is fallout from that host module not loading. These are not workflow bundle
exceptions, but the consolidated run is **not** represented as console-clean.

## Verdict

Rail arbitration, intent arbitration, output-label allocation, compact list composition,
menu escape and automation reflow are fixed and live. One measured compositor defect remains:
the reduced-but-real short-edge mapping badge collision.
