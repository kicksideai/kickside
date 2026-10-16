# W14 compatibility-at-publish implementation

## Stage 1 — consolidate interface derivation

- `platform/automation/src/automation.lua:1516-1542` now reads published workflow
  interfaces through `workflow_store.latest_published_interface`; the duplicate
  node/schema derivation was removed. Binding validation uses
  `workflow_store.version_interface` and `start_input_schema_from_document` at
  `1862-1907`.
- `platform/automation/src/_index.yaml:660-716` declares the shared store import
  for each automation entry compiled from this source.
- Regression coverage: `platform/automation/src/automation_test.lua` verifies the
  runnable catalog uses the workflow-store projection; the standalone workflow
  suite adds the shared-projection regression at
  `platform/workflows/src/versions_test.lua:166-184`.
- Commit: `1a8933ff workflows: consolidate interface derivation`.

## Stage 2 — consumer reverse index

- Schema: `platform/workflows/src/migrations/08_workflow_consumers.lua:11-52`
  creates `workflow_consumers(workflow_id, consumer_type, consumer_ref,
  pinned_version, floating)` with primary key `(workflow_id, consumer_type,
  consumer_ref)`, plus `workflow_consumer_index_meta`.
- Projection/read model: `platform/workflows/src/store.lua:407-520` materializes
  immutable published Call references (`<parent>@v<version>#call:<node>`),
  agent-tool exposure (`<workflow>@v<version>`), and mutable automation bindings
  (the binding id). `versions.publish` writes Call/tool rows in its existing
  transaction at `platform/workflows/src/versions.lua:282-286`; automation binding
  create/delete writes the binding projection at
  `platform/automation/src/automation.lua:2046-2057,2129-2151`.
- `store.consumer_dependents(workflow_id)` returns exactly
  `{consumer_type, consumer_ref, pinned_version, floating}`. A null
  `pinned_version` with `floating=true` tracks latest published; a positive version
  has `floating=false`.
- Backfill: the first dependents read calls `rebuild_consumer_index`
  (`store.lua:456-492`), replaying immutable `workflow_versions` plus existing
  `automation_bindings`, then writes the `v1` marker. This is a component-owned
  materialized read-model rebuild, not a new synchronizer.
- Tests: `platform/workflows/src/versions_test.lua:186-274` covers all three
  consumer faces and the lazy legacy backfill.
- Commit: `e79ebdda workflows: materialize consumer reverse index`.

## Stage 3 — compatibility check at publish

- Diff and gate: `platform/workflows/src/versions.lua:100-183,240-258` compares
  the candidate graph-derived interface to the latest published interface before
  allocating the new version.
- Implemented breaking rules:
  - Start input: a newly required field, removal of a prior named field, or a type
    change of a prior named field.
  - Finish output: removal or type change of a prior named field.
  - Error schema: removal of a prior named field.
  Adding optional Start fields or any new Finish/Error fields is non-breaking.
- API: `platform/workflows/src/api/exec_api.lua:135-166` accepts
  `POST /workflows/{id}/publish` body `{ "confirm_compatibility": true }`.
  A breaking publish with dependents returns HTTP 409:

  ```json
  {
    "success": false,
    "confirmation_required": true,
    "warning": {
      "breaking": true,
      "confirmation_required": true,
      "changes": [{"face":"start_input","kind":"start_required_added","field":"region","message":"..."}],
      "dependents": [{"consumer_type":"automation_binding","consumer_ref":"binding-id","pinned_version":null,"floating":true}]
    }
  }
  ```

  Repeating the same request with `confirm_compatibility: true` publishes normally.
  Non-breaking candidates and breaking candidates with zero dependents publish
  normally; consumers are never rewritten or auto-migrated.
- Tests: `platform/workflows/src/versions_test.lua:276-350` covers true/false
  diffs, warning/confirmation, and zero-dependent fast path.

## Verification and operations

- Baseline in this sandbox: `210 passed, 1 failed`; the failure is the pre-existing
  run-detail access test because sandbox policy denies its temporary
  `127.0.0.1:19137` listener.
- Final workflow-suite run: `216 passed, 1 failed` (the same environmental socket
  failure). The six passing-test delta is the W14 coverage added here.
- Restart required: yes, deployment/service reload is required to load the Lua and
  apply migration 08. No restart was performed; the live app on port 8085 was not
  contacted or changed.
