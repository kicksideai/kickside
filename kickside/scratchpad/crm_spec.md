# KickSide CRM — component spec (draft v0.7)

An **installable hub module** that is the central record brain of a kickside workspace.
Goal (user): a **very simple yet very powerful, highly extensible core** — platform-grade, to build N
go-to-market strategies on, with **a rich event backbone** as the reactive spine.

## v0.7 — idiomatic convergence (codex-grounded, NORMATIVE)
An adversarial idiomaticity pass (grounded file:line against core/component, core/core, chestor/graph,
platform/inbox) reframes the core from "3 data + 1 projection + 3 control planes" into a clean
**ownership split**. The elegance principle: **declaration over implementation — the CRM owns query shape,
not platform machinery.**

| CRM-OWNS (thin, projection-style) | PLATFORM — DECLARE, never re-implement |
|---|---|
| Record **semantics** + Attributes + typed value index | Record **shell** / ACL / placement / lifecycle / public-meta (`core/component`) |
| **Associations** (projected record-edge table) | Thread **event store** + projection runner + cursors (`core/core`, graph pattern) |
| Views / segments / layouts (saved-query records) | **Realtime** = public-meta counters + `component.meta.changed` relay (inbox pattern) |
| **Projections** (value index · membership · activity · reconciliation) | **Scheduler** = Trigger service + `core/cron` (timer mode) |
| **Reconciliation** (merge/supersede/external-id) | Event `external_source/external_id/correlation_key` cols + data-contract idempotency |
| **CRM write constraints** (validation/required/field rules) | **Security** = component ACL + declared `security.policy` (NO second ACL) |
| Sink (`kickside.data:writable`) · agent tools · view.components | Source/sink ABI · agent traits/tools · `view.component`/`ui.nav_item` · shared widgets |

Three hard corrections to the sections below (they override the older prose):
1. **Associations are NOT thread edges.** `kickside_thread_edge` relates `from_thread_id→to_thread_id` and
   records are component ROWS with no thread of their own (only the one CRM aggregate thread exists). The
   **Edge concept survives; its storage changes**: `crm.relation.linked/unlinked` events on the CRM thread
   → a CRM-owned `crm_association(crm_id, from_record_id, to_record_id, relation, ...)` projection.
   Containment stays component **placement** only.
2. **Policy/Identity/Scheduler are declarations, not CRM planes.** Rename Identity→**Reconciliation**
   (CRM owns only the merge/supersede tables). Policy→**CRM write constraints** + declared security. Scheduler
   is entirely the Trigger service + cron. The "control plane" naming survives only as *why these three are
   declared against platform services instead of folded from events* — not as CRM-built subsystems.
3. **CRM core does NOT implement `installable`.** In this runtime `installable` is the *automation* contract
   (`core/contract`). CRM core is a hub MODULE (plan→`wippy.lock`); its component binding implements
   **`deletable`** (cascade cleanup) only. `portable` optional.
4. **Provisioning = create-on-demand (graph pattern), NOT `provision.scope: workspace`.** Autoinit supports
   only `user`/`system` scopes (unknown collapses to `user`, `core/component/src/autoinit.lua`). So the CRM
   binding omits `meta.provision` and declares `component: { create, manage }` + `thread_class: workspace.crm`
   like `chestor/graph`; the install/create path materializes ONE CRM component per workspace and the declared
   projections auto-apply from its `impl_id`. (A real workspace-scope provisioner is a future platform add.)
5. **Schema/view authoring is event-sourced too.** `crm_attribute` and `crm_view` are not direct-write config
   tables — object/attribute/view definitions are `crm.attribute.*`/`crm.view.*` events on the CRM thread,
   projected into those tables. ONE write backbone (no silent writes), replayable, same discipline as records.

Everything below stands as the detailed design; read it through this ownership lens.

## THE LAST CRM — the honest core (small, no branding)
Not a CRM with features — a **record substrate + control planes + an AI operating layer**, every part
standing on a kickside mechanism that already exists. It's the last CRM because the core is tiny and
everything else is data/config over it. But "tiny" is an *honest decomposition*, not a slogan: an
adversarial pass falsified a cute "six primitives, everything derives from events" framing — three concerns
genuinely do NOT derive from an append-only log, they are separate **control planes**. Naming them is what
makes the design buildable instead of merely elegant.

**DATA core — three primitives, the source of truth:**
1. **Record** = Object + Attribute (a typed node; attributes are data rows, queryable via a value index —
   NOT component meta). (kickside: `kickside_components` row + CRM-owned `crm_record_value_index`)
2. **Edge** — a typed relation between records; the graph. (kickside: NOT thread edge — records have no thread; a CRM-owned `crm_association` projection folded from `crm.relation.*` events on the CRM thread)
3. **Event** — append-only; every change is an event; the audit/source log. (kickside: `kickside_event`, `01_thread.lua`)

**One serving mechanism (a runtime optimization, not a "primitive"):**
- **Projection** — every read model is folded from events: value index, collection membership, activity
  timeline, identity map, counts. A **View** is just a saved-query Record rendered (table | board | timeline);
  pipeline/segment/report are views. (kickside: the `projection.lua` worker — the level you endorsed)

**THREE control planes — the honest "sevenths" (they gate / reconcile / schedule; they do NOT derive from events):**
4. **Policy** — pre-write enforcement: validation, required-fields, field-level security, permission-sets,
   approval gates, assignment rules. Blocks BEFORE the append; events are post-facto. (kickside: security/ACL + a thin CRM constraint layer)
5. **Identity** — reconciliation: dedup, merge, canonical write-target, external-id maps, echo-suppression.
   (kickside: the event `external_source/external_id/external_version/correlation_key` columns + a merge projection)
6. **Scheduler** — time-triggers: sequences/cadences, SLA timers, follow-up wake-ups. A future wake-up is not
   derivable from a log. (kickside: the Trigger platform service, timer mode)

**Actors write through ONE path** (human · API · **Agent**), each gated by Policy. The Agent is not a data
primitive — it is an *operator* that reads projections, emits events, and fills attributes; a component like
any other writer, not a special substrate concept.

**Every CRM "feature" is a derivation of the six:**
| CRM concept | = derivation |
|---|---|
| Contact / Company / Deal | Record types (data-defined) |
| Pipeline + stages | a board **View** + a stage/membership **Projection** |
| Activity timeline | a **Projection** of **Events** filtered to activity types |
| Relationship (works-at, decision-maker) | typed **Edges** |
| Custom object / field | a Record type / Attribute — data, no migration |
| Automation / workflow | an **Agent**/rule subscribing to **Events** |
| AI enrichment / lead scoring | an **Agent** filling **Attributes** / emitting **Events** |
| Segment / saved list / report | a **View** |
| GTM strategy / motion | a package = {Views + rules + Agents} — a saved bundle, NOT a core concept |
| Count / badge / KPI | a **Projection** surfaced declaratively (the inbox-badge pattern) |
| Provider sync / import | an adapter emitting **Events** (in) / an **Agent** writing (out) |

**Why it's still the last CRM:** the data core is three primitives; everything else is a projection, a
saved-query record, a policy rule, an identity match, or a schedule — all data/config, all riding existing
kickside mechanisms, no per-object machinery. **Super simple:** 3 data + 1 projection + 3 control planes.
**Super powerful:** any GTM motion is a bundle of records + views + policies + schedules + agents. The
honesty — naming Policy/Identity/Scheduler instead of hiding them inside "events derive everything" — is
exactly what makes it buildable, not just elegant. Discipline: a proposed feature lands as data/config on
these seven concerns, or it doesn't land.

## Architecture in one line — CQRS on kickside primitives
- **Write model / source of truth = REUSE:** each entity is a `kickside_components` row (identity,
  access, lifecycle) whose every change emits a typed **event** on its thread (`core/core` event store).
- **Read model = CRM-OWNED thin projections** materialized from the event stream: a value index, a
  collection membership table, an activity projection, an identity/merge table.
- So "each contact is a component" (your intuition) holds for the record SHELL; the CRM owns only the
  **query projections** — NOT a parallel canonical record store. Events are the source; projections are
  their materialization; **the event backbone and the queryability are the same mechanism.**

(Critique-grounded: the real `component_service` query DTO supports only impl_ids + exact-meta + component
columns — no arbitrary attribute filter/sort/range/FTS/stage query, and `meta` is string-only public
render data. So arbitrary CRM fields must NOT live in meta; they live in the value index.)

## Reuse vs Own — the hard line (do not blur)
| REUSE (platform owns) | CRM OWNS (thin, projection-style) |
|---|---|
| `component_service` — record shell, access, lifecycle | `crm_record_value_index` — typed queryable attribute values |
| thread **event store** — audit + source-of-truth log | `crm_collection_membership` — pipeline stage/position |
| automation **ports** (`pullable`/`writable`, trigger ABI) | `crm_activity_projection` — timeline across records/participants |
| **agent traits/tools** toolkit | `crm_identity` / merge — dedup, supersede, external-id map |
| **hub install** flow (`ns.requirement` gate) | `crm_view` — saved filters/segments over the value index |

## The core — SEVEN concepts (added View/Segment; the critique showed 6 can't back "N strategies")
1. **Object + Attribute (schema-as-data).** object type = a contract-binding impl_id; attributes are
   **data rows** (`crm_attribute`), not registry entries — except shipped/system attributes. Type set
   stays small: text, number, boolean, date, select, multi_select, currency, email, phone, url, relation,
   ai (+rollup). Standard objects: Person, Company, **Opportunity (first-class)**, Note, Task. Custom =
   identical mechanics. **Authoring** in the **settings** surface (add/edit types + fields in UI);
   optional **schema sync** (sync module) across workspaces/environments or mapping provider properties ↔
   attributes — only if needed.
2. **Record.** Canonical shell = a component row (private_context = raw values); **queryable** via
   `crm_record_value_index(record_id, object_type, attr, value_text, value_num, value_time, value_bool,
   value_tsv)` — typed columns + indexes, maintained synchronously by the CRM write path. Filter/sort/range/
   FTS live here.
3. **Relationship = ONE CRM API, TWO explicit storage kinds** (they are different systems — don't merge):
   - `association` (Contact↔Company↔Deal, many-to-many, polymorphic) → a CRM edge/projection (thread
     edges as the audit trail; CRM owns the writer + a queryable edge projection since no general public
     edge-writer exists).
   - `containment` (Deal-under-Company folders) → component **placement** (parent_id/path) for UI/access/
     subtree only. NEVER use placement for associations.
4. **Pipeline = collection + stage-membership**, its own indexed table `crm_collection_membership(
   collection_id, record_id, stage_id, position)` idx `(collection_id, stage_id, position)`. Stage lives
   on membership → any object gets a pipeline; a record sits at different stages in different pipelines.
5. **Activity timeline** = events are source of truth + a dedicated `crm_activity_projection(activity_id,
   record_id, type, occurred_at, actor, participant_record_id, payload)` so you can query workspace
   activity, participant timelines, "meetings last week," due tasks, "all activity for a company + its
   contacts." Task is also a standard object (due_date/status) projected into the timeline.
6. **View / Segment (NEW).** Saved, named filter/sort over the value index (+ layout table|board|timeline).
   This is how each GTM strategy gets its own working surface without new code — "my Q3 enterprise leads,"
   "deals stalled >14d." A pipeline is a board-layout view over a collection.
7. **Automation + AI.** trigger (any CRM event, §E) → branch + iterator → action. AI = **AI attributes**
   (agent fills a field from record + prompt/rubric) + **agent tools** over CRM read/write. Agents act
   through the same paths humans do.

## E. Event model — the reactive backbone (DESIGN PRIORITY)
Every meaningful change emits a **typed event** on the affected record's thread — the same `core/core`
event store that already drives triggers/dataflows. **No silent writes:** the write path emits; reads never
mutate; the projections above are materialized FROM these events. Events are THE integration seam.

Taxonomy (dot-notation, wildcard-subscribable — `crm.*`, `crm.contact.*`, `crm.*.stage_changed`):
- Record: `crm.<object>.created | .updated | .deleted | .merged | .restored`
- Field: `crm.<object>.field_changed` (attr, before, after) + promoted specifics (`crm.deal.stage_changed`, `crm.contact.status_changed`)
- Relationship: `crm.relation.linked | .unlinked` (from, to, relation, cardinality)
- Pipeline: `crm.membership.added | .stage_changed | .removed | .won | .lost`
- Activity: `crm.activity.logged` (type email|call|meeting|note); `crm.task.created | .completed | .due`
- Sync/enrichment: `crm.sync.started | .completed | .failed`; `crm.record.enriched` (source, fields)
- AI: `crm.ai_attribute.filled` (attr, model, confidence)
- Access: `crm.access.granted | .revoked`

Envelope (uniform, typed — the toolkit-schema discipline): `{ type, object, record_id, actor, occurred_at,
before?, after?, source, source_event_id, correlation_id }`. Ordered + idempotent via the event store's
source_event_id; replayable → projections rebuild deterministically; `correlation_id` threads a causal
chain (sync → enrich → automation → activity) for debuggability.

Consumers (subscription only, zero core change): **automations** (`trigger on crm.deal.stage_changed`),
**agent reactions** (a trait subscribing to `crm.*`), **provider sync** (outbound emits; inbound carries
**echo-suppression** via source/correlation ledger so a synced-in change doesn't loop out — ties to #112),
**external webhooks** (event → outbound fan-out). Guard: emit at the write boundary only; carry before/after
so consumers don't re-query; no read-path or compensation events.

**Delivery mandate — generalized · declarative · fast · realtime** (all four, non-negotiable):
- **Generalized:** ONE event/projection/badge/count mechanism for ALL objects — never per-object code.
  The inbox `pending_count` nav badge is the proven pattern to reuse verbatim: a declarative badge that
  reads a projected `component_meta` field, fed by a projection off the event stream.
- **Declarative:** badges, counts, subscriptions, and reactions are registry-declared
  (`badge: {source: component_meta, field, hide_zero}` / an automation subscribing to `crm.*`) — never hand-wired.
- **Fast:** every read hits an indexed projection (value index / membership / activity / meta counters),
  never scans the event log or does N+1 lookups.
- **Realtime = INVALIDATION model (grounded, not "instant arbitrary push"):** kickside realtime is
  component/thread-scoped invalidation over the relay — `component.${id}` subscriptions + `component.meta.changed`
  (meta_service) + thread `events.appended`. The write tx updates the projection synchronously AND fans out
  an invalidation on the affected component/thread; the UI refetches that scope (exactly how the inbox badge +
  `/inbox` work today: nav badge is HTTP-resolved via list_nav, then subscribed by component id). Finer-grained
  live board/list/query updates need CRM to add **view/collection-level topics** — a deliberate later add, not assumed.

## Thread topology & CQRS materialization (RESOLVED — mirrors chestor/graph)
Verified against `chestor/graph` + `chestor/db-schema`: they are textbook CQRS and are the template CRM copies verbatim. The record-shell-vs-projection split (§concept-2 vs the Reference impl) is resolved here.

**The proven pattern (chestor/graph):**
- **Write model / source of truth = the component's thread.** Typed events (`node.added`, `edge.added`, `node-type.registered`, …) appended through the thread-backed API binding. Nothing reads by folding on the fly.
- **Projection = declarative on the kind's `meta.projections`:** `{ worker_ref: func://…projection_worker, input_mode: prefetch_events, events.input: [...] }`. The core runner feeds each new event batch to the worker; the worker upserts normalized tables and returns `last_seq`.
- **Read model = normalized materialized tables, ONE shared set per module, partitioned by owner id:** `chestor_graph_nodes/edges/materials/types/layout`, all `PRIMARY KEY (graph_id, id)`, every index prefixed `(graph_id, …)`, upserts `ON CONFLICT(graph_id,id) DO UPDATE` (idempotent/replayable), `delete_graph_rows(graph_id)` cascades on the deletable contract.

**CRM is the same shape, one level up:**
- Records are `kickside_components` rows (shell / identity / access) — **NOT one thread each.**
- **One CRM thread per workspace** (the installed CRM component). Every `crm.*` change is an event on it.
- **One leased `prefetch_events` projection** folds that stream into shared tables keyed `(crm_id, record_id)`: `crm_record_value_index`, `crm_collection_membership`, `crm_activity_projection`, `crm_identity` — the exact analog of `chestor_graph_*` keyed by `graph_id`.
- **Scale unit = workspace:** many small threads + projections, parallelized by the leased worker pool. Rejected: a projection *per record* (explodes the lease count) and one *global* thread (hot single stream, no tenant partition).
- **Per-record realtime needs no per-record thread:** the projection touches the record component's meta → `component.meta.changed` invalidates `component.${record_id}` and the detail view refetches. The log stays on the CRM thread.
- **Escape hatch:** if one workspace saturates one thread, shard the stream by object type (`Person`/`Company`/`Opportunity` thread) — a small bounded count, each with its own projection into the SAME shared tables. Additive partition, not a redesign. Per-record is never the right granularity.

**Correction to §concept-2:** `value_index` is **projection-materialized** (eventually consistent), NOT "maintained synchronously by the CRM write path" — align to the graph worker. Tradeoff accepted: reads are subject to projection lag; a surface needing read-your-writes for one record reads that record component's `private_context` (authoritative), never the index.

**Phase-3 consequence:** echo-suppression is a ledger check on `source_event_id`/`correlation_id` at the single CRM thread's append boundary; only **merge** (canonical-target rewrite across the shared tables) stays real work. Phase 3 ≈ 4–5d.

## 2. Extensibility — the money property (simple core, unbounded surface)
Every extension is a declarative registration discovered by `registry.find` on a `meta.type` — the core
never changes to add capability:
| To add... | Register... |
|---|---|
| a new object type / field | `crm.object` binding / `crm_attribute` row (settings UI) |
| a new pipeline / view / segment | a `collection` / `crm_view` (data) |
| a new activity kind | an `activity.type` |
| a new action | a `crm.action` contract-binding (class-scoped) |
| a new provider source/sink | `pullable`/`writable` + `kickside.automation.port` (align class `kickside.crm`, group `CRM`) |
| a new agent tool | an `agent.trait` |
| a new UI page/nav/picker | `view.component` + `ui.nav_item` (auto-discovered) |
| a new event reaction | an automation/agent subscribing to a `crm.*` event |

## 3. Provider bridge — reuse the port ABI, but CRM owns identity/idempotency
Providers feed via `pullable` → CRM `writable` sink (structured envelope), wired as automation ports,
triggered by `kickside.trigger:service`. The source emits `item_key`/`dedup_key`/external ids/properties —
**the CRM owns the identity tables + replay/idempotency** (external-id map + dedup queue), not a naive
find-or-create. Enrichment = the same writer shape. Scope sync to `is_syncable` objects.

## 4. Behavior / brain
Agent tools (+MCP surface) over the projections; AI attributes; the Skyler action pipeline cleaned:
`crm.action` binding → dataflow → agent → **inbox approval** → deliver, agent chosen by data. Implement
**`deletable`** (cascade: events/projections/associations) + optional `portable`. NOT `installable` (that is
the automation contract; CRM core installs as a hub module → `wippy.lock`).

## 5. Installable from the hub
Self-contained `kickside/crm` module (own `wippy.yaml`); `_index.yaml` declares object bindings, default
collections/views, sink, traits, `view.component` UI + `ui.nav_item`, endpoints, security policy; host
resources via `ns.requirement`. Install = hub plan → unbound requirement is the gate → changeset → `wippy.lock`.
Registry/discovery-driven FE — no Makefile WC list. (A vertical GTM "app" = a packaged module bundling
objects+views+automations+UI — install many.)

## 6. Shed (Skyler): `app.crm.*` monolith · Makefile WC list · `userspace/*` coupling · unscoped
global registry string-match dispatch · monolithic spec residue.

## 7. Naming: Task→Recipe (R2) was reverted, being re-landed separately; current kind = automation/Task.
Spec is kind-agnostic; the CRM consumes the automation port/trigger/event ABI whatever it's called.

## 8. Platform layer — N strategies as installable PACKAGES (resolved from Salesforce/top-platform patterns)
**The load-bearing answer to "N GTM strategies on one core": each strategy is an installable PACKAGE,
layered ADDITIVELY over the shared object model — not N schemas, one core + N packaged perspectives.**
- **Strategy = package:** `{ record-variant, views[], validation-rules[], computed-fields[],
  permission-set, automations[] }` + manifest `{ id, semver, depends-on[], namespace }`. Install is
  additive (unions grants, registers views, activates the variant+rules); uninstall removes only the
  namespaced artifacts; two strategies coexist over the SAME records because views + variants are
  non-destructive perspectives, not schema forks. Rides the hub install flow (§5) + `ns.requirement`
  gate, plus semver + declared deps + namespace.

Six platform mechanisms, each in leanest form (steal the pattern, reject the enterprise bloat):
- **Record variant** (= Salesforce Record Types, lean): a `variant` discriminator on an object selecting
  {view, required-fields, validation set, automation set} — one object serves many motions (PLG vs
  enterprise vs channel). AVOID coupling variant→permission (combinatorial explosion).
- **View/Segment** (concept 6, reinforced): the WHOLE UI story = many saved views over one dataset,
  `{filter, sort, columns, mode}`, schema-neutral; segment-local fields live on the view/membership,
  never polluting the core (Attio). Collapses page-layouts + list-views + record-types-for-layout into one.
- **Computed/formula fields:** declarative expressions evaluated on read + roll-ups aggregating across ANY
  relation (not master-detail-only). Add `formula` + `rollup` to the attribute types.
- **Validation rules:** `boolean expression → block save + message`, fires on ALL writes (UI + API),
  scoped to a variant. Keep it exactly this small — never a second automation engine.
- **Permission-sets** (resolves the coarse component-ACL gap): additive, task-scoped, composable grants;
  effective access = UNION (order-independent → "why can this user do X" is answerable); near-empty
  baseline + one optional **mute**. **Capability axis (actions/fields) is SEPARATE from visibility axis
  (which rows)** — never conflate. Field-level security only narrows. Layered over the component ACL
  (which stays the coarse record-level shell).
- **Automation = one engine + one code-escape** (concept 7, reinforced): a single `trigger → conditions →
  actions` engine + ONE typed "call code" action node (list-in/list-out, bulk-safe, callable from flow +
  code + API). NEVER two overlapping declarative tools.
- Plus a **bulk import/reconcile** surface (CRM-owned, feeds the identity/dedup projection).

**Reject (enterprise bloat):** governor limits (per-txn caps leaking into the declarative layer) ·
profile/permission sprawl (both the monolith and hundreds-of-tiny-sets — discipline: task-scoped grants
bundled per persona + mute) · config-XML merge hell · per-object special machinery (record-type × layout ×
profile explosion) · a separate page-layout system · two automation tools.

## Reference implementation + MVP anchor
**Reference pattern (the quality bar — user-endorsed):** the inbox projection worker
`platform/inbox/src/persist/projection.lua` IS the target for every CRM projection — a prefetch-events
worker folds events into a materialized read-model in `kickside_projection` (no fold-on-read = fast), then
`sync_public_meta` pushes derived counters to the component's PUBLIC meta, which a declarative
`ui.nav_item` badge reads and the relay pushes live. Build value_index / membership / activity / counts
exactly this way: event-fold → materialized projection → public-meta counters → declarative realtime surface.

**MVP anchor — run GTM for KICKSIDE ITSELF (dogfood).** The first slice proves the whole model end-to-end:
- Objects: Person, Company, Opportunity (+ Activity).
- One pipeline: Leads → Qualified → Demo → Won/Lost, as a board view over Opportunity.
- Events + projections: `crm.*` emit → value_index + membership + a "follow-ups due" count on the workspace
  nav (the inbox-badge pattern, generalized).
- Provider bridge: pull leads/activity from providers we already have (HubSpot, GitHub, Discord, email).
- One agent tool + one AI attribute: "find/enrich a company," "classify ICP tier."
Deferred to post-core: permission-sets, packaging/versioning, formula fields, bulk import.

## North star
A record is a component instance of a runtime-defined object; every change emits a typed event on its
thread; queryable read-projections (value index, membership, activity, identity) are materialized from
those events; relationships are explicit association-vs-containment; pipelines and segments are views;
sync/enrichment/AI/actions are pluggable writers — and every new object, field, view, action, source,
tool, page, or reaction is a declarative registration, not a core change. Simple core, event-driven,
unbounded surface.
