# Final modal + short-edge badge re-verification — 2026-07-11

## Verdict

**PASS** against the live app on `localhost:8085` after a hard reload and source-wired
restart. Raw measurements are in `final_modal_badge_reverify/results.json`; screenshots
and the replay driver are in that directory. The browser recorded **zero console/page
errors**.

The replay also caught and closed a deployment gap: `kickside/agents` was still pinned to
the packed 0.1.10 bundle. `app/wippy.lock` now has the scoped
`kickside/agents -> ../platform/agents` replacement. `make preboot-check` passed before
restart (401 effective routes; only its known directed missing-declaration warnings).
The live resource trace confirms the source build:

- `kickside-agents/styles-DD6RlT2i.js`
- `kickside-agents/AgentForm...-B7jgXIBQ.js`

## Add Trigger

Driven from a published workflow so the full automation form and mapping surface load.

| Viewport | Dialog | Inner builder | Result |
|---|---:|---:|---|
| 360 dark | 342 px | 302 px | PASS |
| 520 light | 502 px | 462 px | PASS |

At both widths the dialog is wholly inside the viewport, the backdrop is `position: fixed`,
horizontal overflow is **0 px**, and `.wf-trigger-body` is the **only active scroll owner**.
Inputs, trigger controls, mapper rows, and the create action remain readable and usable.

## New Agent

Driven at 360 and 520 in both light and dark themes.

- accessible dialog name: `New agent`;
- initial focus: `Agent name` input;
- body scroll locked and six outer application tiers inert while open;
- Tab and Shift+Tab remained contained in the dialog (endpoint wrapping is additionally
  covered by the focused component test);
- Escape closed the dialog, removed all inert state, restored body scrolling, and returned
  focus to `New agent`;
- description/nav overlap: **0 px²** in all four cases;
- nav/right-pane overlap: **0 px²** in all four cases;
- compact section navigation is one horizontal overflow rail rather than overlapping the
  identity form;
- dialog and both grid tracks remain within the modal width after the `min-width: 0`
  containment correction.

The shared `useModalDialog` convention was hardened as part of this pass: outside inerting
now traverses ShadowRoot -> host composed ancestry, and nested dialogs restore each prior
inert value in stack order. Its dedicated shadow-host/nested test passes.

## Short incomplete edge

A disposable two-node workflow with a short, unmapped required-field edge was created and
loaded using the tangent-plus-normal badge placement.

- badge/target-card intersection: **0 px²**;
- visible missing count: `1`;
- disposable workflow delete: **HTTP 200** (`019f52d6-e90b-7b78-9bd7-73c4d26c1c9d`).

## Verification trail

- workflows UI: 60 files / 502 tests green;
- agents UI: 4 files / 11 tests green;
- widgets UI: 20 files / 119 tests green;
- focused AgentForm modal test: 2/2 green;
- widgets, agents, and workflows production builds green;
- `git diff --check` green for the touched source.

No commit or push was made.
