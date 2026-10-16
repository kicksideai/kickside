# Workflow vocabulary cleanup

Date: 2026-07-10

## Scoped commits

1. `5119ca5d workflows: retire partial vocabulary`
2. `93dc0d82 workflows: retire agent tool opt-in`

## Partial vocabulary (W9)

Removed:

- List-level `is_partial` / `is_published_partial` projection and the `partial`
  query filter. The list endpoint now returns the ordinary repository rows directly
  (`platform/workflows/src/api/list_workflows.lua:19-26`).
- Version/snapshot/call-node markers, while preserving the interface itself. The
  latest-published projection is now only `{ version, def_seq, interface }`
  (`platform/workflows/src/store.lua:491-503`).
- The automation `kickside.workflows.partial:*` dynamic-body-backend namespace.
  Body backends now come only from declared registry entries
  (`platform/automation/src/automation.lua:2745-2775`); workflow definitions remain
  runnable descriptors (`platform/automation/src/automation.lua:1471-1508`).

Kept:

- Boundary-derived interface and `portable_slots` (`platform/workflows/src/store.lua:200-210`).
- The published interface and child `call_workflow` ports that power the Call picker
  (`platform/workflows/src/store.lua:365-395`).
- The boundary-removal guard, renamed to an interface lifecycle guard rather than a
  species check (`platform/workflows/src/workflow.lua:300-305`, `624-629`).

Compatibility:

- No data migration was run. A stored root-level `is_partial` marker is suppressed on
  read as non-authoritative (`platform/workflows/src/store.lua:369-374`); ordinary
  legacy params are retained and ignored by interface derivation.

## Agent-tool opt-in (W17)

Removed:

- `params.agent_tool.enabled` / `expose_as_agent_tool` discovery and the dedicated
  descriptor declaration. The typed trait now derives all published, enabled,
  actor-launchable workflows from the canonical runnable catalog
  (`platform/workflows/src/agent_tool.lua:202-223`).
- Agent-tool consumer-index writes. Published documents now project only actual
  Call-node consumers (`platform/workflows/src/store.lua:545-567`); old persisted
  `agent_tool` rows are ignored when reading dependents
  (`platform/workflows/src/store.lua:631-640`).
- `params.agent_tool.llm_description` fallback from both agent and runnable
  descriptors (`platform/workflows/src/agent_tool.lua:121-144`,
  `platform/workflows/src/runnable_catalog.lua:60-82`).

Kept:

- The static typed adapter and `workflow_tools_trait`
  (`platform/workflows/src/_index.yaml:652-691`, `788-801`).
- The generic `run_workflow` adapter, the workflow-call trait, and awareness trait
  (`platform/workflows/src/_index.yaml:693-757`, `759-786`).
- Shared descriptor, access rechecks, Start-schema validation, runner invocation,
  and await-result behavior (`platform/workflows/src/agent_tool.lua:99-152`,
  `322-376`). The generic and typed trait faces both re-resolve through this path.

## Consumer sweep

- Backend Lua source outside tests: no active `is_partial`,
  `is_published_partial`, `is_partial_call`, or `kickside.workflows.partial:*`
  consumer remains. The sole source match is the compatibility suppression noted
  above.
- Sibling `wapps`, `providers`, and `crm` source trees: no matches.
- No remaining `params.agent_tool.enabled`, `agent_tool.enabled`, or
  `expose_as_agent_tool` source path was found.
- Read-only UI/static matches still exist in the current worktree under
  `platform/workflows/ui`, `platform/automation/ui`, and `platform/recipes/ui`.
  They were not modified because this lane explicitly excludes `platform/*/ui` and
  UI/static rebuilds. Some of those UI directories were already dirty when this lane
  started.

## Tests

- Baseline: workflows `267` (including setup).
- After W9: workflows `266` green; automation `331` green. Delta is `-1` workflow
  test because the retired list-filter-only test was removed; the interface,
  compatibility, Call-port, and no-dynamic-backend assertions were retargeted.
- After W17: workflows `266` green. Face-3 coverage now proves disabled legacy
  metadata does not hide a published workflow, both trait faces compile, the typed
  adapter executes, lifecycle/access checks still apply, and legacy consumer rows are
  ignored.

## Reload

Reload/restart required to activate changed Lua modules and registry declarations.
No restart, UI rebuild, or change to `app/wippy.lock` was made; the live app on 8085 was
not touched.
