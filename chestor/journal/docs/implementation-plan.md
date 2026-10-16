# Chestor Journal implementation plan

Status: baseline implementation delivered; this document preserves the reviewed
cutover and the remaining hardening/rollout backlog. The checklists below are the
original acceptance plan, not a claim that every long-run gate is complete. The
exact shipped cut is recorded in `graph-memory.md`.

Related contract: [graph-memory.md](./graph-memory.md).

## Product decision

The component is `chestor/journal`. A Journal is one Workspace component with one
durable thread and many logical graphs inside it. A graph is not registered as a
separate Workspace component, so a Journal containing twelve graphs does not create
twelve entries or twelve independent permission/lifecycle surfaces.

The renderer remains the component's `view.component`. The baseline now includes
the durable graph read model, bounded graph API, graph tools, automatic maintenance
pipeline, and server projections. Retention/pruning, long-run soak, and rollout
work remain explicit later phases below.

## Non-negotiable invariants

1. The component-owned Journal thread is authoritative.
2. HTTP, UI, and MCP reads never run projectors or advance cursors.
3. UI, humans, external agents, and internal agents use one graph command path.
4. The graph projector is the only writer of graph read-model state.
5. Every semantic graph record links to evidence and writer provenance.
6. Manual, pinned, or locked records cannot be overwritten, merged, moved, or
   pruned by automatic maintenance.
7. The main Journal state response contains graph catalog rows, not complete graph
   payloads.
8. A graph query has hard server limits. The browser retains its 160-node/480-edge
   limit as a second safety boundary.
9. Custom hooks/traits run only on agents hosted by Wippy. External agents use MCP
   tools and receive no assumed runtime hook.
10. Every new child namespace has its own `_index.yaml`. `file://` values remain
    filenames relative to that namespace; registry ids never masquerade as paths.

## Architecture

```text
Human / external agent / internal agent
                 |
                 v
       Journal command libraries
                 |
                 v
       component-owned event thread
          |                 |
          |                 +---- ordered graph projection
          |                       | state fold + scheduling stage
          |                            |
          |                            v
          |                    durable maintenance job
          |                            |
          |                            v
          |                    internal Wippy agent
          |                            |
          +<------- graph operation request
          |
          +---- core Journal projection
          |
          +---- graph read model
                        |
                        v
             graph catalog / nodes / edges /
             evidence / changes / job health
                        |
                 +------+------+
                 |             |
              HTTP API      MCP tools
                 |             |
                 +------v------+
                  bounded graph UI
```

Known event structure is projected deterministically first. A small model is used
only where semantic classification or relationship inference is actually needed.
This is the same useful split as KB10/Wiki: deterministic ingestion followed by an
optional agent placement/treatment pass.

## Package and namespace layout

Keep the existing root, API, persistence, traits, binding, lifecycle, and migration
namespaces. Add a focused graph domain namespace and individual vertical adapters:

```text
src/
  _index.yaml                         chestor.journal ownership and kind binding
  graph/
    _index.yaml                       namespace chestor.journal.graph
    config.lua                        config defaults and validation
    operations.lua                    operation shape and policy validation
    structural.lua                    deterministic event-to-graph extraction
    projector.lua                     deterministic state-folding library
    scheduler.lua                     deterministic maintenance-planning library
    projection.lua                    thin ordered projection worker orchestrator
    maintainer.lua                    one queued maintenance run
    service.lua                       leased/debounced worker process
    agents/
      _index.yaml                     built-in agent.gen1 registry entries
  persist/
    _index.yaml                       existing namespace
    graph_reader.lua                  catalog, window, search, traversal, delta reads
    graph_writer.lua                  projector-only graph table mutations
    graph_jobs.lua                    idempotent job/run persistence and leases
  api/
    _index.yaml                       one endpoint entry per file
    list_graphs.lua
    query_graph.lua
    apply_graph_ops.lua
    configure_graph.lua
  traits/
    _index.yaml                       one public operation entry per file
    read_journal.lua                  compact context/tail/search/event reads
    record_journal.lua                typed fact/session/task/artifact writes
    query_journal_graph.lua           catalog/window/search/evidence/delta reads
    apply_journal_graph_ops.lua       explicit graph node/link edits
    configure_journal_graph.lua       declarative graph policy
  migrations/
    03_create_journal_graph_tables.lua
    03_create_journal_graph_tables_ops.lua
```

Do not put graph domain logic in the endpoint files, tool wrappers, root
`journal.lua`, renderer, lifecycle binding, or `_index.yaml`. These adapters resolve
access/input and delegate to the owning library.

If operation validation can genuinely be shared with `chestor/graph`, expose or
extract a focused domain library/contract. Do not import `chestor/graph` HTTP/UI
entries and do not copy its complete vertical implementation into Journal.

## Event contract

Add these event types to the Journal kind declaration and output ports:

### `chestor.journal.events:graph.configuration.requested`

Records an explicit create/update/lifecycle request. The body contains:

```text
request_id, graph_id, expected_config_revision?
title, purpose, kind, lifecycle
sources, shape, maintainer, schedule, retention, write_policy, layout
```

The projector validates the expected revision and stores the request outcome. The
configuration revision is derived from committed event order, not a client clock.

### `chestor.journal.events:graph.operations.requested`

The sole mutation input for humans and every agent:

```text
request_id, graph_id, expected_revision, idempotency_key
origin, source_event_ids/source_range, artifact refs
agent/model/trait/config/run provenance when applicable
operations[]
```

Supported operations initially:

```text
node.add, node.update, node.remove
edge.add, edge.update, edge.remove
layout.position-set, layout.position-cleared
```

Pin/lock changes are fields on authorized node/edge updates, not a second mutation
protocol. Material/attachment support is deferred until a demonstrated Journal use
requires more than evidence links.

### `chestor.journal.events:graph.maintenance.requested`

Durable, idempotent work marker produced by the scheduler for one graph, source
range, and configuration revision. It is excluded from the scheduler's source
filter so the projection cannot trigger itself.

### `chestor.journal.events:graph.maintenance.completed`

Records job id, source range, configuration revision, starting/final graph
revision, operation request ids, counts, model/agent/traits, duration, and warnings.

### `chestor.journal.events:graph.maintenance.failed`

Records a retryable or terminal failure without pretending that graph state was
updated. It contains attempts, error kind/message, configured agent status, and
fallback status.

The thread append `external_source`/`external_id` pair supplies idempotency. Internal
ids should be stable, for example:

```text
graph-config:<graph_id>:<request_id>
graph-ops:<graph_id>:<idempotency_key>
graph-maint:<graph_id>:<from_seq>:<to_seq>:<config_revision>
graph-maint-result:<job_id>:<attempt>
```

## Graph configuration

Store a versioned normalized JSON configuration with these sections:

```text
identity       id, title, purpose, kind
lifecycle      active, learning, frozen, archived
sources        event types, tags, sessions, task scopes, linked components
shape          node kinds, edge kinds, semantic-key rules
maintainer     deterministic | agent | deterministic+agent
               built-in/custom agent id, model (default class:fast), prompt,
               trait ids, maximum iterations
schedule       debounce, source batch size, retry policy
retention      keep/freeze/archive/prune policy
write_policy   allowed origins/capabilities and pin/lock rules
layout         force/persisted policy and optional stored positions
```

Ship templates rather than hardcoded graph behavior:

- Work: sessions, tasks, dependencies, blockers, results.
- Decisions: decisions, supersession, evidence, downstream impact.
- Risks: blockers, rejected gates, unresolved risk and ownership.

Known task/session/supersession relationships are deterministic. The optional small
agent enriches semantic links and classifies free-form entries. Custom graphs such
as a protocol design or refactor-debt map use their configured small agent and
optional secondary traits.

Do not silently activate expensive model maintenance for every existing Journal.
New Journals may opt into default templates at create; existing Journals activate
them through one explicit configuration command.

## Persistence model

Migration 03 creates tables partitioned by `journal_id` and `graph_id`.

### Catalog and configuration

`journal_graphs`

```text
journal_id, graph_id, title, purpose, kind, lifecycle
config_json, config_revision, graph_revision
node_count, edge_count, last_source_seq
health, attention_error, updated_at
PRIMARY KEY (journal_id, graph_id)
```

### Projected graph state

`journal_graph_nodes`

```text
journal_id, graph_id, node_id, semantic_key, kind, label, summary, status
properties_json, pinned, locked, origin
created_revision, updated_revision, removed_revision?
actor_type, actor_id, created_at, updated_at
UNIQUE (journal_id, graph_id, semantic_key)
```

`journal_graph_edges`

```text
journal_id, graph_id, edge_id, semantic_key, edge_type
from_node_id, to_node_id, label, properties_json
pinned, locked, origin
created_revision, updated_revision, removed_revision?
actor_type, actor_id, created_at, updated_at
```

`journal_graph_evidence`

```text
journal_id, graph_id, target_type, target_id
event_id, event_seq, task_id?, session_id?, artifact_id?, component_id?, file_path?
source_role, confidence, created_revision
```

`journal_graph_layout`

```text
journal_id, graph_id, node_id, x, y, pinned, updated_revision
```

`journal_graph_changes`

```text
journal_id, graph_id, revision, operation_index, operation_json
```

This bounded changelog powers `since_revision` reads. Retain enough revisions for
live clients, then compact them; a client older than the retained floor receives a
`snapshot_required` response.

### Command outcomes and maintenance

`journal_graph_requests`

```text
journal_id, request_id, graph_id, event_seq, request_kind
status (pending/applied/rejected), resulting_revision, error, processed_at
UNIQUE (journal_id, request_id)
```

`journal_graph_jobs` and `journal_graph_runs`

```text
job_id, journal_id, graph_id, source_from_seq, source_to_seq, config_revision
status, attempts, lease_owner, lease_expires_at, next_attempt_at, error
run_id, agent_id, model, trait_ids, started_at, finished_at, operation_request_ids
UNIQUE (journal_id, graph_id, source_from_seq, source_to_seq, config_revision)
```

Use indexes for active catalog, semantic key, node kind/status, both edge directions,
evidence event/target, revision changes, and claimable maintenance jobs. SQL readers
perform search/traversal; Lua never loads a complete large graph to answer a window.

## Projection behavior

### Ordered graph projection

Declare one additional Journal projection:

```text
kind: chestor.journal:graph_state
projection_key/cursor_key: graph_state
worker_ref: func://chestor.journal.graph:projection
input_mode: prefetch_events
batch_size: 100
```

It consumes graph configuration/operation requests, maintenance results, and the
ordinary Journal events needed by deterministic templates. One thin worker calls a
focused projector library and a focused scheduler library in event sequence. This
ordering is important: separate independent graph-state and graph-scheduler cursors
could let scheduling observe a source event before its preceding configuration is
materialized.

For every batch it performs one idempotent database transaction:

1. dedupe `request_id`;
2. validate graph/config revision;
3. validate node/edge references, schema, permissions, and pin/lock policy;
4. apply the whole operation batch or none of it;
5. increment graph revision once;
6. write evidence and revision changes;
7. update catalog counts/health;
8. record `applied` or `rejected` request outcome;
9. match later source events against the configuration state established by all
   earlier events in the same ordered batch;
10. upsert coalescible maintenance jobs and optionally append idempotent
    `graph.maintenance.requested` audit markers.

Projection replay from the same event thread must produce the same graph state and
revision hash. Model calls and nondeterministic layout do not run in this projector.

### Scheduler stage

The scheduler library runs inside that ordered graph projection. It:

1. ignores graph maintenance/result events;
2. matches each source range against active automatic graph configurations;
3. coalesces by graph and configured debounce window;
4. writes an idempotent maintenance job/marker;
5. advances its cursor after the durable work exists.

Use the core projection runner's idempotent `append_events` output for audit markers
where it fits the final queue design. All module-DB writes are retry-safe through
stable unique keys because the module transaction and core cursor commit are not
the same SQL transaction. If a jobs contract already supplies durable
leases/retries, prefer that declared dependency over inventing a second scheduler.
A module-owned jobs table is acceptable only for behavior the shared contract
cannot express.

## Internal maintainer

The maintainer is a Wippy process service with a stable system actor and bounded
concurrency. One run:

1. claims one job with a lease;
2. captures the Journal owner/request execution identity required for writes;
3. loads the exact source event range plus a bounded current graph neighborhood;
4. reads the deterministic structural state already committed by the graph
   projection;
5. when configured, runs the built-in/custom Wippy agent with `class:fast` by
   default and the configured prompt/traits;
6. exposes only bounded query and apply-operation tools in the agent arena;
7. appends idempotent operation requests;
8. waits for their projected outcomes, then appends the completed event; after a
   crash/retry it reuses those outcomes rather than issuing different operations;
9. retries transient failures with backoff and surfaces terminal failures in graph
   health.

Use KB10/Wiki safeguards:

- debounce ingest bursts per Journal graph;
- cap iterations and input characters;
- protect `manual=true`, `pinned=true`, and `locked=true` records;
- get-or-create by normalized semantic key;
- prefer no mutation when uncertain;
- if a custom agent is missing, expose an attention state and use the built-in
  maintainer only when configuration explicitly permits fallback;
- run optional treatment/dedup as a separate, less frequent pass.

Traits may add tools, prompt material, or internal runtime hooks to the Wippy-hosted
agent. Trait ids and versions are recorded in run provenance. External MCP agents
are never treated as hookable runtimes.

## Lean HTTP and agent/MCP surface

### HTTP

```text
GET  /api/v1/workspace/journals/{id}/graphs
GET  /api/v1/workspace/journals/{id}/graphs/{graph_id}
POST /api/v1/workspace/journals/{id}/graphs/{graph_id}/ops
PUT  /api/v1/workspace/journals/{id}/graphs/{graph_id}/config
GET  /api/v1/workspace/journals/{id}/events
GET  /api/v1/workspace/journals/{id}/events/{event_id}
GET  /api/v1/workspace/journals/{id}/updates?after_seq={seq}&limit={n}
```

The graph query endpoint accepts one bounded mode at a time:

```text
root_id + levels
node_id + neighbors/depth
query + kind/status filters
viewport bounds
since_revision
cursor + limit
```

It returns graph/catalog revision, nodes, edges, collapsed counts, evidence summary,
pagination/delta cursor, and `snapshot_required` where relevant. Server defaults and
maximums are 3/4 levels, 160 nodes, and 480 edges.

The existing `GET /api/v1/workspace/journals/{id}` changes `graphs` to catalog
metadata only. It never embeds node or edge arrays.

### Agent/MCP operations

Publish five Journal operations total, not the current thirteen plus four more:

1. `ReadJournal` — bounded context, tail, event detail, exact/semantic search, or
   filtered projected tasks; the context response includes the compact graph
   catalog.
2. `RecordJournal` — append one typed Journal fact, including session, task,
   checkpoint, digest, or artifact facts, through the existing command path.
3. `QueryJournalGraph` — list the catalog when `graph_id` is absent, or query a
   bounded window, search, neighborhood, evidence page, or revision delta.
4. `ApplyJournalGraphOps` — apply one attributed node/link/layout operation batch.
5. `ConfigureJournalGraph` — create or change one declarative graph rule.

Continuity checks, compaction preparation, digest reminders, and session recovery
are behavior of the Journal trait/prompt and Wippy-hosted hooks; they are not
separate public protocols. The trait may call `ReadJournal` and `RecordJournal` to
perform them. Optional secondary traits configured for an internal maintainer do
not add tools to the default public Journal surface.

A compact external protocol does not permit a monolithic implementation. Each of
the five entries is a thin `function.lua` adapter with a discriminated, schema-
validated request. It delegates each case to the existing focused command,
context, recall, graph command, or graph query owner. HTTP endpoints remain one
vertical function per file. No adapter implements persistence, projection,
scheduling, or model behavior.

Read operations require `state.read`; mutation/configuration operations require
`state.read` and `state.write`. All use the same component access gate as the HTTP
surface.

## Realtime UI integration

Keep the current force renderer and client bounding code. Replace its data source:

1. Journal load receives only the graph catalog.
2. Selecting a graph requests its three-level root window.
3. Opening a branch requests `root_id=<node>&levels=3`; it does not slice a full
   payload already held in memory.
4. Search requests a small result set, then centers a returned neighborhood.
5. Component-meta notifications carry committed event and graph sequence
   watermarks. Fetch `/updates` from the last applied event sequence and merge only
   changed events, tasks, sessions, and artifacts; do not reload the Journal state.
6. If the graph watermark advanced, refresh the small graph catalog. If the
   selected graph changed, request `since_revision`; apply the delta or
   reload its current branch on `snapshot_required`.
7. Inspector evidence is fetched when selected/opened, not for every visible node.
8. The evidence table uses server pagination rather than filtering all graph rows.

Retain `graphWindow.ts` as a defensive cap and test utility. Production correctness
must not depend on receiving a complete graph.

## Previous iteration disposition and cutover

This is a replacement cutover, not an additive second Journal. Do not restore the
old vertical facades and do not keep two production graph models indefinitely.
Removal happens in the order below; no source files or migrations are moved merely
to make the registry layout look different.

### Delete now or keep deleted

| Artifact | Decision | Focused replacement | Enforcement |
| --- | --- | --- | --- |
| `src/api/journal_api.lua` | Keep deleted. It combined every HTTP operation in one vertical adapter. | Individual `src/api/*.lua` endpoint functions plus `src/api/support.lua`. | Packaging test checks every endpoint entry and its direct focused import. |
| `src/agent/*` and `chestor.journal.agent:*` | Keep deleted. The namespace duplicated tool wrappers and lacked the current trait contract. | Individual `src/traits/*.lua` tools and `chestor.journal.traits:journal_trait`. | Registry test rejects the legacy namespace and verifies tool schema/scope metadata. |
| `src/binding.lua` | Keep deleted. Status and deletion were bundled. | `src/binding/get_status.lua` and `src/binding/delete_journal.lua`. | Binding tests resolve each function entry independently. |
| `src/materializer.lua` | Keep deleted. SQL utilities, event folding, FTS, normalized writes, reads, and cleanup were mixed together. | `src/persist/ops.lua`, `reader.lua`, `writer.lua`, `embeddings.lua`, and `projector.lua`. | Packaging and replay tests reject `chestor.journal:materializer`. |
| `src/projection.lua` and the old root projection entry | Keep deleted. It was a root wrapper over the monolithic materializer. | `src/persist/journal_projection.lua`, with graph projection later at `src/graph/projection.lua`. | Registry tests require the exact worker refs and reject `chestor.journal:projection_worker`. |
| `src/journal.lua` and `chestor.journal:journal` | Delete before graph work begins. It is an unused compatibility facade that republishes commands, queries, context, and recall as one broad library. | Callers already import the focused owning library directly. | `rg` must find no imports; add a packaging assertion that the facade id is absent. |

These deletions do **not** authorize deleting the normalized Journal projection.
The word “derived” in `src/persist/projector.lua` describes the legitimate
event-to-session/task/artifact read model, not the temporary browser graph
fallback.

### Keep as the Journal foundation

| Artifact | Why it stays |
| --- | --- |
| `src/thread_log.lua`, `commands.lua`, `queries.lua`, `context.lua`, and `recall.lua` | They are focused domain libraries around the authoritative component-owned event thread. |
| `src/persist/*`, including `projector.lua` and `journal_projection.lua` | They own the existing normalized Journal read model and remain separate from the new graph projection. |
| migrations 01 and 02 | Existing data remains in place. Migration 03 adds graph tables; it does not rename or move earlier migrations. |
| current `api`, `binding`, `lifecycle`, and `traits` child namespaces | They already use correct namespace-local `_index.yaml` files and one vertical adapter per function. |
| `GraphCanvas.vue` and `forceLayout.ts` | Preserve the force-directed visual and its bounded interaction behavior; change only the data contract to a server window. |
| `graphWindow.ts` | Keep as a hard defensive cap and test utility. It must not be the production graph query engine. |
| 5,000-node scale fixtures | Keep only in tests so regression and crash resistance remain testable. |

### Replace, prove parity, then delete

| Temporary production behavior | Replacement | Deletion gate |
| --- | --- | --- |
| `workGraph`, `eventGraph`, `requestedGraphs`, and `graphCatalog` graph synthesis in `ui/src/app/viewModel.ts` | Server graph catalog plus deterministic Work/Decision/Risk templates in the ordered graph projection. Keep `journalSignals`; split it into a focused view-model module if necessary. | Shadow comparison accepts node identity, links, evidence, counts, and lifecycle semantics. Then delete only the graph synthesis code. |
| `viewModel.spec.ts` expectations for browser-derived graphs | Catalog response, graph API client, and projection fixture tests. | Replacement tests pass before old assertions are removed. Do not discard signal tests. |
| `JournalState.graphs` containing `nodes` and `edges` and `JournalGraph.source: 'derived'` | `JournalGraphSummary[]` in Journal state and a separate `JournalGraphWindow` response for nodes/edges/cursors/revisions. | Main-state contract test proves no node/edge arrays are serialized. |
| `GraphCatalog.vue` local filtering of every node/edge and 250-row evidence slicing | Catalog-only rail, lazy graph-window request, and paginated evidence/backlink requests. | Deep, wide, stale-response, pagination, and accessibility tests pass. |
| `GraphCanvas.vue` accepting a complete `JournalGraph` and invoking `graphWindow` as its primary source | Accept a bounded `JournalGraphWindow`; retain a final local cap before layout. | Component test rejects more than 160 nodes/480 edges and never requires a complete graph. |
| `EventDetail.vue` scanning every graph node for `ref_id` | Bounded server evidence/backlink query for the selected event. | Event detail works when Journal state contains catalog rows only. |
| `useJournal.ts` reloading the complete Journal for every graph metadata change | Compare aggregate graph revision, request a selected-graph delta, and reload the current branch only on `snapshot_required`. | Realtime tests cover coalescing, stale replies, missed revisions, and reconnect. |
| Derived-preview badges/styles, the `'derived'` source union, “derived evidence” fallback, and the hardcoded three-graph header count | Committed provenance/evidence status and catalog counts from the server. | No production code path can manufacture a graph. |
| Thirteen public wrappers under `src/traits/` | Five-operation Journal trait: `ReadJournal`, `RecordJournal`, `QueryJournalGraph`, `ApplyJournalGraphOps`, and `ConfigureJournalGraph`. Preserve focused domain libraries and HTTP adapters; replace only the public agent protocol. | Contract fixtures cover every old capability through the new schemas; registry exposes exactly five public Journal tools; old ids have an explicit compatibility/removal decision. |

The wrappers to retire are `begin_journal_work`, `append_journal_entry`,
`get_journal_context_pack`, `check_journal_continuity`, `read_journal_tail`,
`search_journal`, `search_journal_text`, `update_journal_digest`,
`create_journal_checkpoint`, `prepare_journal_compaction`,
`close_journal_session`, `upsert_journal_task`, and `link_journal_artifact`.
Their capabilities are not removed: read/search collapse into `ReadJournal`, typed
writes collapse into `RecordJournal`, and continuity/compaction orchestration moves
into trait policy. If released clients already rely on the old ids, keep thin
deprecated aliases for one declared release only; aliases are not listed in the
default trait and contain no domain logic.

The built files under `static/` are build outputs: regenerate them after source
changes and never hand-edit them as a compatibility layer.

### Cutover sequence

1. **Remove dead facade:** delete `src/journal.lua` and its registry entry after a
   zero-import check; add the absence assertion.
2. **Collapse the public protocol:** add `ReadJournal` and `RecordJournal`, verify
   capability parity, then retire the thirteen old wrappers (or isolate one-release
   aliases when compatibility is required).
3. **Add backend beside the preview:** implement graph events, migration 03,
   ordered projection, catalog/window readers, commands, endpoints, and tools. The
   current browser preview remains visible but is marked development/shadow data.
4. **Shadow and compare:** run deterministic server templates against representative
   old Journals and compare stable identities, relationships, evidence, counts,
   permissions, and graph lifecycle. Differences are explicit reports, not silent
   client fallback.
5. **Switch production reads:** change the UI types and components to catalog plus
   bounded window/evidence/delta APIs. Disable browser graph synthesis in normal
   builds while retaining scale fixtures only in tests.
6. **Soak realtime and recovery:** verify revision conflicts, reconnect,
   `snapshot_required`, worker restart, replay, and 5,000/50,000-node budgets.
7. **Delete the fallback:** remove the graph-specific synthesis functions, derived
   source labels/styles, full-graph state shape, and their obsolete tests. Rebuild
   `static/` and confirm no production import references them.

At every step, registry ids remain ids and sources remain namespace-local files.
For example, the entry is `chestor.journal.api:list_graphs` with
`source: file://list_graphs.lua` in `src/api/_index.yaml`; it is never a fabricated
path-like id, `file://api/list_graphs.lua`, or a folder-valued source.

## Delivery phases

### Phase 0 — freeze contracts

- [ ] Approve this plan and `graph-memory.md` vocabulary.
- [ ] Remove the unused `chestor.journal:journal` compatibility facade and enforce
      its absence.
- [ ] Freeze the five-operation public Journal protocol and capability fixtures;
      decide whether old tool ids require one release of deprecated aliases.
- [ ] Confirm operation compatibility boundary with `chestor/graph`.
- [ ] Freeze event schemas, configuration schema, response envelopes, limits, and
      request idempotency rules.
- [ ] Add packaging tests that reject fake namespaces, folder-valued root
      `file://` sources, vertical imports, and undocumented entries.

Gate: schema fixtures and registry/package tests pass; no database or UI behavior
changes yet.

### Phase 1 — curated graphs and deterministic projection

- [ ] Add migration 03 and persistence readers/writers.
- [ ] Add configuration/operation request events and ports.
- [ ] Implement graph config and operation validation libraries.
- [ ] Implement the ordered graph projection, deterministic templates, scheduling
      stage, and request outcomes.
- [ ] Add list/query/apply/configure HTTP endpoints.
- [ ] Add the three graph operations to the five-operation Journal trait.
- [ ] Support curated graphs and deterministic Work/Decision/Risk templates without
      model calls.

Gate: replay, idempotency, revision conflict, batch atomicity, pin/lock, access
isolation, delete cleanup, and 5,000/50,000-node query tests pass.

### Phase 2 — production bounded UI

- [ ] Change Journal state to graph catalog rows only.
- [ ] Add graph API client and lazy branch/search/evidence queries.
- [ ] Wire open/up/overview/levels to server windows.
- [ ] Add revision delta reconciliation and `snapshot_required` fallback.
- [ ] Expose command pending/rejected state without optimistic false success.
- [ ] Keep synthetic graph inputs only in unit tests; production builds use the
      server graph contracts.

Gate: browser DOM never exceeds the window limits; deep/wide graph fixtures,
keyboard navigation, mobile layout, dark/light contrast, realtime update, and
stale-response tests pass.

### Phase 3 — automatic small-agent maintenance

- [ ] Activate durable maintenance jobs from the ordered projection's scheduler
      stage.
- [ ] Add built-in maintainer agent and bounded internal tools.
- [ ] Add process service, identity capture, leases, retry/backoff, and health.
- [ ] Enable optional configured agent/model/prompt/trait set.
- [ ] Add missing-agent attention and allowed fallback behavior.
- [ ] Record complete model/agent/trait/source provenance.

Gate: burst coalescing, crash/restart, duplicate delivery, poisoned job, missing
agent, stale revision, and manual protection tests pass. Replaying the Journal does
not rerun model calls.

### Phase 4 — treatment, pruning, and long-run hardening

- [ ] Add separate low-frequency dedup/treatment maintenance.
- [ ] Add retention/pruning with reversible removals and protected evidence.
- [ ] Compact revision deltas with a snapshot floor.
- [ ] Add graph export/import only after the internal model is stable.
- [ ] Add operational metrics and attention UI for lag, retries, and failures.

Gate: multi-month synthetic Journal soak, graph rebuild, compaction, stale evidence,
and pruning recovery tests pass.

### Phase 5 — rollout

- [ ] Install without activating model maintenance on existing Journals.
- [ ] Offer explicit default-template activation.
- [ ] Complete the documented shadow comparison before switching existing
      Journals.
- [ ] Verify client-derived production code has been deleted after parity is
      accepted; keep only test fixtures and defensive caps.
- [ ] Update component/module documentation and publish the package.

Gate: fresh install, upgrade, rollback, uninstall/delete, and permissions audit pass.

## Test matrix and budgets

### Required correctness tests

- deterministic replay and identical state hash;
- operation idempotency: same key/same body returns same outcome; same key/different
  body rejects;
- optimistic revision conflict and no partial batch apply;
- node removal edge/evidence/layout behavior;
- stable semantic-key get-or-create;
- manual/pinned/locked automatic-write rejection;
- one source event contributing to several graphs;
- frozen/archived graph scheduling behavior;
- read calls leave all projection cursors unchanged;
- tenant and Journal access isolation across every endpoint/tool;
- worker restart, lease expiry, retry, fallback, and poison handling;
- realtime deltas and snapshot-floor recovery.

### Scale budgets

```text
catalog response                 no graph node/edge arrays
default graph window             <= 160 nodes, <= 480 edges
maximum hierarchy levels         4
force layout input               <= 160 nodes
default UI DOM graph nodes       typical 10-80, hard max 160
graph window JSON                target < 512 KiB
indexed graph query p95          target < 150 ms at 50,000 nodes
initial graph interaction        target < 1.5 s on reference workstation
force calculation                target < 50 ms for maximum window
```

The CI scale suite must include a 5,000-node four-way tree, a 5,000-node chain, a
2,000-child wide root, dense cross-links, disconnected roots, cycles, and a
50,000-node database-only query fixture.

## Recommended PR sequence

1. `journal-graph-contracts`: schemas, constants, registry declarations, fixtures.
2. `journal-agent-surface`: five-operation trait, compatibility fixtures, retire
   the thirteen-wrapper default surface.
3. `journal-graph-store`: migration, focused persistence libraries, replay tests.
4. `journal-graph-commands`: config/ops validation and projector request outcomes.
5. `journal-graph-surfaces`: four HTTP endpoints and three graph operations.
6. `journal-graph-ui-live`: catalog/window/delta API integration.
7. `journal-graph-maintainer`: scheduler, service, built-in agent, traits, health.
8. `journal-graph-treatment`: dedup/prune/compaction and long-run tests.
9. `journal-graph-release`: upgrade/shadow rollout, docs, package release.

Each PR must pass Journal packaging tests, Wippy tests, Lua type checks where
available, frontend typecheck/tests/build, `git diff --check`, and the Wippy FE
compliance gate when it touches the renderer.

## Definition of done

The component is complete when a user or agent can configure a graph in plain
language through the five-operation Journal surface, new Journal facts update it
asynchronously through a visible/retryable internal maintainer, humans and agents
can safely edit the same state, every record has evidence/provenance, the graph can
be rebuilt from the Journal thread, and a 50,000-node stored graph remains navigable
because neither the API nor browser loads it in full.
