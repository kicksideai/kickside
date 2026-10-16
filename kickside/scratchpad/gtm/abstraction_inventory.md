# Behavior-mounting abstraction inventory

Read-only reconnaissance of `kickside/platform/*`, `kickside/core/*`, `wapps/*`,
`providers/*`, and `crm/*`. Counts below are source-registry declarations in
`_index.yaml` files, excluding test/vendor indexes. A declaration count is not
always a count of user-visible objects: some entries are implementations,
compatibility entries, or multiple provider specializations of one concept.

## Executive summary

There are four layers that currently overlap:

1. **Runtime mounts**: `kind: contract.binding` entries with
   `meta.type: kickside.automation`, plus the v2
   `kickside.automation.binding` artifact. These are the actual trigger-to-code
   or trigger-to-workflow mounts.
2. **Reusable workflow vocabulary**: `kickside.flow.point`,
   `kickside.automation.trigger_point`, `kickside.automation.port`,
   `kickside.workflows.flow_template`, and `kickside.workflows.node`.
3. **Catalog packaging**: `kickside.automation.installable` packages a binding,
   sync, script, or manual setup recipe. It is not a new runtime primitive.
4. **Code and UI registries**: traits, tools, inbox item types, workers,
   processors, KB engines, and UI surfaces mount implementation or presentation
   behavior. Most are selectable/configurable, but not user-redefinable as
   workflows.

The main semantic fault line is between a **published, editable workflow graph**
and a **code function exposed as a node, script, trait, or mapper**. The latter
can be placed in a workflow, but its internal scoring, qualification, routing,
or provider behavior remains code-owned.

## Declaration census

| Mechanism / registry type | `kickside/platform` | `kickside/core` | `wapps` | `providers` | `crm` | Total | Where defined / primary consumers |
|---|---:|---:|---:|---:|---:|---:|---|
| `kickside.automation.installable` | 0 | 0 | 15 | 5 | 0 | 20 | Wapp/provider `_index.yaml`; `platform/automation-catalog/src/{catalog,service}.lua`; catalog UI |
| `kickside.automation.suggested_binding` | 0 | 0 | 1 | 0 | 0 | 1 | `wapps/precall/src/templates/_index.yaml:736`; suggestion/template consumers |
| `kickside.flow.point` | 2 | 0 | 11 | 0 | 0 | 13 | Platform automation/workflows and wapp domain indexes; flow-point resolver/UI |
| `kickside.automation.trigger_point` | 1 | 0 | 1 | 0 | 0 | 2 | `platform/automation/src/_index.yaml`; inbound wapp webhook index; trigger resolver |
| `kickside.automation.port` | 15 | 0 | 2 | 16 | 21 | 54 | Provider/source/sink indexes; automation source/sink and sync discovery |
| `kickside.workflows.flow_template` | 0 | 0 | 15 | 0 | 0 | 15 | Wapp template indexes; workflow template API/instantiation and catalog |
| `kickside.workflows.node` | 4 | 0 | 28 | 0 | 2 | 34 | Workflow/node indexes; node palette, validator, compiler |
| `kickside.automation.binding` artifact kind | 1 | 0 | 0 | 0 | 0 | 1 | `platform/automation/src/_index.yaml:772` and SQL `automation_bindings`; automation engine |
| `agent.trait` | 23 | 0 | 5 | 41 | 1 | 70 | Trait indexes; agent list/compiler and `AgentForm.vue` |
| `tool` | 30* | 0 | 4* | 47* | 1* | 82* | Function/tool indexes; tool list and agent compiler |
| `inbox.item_type` | 4 | 0 | 6 | 0 | 2 | 12 | Inbox and domain indexes; inbox projection/API and `InboxItem.vue` |
| `agent.gen1` | 12 | 0 | 0 | 0 | 0 | 12 | Platform agent indexes; roster/list APIs and agent runtime |
| `agent.memory_provider` | 1 | 0 | 0 | 0 | 0 | 1 | Platform agent index; memory option resolver/UI |
| `kickside.automation.trigger_mode` | 3 | 0 | 0 | 0 | 0 | 3 | Automation index; timer/watch/poll resolver |
| `kickside.automation.body_backend` | 4 | 0 | 0 | 0 | 0 | 4 | Execution/code-execution indexes; automation backend discovery |
| `kickside.kb_engine` | 2 | 0 | 0 | 0 | 0 | 2 | Knowledge engine index; KB engine resolver/UI |
| `kickside.core.threads.event` | 38 | 0 | 0 | 0 | 0 | 38 | Platform event indexes; event bus, trigger/port discovery, projections |
| `projection.worker` | 8 | 0 | 0 | 0 | 0 | 8 | Platform worker indexes; lifecycle/projection workers |
| `processor` | 7 | 0 | 0 | 0 | 0 | 7 | Platform processor indexes; upload/automation/background processors |
| `view.component` | 99 | 0 | 0 | 0 | 0 | 99 | Platform UI indexes; surface/component loader |
| `ui.nav_item` | 12 | 0 | 6 | 0 | 1 | 19** | UI indexes; shell nav aggregator |
| `ui.settings_tab` | 9 | 0 | 0 | 0 | 0 | 9 | Platform UI indexes; settings surface |
| `ui.account_item` | 2 | 0 | 0 | 0 | 0 | 2 | Platform UI indexes; account menu |

\* `tool` declarations are spread across platform indexes and imported module
indexes; the total is a registry-entry count rather than a useful product count.

\* The app itself adds a system nav item outside the requested platform/wapp/
provider/crm census, so the screenshot has 13 visible top-level items even
though the scoped source count is 19.

`kickside/core/*` contributes the scheduler/job contracts and runtime substrate,
not additional behavior meta-types in this census. In particular,
`kickside.cron:schedulable` and `kickside.cron:scheduler` are contract
definitions used by platform automation and core jobs.

## Detailed inventory

### 1. Automation contracts and runtime artifacts

| Mechanism | Defined in | Consumed by | Config surface | Overlap / boundary |
|---|---|---|---|---|
| `kind: contract.binding`, `meta.type: kickside.automation` | `kickside/platform/automation/src/_index.yaml`; domain bindings in platform/wapps/providers | `automation.install_type`, component APIs, workspace create picker, automation UI | Contract `inputs`; declared actions/controls; implementation function; optional `schedules`; public state; event/trigger handler | The user-visible automation type. It can mount code or a workflow, but is broader and older than the v2 binding artifact. |
| `kickside.automation.binding` | Registry kind in `platform/automation/src/_index.yaml:772`; persisted in `automation_bindings` | `automation.lua:create_binding`, trigger lowering, workflow consumer projection | `portable_key`, `title`, `trigger_point_id`, `trigger_config`, `runnable_ref`, `mapping_spec`, `execution_policy`; no user-facing `config_schema` | The most general trigger-to-runnable mount. Installable `binding_spec` lowers into this shape. |
| Automation binding kinds | `kind: contract.binding` entries named `workflow_kind`, `channel_responder`, `data_flow`/`sync`, `script`; recipe is a retired compatibility tombstone | `platform/workflows`, channel responder, sync, automation script installer | Each kind has its contract’s inputs and implementation; `data_flow` has source/sink/config; `script` has `script_ref`, trigger, config | These are named contract families, not independent user-facing meta-types. They overlap with v2 bindings and flow templates. |
| `kickside.automation.installable` | 20 entries in wapp/provider template/source indexes | `automation-catalog/src/catalog.lua` validates; `service.lua` lists/enables; catalog UI presents cards | Required `title`, `blurb`, `package`, `group`, `effect`, `install_via`, `config_schema`; `binding_spec`, `sync_spec`, `script_ref`, or `manual_spec` depending on route | Packaging and setup UX. It does not add a new execution model. Several entries carry a `binding_spec` that the selected `script` install path ignores. |
| `kickside.automation.suggested_binding` | `wapps/precall/src/templates/_index.yaml:736` | Template/suggestion discovery; it is not passed through the catalog installer as an installable | `binding_spec` with trigger, runnable/template, mapping and slot bindings | A recommendation/portable binding description. It overlaps the binding artifact but is not itself an installed binding. |

The catalog installer behavior is explicit in
`kickside/platform/automation-catalog/src/service.lua`:

- `binding` resolves config references in `binding_spec`, assigns the workflow
  or runnable, and calls recipe/binding installation.
- `sync` splits source, sink, and shared config and calls the generic sync type
  installer.
- `script` installs `kickside.automation:script` with the declared function,
  trigger spec, and config.
- `manual` records setup-required metadata and opens the supplied URL; it does
  not create a runtime automation.

### 2. Trigger, event, port, and workflow declarations

| Mechanism | Defined in / count | Consumed by | Config surface | Overlap |
|---|---|---|---|---|
| `kickside.flow.point` (13) | `platform/automation` and `platform/workflows`; wapp domain indexes | `platform/workflows/src/flow_points.lua`, workflow trigger APIs/UI | `point_id`, interface version, typed input/output, default runnable/template ref, observation metadata | Domain-owned, stable event-to-flow contracts. Similar to trigger points, but richer and often paired with a default editable flow. |
| `kickside.automation.trigger_point` (2) | Periodic trigger in `platform/automation/src/_index.yaml`; inbound lead webhook in `wapps/gtm_core/src/_index.yaml` | `automation.lua:list_trigger_points`, trigger resolver, binding UI | Context/input schema, selector schema, bind/invoke refs, UI metadata; periodic supports interval/cron UTC | Generic trigger interface. A flow point can supply the same trigger role; ports can expose the same source when the payload is modeled as data. |
| `kickside.automation.port` (54) | Platform source/sink ports plus provider and CRM indexes | Automation `list_sources/list_sinks`, sync UI/engine, workflow port/node pickers | Port id, `binding`, event/source/sink, surface/operations, input/output/config schema | A source port can express a trigger; a sink port can express an action. A sync pair is a source-to-sink specialization. |
| `kickside.core.threads.event` (38) | Platform event indexes | Event bus, projections, port discovery, trigger workers | Event name and payload schema, retention/stream metadata | Raw event declaration. It mounts nothing user-facing until referenced by a port, trigger point, or workflow node. |
| `kickside.workflows.flow_template` (15) | Wapp template indexes | Workflow template API, instantiate/publish paths, catalog/recipes | `portable_key`, title/description, graph document, nodes/edges/params, slots, validation slots | Reusable graph, not a trigger. Binding specs refer to a template/runnable; an installable often packages both. |
| `kickside.workflows.node` (34) | Platform, wapp, and CRM workflow indexes | `node_kinds`, validator, compiler, builder palette | `input_schema`, `config_schema`, `output_schema`, ports, authority scopes, lowering to engine node/function | User can compose the node but not redefine its lowering function. This is the principal place where code behavior appears workflow-addressable. |
| `kickside.automation.trigger_mode` (3) | `platform/automation/src/_index.yaml` | `trigger/resolver.lua` | timer/watch/poll mode and mode-specific lifecycle/config | Lifecycle policy for a trigger, not a runnable or workflow. |
| `kickside.automation.body_backend` (4) | `platform/execution` and `code_execution` indexes | Automation backend discovery and execution | Code/action/agent backend metadata and schemas | Execution implementation behind an automation; not a user graph. |
| Cron/schedule declarations | Core contracts `kickside.cron:schedulable`/`:scheduler`; automation periodic trigger and `schedules` arrays; sync schedule config | Core scheduler/jobs; `automation/schedule.lua`; scheduled action adapter | Interval, cron UTC, timezone/selector, enabled state, component/action reference | Three surfaces can mean “run on a schedule”: periodic trigger point, automation `schedules`, or sync schedule. They converge on scheduler tasks but differ in ownership and UI. |

### 3. Agents, tools, inbox, KB, and background behavior

| Mechanism | Defined in / count | Consumed by | Config surface | Overlap / limit |
|---|---|---|---|---|
| `agent.trait` (70) | Platform, provider, wapp, CRM indexes | `agents/src/api/list_traits.lua`, capability context/compiler, `AgentForm.vue` | Description/context schema; selected `trait_contexts`; optional build/prompt/web component and connection provider | A trait mounts prompt/build/tool/memory behavior into an agent. It is selectable, not a user-authored workflow. |
| `tool` (82) | Function registry entries across platform modules | `registry/tools.lua`, tool list API, agent compiler and runtime | Input schema, LLM alias/description, function source, authority | A tool is callable behavior, not a trigger or workflow. An agent/workflow node may invoke it. |
| `agent.gen1` (12) | Platform agent indexes | Agent roster/list APIs and runtime | Static module/prompt/model/trait wiring | System agents are code-declared and not user-editable as workflows. |
| User-agent contract | `platform/agents/src/_index.yaml`, `kickside.agents:user_agent` | User-agent API, compiler, `AgentForm.vue` | Prompt, model, temperature, max tokens, thinking effort, traits, trait contexts, tools, delegates, memory | User-configurable agent wrapper. The current config does not include trigger, approval policy, KB attachment, output type, or prompt history. |
| `agent.memory_provider` (1) | Platform agent index | Memory option API/resolver and form | Provider id/config | A memory backend selector, not a workflow mount. |
| `inbox.item_type` (12) | Platform, wapps, CRM indexes | `inbox/item_types.lua`, list API, projection, `InboxItem.vue`, custom web components | Value/title/icon/category/severity/priority, custom view, await arm, resolve callback, actions, form schema, timeout/escalation, priority mapping | Mounts human-in-the-loop work and callbacks. It overlaps a workflow human/approval node but remains a code-owned queue contract. |
| `kickside.kb_engine` (2) | Knowledge engine index | `knowledge/engines.lua`, KB APIs and UI | Create/manage component, config schema/default config, storage contract | Mounts KB storage/retrieval behavior, not automation. Agents can reference KBs, but the KB itself is not a workflow graph. |
| `projection.worker` (8) | Platform worker indexes | Projection/lifecycle worker runtime | Worker function, schedule/queue, projection metadata | Background behavior mount; no builder surface. |
| `processor` (7) | Platform processor indexes | Upload, automation, and background processor runtime | Processor function, queue/trigger metadata | Background behavior mount; no user-redefinable workflow surface. |
| `view.component` (99) | Platform UI indexes | App shell/component loader and host surfaces | Tag, route, component/module metadata | Mounts UI behavior, not business automation. It matters because it creates parallel configuration surfaces. |
| `ui.nav_item` (19 scoped, plus app System item) | Platform/wapp/CRM UI indexes and app index | Shell nav aggregation, `useSurfaces.ts`, `app.vue` | Label/icon/route/component/ordering/visibility | Mounts navigation. It is why the live shell exposes more than John’s six primary views. |
| `ui.settings_tab` / `ui.account_item` | Platform UI indexes, 9/2 | Settings/account shell | Label, route, component, ordering | Additional UI mounts, not workflow semantics. |

## Catalog installable matrix

There are 20 source declarations but 19 conceptual installables because
PhantomBuster and WebScout use the same local name for separate provider
implementations. “General equivalent” means the behavior can be represented
without the catalog card, using the general runtime primitive. It does not mean
the current installer already performs that lowering.

| # | Installable and source | Current `install_via` and actual install behavior | Binding/sync effect | General abstraction that can express the same behavior |
|---:|---|---|---|---|
| 1 | `automation.job_change_reconnect_review` — `wapps/contacts/src/templates/_index.yaml:33` | `binding`; resolves CRM, threshold, word cap, KB, and workflow refs, then creates a binding | `job_change_observed_point` → selected workflow, with slot bindings and mapping; workflow can emit review | Flow binding on the flow point/trigger point → published workflow template |
| 2 | `automation.curated_linkedin_comment_review` — `wapps/content_engagement/src/templates/_index.yaml:46` | `script`; installs the periodic script function with trigger/config. Its co-located `binding_spec` is not used on this path | Periodic curated-account pull/review script, with connection, cadence, rubric, KB, and workflow-looking config | Periodic trigger point → flow binding/workflow; or source port → workflow/inbox if modeled as data |
| 3 | `automation.stalled_deal_reengagement` — `wapps/deal_intelligence/src/templates/_index.yaml:34` | `script`; periodic script installation | Stalled-deal evaluation runs the declared code function; config supplies stage thresholds, cadence, KB, and draft limits | Periodic trigger/flow point → workflow template |
| 4 | `automation.approved_to_gmail_draft` — `wapps/deal_intelligence/src/templates/_index.yaml:60` | `manual`; setup card points to `/system/automations`; no runtime mount | Manual mapper `act_loop.gmail_draft` to Gmail draft sink | Resolved inbox/approval event → workflow → Gmail sink, if an event source is present |
| 5 | `automation.promoted_candidate_to_pre_call_brief` — `wapps/gtm_core/src/_index.yaml:247` | `binding`; creates a trigger binding and workflow runnable | `candidate_promoted` → selected workflow with CRM/profile/voice KB refs and mapped candidate payload | Flow binding on `candidate_promoted` → workflow template |
| 6 | `automation.market_watch_digest` — `wapps/gtm_core/src/market_watch/_index.yaml:374` | `script`; periodic script | Market-watch digest cadence and reference are passed to code | Periodic trigger point → workflow |
| 7 | `automation.market_watch_scan` — same file `:390` | `script`; periodic script | Scheduled market-watch scan | Periodic trigger point → workflow |
| 8 | `automation.market_watch_deep_scan` — same file `:406` | `script`; periodic script | Scheduled deep scan | Periodic trigger point → workflow |
| 9 | `automation.market_watch_source` — same file `:422` | `script`; periodic script | Scheduled source refresh | Periodic trigger point → workflow |
| 10 | `automation.watch_buying_signals` — same file `:438` | `script`; declared `binding_spec` is ignored because the installer selects the script branch | Periodic signal sweep with query budget/threshold config; the advertised hot escalation/mapping is not what the script branch installs | Periodic trigger point → workflow, then workflow event/inbox output |
| 11 | `automation.approved_to_hubspot` — `wapps/precall/src/_index.yaml:349` | `manual`; setup card and mapper | Manual `act_loop.hubspot_write` to HubSpot CRM sink | Resolved approval event → workflow → HubSpot sink |
| 12 | `automation.approved_to_gmail_draft` — `wapps/precall/src/_index.yaml:371` | `manual`; setup card and mapper | Manual Gmail draft mapper/sink | Resolved approval event → workflow → Gmail sink |
| 13 | `automation.brief_review_waiting_notify` — `wapps/precall/src/_index.yaml:389` | `manual`; setup card and mapper | Manual review notification mapper to channel post sink | Review-await event → workflow → channel sink |
| 14 | `automation.fireflies_call_to_intelligence` — `wapps/precall/src/templates/_index.yaml:55` | `binding`; creates source-trigger binding | Fireflies transcript source → workflow with mapped call payload and slots for CRM/KB/word cap | Source port or trigger point → workflow template |
| 15 | `automation.calendar_meeting_to_pre_call_brief` — same file `:759` | `binding`; creates source-trigger binding | Google calendar meeting source → workflow with meeting mapping and lookahead/lead-time config | Source port or trigger point → workflow template |
| 16 | `automation.sync_contacts` — `providers/hubspot/src/_index.yaml:35` | `sync`; calls generic sync installer | HubSpot CRM source port, object type `contacts`, direction/schedule/backfill/field map → CRM sink | Generic sync pair: source port → sink port with config |
| 17 | `automation.sync_companies` — same file `:64` | `sync`; calls generic sync installer | Same source/sink pair, object type `companies` | Generic sync pair |
| 18 | `automation.sync_deals` — same file `:93` | `sync`; calls generic sync installer | Same source/sink pair, object type `deals` | Generic sync pair |
| 19 | `automation.candidates_to_acquisition_intake` — `providers/phantombuster/src/source/_index.yaml:84` | `sync`; calls generic sync installer | PhantomBuster candidates source → GTM acquisition-intake sink, actor/query/cadence/row budget config | Generic sync pair |
| 20 | `automation.candidates_to_acquisition_intake` — `providers/webscout/src/source/_index.yaml:49` | `sync`; calls generic sync installer | WebScout candidates source → same acquisition-intake sink; query/cadence/row budget config | Generic sync pair |

The catalog’s config schemas are mostly setup references: connection ids,
component refs, cadence, thresholds, KB refs, field maps, row budgets, and
workflow refs. The general abstractions expose the same information as trigger
configuration, node/flow parameters, slot bindings, or source/sink config. The
catalog therefore adds discoverability, validation, defaults, and a guided
install path; it does not require a distinct behavior model.

## Code-path-only and code-fixed behavior

“Code-path only” has two meanings in this codebase. Some behavior has no
workflow invocation at all. Other behavior has a workflow node wrapper, but the
algorithm is still a fixed Lua function and cannot be opened and replaced in the
builder. Both matter for user-visible replaceability.

| Behavior | Workflow visibility today | What remains code-only / code-fixed | Evidence |
|---|---|---|---|
| Default acquisition qualification | **No** when no strategy workflow is configured; `qualify()` directly calls suppression, ranking, and review | Default suppression/ranking/review policy is hard-wired to `qualify_default`; a strategy workflow is an optional override | `wapps/gtm_core/src/import_funnel.lua:21-35` |
| Suppression and candidate ranking | **Partial**: exposed through GTM workflow node adapters, but not as editable decision logic | Suppression rules, ranking algorithm, thresholds, and persistence are Lua; the builder can place the adapter and pass inputs, not rewrite the algorithm | `wapps/gtm_core/src/import_funnel.lua`; `wapps/gtm_core/src/score.lua`, `prospecting.lua`, `import_sessions.lua` |
| Fit scoring / qualification | **Partial**: `workflow_node.score_fit` and related template nodes are visible | Rubric/calculation and result persistence are fixed functions; no user-authored scoring expression/rule graph is exposed by the node | `wapps/gtm_core/src/workflow/_index.yaml`; `wapps/gtm_core/src/workflow/workflow_nodes.lua`; `src/score.lua` |
| Candidate promotion and acquisition intake | **Partial**: workflow nodes exist | CRM resolution, deduplication, import funnel transitions, source normalization, and write policy are code adapters | `wapps/gtm_core/src/import_funnel.lua`, `import_sessions.lua`, `prospecting.lua`; `wapps/contacts/src/workflow/_index.yaml` |
| Contact resolution / merge review | **Partial**: `workflow_node.resolve_contact` can be placed | CRM source-pattern rules, confidence scoring, merge decision, field policy, echo suppression, and stale escalation are code-owned; the inbox card/callback is not user-replaced by a graph | `wapps/contacts/src/workflow/_index.yaml`; `crm/src/resolution/*`; `crm/src/policy.lua`; `crm/src/field_review.lua` |
| Pre-call research | **Partial**: `research_lead`, `owned_data_read`, and related nodes/templates exist | Search/provider calls, source selection, extraction, and evidence shaping are implementation functions; the user can reorder nodes but not replace the research implementation through the builder | `wapps/precall/src/workflow/_index.yaml`; `wapps/precall/src/workflow/workflow_nodes.lua` |
| Brief composition and reply drafting | **Partial**: `compose_brief`, `draft_reply`, and brief-review templates are visible | Prompt assembly, word caps, output shaping, and action-loop mapping are code/template behavior; the current UI has no per-agent output-routing or approval policy editor | `wapps/precall/src/workflow/_index.yaml`; `wapps/precall/src/templates/_index.yaml`; `wapps/precall/src/act_loop.lua` |
| Call-intelligence extraction | **Partial** where the extraction node/template is used | Transcript parsing/extraction schema and field normalization are fixed code/agent behavior; no user-facing extraction-stage replacement graph was found | `wapps/precall/src/calls/*`, `wapps/precall/src/workflow/*`, call template indexes |
| Script-based catalog automations | **No editable graph required by install** | Content engagement, stalled-deal, market-watch, and buying-signal scripts invoke declared functions. Config may mention a workflow ref, but the `script` installer installs the script branch and ignores a sibling binding spec | `platform/automation/src/script_automation.lua`; `platform/automation-catalog/src/service.lua`; cited catalog indexes |
| Manual catalog automations | **No** | HubSpot/Gmail/notification setup uses `act_loop` mapper methods and a sink; catalog enable only marks setup required | `platform/automation-catalog/src/service.lua`; precall/deal-intelligence catalog entries |
| Provider pulls, writes, and syncs | **No implementation replacement** | Source/sink ports expose configuration and wiring; provider API pagination, auth, field mapping, and write semantics remain provider Lua | Provider `_index.yaml` files; platform sync/connection runtime |
| Inbox ordering, timeout, escalation, and resolution callback | **No** general replacement graph | Priority ranking, recency ordering, timeout escalation, item projection, and `on_resolve` callbacks are inbox/CRM code paths | `platform/inbox/src/api/list_inbox.lua:1-3`; `platform/inbox/src/persist/reader.lua:54-58,114`; domain item indexes |
| Connection health and run gating | **No** general user-visible policy graph | `test_connection` exists as a runtime diagnostic, but no general UI or enforcement path ties unhealthy connections to preventing a particular agent/workflow run | `platform/connection/src/_index.yaml:181-196,323`; `platform/connection/ui/src/app/connections.vue` |
| KB ingestion, organization, embedding, and version lineage | **No** | Upload/ingest/archive processing and engine behavior are platform APIs/workers; KB references can be passed to agents/workflows, but the ingestion lifecycle is not a user-redefinable graph | `platform/knowledge/src/api/ingest_upload.lua`; KB engine indexes; knowledge UI |
| Agent traits, tools, and static system agents | **No implementation replacement** | Users select traits/tools and edit a user-agent prompt, but build/prompt functions, tool functions, memory providers, and `agent.gen1` wiring are registry/code-owned | Agent trait/tool indexes; `platform/agents/src/api/*`; `platform/agents/ui/src/app/AgentForm.vue` |

## Generalization conclusions

- A `binding_spec` is a packaging representation of “trigger point plus runnable
  plus mapping/slots.” The general runtime representation is
  `kickside.automation.binding` (or the older `kickside.automation` contract)
  pointing at a flow point/trigger point and a workflow/template.
- A `sync_spec` is a packaging representation of “source port plus sink port
  plus split config.” The general representation is a sync/data-flow binding
  between two `kickside.automation.port` declarations.
- A `flow_template` is the reusable graph and a `flow.point`/`trigger_point` is
  the event interface. Neither replaces the other; catalog entries often bundle
  both.
- A workflow node, agent trait, tool, inbox item type, or provider port can make
  code behavior composable without making the behavior replaceable. The live
  user boundary is therefore substantially narrower than the registry count.
