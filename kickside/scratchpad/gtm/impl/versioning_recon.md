# Workflows versioning recon vs W14 target model

Scope read first: `scratchpad/gtm/workflows_v2_decisions.md` W9 + W14 (+ W13 for run-inspector cross-check).
Repo: `platform/workflows` (src = Lua CQRS def/version/run planes, ui = builder Vue). Consumers checked:
`platform/automation/src/automation.lua` (bindings/runnables), `platform/workflows/src/compiler/materialize.lua`
+ `runnable/launch.lua` + `runner.lua` (Call node), `agent_tool.lua` (tool face), `template.lua` (template
instantiation). Live checks against `http://localhost:8085` using workflow
`019f487a-472e-74d2-927a-a2a1fe92130e` ("UX Audit Sandwich").

---

## W14.1 — Lifecycle (draft->publish, immutability, who/when)

**EXISTS.**

- `versions.lua:102-209` `M.publish(workflow_id, actor)`: inside one transaction, folds the definition
  read model at the current head (`store.read_state`/`workflow.build`, line 132-134), compiles it
  (line 147), allocates `version = MAX(version)+1` under `UNIQUE(workflow_id, version)` (lines 141-145,
  161-173), retries up to `PUBLISH_RETRIES = 6` (line 24) on a unique-collision race, and appends a
  non-projected `version.published` marker event into the SAME def event stream (lines 154-159) plus a
  realtime broadcast (lines 194-203).
- **Immutability, proven from the write paths**: the only SQL touching `workflow_versions` in the whole
  repo is `SELECT` (versions.lua:141, 217-218, 241-242, 270; `store.lua:257-258` `version_interface`;
  `automation.lua:1602-1609, 1963-1971` read-only lookups) and one `INSERT` (`versions.lua:161-168`).
  `grep -rn "workflow_versions" platform/workflows/src platform/automation/src` turns up no `UPDATE` or
  `DELETE` anywhere. The migration (`migrations/02_workflow_versions.lua:13-30,36-53`) only declares
  `up`/`down` (create/drop table), no alter-in-place path. There is structurally no code path that can
  mutate a published row once inserted.
- **Who/when**: `created_by` = the `actor` argument passed to `M.publish` (versions.lua:167; callers pass
  the authenticated actor, e.g. `exec_api.lua:124` `versions.publish(id, actor_id())`); `created_at` =
  `now()` (RFC3339 UTC, versions.lua:28-30, 167).
- Live: `GET /workflows/{id}/versions` returned exactly one immutable row
  `{"version":1,"def_seq":41,"created_by":"admin@wippy.local","created_at":"2026-07-09T16:33:50-04:00"}`
  while the live document's `head_seq` is 42 (one more def-event landed after publish) — confirms publish
  is a frozen point-in-time snapshot distinct from ongoing draft edits.

---

## W14.2 — Run pinning (version or snapshot? in-flight migration? API/UI exposure)

**PARTIAL** (backend: EXISTS and correct; run-inspector UI display: MISSING).

- `workflow_runs.version` is an integer column (`migrations/03_workflow_runs.lua:15,43`).
- `runs.lua M.launch` (742-800): when no direct `commands` are supplied, resolves
  `v = opts.version or versions.head(workflow_id)` (757-765, i.e. latest-published if unpinned), then loads
  the **immutable** version row via `versions.get(workflow_id, v)` (766) and takes its frozen
  `compiled_commands` (771). `start_compiled` (584-737) reminds those compiled commands to fresh
  per-run node/data uuids (`compiler.remint`, 628-636) and materializes a brand-new dataflow — after that
  point the run's engine state is independent bytes, not a live reference back to the definition. Because
  `workflow_versions` rows never mutate (W14.1), pinning the `workflow_runs.version` integer is equivalent
  to pinning the full frozen document/compiled-command snapshot: **an in-flight run cannot observe a later
  publish** — there is no read-path from a running dataflow back to `workflow_versions`.
- API exposure: `row_to_run` (runs.lua:166-190) includes `version`; `GET /workflows/{id}/runs` and
  `GET /workflows/{id}/runs/{run_id}` (api/_index.yaml:311-345) surface it. Live: the manual/published run
  `88444c66` returned `"version":1,"origin":"published"`; the `simulate` run `e3bc833e` returned
  `"version":0,"origin":"simulation"` — the distinction between a pinned published run and a draft-compile
  run is enforced and visible end to end.
- UI gap: `run.version` is never rendered. `WorkflowCanvas.vue` and `run-history.ts` show run status/error
  but no "ran on vN" badge anywhere in the run list or run detail; the only version badges in the whole UI
  are the Publish-toast (`WorkflowCanvas.vue:722-734`, ephemeral) and the Call-node picker's
  `Published vN` (`WorkflowCallPicker.vue:83,110`, about a *child* workflow, not the run's own version).

---

## W14.3 — Consumer references (pin policy per face; can any face run a draft?)

**PARTIAL.** The engine/contract layer supports "latest-published default, explicit pin optional" end to
end, but the only face with a built UI (the Call node) never actually uses the default — it always bakes
in a concrete pin — and the agent-tool face has the opposite gap (always dynamic, no pin option at all).

- **Call node**: `compiler/materialize.lua:125-136` (`base_config`, kind `workflow_call`) emits
  `config.runnable_ref = { kind = "workflow_definition", id = workflow_id, version = tonumber(cfg.version) }`
  — `cfg.version` comes straight from the node's canvas config. The builder UI
  (`NodeConfigPanel.vue:149-166`, `onWorkflowCallSelect`) sets
  `version: candidate.published_version || null` **at the moment the user picks a child workflow** in
  `WorkflowCallPicker.vue` — there is no "track latest" toggle, so every Call node the builder produces is
  hard-pinned to whatever was the latest published version at wiring time. At runtime,
  `runnable/launch.lua:73-157` (`launch_workflow_definition`) and `runner.lua:32-35` (`version_of`) DO
  correctly fall back to "resolve latest published at launch" when `ref.version` is absent
  (`runs.lua:757-765`) — the engine-level default exists — but the builder never emits that unpinned form.
- **Automation binding**: `automation.lua:workflow_runnables()` (1638-1686) computes
  `runnable_ref.version = <latest published at list time>` only for the runnable **picker's** advertised
  descriptor (1663-1666); the actual persisted binding row stores whatever `runnable_ref` the client submits
  verbatim — `validate_binding_spec` (2015-2040) requires only `runnable_ref.kind`, no server-side
  version-stamping or an explicit `pin_policy` field. `execute_binding` (2551-2634) reads
  `binding.runnable_ref` straight off the stored row (2603) unchanged into `M._launch_runnable`. So whether
  a binding floats to latest or is pinned depends entirely on what UI payload created it — and no
  automation-binding-creation UI component exists yet in `platform/automation/ui/src` (repo-wide grep for
  `runnable_ref`/`create_binding`/`createBinding` there found nothing); W9's target "Automations UI gains
  create-automation-from-workflow" is not built, so this face is currently backend-only/unexercised.
- **Agent tool**: `agent_tool.lua:M.descriptor` (56-88) via `version_row()` (42-54) defaults to
  `versions.head(workflow_id)` whenever no version is supplied, and the descriptor is rebuilt fresh every
  time an agent's tool list is resolved — there is no stored pin at all for this face (opposite gap from
  Call node: always-latest, no way to pin to a specific version).
- **Templates**: instantiation (`template.lua:M.instantiate`, 353-400) produces a brand-new, independent
  editable workflow — not a live reference to a running definition — so "pin policy" doesn't apply to this
  face; see W14.6 for the separate lineage-recording gap.
- **Can any path execute a draft?** No. Every non-simulate path (`runner.run` -> `runs.launch` with
  `has_direct_commands=false`) reads exclusively through `versions.head`/`versions.get`, which only see rows
  in the immutable `workflow_versions` table — a draft has no row there, so it is structurally unreachable.
  The only path that runs unpublished canvas state is `M.simulate` (`runs.lua:805-848`), which is
  explicitly the author-only "Run with input" action, distinctly tagged `trigger_kind="simulation"`,
  `origin="simulation"`, `version=0` — matching W9.4 ("published-only callable") for the automation/Call/tool
  faces.

---

## W14.4 — Compat at publish (interface diff, dependent enumeration/reverse index)

**MISSING.**

- `versions.lua:M.publish` performs exactly one check before allocating a version: compiler validation of
  the current document (`compiler.compile`, line 147; refusal on error, 148-151). It never reads the
  *previous* published version's interface, never diffs input/output/error schema shape, and never emits a
  warning/confirmation. `grep -rn "compat\|breaking\|prior_interface\|dependents"` across
  `platform/workflows/src` and `platform/automation/src` returns nothing.
- **No reverse index exists.** A Call node's reference to workflow X lives only inside *another* workflow's
  own `workflow_def_nodes`/config JSON (or its frozen `workflow_versions.document` blob); an automation
  binding's reference lives in `automation_bindings.runnable_ref`, a JSON column keyed by `binding_id`, with
  no index on the workflow id inside it; an agent-tool reference isn't even a stored artifact — it's
  resolved live from the agent's declared tool list. "Who calls workflow X" today would require a full
  table scan of every workflow's document/version JSON plus every `automation_bindings.runnable_ref` blob
  plus every agent's tool config — none of these scans exist anywhere in the codebase.
- **What already exists that a compat check could be built on**: `store.lua:M.interface_from_nodes`
  (161-196) / `M.interface_from_document` (198-201) already compute exactly the comparable shape
  (`input_schema`, `output_schema`, `error_schema`, `input_keys`, `output_keys`, `error_keys`, counts) from
  a document; `store.lua:M.version_interface` (250-270) and `M.latest_published_interface` (345-360)
  already fetch a given/latest published version's interface for a workflow_id — this is precisely the
  "previous published interface" a diff-at-publish check needs, one call away, already used by
  `list_workflows` to expose `published_interface` + `has_draft_changes` (confirmed live: the sandbox
  workflow shows `has_draft_changes: true`, `published_def_seq: 41` vs live `head_seq: 42`). The missing
  pieces are purely (a) the diff/incompatibility rule and (b) the dependent-enumeration query; the input
  data is already computed and queryable.

---

## W14.5 — History UX (list/single/diff API; builder UI surfaces)

**PARTIAL.**

- API: `GET /workflows/{id}/versions` -> `versions.list()` (versions.lua:211-232) returns
  `{version, def_seq, created_by, created_at}` newest-first, deliberately light (no document/commands).
  `GET /workflows/{id}/versions/{n}` -> `versions.get()` (234-263) returns the full frozen row (document,
  compiled_commands, allowlist, derived interface, input_schema, `is_partial`). Neither a diff endpoint
  (`versions/{a}/diff/{b}`) nor a restore-as-new-draft endpoint exists anywhere in `api/_index.yaml`.
- UI: `api.ts:listWorkflowVersions()` (`ui/src/app/api.ts:235-244`) calls the versions-list endpoint and is
  fully implemented client-side — but a repo-wide grep (`grep -rn "listWorkflowVersions" ui/src`) shows it
  is **never called** anywhere in the builder. There is no version-history panel, no read-only old-version
  viewer, and no diff view in the UI at all. The only version-related UI surfaces are: (1) a one-shot toast
  on Publish showing the new version number (`WorkflowCanvas.vue:722-734`), which disappears; and
  (2) `WorkflowCallPicker.vue:81-85,107-112` badges (`Published vN`, `Draft changes`) shown when picking a
  *child* workflow for a Call node — and these are sourced from `list_workflows`'
  `published_version`/`has_draft_changes` fields, not from the versions endpoint at all.
  (Side note, not in scope but adjacent: the picker still labels everything "Partial" — W9's terminology
  the decision record says should dissolve.)

---

## W14.6 — Templates/packs record source template + version

**MISSING.**

- `template.lua:M.instantiate` (353-400) creates a new workflow component (`workflow_repo.create`, 372),
  applies the resolved template document as commands (378-381), optionally publishes it (382-391), and
  returns `{workflow_id, title, commands, applied, published, template_ref}` — `template_ref` exists only
  in the **API response**, never persisted onto the created workflow record. No column/param stores which
  template — or which template version — an instantiated workflow came from.
- No `source_template`/`template_version`/persisted `template_id` field exists anywhere: grep across all
  seven workflow migrations (`01`-`07`) shows no such column; grep for `template_version`/`source_template`
  as a stored field (as opposed to an API request parameter) returns nothing.
- The template artifact itself has no version to record yet either: `template_def`/`slot_specs`
  (template.lua:32-68) read `entry.meta.definition{document, slots}` with no `meta.version`. Additionally,
  no module in this checkout actually declares a `kickside.workflows.flow_template` registry entry
  (grepped all `*.yaml`) — the instantiation mechanism exists but is currently exercised only by tests, so
  there isn't even a real template version in the wild to check against.

---

## Versioning-adjacent machinery worth reusing (not asked per-point, but relevant to any build-out)

- **Event-sourced def CQRS is already the audit trail.** `workflow_def_events` is the append-only authority
  (per-workflow monotonic `seq`, unique `(workflow_id, seq)`); `versions.publish` appends a
  `version.published` marker into this SAME stream (versions.lua:154-159) and broadcasts it over the same
  realtime channel node edits use (194-203). A history/timeline feature can read this stream directly
  instead of inventing a parallel audit log.
- **`workflow_versions` is already the "no parallel version store."** Per W8 discipline, any compat-check,
  diff, or history feature should read through the existing `versions.get`/`store.version_interface`
  helpers rather than adding new tables.
- **Interface derivation is duplicated once already — don't add a third copy.** `store.lua`
  (`interface_from_nodes`/`latest_published_interface`/`version_interface`) and `automation.lua`
  (`workflow_interface_from_nodes` at 1389, `workflow_latest_interfaces` at 1595) independently reimplement
  near-identical "derive Start/Finish/Error schema shape from a document's nodes" logic. A compat-at-publish
  feature should consolidate onto one of these, not add a third.
- **`workflow_runs`' invocation columns** (`migrations/07`: `parent_run_id`, `call_node_id`, `binding_id`,
  `trigger_point_id`, `invocation_id`, `runnable_portable_key`, `workflow_stack`) already capture "what
  called this run" provenance — useful for post-hoc run-level audit, though it doesn't help a pre-publish
  dependents scan (that needs a definition-level index, not a run-level one).
- **No generic "component version" convention exists elsewhere in kickside to borrow for W14.6.** The only
  per-module "version" anywhere is the static `version: "1.0"` string at the top of each module's
  `_index.yaml` — a manifest constant, not a runtime-versioned instance — not reusable for template-instance
  lineage.

---

## Verdict summary

1. **Lifecycle** — EXISTS. `versions.lua` publish is atomic, immutable (insert-only, no update path
   anywhere), and stamps `created_by`/`created_at`.
2. **Run pinning** — PARTIAL. Backend correctly pins to an immutable version (in-flight runs cannot
   observe a later publish) and exposes it via the runs API; the run-inspector UI never displays it.
3. **Consumer references** — PARTIAL. Engine supports latest-default + explicit-pin, but the Call-node
   builder UI always hard-pins at wiring time (never floats), the agent-tool face always floats with no
   pin option, and the automation-binding creation UI doesn't exist yet to judge. No face can run a draft.
4. **Compat at publish** — MISSING. No interface diff, no dependent enumeration, no reverse index; the
   comparable interface data already exists and is queried elsewhere (`store.version_interface`/
   `latest_published_interface`), so the diff and the reverse-index scan are the only missing pieces.
5. **History UX** — PARTIAL. List/get API exists and is reasonably shaped; diff and restore-as-new-draft
   are missing at both API and UI; the UI doesn't even call the list-versions endpoint it already has.
6. **Templates** — MISSING. Neither the source template nor its version is recorded on an instantiated
   workflow, and the template artifact itself has no version field to record.

**Biggest gap**: W14.4 (compat-at-publish + dependents enumeration) — it's the one point with genuinely
zero code today (not even a stub), it's the differentiator the decision record calls out explicitly
("this is the differentiator the typed model earns; n8n cannot do this"), and it's the one every other gap
compounds: without a reverse index, "who breaks" can't be answered even after a diff rule is written.

**What the compat check can be built on**: `store.lua:M.version_interface`/`M.latest_published_interface`
already produce the exact before/after interface shape (input/output/error schema + required-key sets) a
diff needs; `versions.publish`'s existing transaction (versions.lua:121-189) is the natural place to call
it against the new candidate's `interface_from_document` before inserting. The dependents-enumeration half
has no existing index to build on — it would need a new reverse index (workflow_id -> {calling workflow
Call nodes, automation bindings, agent tool registrations}), most naturally maintained incrementally at
Call-node-save time and binding-create time rather than scanned at publish time.
