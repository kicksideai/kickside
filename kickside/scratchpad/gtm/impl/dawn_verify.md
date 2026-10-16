# DAWN — final dawn verification (http://localhost:8085)

Date: 2026-07-10. Stack: full overnight reload, 294 routes, DB `app/.wippy/app.db`.
Auth: admin@wippy.local via `POST /api/public/user/token`. Method: API (curl) + isolated
headless Chrome over CDP:9222 (shared playwright MCP was locked as warned).
Screenshots: `/tmp/.../scratchpad/dawn/shots/`. Downloads: `.../dawn/downloads/`.
ENV blocker (expected): no model provider — agent runs fail `No models found for class: fast` / `AGENT_EXEC_FAILED`. Classified ENV-BLOCKED, not defect.

## Verdict: 8/8 capabilities PASS. One real DEFECT found (item 3 teardown).

| # | Item | Verdict | Key evidence |
|---|------|---------|--------------|
| 1 | Publish gate | **PASS** | unbound `inbox_decision.prompt` -> HTTP 422 + directed error on the node; bind -> publishes v1 |
| 2 | Export/import round-trip | **PASS** | row-menu Export downloads honest-named JSON (no compiled_commands); import -> distinct-named draft, graph-equivalent |
| 3 | Periodic automation e2e | **PASS** (crown) + **DEFECT** | fired 12x @60s w/ trigger+dedup evidence, mapping proven; 0 fires after disable. DELETE path 500s + leaks schedule (see defect) |
| 4 | Recipes assembler | **PASS** | lowered model renders (trigger + what-it-creates); no generation-era editor; apply creates+links both artifacts |
| 5 | Trigger catalog | **PASS** | `GET /automations/trigger-points` = 39 pts (periodic + 30 event + 7 poll + 1 webhook), schema-driven; UI picker grouped |
| 6 | List | **PASS** | LOCATION absent for root rows (never fabricated); binding row -> "Workflow" runnable_ref link; no partial vocab. Breadcrumb-present: mechanism only (see note) |
| 7 | Traits post-reload | **PASS** (ENV-blocked conversation) | 3 workflow traits live; agent creatable bearing both traits; `run_workflow` ToolDef shape intact |
| 8 | Regression pulse | **PASS** | builder loads; sandwich Google node passes, agent ENV-blocked; debug drawer + run inspector; History button; export disabled on drafts w/ hint |

## Evidence

### 1. Publish gate — PASS
- API: workflow Start->`inbox_decision`(config `{}`)->Finish. `POST /workflows/{id}/publish`
  -> **HTTP 422** `{"error":"publish refused","errors":[{"code":"node_config_missing",
  "message":"node decide config.prompt is required; bind it or declare it as a slot",
  "node_id":"decide"}]}`.
- Builder (`09b`): red banner "Not publishable: node decide config.prompt is required;
  bind it or declare it as a slot" AND the **Review node renders red with a warning badge
  on the node**.
- Bind `config.prompt` -> publish **200 v1** (API) and green "Published version 1. It's now
  callable — as an automation, a Call node, or an agent tool." (`09c`).

### 2. Export/import round-trip — PASS
- Row ⋮ -> **Export** downloads `workflow-019f4aea-...workflow.json` (honest name, 2362B):
  `kind=workflow_definition, schema_version=1, version=1`, **no compiled_commands**,
  nodes `[start, template_echo, finish]` (`10`, downloads/).
- Import (`POST /workflows/import`) -> new draft `019f4aee-...`, `status=draft`,
  graph-equivalent (`start->template_echo(result)->finish`). Distinct name ("Workflow
  019f4aea-..." vs source "DAWN — echo pure"); shows as a Draft row in the list (`03`).
  Import modal live: "Paste a portable workflow export, or choose a file. It lands as a
  new unpublished draft."

### 3. Periodic automation end-to-end — PASS (crown) + DEFECT in teardown
- Automate deep-link (builder) navigates to canonical `/automations?backend=<workflow-id>`
  (plain id, no `partial:` prefix) (`06b`).
- Created via `POST /api/v1/recipes/apply`: `workflow_ref` (kind=workflow_definition),
  `trigger_point_id=kickside.automation:periodic_trigger_point`,
  `trigger_config={schedule:{type:interval,expression:"60s",tz:"UTC"}}`,
  `mapping_spec={v:1,mode:expr,expr:"{ text: input.fired_at }"}`. Returned binding +
  registered schedule (mode=timer, phase=live).
- **Fired 12x exactly 60s apart** (07:27:08 -> 07:38:08Z). Each run: `trigger_id`=binding_id,
  `dedup_key`=`<schedule_id>:<fired_at>`, `origin=published`, `status=completed`. Mapping
  proven: a fired run's output `text` == the `fired_at` timestamp
  (`{"result":{"prefixed":"DAWN> 2026-07-10T03:29:08-04:00","text":"2026-07-10T03:29:08-04:00"}}`).
- After disable: **0 further fires over ~2.5 min** (07:39:08–07:42:08 slots all empty).

**DEFECT — recipe/v2 automation binding cannot be torn down; leaks its schedule.**
- `DELETE /api/v1/automations/{id}` -> **HTTP 500** `delete_component:
  kickside.component.persist:teardown:70: attempt to call a non-function object`, and the
  cron schedule kept firing (4 more fires after the failed delete).
- Root cause: recipes `create_binding` uses the v2 binding path (rollback lives in
  `automation_bindings.lowering_state.rollback`), but DELETE routes to legacy
  `automations_lib.uninstall`, which replays the umbrella's `private_context._rollback`
  (empty for v2) then calls `svc:delete` -> `teardown.lua:70 instance:delete({})`. The v2
  binding kind (`automation_binding_kind`) declares only `component` + `binding_runtime`
  contracts (actions execute/poll) — it does **not** bind `kickside.contract:deletable`,
  so `:delete` is a non-function. The correct teardown `automations_lib.delete_binding`
  (disable -> detach schedule -> remove row) is not HTTP-exposed. The component-class cron
  row also can't be removed via `DELETE /kickside/cron/{id}` (403 "class 'component'
  cannot be deleted"; its handler omits the `lifecycle=true` marker `delete_schedule` uses).
- Stopped out-of-band: disabled the leaked cron row in `app.db`
  (`enabled=0,status='disabled'`) -> 0 fires; removed the binding footprint in cleanup.

### 4. Recipes assembler — PASS
- "Automate a workflow — Run a published workflow on a trigger" dialog (`07`) renders the
  lowered model: Name; Runs = "From a template — a new workflow you can edit" + "Or a
  published workflow" pickers (what-it-will-create); When = trigger picker + schedule
  config ("Runs every N minutes", "At specific times", "Evaluated in UTC").
- **No** Code/Action/Agent/backend/sink/composer editor anywhere. Apply mechanism proven
  in item 3 (created workflow + binding, linked via runnable_ref).

### 5. Trigger catalog — PASS
- `GET /api/v1/automations/trigger-points` -> `success, count=39`; kinds
  `{event:30, collection_poll:7, webhook:1, schedule:1}`; periodic
  `kickside.automation:periodic_trigger_point` (kind=schedule) present; each row carries
  `selector_schema`/`context_schema`.
- UI picker (`08`) renders the fetched catalog grouped (Channels/Confluence/CRM/Developer/
  ... + "On a schedule"), searchable, schema-driven config per point.

### 6. List — PASS
- LOCATION column present; **absent (empty) for every root workflow** — never fabricated
  (`03`, `12`).
- Binding row -> workflow link: the automation row for "DAWN — periodic echo" renders a
  green **"Workflow" link** (`06b`, `15a`); the binding's `runnable_ref.id` == the echo
  workflow id (API-confirmed).
- No partial vocabulary: `WorkflowList.vue` has no "partial" user text; list uses
  Flat/Grouped + All-labels; status vocab is v1/v2/v3·draft/Draft. (Remaining `is_partial`
  is an internal Call/Embed picker field, not list/create vocab.)
- Breadcrumb-PRESENT note: a workflow placed via API under a domain container
  (contacts-memory) recorded `parent_id`+`path` in the DB but surfaced no breadcrumb — the
  list projection (`repo.enrich_locations`) only surfaces actor-readable navigable-parent
  meta.title. Mechanism confirmed in code; present-case not live-driven (no user-navigable
  workspace folder available to place into on this instance).

### 7. Traits post-reload — PASS (conversation ENV-blocked)
- `GET /api/v1/agents/traits`: `workflow_call_trait`, `workflow_awareness_trait`,
  `workflow_tools_trait` all live.
- Agent "DAWN — trait agent" created; read-back traits =
  `[workflow_call_trait, workflow_awareness_trait]`. Creation requires a `model` (ENV-blocked
  provider) — a placeholder model let creation+attachment succeed; a live conversation is
  ENV-blocked.
- `run_workflow` ToolDef shape intact (agent_tool.lua): one stable tool, schema
  `required [workflow_ref, input]`, `workflow_ref`=string "Exact workflow id from the
  Workflow catalog", `input`=object — matches w17_agent_traits.md.

### 8. Regression pulse — PASS
- Builder loads (`04`): Start->Template echo->Finish, palette Structure/Agents/Automations/
  Workflows/Logic (Branch/Combine/For each/Loop/Wait).
- Sandwich (`13`): present as v3·draft. Run `ff2017b7`: **Start ✓, Google Search ✓
  (passes), Refund Triage ✗** `Refund Triage failed: No models found for class: fast`
  (single-prefix, ENV-blocked LLM), Error branch ✓, Read Web Page/Finish pending.
- Debug drawer (`13b`): "Runs" past-runs list; run inspector (`13c`) overlays per-node
  status + "Click a step ... to see what it received and produced", "Re-run with same input".
- Version history via labeled **History** button (`05`): v1 CURRENT by admin@wippy.local,
  interface READ-ONLY (IN text / OUT prefixed,text / ERROR none).
- Export disabled on drafts with hint (`12`): draft row ⋮ -> "Export" grayed,
  "Only published workflows can be exported."

## Cleanup
- Deleted all DAWN workflows (echo pure, publish gate, gate UI, placed, imported draft) +
  the auto-instantiated "Template echo" child + "DAWN — trait agent" (all DELETE 200).
- Periodic binding: DELETE failed (defect above); removed its full footprint via DB
  (kickside_components, component_meta x5, component_access, automation_bindings, cron row).
- Final state: workflows back to original 3; 0 DAWN residue; **0 scheduled+enabled cron
  rows** (no schedules left running); isolated Chrome shut down. (Left untouched: pre-existing
  workflow-kind automations and the extra sandbox run added to the sandwich's history.)

## Binding deletion fix verification — 2026-07-10

- v2 `automation_binding_kind` now binds `kickside.contract:deletable`. Its lifecycle
  handler uses the canonical binding delete path: detach the lowering (including its
  component-class cron row), remove the workflow-consumer projection and binding row,
  then let component teardown unregister the shell.
- `DELETE /api/v1/automations/{id}` now classifies v2 binding shells and enters that
  standard kind teardown; legacy automation umbrellas still use `uninstall` and replay
  their rollback ledger. Missing ids return the directed 404 envelope.
- Cron DELETE now forwards `lifecycle=true` to its scheduler request, allowing the
  owner lifecycle path to reap component-class rows.
- Added harness coverage for: v2 deletable declaration; a periodic binding whose cron
  row fires once, deletes, loses both binding and row, and cannot fire again; v2 versus
  legacy routing; HTTP 200/404 envelopes; and cron lifecycle-marker forwarding.
- Regression runs: `platform/automation` **343 passed** (+8 from 335 baseline),
  `platform/workflows` **267 passed**, `core/cron` **100 passed** (+1 from 99 baseline).
  `wippy lint` for automation remains blocked by the pre-existing 354-error module/dependency
  type-check baseline; the runnable harness suites passed.

## Periodic dispatch race guard — 2026-07-10

- The binding executor now re-reads the binding row at the periodic fire-to-launch
  boundary. A deleted or paused owner turns the already-claimed tick into one debug-logged,
  terminal successful skip; it cannot dispatch a runnable or trigger a scheduler retry.
- TDD coverage simulates a due periodic tick whose binding is synchronously deleted before
  launch, and the matching pause window. Both prove no runnable launch; the existing normal
  periodic-fire mapping and launch case remains green.
- Regression runs: `platform/automation` **346 passed** (+2 new race cases over the current
  344-test baseline); `core/cron` **100 passed** (unchanged).
- The live app on 8085 was not restarted or modified. Reload is required to activate this
  source change in a running deployment.
