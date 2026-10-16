# Run-state composition fixes — 2026-07-11

Source fixes for the three verified defects in `run_state_composition_qa.md`.

## R1 — compact toolbar

- Extracted `CanvasToolbar.vue`; `WorkflowCanvas.vue` remains the single command/state
  owner and now delegates only toolbar presentation.
- At `<= 600cqw`, Run and Publish remain explicit. Every secondary command remains
  available in one More menu; nothing relies on clipped overflow.
- Menu supports Arrow Up/Down, Home/End, Escape, focus restoration, disabled states,
  outside-click dismissal, menu roles, and `aria-expanded`.
- Runs, Run-with-input, and Version history use a stable editor-level popover anchor, so
  opening them from the compact menu does not depend on a hidden desktop button wrapper.

## R2 — component-declared human waits

- `KindDef` now carries the semantic `waitsForHuman` capability.
- The built-in Human Decision declares it directly; extension kinds derive it once from
  their declarative Human catalog category during registration.
- The run overlay consumes `kindWaitsForHuman(kind)`. It contains no component ids and no
  direct dependency on palette grouping strings.
- Regression uses a generic `review_step` extension kind, not a production component id.

## R3 — readable auto-fit

- Every fit path (manual Fit, initial/refit after layout, responsive rail reframe) uses the
  shared `readableFitOptions()` policy.
- Minimum zoom is `0.55`; a standard 216px card remains at least 118px wide. Large graphs
  intentionally require panning, while VueFlow minimap/controls preserve overview and
  navigation.

## Verification

- Workflows UI: **63 files / 515 tests green** at final shared-tree state.
- New focused coverage: toolbar command availability + emit/close + Escape/focus restore;
  component-declared Human awaiting; readable fit floor.
- Production build: green (243 modules).
- `git diff --check` on workflows UI source: green.

## Live replay

Hard-cache-disabled replay against `:8085`; measurements and screenshots are under
`run_state_composition_qa/after/`.

- **R1 PASS:** at the measured 518px browser / 336px editor slot, Run + Publish + More are
  visible. More is wholly in viewport (`x=288..512`) and lists all ten secondary commands.
  Escape closes it and restores focus; activating Fit closes it and restores focus before
  command handoff.
- **R2 PASS:** the real 18-hour `Brief review` run now renders
  `is-awaiting`, an awaiting marker, and “Waiting for approval.” Replay found and fixed a
  second root cause: Past runs had forced every opened run into terminal overlay semantics;
  it now derives liveness from the run status.
- **R3 PASS:** the real 16-step / 27-edge workflow measured 118.8–123.2px cards after Auto
  layout at 1500 and 520 in both light and dark. The old result was roughly 75–100px.
- Browser console/page errors: **0**.
