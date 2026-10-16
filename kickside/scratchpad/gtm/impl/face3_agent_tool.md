# Face 3 — agent-tool discovery wiring

## Outcome

Published workflows with `params.agent_tool.enabled=true` now appear as typed callable
tools when an agent enables the public **Workflow tools** capability. The capability is
the platform's existing `agent.trait` contribution model; it is not a workflow-specific
catalog or an agents-module fork.

## Discovery seam

- Declaration: `platform/workflows/src/_index.yaml:504-531` registers
  `kickside.workflows:workflow_tools_trait` (`meta.type: agent.trait`) and connects its
  `build_func_id` to `kickside.workflows:workflow_tool_build`.
- Contribution: `platform/workflows/src/agent_tool.lua:114-160` lists the ambient
  actor's visible workflow components, reads the latest published descriptor, and emits
  Wippy `ToolDef` values. Each value preserves the graph-derived Start schema and adds
  `workflow_tool` context to the existing private
  `kickside.workflows:agent_tool_adapter`.
- The standard Wippy agent compiler invokes that build function for a configured trait;
  the live harness test compiles that trait, then invokes the resulting registered tool
  function.

No `platform/agents`, Wippy-agent, or dataflow module was changed. The only module
touched is `platform/workflows` (implementation, declaration, and its existing tests).

## Access, lifecycle, and version policy

- Discovery uses `workflow_repo.list()` and rechecks component `READ` access per
  descriptor (`agent_tool.lua:77-110`); non-visible workflows are omitted.
- Invocation re-resolves the descriptor and requires component `WRITE` access before
  launch (`agent_tool.lua:168-197`), matching the normal workflow run door. This makes
  a stale compiled tool fail closed after a revoke, delete, or disabling publish.
- Only the latest published version is described and invoked. This is the selected
  **latest-published** policy, recorded as **W14.3-pending**; an explicit per-consumer
  pin is not introduced here.
- The descriptor's input schema is the published Start schema, and the adapter returns
  the Finish result through `runs.await_result`.

There is no mutable unpublish transition in the current immutable-version lifecycle.
Publishing a disabled version removes discovery; deleting a workflow removes it as the
lifecycle removal equivalent. Both paths are covered.

## Native-lowering reconciliation (W9)

The Wippy native tool path executes the adapter as a regular registered `function.lua`
tool. The workflow itself continues to execute through `kickside.workflows:runner` in
`spawned_child_run` mode.

Direct `flow.lua` nested lowering is intentionally not used for the workflow body:
inside a dataflow context it returns `_control.commands`, which creates child nodes under
the enclosing agent node. It cannot express the runner's required independent root
dataflow, reminted published command stream, `workflow_runs` row, run id, lifecycle
emissions, and asynchronous completion/read-back. `flow.start()` also rejects an async
start from a nested dataflow context. Lowering the published stream directly would
therefore bypass the one runner seam and erase spawned-run semantics. The adapter calls
the runner and awaits its Finish output instead; this is the precise W9 exception, not a
parallel execution engine.

## Verification

`cd platform/workflows/test && wippy run test`

- `242/242` passed in 6.6s.
- Baseline was 240 including setup; delta is **+2** tests.
- Added coverage proves trait-compiler discovery, Start-schema propagation, local
  dataflow adapter invocation/Finish result, draft-versus-published visibility,
  disable/re-enable/delete removal, and access denial for a non-permitted actor.

## Restart

Restart/reload required to activate the new registry trait and function declarations in
a deployed app. No restart was performed; the live app on port 8085 was not touched.
