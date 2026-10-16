# Workflow run inspector — first-class debug surface (W13)

Scope: `platform/workflows/ui/src` only. No Lua/yaml (`platform/workflows/src` is the codex
lane's), no production build, no `platform/workflows/static` touched. Source + vitest +
vue-tsc only — the live 8085 bundle is unchanged; build + restart deferred.

Designed against the REAL failed run (read-only over `/api/v1`): workflow
`019f487a-472e-74d2-927a-a2a1fe92130e`, run `88444c66-2df2-4f5d-8ced-3a87e44ea534`
(Start ok, Google Search ok, Refund Triage agent node failed, downstream pending). The
raw API responses are saved as test fixtures under `src/app/__fixtures__/`.

## Error-shape decision (matches the codex lane's final shape)

`agent_node_error_propagation.md` (committed by the codex lane after this lane started)
confirms: the fix is **blocked** — the swallow point is in `wippy/dataflow`, an external
pinned dependency outside this writable root — so today the failing node's terminal
`node.result` (discriminator `result.error`) carries the bare string `"Failed"`, and the
run-level error is `Node [<uuid>] failed: Failed`. Its documented *final* shape once the
dependency patch lands is a **plain-string reason** in that same `node.result`, surfacing
as `Node [<uuid>] failed: <reason>`.

The drawer renders defensively across all three:
- **Plain string, real reason** (the final shape) -> shown as the failure headline.
- **Structured `{ code, message }`** (a future superset; also unwraps `{ error: {…} }`) ->
  code chip + message headline, full object in a collapsed "Error detail" block.
- **Bare token `"Failed"` / empty** (today) -> generic headline + honest line
  "No further detail was recorded for this failure." and a next step.

Run-level `Node [uuid] failed: <reason>` is parsed by `runFailureReason` (drops the
uuid-bearing prefix; empty for a bare token), so the on-canvas strip names the step by its
human title, not a UUID.

## Per-gap

**Gap 1 — per-node I/O inspection.** Clicking a step in the run view folds that node's real
data rows into one `NodeInspection` (input, output, error, agent trace, timing) and renders
it read-only. JSON shows in a collapsible pretty block with copy-to-clipboard; payloads over
~40 lines truncate to a leading slice with a "Show N more lines" expand. Agent nodes get an
"Agent trace" section (tool-calls count + collapsed tool-calls + the raw generation). Prose
output (an agent's answer) renders as markdown; structured data as JSON.
- `run-detail.ts` (`buildNodeInspection`, `extractAgentActions`, `extractTiming`,
  `formatDuration`, `stringifyPayload`, `truncatePayload`, `decodeRunNodeRows`).
- `RunPayload.vue` (the one reusable read-only payload block: collapse + copy + expand).
- `RunNodeOutput.vue` (drawer, rewritten to consume the fold).

**Gap 2 — failing node reason inline.** A calm on-canvas strip names the failing step and its
one-line reason with a "View details" jump that selects the node and opens the drawer; the
drawer shows the full structured error (or the honest fallback). Defensive per the decision
above.
- `WorkflowCanvas.vue` `failedNode`/`failedNodeTitle`/`failedReason`/`openFailedDetails` +
  the `.wf-run-fail-strip` template block.
- `run-detail.ts` `extractNodeError`, `runFailureReason`.

**Gap 3 — re-run with same input.** From the run view, "Re-run with same input" reads the
run's recorded Start `node.input`, prefills the existing Run-with-input dialog + SchemaEditor
(no second form), and opens it. Falls through to an empty payload if the input can't be read,
rather than blocking.
- `RunNodeOutput.vue` emits `rerun`; `WorkflowCanvas.vue` `rerunSameInput` + `openSimWith`.

**Gap 4 — states, not trash.** Existing calm node states kept (completed tint+check,
failed danger ring+x, running/awaiting pulse). Added: while a run overlay is showing, steps
that haven't run dim (`.wf--run .wfn.is-idle/.is-pending { opacity: .5 }`) so the ones that
did carry the eye. Selected-step header shows a status badge + duration. Empty/loading/no-data
states stay directed. SchemaEditor reused as the sole write surface; the new `RunPayload` is
its read-only counterpart (no duplicate JSON surface). Deleted the now-orphaned `.wf-run-section`
CSS rule.

## Files

New:
- `src/app/run-detail.ts` — pure fold + error/timing/reason/payload helpers (the testable core).
- `src/app/RunPayload.vue` — reusable collapsible/copy/expand payload block.
- `src/app/run-detail.test.ts` — 28 tests over the real fixtures + edge cases.
- `src/app/run-node-output.test.ts` — 5 mount-level tests (happy-dom) incl. a snapshot of the
  drawer rendering the real run-88444c66 agent-node fixture.
- `src/app/__fixtures__/run-88444c66-*.json` — captured API responses (detail + 3 nodes).
- `src/app/__snapshots__/run-node-output.test.ts.snap`.

Modified:
- `src/app/RunNodeOutput.vue` — drawer rebuilt on `buildNodeInspection`: error-first,
  input/output/agent-trace via `RunPayload`, status+timing, re-run action.
- `src/app/WorkflowCanvas.vue` — failing-node strip, `rerunSameInput`/`openSimWith`,
  `@rerun` wiring, `wf--run` root state class.
- `src/app/api.ts` — `RunNodeDataRow` gains `discriminator`/`created_at`; `getRunNodeData`
  delegates decoding to `run-detail.decodeRunNodeRows` (one decode impl, unit-tested without
  the proxy dependency).
- `src/styles.css` — run-inspector + payload + fail-strip + dim styling; tokens-only `--p-*`
  via the existing `--wf-*` vars, no hex/brand colors; removed one orphaned rule.
- `vitest.config.ts` — added the Vue SFC plugin (same `isCustomElement` rule as the app build)
  so the mount-level self-review can render; suite default stays node env, the mount test
  opts into happy-dom per-file.

## Verify

- vitest: **156 -> 189** passing (0 failing). +28 `run-detail`, +5 `run-node-output`; the 156
  baseline suites unchanged.
- vue-tsc (`--noEmit -p tsconfig.json`, binary from `app/frontend/applications/main`):
  **3 errors, all pre-existing and outside scope** (`widgets/…/ports.ts:71`,
  `WorkflowSetup.vue:35`, `workflow_setup.ts:28`) — identical to the consolidation report's
  baseline; zero in any touched file.
- Cannot see it live (build deferred). Self-review = the mount test snapshotting the real
  failed-run drawer (honest no-detail fallback, input received, produced answer, agent trace).

## Deferred

No `npm run build`; `platform/workflows/static` untouched, so these edits are not yet live.
Build + app restart is the next lane (confirm the `kickside/workflows -> ../platform/workflows`
lock replacement so the rebuilt static serves).
