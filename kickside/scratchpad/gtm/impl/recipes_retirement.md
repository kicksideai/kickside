# Recipes retirement — backend consolidation lane

## Stage 0 — recon (no product code)

### Baseline and constraints

- The app is live on port 8085. This lane did not inspect or restart it, and makes no UI
  build changes.
- `app/wippy.lock` was already modified before this work started. The requested final
  clean status cannot be achieved without touching that explicitly protected file; it is
  left untouched.
- Pre-change suite inventory: Recipes has 80 `test.it` cases, Automation 333, and
  Workflows 257 source cases (the runnable Workflows harness reports 256 tests, including
  its setup suite). The initial full-suite run was green only for Workflows: `256/256`.
  Recipes failed before test discovery because its harness loads `wippy.relay:central.service`
  without the now-required `host`; Automation failed during dependency resolution before
  discovery because its harness lock/dependency graph cannot load
  `kickside.automation:automation`. These are pre-change harness failures, not product-test
  failures.

### What Recipes is today

Recipes currently defines an installable automation kind,
`kickside.recipes:recipe_automation`, whose input grammar is:

```text
{ title, enabled, timeout_seconds, max_retries,
  trigger: trigger-spec-v1,
  step: { backend_ref, config },
  sink?: { port, config },
  environment: { tool_ids, contract_ids, agent_ids } }
```

At installation, `cx_automation.install` normalizes this state and asks
`kickside.automation.trigger:trigger_service` to provision a timer/watch/poll machine. It persists
the service-owned `_trigger` block inside the Recipe component and stores the Recipe-owned
step, optional sink, environment, retry settings, pause state, and per-envelope
`_recipe_turns`. `run`, `write`, and `on_event` all route to `run_step`/`dispatch_backend`.
That code resolves a `kickside.automation.body_backend` and calls its `run_ref`; a special
`runnable_ref` branch opens `kickside.workflows:runner` itself. It optionally opens a writable
sink and writes the result. This is a complete trigger-to-execution path owned by Recipes,
parallel to the workflow runner plus automation binding path.

The UI mounts as the creation view for that type. It renders backend, code/action/agent
authoring views, trigger-config, optional sink, and environment fields; then posts the old
input to `POST /api/v1/automations` or edits it through
`PUT /api/v1/automations/{id}`. The old `run_recipe_port` also lets a workflow invoke an
installed Recipe, and `recipe_workflow_node` lowers that port to a function node. Both make
Recipes a runnable/workflow-like species of its own.

### Action/generation path

`POST /api/v1/automations/compose` is a Recipe-specific intent compiler. It asks an LLM to
choose a body backend, trigger spec, optional sink, and environment; then calls that backend's
`generate_ref`, validates it through `cx_automation.validate_recipe`, and returns the old
Recipe grammar. `kickside.execution` supplies the code/action/agent backends. In particular:

- the Action backend calls a selected tool using `args_config`;
- the Code backend generates and runs sandbox Lua against the SDK;
- the Agent backend invokes an agent with Recipe-specific run shaping.

This produces workflow-like behavior outside the workflow definition plane: an opaque
trigger machine invokes a Recipe-owned dispatcher, which invokes generated/action/agent code
and optionally a sink. The generated source and action configuration never become an ordinary
template-instantiated workflow definition with lineage.

### Existing declarations and parallel implementation sites

1. `platform/recipes/src/_index.yaml`: `recipe_automation` contract binding and its
   install/run/on-event/pause/resume/reconfigure/write entry points.
2. `platform/recipes/src/cx_automation.lua`: validation, trigger installation, backend
   dispatch, direct workflow runner opening, sink dispatch, turn bookkeeping, and lifecycle
   controls.
3. `platform/recipes/src/api/composer.lua` and `api/compose.lua`: the Recipe-specific LLM
   decision/generation/validation path and `/automations/compose` endpoint.
4. `platform/recipes/src/traits/automation_manager.lua`: defaults Task composition to the
   Recipe automation type and installs/reconfigures it.
5. `run_recipe_port` plus `recipe_workflow_node`: a Recipe-owned runnable port and a
   workflow palette shim that invokes it.
6. `platform/recipes/ui`: backend picker, code/action/agent authoring and old automation
   install/reconfigure calls. This lane will not modify it.
7. `platform/execution`: body-backend declarations and `generate_ref` providers consumed by
   Recipes. They are external providers, but their Recipe-facing generation contract is a
   parallel authoring path and must no longer be called by Recipes.

### Standard seams available for lowering

- `kickside.workflows:flow_template.instantiate` creates an editable workflow through
  definition CQRS, writes `template.instantiated` lineage with bound slots, and publishes it.
  It is the module-level template mechanism; it is intentionally distinct from Wippy
  dataflow's internal `flow.template()` helper.
- `kickside.automation:automation.create_binding` persists the canonical binding
  `(trigger_point_id, runnable_ref, mapping_spec)`, registers a standard binding component,
  projects workflow consumers, and lowers the trigger through the shared trigger service.
  Its execution dispatch opens the one workflow-runner contract.
- The template-backed-node pattern introduced in `c2f5a5ec` is the reference declaration:
  a module ships a portable flow template and a normal reference declaration; instantiation
  supplies slots and lineage, and execution lowers to ordinary pinned `call_workflow`.

### Lowering target

A Recipe declaration will become thin assembly:

```text
{ portable_key, title, trigger_point_id, trigger_config,
  flow_template | workflow_ref,
  slot_bindings, mapping_spec, enabled?, parent_id? }
```

Applying it must instantiate the selected flow template (when provided) using the standard
lineage-producing seam, then create an ordinary automation binding to that workflow using
the standard binding seam. Recipes must not install a trigger machine, run a backend, open a
runner, generate code, or own a runnable port/node.

### FE contract for the FE lane

The Recipes view becomes a declarative assembler, not a backend/body editor. It renders:

1. a trigger-point picker plus that point's configuration;
2. a flow-template/workflow picker and a **what this will create** summary (new editable
   workflow title/template lineage and automation binding title);
3. only the selected template's declared slot bindings, plus the standard mapping editor;
4. the standard automation creation result (`binding_id`, `workflow_id`, pinned version,
   enabled state), after which navigation can go to the workflow or automation.

Required backend contract:

- Replace the Recipe type install payload with `POST /api/v1/recipes/apply` accepting the
  lowering shape above and returning `{ success, binding, workflow }`.
- `workflow` contains `{ workflow_id, version, template_ref? }`; `binding` is the normal
  Automation binding row. The UI must use the existing Automations binding-creation flow for
  pause/resume/delete rather than Recipe actions.
- Retire UI dependencies on `/automations/compose`, `/automations/body-backends`, old
  `POST /automations` with `kickside.recipes:recipe_automation`, old Recipe config reads,
  reconfigure, `run_recipe_port`, and the Recipe workflow node.
- For legacy component ids, show the migration result supplied by the heal endpoint; never
  call legacy Recipe actions after the cutover.

## Stage 1 — lowering

Implemented `kickside.recipes:lowering` and `POST /api/v1/recipes/apply`.
`lowering.apply` accepts only the declaration grammar above. A template declaration calls the
published `kickside.workflows:instantiate_flow_template` function with its slots and actor;
an existing published `workflow_ref` skips instantiation. Both then call only
`kickside.automation:automation.create_binding` with the trigger point, mapping, workflow
runnable ref, authority scope, and standard `component_owner` execution policy.

The new seam has no imports or calls for trigger service, body-backend discovery, generated
code, sink writing, or workflow running. It also explicitly rejects the old
`trigger`/`step`/`sink`/`environment` grammar, preventing a new caller from falling back to
the parallel path. A failed binding leaves only an ordinary lineage-bearing workflow, never a
Recipe trigger/execution runtime, and returns that workflow id for recovery.

Tests added: five lowering cases (template slots + binding assembly, existing-workflow path,
retired grammar rejection, ambiguous-path rejection, and binding-failure recovery). Recipe
source cases are now 85 (+5); Automation and Workflows source counts are unchanged.

Verification: the module-local Recipes lint reports no diagnostics for
`kickside.recipes:lowering`, `kickside.recipes:apply`, or `kickside.recipes.api:apply`; it is
otherwise blocked by 252 pre-existing diagnostics in Automation and transitive modules. The
full Workflows suite remains green at 256/256. Recipes and Automation still fail before test
discovery on the same dependency-graph problem: `kickside.automation:automation` is not
created, so all dependent entries are unresolved. A narrowly-scoped harness probe confirmed
that Recipes' earlier Relay host failure was only the first symptom; even after supplying its
missing Relay/Session bindings, the shared Automation node is absent. No test-harness edits
are retained in this change.

Stage 2 is intentionally not started: the required Stage 1 full-suite gate is not green, and
repairing the Automation module/harness graph would be a separate entanglement from Recipe
retirement.

## Suite repair — Automation harness dependency graph

The Automation suite failure was introduced by `1a8933ff` (`workflows: consolidate interface
derivation`). That change made `kickside.automation:automation`, `binding_execute`, and
`binding_poll` directly import `kickside.workflows:store`, but its standalone harness did not
declare or mount `kickside/workflows`. The unresolved store prevented the Automation library
from being constructed, so every entry importing it remained unresolved before test discovery.

The harness now declares the local Workflows replacement and mounts it against its in-memory
database/router/process resources. The new store-projection test was also corrected to select
its projected workflow by id instead of relying on catalogue order. No production behavior or
test is skipped or relaxed.

Verification: standard `make test` in `platform/automation` now passes **327/327 runnable
tests** (previously dependency-graph failure before discovery). Source inventory remains 333
`test.it` declarations; the runner groups several table-driven cases differently.

## Stage 2 — same-change retirement and applied-instance healing

The Recipe-owned execution path is gone. Removed declarations and source cover the old
installable Recipe runtime (`cx_automation`), the backend/composer/decision-schema generation
path and `POST /automations/compose`, the Automation Manager trait that installed those
recipes, the Recipe writable `run_recipe_port`, and the Recipe workflow palette node. Recipes
now exposes only assembly (`POST /api/v1/recipes/apply`) and migration
(`POST /api/v1/recipes/heal`). No Recipe code resolves a body backend, calls `generate_ref`,
opens a workflow runner, installs a trigger, dispatches a sink, or owns a runnable node.

### Applied Recipe migration

`POST /api/v1/recipes/heal` takes:

```text
{
  legacy_component_id,
  declaration: {
    portable_key, title?, trigger_point_id, trigger_config?,
    flow_template | workflow_ref, slot_bindings?, mapping_spec?,
    guard_expr?, authority_scope?, execution_policy?, enabled?, parent_id?
  }
}
```

The old state contains opaque code/tool/agent body configuration, not a truthful native
workflow graph, so heal deliberately requires the selected standard template or published
workflow instead of guessing a conversion. It first checks DELETE access, creates the new
workflow/binding with `enabled=false`, replays the legacy component's persisted rollback chain
and deletes that component, then enables the new binding only if the old Recipe was enabled.
If legacy teardown or enabling fails, it removes the disabled replacement binding; a
template-instantiated workflow remains a normal lineage-bearing recovery artifact, never a
Recipe trigger/execution runtime.

The former `kickside.recipes:recipe_automation` id remains only as an unannounced,
non-installable deletion/tombstone binding so existing component rows can be cleaned up. A
stray old timer/watch/poll callback pauses its trigger and returns `migration_required`; it
never executes its stored backend. This prevents an old resource from continuing as a parallel
runtime while keeping its rollback chain and component identity available to heal.

### Recipe UI contract for the FE lane

The existing Recipes UI/static bundle was intentionally not edited or rebuilt in this backend
lane. Its replacement is a declarative assembler:

1. Render a trigger-point picker and that point's `trigger_config` fields.
2. Render a flow-template or published-workflow picker, then a **what this will create**
   summary: template lineage/new editable workflow title (when applicable), workflow id/version,
   and Automation binding title/enabled state.
3. Render only the selected template's declared slot bindings plus the standard binding mapping
   editor. Do not render Code, Action, Agent, backend, sink, environment, or composer controls.
4. Submit the lowering grammar to `POST /api/v1/recipes/apply`; consume
   `{ success, workflow: { workflow_id, version, template_ref? }, binding }` and navigate to
   the standard workflow or Automation binding.
5. For a legacy component id, submit `{ legacy_component_id, declaration }` to
   `POST /api/v1/recipes/heal` and show `migration.workflow`, `migration.binding`, and
   `migration.legacy_component_id`. Never call a legacy Recipe action after cutover.

The UI must retire `/automations/compose`, body-backend/sink authoring, old
`POST /automations` with the Recipe type, Recipe config reads/reconfigure, `run_recipe_port`,
and the Recipe workflow node. Pause/resume/delete now use the ordinary Automation binding flow.

### Stage 2 verification and reload

- Recipes: **5/5 runnable harness entries green**; 19 source `test.it` cases cover lowering,
  healing ordering/failure cleanup/access checks, tombstone quiescence, and manifest retirement.
  The prior 85 Recipe cases exercised the removed dispatcher/composer behavior and are replaced
  by assembly/migration coverage rather than retained against a non-existent runtime.
- Automation: **327/327** green after the harness repair.
- Workflows: **259/259** green on the current shared worktree. The original baseline record was
  256; the three additional cases are in pre-existing concurrent Workflows edits, not this lane.

The module manifest/API changed, so a normal application/module reload is required for the new
entries to take effect. This lane did not restart or otherwise alter the live app.
