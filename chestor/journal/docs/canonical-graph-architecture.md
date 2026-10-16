# Chestor Journal: canonical graph architecture

See `addressing-and-context-handoffs.md` for the compact cursor-handle address
space and explicit pointer/summary/full design-note inheritance used by agents.

Status: binding direction for the rebuild. This supersedes the work-node-first
parts of `agent-cursor-model.md`. The Journal is a durable, temporal knowledge
graph with agent cursors. Work management is one optional ontology and policy
projection; it is not the storage model.

High-fidelity clean-sheet direction boards live in
[`design-visuals/`](design-visuals/README.md).

## 1. Component study and boundary

The other Chestor components establish useful local conventions:

- `workspace` owns discovery, containment, access, breadcrumbs, deep links,
  preview/full renderer modes, and declaration-driven create/manage surfaces.
  Journal must register as an ordinary component and let Workspace host it.
- `graph` demonstrates free-form typed nodes and edges, attached material,
  nested boundaries, persisted layout/viewport, projection wakeups, optimistic
  reconciliation, inspectors, keyboard navigation, search-to-focus, and
  append-only undo/redo. Its current full-state read and client-only search are
  not suitable for a graph with millions of records, so Journal must preserve
  the interaction semantics while using server-owned windows and search.
- `db-schema` demonstrates a domain ontology projected from immutable events,
  deterministic layout, preview/full rendering, inverse-event history, export,
  and live refresh from projection topics. A Journal ontology follows the same
  principle: domain meaning is a projection over the generic graph.

Journal remains an independent component. It does not import another
component's UI or make Chestor Graph its storage authority. Shared KickSide
component, thread, projection, jobs, access, and view conventions are reused.
The former Journal UI is not migrated: its task-first shell, tabs, panels,
components, layout, and client state are discarded. Reuse is limited to
platform contracts and broadly proven interaction principles, not old UI
elements.

## 2. Cold vocabulary

The authoritative vocabulary is intentionally small:

```text
Journal   security, retention, event-stream, and projection boundary
Graph     named namespace/subgraph with lifecycle and configuration
Node      stable identity, free-form kind, state, content, attributes
Edge      stable identity, endpoints, free-form relation, state, attributes
Event     immutable command result and historical authority
```

Everything else is an ontology, policy, or projection:

- a source reference is a node with `kind=reference` and indexed URI attributes;
- a paper is a node with `kind=paper`;
- a requirement and contradiction are nodes joined by typed edges;
- a cursor, agent, decision, claim, audit unit, artifact, or work item is a node;
- containment, dependency, delegation, selection, contradiction, satisfaction,
  provenance, and integration are edge kinds;
- fast reference catalogs, cursor rows, text indexes, vectors, rollups, audit
  coverage, and work state are rebuildable projections.

Kinds and relation names are free-form strings. A versioned ontology profile
may declare schemas, rendering hints, required attributes, allowed endpoints,
and enforcement rules, but the cold graph never hard-codes a domain kind.

## 3. Canonical records

### Graph

```text
journal_id, graph_id, kind, state, revision
title, description, attrs
created_event_id, updated_event_id
created_at, updated_at
```

A detached research/specification area is an ordinary graph whose attributes
declare `detached=true`, its research question, expected outputs, closure
criteria, and `integration_policy=explicit`. Optional anchors use
`anchor_graph_id + anchor_node_id`; they do not assume an ontology.

### Node

```text
journal_id, graph_id, node_id
kind, state, title, body, attrs
parent_node_id (optional containment convenience)
revision, created_event_id, updated_event_id
recorded_at, effective_from, effective_to
```

`parent_node_id` is an indexed projection of a distinguished containment edge.
The edge remains the semantic truth. It exists because hierarchy navigation is
too important to require recursive JSON or unindexed edge scans.

### Edge

```text
journal_id, graph_id, edge_id
from_node_id, to_node_id, kind, state, attrs
revision, created_event_id, updated_event_id
recorded_at, effective_from, effective_to
```

Node and edge identity is graph-scoped. Cross-graph connections use an endpoint
address `{graph_id,node_id}` and are projected into an indexed cross-link table;
they are never encoded by guessing prefixes.

### Time

Three times must remain distinct:

- `recorded_at`: immutable server time when the event entered the journal;
- `observed_at`: when a source/agent observed it, if known;
- `effective_from/effective_to`: domain validity interval, if applicable.

Current node/edge tables serve hot reads. Immutable events plus version
projections serve `as_of`, interval, and diff queries. Updating a projection row
must not destroy the ability to answer what the graph looked like at a prior
recorded or effective time.

### Attributes

Frequently filtered identity/state/time fields are columns. Extension data is
canonical JSON `attrs`; it is not multiplied into nullable domain columns.
Useful attributes can be promoted into versioned indexed projections without
changing the cold model.

## 4. Events and projections

The component thread is the historical authority. A mutation is one atomic,
idempotent batch with command ID, actor, correlation/causation IDs, expected
graph revision, and source evidence. Validation runs against the pre-state plus
earlier operations in the same batch, so a batch can create nodes and connect
them atomically.

Projection rules:

- exact retries are no-ops; an event ID with different canonical payload is a
  collision and is rejected;
- reads never advance projections;
- projection definitions carry version and input hash;
- upgrades shadow-replay the complete stream, verify invariants, and swap;
- inferred edges live in a separate plane with confidence, model/version,
  prompt hash, and evidence IDs;
- inferred data cannot create authority, hard requirements, closure proof, or
  destructive state transitions.

## 5. References and provenance

A reference is modeled, not special-cased:

```text
reference node attrs:
  uri, version, content_hash, media_type, availability, retention, provider

ordinary edge:
  <any node> --source|evidence|implements|tests|generated_from--> <reference node>
```

A URI/version/hash catalog is a hot projection used for deduplication and
lookup. It is not a second authoritative entity model. This permits a paper to
cite a dataset, a claim to cite a symbol, an audit unit to cite a test run, and
a reference to derive from another reference without adding schema families.

Every derived node/edge includes evidence event IDs. The UI and MCP can always
expand `why` into the exact source chain.

## 6. Requirements, contradictions, and convergence

Requirements are nodes. Relations provide semantics:

```text
requirement --governs--> node/subgraph
claim --satisfies--> requirement
evidence --supports--> claim
claim --contradicts--> claim|requirement
decision --selects|rejects--> candidate
decision --supersedes--> decision
```

An ontology policy defines which contradictions are blocking and which proof
edges are required for closure. Enforcement queries the graph transactionally;
it does not trust a summary string. A contradiction is resolved only by an
explicit resolving/superseding edge and decision provenance.

Competing research branches remain detached until a convergence command
atomically creates the decision and candidate/select/reject edges. Integration
into another graph is a separate explicit operation with a node mapping,
evidence range, unresolved contradictions, and acceptance disposition.

## 7. Embeddings and hybrid retrieval

Embedding documents are generic and content-addressed:

```text
journal_id, document_id
source_type, source_id, graph_id, node_id, edge_id
source_revision, content_hash, chunk_index, content
model, model_version, provider_version, dimensions
projection_version, status, attempts, next_retry_at
created_at, updated_at
```

Native vector partitions include journal, model/version, source type, and graph
so top-K cannot be crowded by another graph or by event vectors. A source
revision change queues a new embedding. Model rollover writes a new partition.
Embedding failure degrades semantic search but never loses or rejects graph
events.

Search modes:

- exact text and attribute filtering;
- semantic nearest-neighbor search;
- hybrid ranking (text + vector + graph proximity + recency), with an
  explanation of each score component;
- connected/path search;
- recorded/effective time interval and `as_of` search;
- contradiction, provenance, and supersession-chain search.

All modes accept graph, node-kind, edge-kind, state, time, source, and bounded
subgraph filters. Results return stable addresses, path/breadcrumb, score
explanation, provenance, omission counts, and continuations.

## 8. Agent cursor

A cursor is generic:

```text
cursor_id, agent_id, parent_cursor_id
graph_id, node_id, revision, state
purpose, assignment, why, close_criteria
last_seen_event_seq, checkpoint
current_episode_id, created_event_id, updated_event_id
```

There is no work-specific field. An ontology adapter may interpret the current
node as work and attach a lease, but cursor position itself works on a paper,
claim, audit, specification, or any future kind.

Resume returns a bounded context envelope:

- current graph/node and root-to-current containment chain;
- purpose, delegation chain, and closure criteria;
- governing requirements/decisions and unresolved contradictions;
- local neighborhood, refs, evidence, and recent temporal changes;
- child cursors and pending integration receipts;
- server-derived next safe actions from active ontology policies;
- exact omission counts and continuation handles for every section.

An episode is disposable and capped at eight hours. The cursor may live for
months. Child cursors have explicit assignment and exit criteria; their result
remains pending until an integration disposition is recorded.

## 9. Small MCP surface

The agent should not assemble raw storage operations for routine recovery. The
public contract is exactly two traits. `Journal` owns four ontology-neutral
memory tools; optional `Journal Work Protocol` adds two governed-work tools and
reuses `JournalFact`. Migration, graph maintenance, and compatibility adapters
are internal functions, not peer MCP tools.

1. `JournalContext`
   - open/resume/checkpoint/move/close a cursor;
   - return the bounded position envelope and continuation handles.
2. `JournalQuery`
   - `catalog`, `node`, `graph_path`, `path`, `neighbors`, `context`, `window`,
     `bundle`, `search`, `semantic`, `hybrid`, `memory`, `timeline`, `events`,
     `evidence`, `changes`, and `request`;
   - exact/semantic/hybrid retrieval and recorded-time filters share stable
     graph/node addresses.
   - `mode=node + event_id` resolves only the projected node address(es); an
     unresolved graph address never falls through to the graph catalog.
   - recall `validity` defaults to `current` (`active` + `resolved`), while
     `all` exposes immutable superseded/retracted history for audit. This is
     independent from a node's operational `status` and a graph's `lifecycle`.
3. `JournalFact`
   - append one typed observation, decision, assumption, constraint, finding,
     risk, question, evidence item, checkpoint, handoff, integration receipt,
     or external reference using the cursor handle for attribution;
   - supersession and lifecycle preserve failed/outdated approaches without
     rewriting history.
4. `JournalGraph`
   - create/configure/archive a graph or detached workspace;
   - append atomic, idempotent node/edge/content/layout operation batches with
     optimistic graph revision checks.
5. `ReadJournal` + `ActOnJournal` (optional work trait)
   - domain policy exposes strict work recovery and guarded verbs without
     putting task vocabulary into the base Journal schema.

Every mutation response returns accepted event IDs, resulting revision, touched
node/edge addresses, and a projection watermark. Every refusal returns a stable
code, exact violated policy, relevant addresses, and safe corrective actions.

### Agent ergonomics

The MCP is optimized for recovery and continuation, not table access:

- one `JournalContext resume` call must be enough to safely restart from a
  cursor after compaction, handoff, or process loss;
- structured continuations returned by reads are executable inputs: pass them
  back as `continuation` instead of translating cursors, revisions, watermarks,
  or request IDs by hand;
- one graph coordinate `{graph_id,node_id}` is accepted and returned throughout;
  the `jc_` cursor handle resolves `journal_id` and defaults that coordinate;
- resume returns graph ancestry, node ancestry, explicit attached context,
  parent assignment/checkpoint, local neighbors, child integration state, and
  the unseen event delta in one bounded envelope;
- every bounded section reports material omissions and an exact structured
  continuation when more data exists;
- compact responses omit repeated provenance/configuration fields; `detail=full`
  remains available for audits;
- graph mutations accept `expected_revision`, `request_id`, origin, provenance,
  and source evidence as one atomic operation batch; with a cursor handle the
  graph, projected revision, and generated request ID default safely;
- every queued graph write returns a `verify` continuation that `JournalQuery`
  resolves to pending, applied, or rejected projection status;
- graph-local retrieval and journal-wide `memory` recall are intentionally
  distinct: the former navigates structure, while the latter finds durable
  event facts across graphs;
- an optional work adapter can expose `start`, `block`, or `verify`, but those
  compile into the generic mutation boundary and never leak task fields into
  the cursor or graph APIs.

The common long-project loop is deliberately short:

```text
resume cursor
  -> inspect bounded position envelope and server-derived next actions
  -> query/explain only the omitted or uncertain context
  -> record a durable fact or mutate an atomic evidence-backed graph batch
  -> verify queued graph mutations
  -> checkpoint cursor using the resume-provided continuation
```

Delegation is equally explicit: open a child cursor with assignment and exit
criteria, let it work in the same or a detached graph, then return an integration
receipt. The parent must accept, reject, or supersede that receipt; child output
never becomes silently authoritative merely because the child exited.

A temporary diversion uses the same mechanism even when the same agent performs
both sides. The current cursor remains parked at its exact graph/node position;
the diversion opens a child cursor over the temporary node. Closing that child
returns `{op: "resume", handle: <parent>}` as `return_to`, so the harness can
restore the parked position with one call instead of remembering a coordinate.
This is a cursor continuation, not a special task field: either endpoint may be
any node kind, and a work ontology may additionally attach exit/verification
policy to the diverted node.

## 10. Human UI

Journal declares a Workspace manage renderer with `preview` and `full` modes.
The UI consumes server truth and never downloads the complete graph.

### Preview

- current human/agent cursors and their last checkpoint age;
- unresolved contradiction and requirement counts;
- recent decisions/changes;
- health and projection lag;
- one-click deep link into the last position.

### Full shell

- left rail: graph/workspace catalog, saved searches, cursor/agent list;
- top command/search palette: exact, semantic, hybrid, time range, kinds,
  state, graph, and contradiction filters;
- center: switchable outline, compound graph, timeline, and comparison lenses;
- right inspector: node/edge attributes, refs, evidence, provenance chain,
  versions, related decisions, contradictions, and activity;
- bottom/side activity drawer: changes since checkpoint or selected time;
- persistent health strip: projection lag, embedding backlog/model version,
  maintainer jobs, replay drift, and heartbeat staleness.

The shell always exposes four answers without changing views:

1. **Where am I?** Selected graph/node/cursor, containment path, lens, and
   recorded/effective time position.
2. **Why am I here?** Cursor purpose, assignment, parent delegation, governing
   requirements, and the decision or search that brought the user here.
3. **Can I trust this?** Evidence/provenance, projection watermark, staleness,
   inference labeling, unresolved contradictions, and incomplete-page markers.
4. **What happens next?** Closure criteria, blocked conditions, pending child
   receipts, and server-derived safe actions with explanations.

These form a persistent position bar rather than information that appears only
inside a particular ontology view.

### Search and recall experience

Search is a first-class lens, not a modal text box:

- the same query can switch among exact, semantic, hybrid, connected, and
  temporal ranking without losing filters;
- facets include graphs, node/edge kinds, state, actor/source, recorded time,
  effective time, evidence availability, contradiction state, and model;
- every hit shows its stable address, containment breadcrumb, matching excerpt,
  time, provenance, and a compact score explanation;
- selecting a result fetches its server-side path and focus window, so search
  can jump into data that was never loaded by the client;
- results can be pinned as a named, shareable saved query whose definition and
  watermark are visible. A live saved query is distinguished from a frozen
  result set;
- query history is local convenience; important research sets are stored as
  graph nodes so agents and humans can cite, discuss, and reproduce them;
- “changes since cursor checkpoint” is a predefined temporal query, not a
  separate inconsistent feed implementation.

Semantic similarity is always labeled as inferred. Exact filters run before
vector top-K, and the UI exposes model/version and degraded lexical fallback.

### Coordinated lenses

No single visualization is canonical. The same bounded server result is shown
through coordinated lenses:

- **Outline/tree** for deep containment, reading order, branch summaries,
  expandable cross-links, and efficient keyboard navigation. It is a designed
  primary surface, not a fallback list;
- **Force graph** for dependency, provenance, contradiction, delegation,
  semantic neighborhoods, and cross-graph structure. Users can freeze, pin,
  isolate, cluster, and expand the bounded simulation without changing truth;
- **Timeline** for recorded history, effective-time intervals, cursor episodes,
  and “what changed while I was away”;
- **Comparison** for candidates, claims, criteria, evidence, and decision
  disposition;
- **Diff** for two revisions/times, including added, removed, changed,
  superseded, and newly unresolved records;
- **Document** for long papers/specifications with cited graph records in the
  margin rather than forcing prose into tiny graph cards.

Selection, hover, filters, time, and focus are shared across lenses. Switching
from outline to timeline does not lose the selected node or query. A visible
focus boundary states what is loaded, what is aggregated, and what remains
outside the window.

### Multi-agent visibility

The cursor rail groups cursors by graph and parent/child delegation. Each row
shows agent identity, purpose, current address, episode age, checkpoint age,
state, pending receipt, and whether its projection has advanced since the
viewer watermark. Selecting a cursor opens its public recovery envelope; it
does not expose hidden model scratch state.

Potential collisions are visible when cursors touch the same node or overlapping
neighborhoods. This is advisory unless an ontology policy supplies leases. The
UI distinguishes observed presence, authoritative ownership, and an expired
lease so a stale heartbeat is never shown as ownership.

### Interaction and accessibility contract

- all navigation and mutation paths are keyboard reachable;
- graph meaning never depends only on color, hover, animation, or spatial
  position;
- destructive or authority-changing actions show a dry-run impact preview and
  require an explicit confirmation containing the target addresses;
- optimistic edits remain visibly pending until the event/projection watermark
  acknowledges them, and conflicts preserve the user's draft;
- focus, selection, expanded containers, inspector tab, lens, time, and query
  are URL-restorable when they are shareable and session-restorable otherwise;
- large lists are virtualized and graph windows are progressively refined, but
  loading must never masquerade as an empty result;
- raw JSON is always available in the inspector, while ontology renderers may
  provide safer forms and domain-specific summaries.

### Visualization behavior

- server returns bounded focus windows and aggregate edge rollups;
- containment has a polished, virtualized outline/tree and an optional
  deterministic compound layout; a force-directed graph is also a first-class
  exploration lens, with seeded/persisted positions, worker-side simulation,
  semantic clustering, pinned nodes, and explicit aggregate boundaries;
- outline and timelines are virtualized;
- level of detail changes from graph containers to nodes to evidence;
- search jumps by fetching the target path/window, then centers and selects;
- collapsed edges are visibly aggregated and expand to their member list;
- node/edge state uses label/shape/icon as well as color;
- URLs encode graph, node, cursor, lens, and optional time/query state so a
  review position is shareable and reload-safe;
- projection wakeups reload monotonically and preserve uncommitted local layout
  until the committed revision acknowledges it;
- empty, incomplete, degraded, stale-cursor, and partially paged states are
  explicit, never represented as an empty successful graph.

### Detached workspace review

A workspace review lens shows the research question, sources, claims,
requirements, contradictions, papers, candidates, and closure criteria. It can
read the whole graph only when the server marks the bundle complete. Otherwise
it follows independent continuations. A comparison table aligns candidates by
criterion and provenance. Converge creates an explicit decision; Promote opens
an integration preview showing exactly which nodes/edges will be copied,
linked, or left unresolved.

## 11. Scale invariants

- No public read has an unbounded node, edge, event, vector, or cursor scan.
- Full-state snapshots are forbidden for large graphs; only small bundles may
  claim completeness.
- Every bounded response reports exact omissions and continuations.
- Recursive containment/path queries are database-recursive and indexed, not
  materialized as caller-sized ID lists.
- Temporal ordering uses indexed `(journal, graph, time, id)` keys and stable
  pagination.
- Vector KNN is partitioned before top-K.
- Projection replay is deterministic and event-ID collision safe.
- A UI never computes closure, contradiction resolution, governing policy, or
  safe next actions from raw records.

## 12. Deep organization and folded learning

The cold graph imposes no hierarchy vocabulary or fixed depth. An optional
organization profile can define human labels and policy for a particular
project, for example:

```text
project -> workstream -> work unit -> attempt
```

Those are ontology kinds over ordinary nodes and containment edges, not base
tables or required global names. A research profile might instead use
`program -> question -> approach -> experiment`. Profiles may recommend a
minimum useful depth but cannot make deeper nesting unqueryable.

A graph can declare an organization expectation in `attrs`:

```text
organization_profile, expected_horizon, expected_agents
recommended_depth, max_leaf_scope, decomposition_triggers
require_exit_criteria, require_fold_learning, review_policy
```

The server derives organization advice from duration, active cursors, branching,
uncertainty, risk, dependency count, evidence burden, and repeated rewrites. On
resume it may say that the current project needs a deep/four-level profile and
name the under-structured branches. This is an explained recommendation unless
a human-pinned ontology policy makes it an enforcement rule.

### Failed and abandoned approaches

An approach that does not work is durable knowledge. Folding a branch records:

```text
outcome: adopted | failed | abandoned | inconclusive | superseded
summary, attempted_conditions, evidence, failure_mode
learning, reusable_constraints, successor_addresses
closed_at, closed_by, decision/provenance
```

`fold_branch` is a convenience mutation that compiles to ordinary node/edge
events. It does not delete or flatten descendants. It changes the branch's
presentation state, stores a durable synthesis node when needed, and links that
synthesis to attempts, evidence, decisions, and successors with relations such
as `summarizes`, `learned_from`, `failed_because`, and `superseded_by`.

Parent rollups expose active-child count, folded-child count, unresolved count,
outcome distribution, and the most important distilled learnings. A parent can
therefore stay compact without pretending failed work never happened.

The outline renders a folded branch as one outcome-shaped summary row with its
learning and descendant counts. It remains expandable in place. The force graph
may collapse it into an aggregate outcome node; search, timeline, provenance,
and `as_of` still reach every underlying record. Agents resuming near a folded
branch receive its distilled learning and failure constraints before they can
repeat the same approach.
