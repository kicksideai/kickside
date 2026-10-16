# W15c FE Stages 2-4 — logic vocabulary (frontend)

Commit `e43451ef` on `main`, built on ui HEAD `a73a706b`. Scoped, not pushed. Backend
contract frozen at `a73a706b`; `platform/workflows/src` untouched, `app/wippy.lock`
untouched, no production build, `static/` untouched.

## Per-scope outcome

### Stage 2 — for_each
Canonical **For each** palette entry (`for_each`) replaces the retired Parallel. Config
panel: source-array key, batch size (default **8**), and an "if an item fails" toggle
(`continue_on_error`) whose per-setting copy is engine-honest — off = stop at the first
failed item, that failure is this step's failure (routable via the Failed port), output is
the results array in source order; on = attempt every item, each entry carries its result
or `{ code, message }`. The `body`/`done` ports are kept (the compiler accepts a non-`body`
continuation edge); the done-port label is updated to the array-output truth ("→ all
results"). Legacy stored `parallel` docs alias to For each (`LEGACY_KIND_ALIAS`) and heal on
edit, preserving the retired sequential/continue behavior (batch 1, `continue_on_error =
on_error != 'fail_fast'`, `on_error` stripped) — mirrors `logic_nodes.legacy_config`.
New: `for-each-node.ts`. Copy: `logic-copy.ts` `FOR_EACH_*`.

### Stage 3 — call_workflow
Canonical **Start Workflow** kind (`call_workflow`) with the always-present Finished
(`result`) / Failed (`failed`) ports. Legacy `workflow_call`/`start_workflow` alias and heal
on the picker edit (`callWorkflowKindPatch`). The panel hint states the blocking semantics
honestly and that the Failed port carries `{ code, message }`, so the author knows the shape
they wire downstream. New: `call-node.ts`.

### Stage 4 — generalized failed port
An **additive** danger-hued Failed handle rides alongside a node's existing default/named
success handles (rendering model extended so a success edge never dangles). It is offered on
ordinary failing kinds (`agent/tool/func/signal/for_each/cycle`), quiet until hovered,
selected, or opted in. Opt-in is contract-faithful: `config.failed_port: true` exposes the
face; a `source_port:"failed"` edge is the runtime opt-in; dragging a route from the canvas
handle sets `config.failed_port` in the same commit (no config-panel spelunking). Existing
`source_port:"error"` edges render equivalently (aliased to the `failed` handle); new edges
write `failed`. The stable `{ code, message }` schema (`FAILED_PAYLOAD_SCHEMA`,
`additionalProperties:false`) is fed to connect-validation for the stored-edge badge, the
edge panel compat read, and the live mid-drag hint, so compat checking works on failed
edges. A panel-side "Failure route" toggle mirrors the same opt-in. New: `failed-port.ts`.

### Loop cap copy
`LOOP_MAX_ITER_HINT` now says the step fails with `MAX_ITERATIONS_EXCEEDED` and offers its
routable Failed port to recover instead of ending the run. The Loop kind is in the
failed-port set, so the Loop card and panel expose the recovery route.

### Agent-tool toggle
A "Use as agent tool" checkbox in a new Workflow-settings popover by Publish, writing
`params.agent_tool.enabled` via `param.set` (legacy flat `expose_as_agent_tool` read). Exact
params shape from `agent_tool.lua` `exposure_from_document`. New: `workflow-settings.ts`.

## Rendering-model note
The generalized Failed port required extending the port model: `renderedHandles` now takes a
`hasFailedPort` flag and appends `failed` to the sources set additively (never replacing the
default/named success handles), and `WfNodeData` carries `failedPort` (offered) +
`failedWired` (opted in). `graph-sync.buildFlowData` computes both, canonicalizes
`error -> failed` on render, and uses `FAILED_PAYLOAD_SCHEMA` as the upstream schema for
needs-mapping on failure edges.

## Verification
- **vitest 273 -> 307 passed** (34 new). New/extended coverage: for_each config round-trip
  to the canonical shape + legacy parallel heal (batch/continue) + container derivation for a
  stored parallel; call_workflow kind heal + legacy render with Finished/Failed ports;
  failed-port helpers + additive rendering + error->failed edge binding + `{code,message}`
  compat in connect-validation; loop/for_each/call copy honesty; agent-tool param round-trip.
- **vue-tsc clean** in every touched file. The 3 remaining repo errors
  (`widgets/ui/src/app/ports.ts`, `WorkflowSetup.vue`, `workflow_setup.ts`) are pre-existing
  baseline, unrelated.
- **Static contract proof** (read-only) against the backend's own fixtures: for_each
  `{source_array_key, batch_size, continue_on_error}` (`compiler/compile_test.lua:668-728`);
  `config.failed_port=true` + `source_port="failed"` recovery edge and `failed_port` stripped
  from runtime args (`compile_test.lua:879-891`, `workflow_test.lua:190`,
  `engine_execution_test.lua:602-623`); legacy `source_port="error"` equivalence
  (`engine_execution_test.lua:292`); `MAX_ITERATIONS_EXCEEDED` via the failed port
  (`coverage_gauntlet_test.lua:526-538`); `call_workflow {workflow_id, version}` + result/
  failed ports (`versions_test.lua:381`, `compile_test.lua:605`); `params.agent_tool.enabled`
  (`agent_tool.lua:34-40`).

## Live bundle staleness
No production build was run and `static/` is untouched, so the served workflows bundle does
not reflect these changes until a `vite build` is run and its dist is synced into the
module's vendored static (per the "Workflows module vendored static" convention). Source and
tests are the source of truth here; the live app on 8085 predates the backend contract.

## Commit scoping
One scoped commit. The four stages are an atomic change: `graph-sync.ts` imports all three
new modules, `kinds.ts`/`NodeConfigPanel.vue`/`WorkflowCanvas.vue`/`styles.css` each carry
multiple stages, and the new tests assert the new vocabulary — so any per-stage split via
whole-file staging would leave an intermediate commit that fails to build or has failing
tests (interactive `git add -p` is unavailable in this environment). Kept to a single
building, green commit, matching the FE Stage-1 precedent of one commit per stage boundary.
