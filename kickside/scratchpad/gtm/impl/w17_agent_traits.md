# W17 — Agent workflow traits

Implemented on `c2f5a5ec` as one scoped backend change (no live-app restart).

## Traits

- `kickside.workflows:workflow_call_trait` contributes one generic
  `run_workflow(workflow_ref, input)` ToolDef. The adapter re-resolves the exact
  target under the ambient acting identity, verifies lifecycle and READ/WRITE
  access, validates `input` against the target's latest published Start schema,
  then uses the existing Face-3 runner seam (`spawned_child_run` + await Finish).
- `kickside.workflows:workflow_awareness_trait` contributes an actor-scoped
  catalog prompt. Each compact line is `id — title: description | Start: {...}
  | Finish: {...}`; whitespace is normalized, names/descriptions are clipped,
  and each interface lists at most six typed fields rather than a raw schema.

## Materialization decision

Used one generic ToolDef, not per-workflow ToolDefs. Per-workflow schemas would
make every agent's tool payload grow linearly with the catalog and repeat rich,
context-heavy Start contracts. The compiler already supports dynamic trait
contributions, and the awareness trait supplies the discovery/interface context
needed by the generic call. The adapter performs target-specific validation on
the server before a run is created (and `runs.launch` validates again). There is
no existing hybrid materialization pattern to extend.

`params.agent_tool.enabled` remains the curated Face-3 `workflow_tools_trait`
surface. These two traits are the deliberate broad grant and intentionally do
not require that opt-in.

## Security and lifecycle matrix

| State for acting user | Awareness catalog | Generic call |
| --- | --- | --- |
| READ + WRITE, published and enabled | included | allowed |
| no READ | omitted | `access denied` |
| READ only | omitted (not runnable) | `access denied` |
| draft / no published version | omitted | unavailable |
| paused / disabled | omitted | `workflow is disabled` |
| deleted | omitted | unavailable |

Catalog discovery uses the existing actor-filtered workflow list and its
published-interface projection; no system/global listing is used. The adapter
rechecks access immediately before execution, so revocations fail closed. It
runs under the ambient identity supplied by the agent execution path; the reused
runner preserves the existing frozen `execution_identity` behavior for deferred
awaits. Published versions are immutable and there is no mutable unpublish
operation; the lifecycle-removal equivalent (delete), publish-from-draft, and
pause/resume catalog updates are covered by the harness.

## Modules touched

- `platform/workflows/src/_index.yaml`
- `platform/workflows/src/agent_tool.lua`
- `platform/workflows/src/repo.lua`
- `platform/workflows/src/engine_execution_test.lua`

`repo.list` now carries the authoritative workflow enabled state from the
actor-scoped component context, allowing all workflow consumers to suppress
paused workflows consistently.

## Tests

Baseline: 247 tests. Final full workflow harness:

```text
cd platform/workflows/test && wippy run test
249 tests passed (248 workflows + setup)
```

Delta: +2 live dataflow tests covering trait compilation, generic call/Finish
round-trip, Start-schema validation, hidden non-curated workflow execution,
READ/WRITE denial, and draft/publish/pause/resume/delete catalog changes.

## Reload

The new registry entries and Lua modules require the normal workflow module
reload/redeploy before they are active. No restart was performed; the live app
on port 8085 was not touched.
