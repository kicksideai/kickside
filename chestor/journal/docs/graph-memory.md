# Journal graph memory

Status: historical implementation record. The immutable-thread and projection
ownership described here still applies, but
[`canonical-graph-architecture.md`](canonical-graph-architecture.md) supersedes
this document's closed graph-kind vocabulary and former five-wrapper public
protocol. The live generic agent surface is `JournalContext`, `JournalQuery`,
`JournalFact`, and `JournalGraph`; strict work behavior is a separate optional
trait.

## Purpose

A Journal graph is shared working memory, not a drawing and not a second source of
truth. Humans, Wippy-hosted agents, and external agents can inspect it. Authorized
humans and agents can edit it. Internal small agents can maintain it automatically
from the Journal's durable event thread.

One Journal can hold many graphs at the same time: always-on work, decision,
observation, and risk graphs; configured operational graphs; and temporary graphs
for one design or investigation. One event may contribute evidence to several
graphs.
These are logical graphs owned by the Journal; they do not create a separate
Workspace component for every graph.

The Journal thread remains authoritative. Every configuration change and graph
mutation is appended as a fact. A projector is the only writer of graph read-model
tables. Reads never advance cursors or mutate state.

## Small vocabulary

The user-facing vocabulary should stay limited to:

| Word | Meaning |
| --- | --- |
| Journal | The durable sequence of project facts. |
| Graph | A named view of connected project memory. |
| Rule | What the graph watches, keeps, and may prune. |
| Node | One remembered thing. |
| Link | A typed relationship between two nodes. |
| Evidence | Journal events or artifacts supporting a node or link. |
| Pin | Human/agent protection from automatic replacement or pruning. |
| Maintainer | The internal agent configuration that updates an automatic graph. |
| Revision | The committed version agents and UI are reading. |

Terms such as projector, cursor, job, model class, and idempotency key belong in
diagnostics and developer surfaces, not normal Journal interaction.

## Historical graph kinds

The names below describe the original built-in profiles, not a schema enum.
Current graphs accept free-form kinds and declare ontology in configuration or
attributes.

- `automatic`: maintained from matching Journal events by an internal Wippy agent.
- `curated`: edited deliberately by humans or agents; no automatic semantic edits.
- `task`: scoped to a design, investigation, or work session. Expiry and automatic
  freezing are retention behaviors outside the current baseline.

Lifecycle is separate from kind:

- `active`: accepts configured writes.
- `learning`: an automatic maintainer is processing or catching up.
- `frozen`: readable but rejects automatic writes; explicit authorized edits may
  unfreeze it.
- `archived`: retained for history and omitted from normal active results.

Pruning is a future retention behavior, not a graph kind. The baseline stores the
policy but does not execute pruning. Automatic operations cannot modify protected
manual, pinned, or locked records.

## Configuration

A graph configuration is declarative and versioned. It contains only the policy
needed to reproduce maintenance:

```text
identity       graph id, name, purpose, kind, lifecycle
sources        event types and tags used by deterministic source matching
shape          graph-shape policy retained for the semantic maintainer
schedule       node, growth, root, and sibling pressure thresholds
maintainer     deterministic, agent, or deterministic+agent mode; built-in or
               configured Wippy agent; model selector (default class:fast);
               optional prompt and optional Wippy trait references
retention      retained policy; automatic pruning is not executed yet
write_policy   retained policy; platform scopes and pin/lock rules are enforced
layout         retained policy plus explicit persisted position operations
```

An instruction such as “maintain the decision chain for this journal” must resolve
to an explicit configuration event. The conversational agent may create that event
through the configuration tool, but the backend must not depend on rediscovering an
implicit instruction from prose on every run.

Wippy traits may supply more than tools: they may add prompts or runtime hooks to
the internal maintainer agent. This is supported only for agents running inside
Wippy. External MCP clients get the same read/write semantics through tools, but no
agent hook is assumed. Driver-level hook injection can be designed later without
changing the graph event model.

## Automatic maintenance loop

```text
Journal command
    -> immutable Journal event
    -> deterministic Journal state projection
    -> ordered graph projection
         -> fold graph configuration and operation events
         -> match later source events against the resulting active graph rules
         -> measure graph size, root pressure, and maximum sibling pressure
         -> when a configured threshold band changes, enqueue one idempotent graph
            job by graph + threshold band + source range + config revision
    -> shared leased-job worker
         -> query the source range and a bounded graph neighborhood
         -> run a small Wippy agent with graph-specific traits and tools
         -> append one attributed graph operation batch
         -> the operation event returns to the same ordered graph projection
              -> validate and fold operations
              -> increment graph revision
              -> publish component metadata change
    -> UI and agents read the committed revision or delta
```

There is one graph projection cursor. Its state-folding and local job-intent stages
run in event order, and it advances only after graph mutations and durable job
intents commit together. After commit, the intent is dispatched idempotently to
`kickside/jobs`, which owns leases, attempts, retry timing, concurrency keys, and
run history. A maintainer run is successful after its attributed operation event is
accepted; the later graph projection validates and folds that request. Failed runs
remain retryable in the shared job engine. A missing custom maintainer falls back
to the built-in maintainer when policy permits.

The built-in graphs default to `deterministic` mode. Every typed entry is cataloged
without waiting for a model: tasks/actions/blockers feed Work, decisions feed
Decisions, observations/findings/insights/lessons feed Observations, and risks or
blockers feed Risks. Explicit parent references, task dependencies, decision
supersession, and observation subjects form nested structure. The projector rejects
missing parents, cycles, and hierarchies deeper than 64 levels.

Agent refactoring is opt-in through `agent` or `deterministic+agent` mode. The
default schedule starts after 24 nodes and opens a new maintenance band after each
16-node growth interval or when roots/siblings cross groups of 12. Each value can
be configured within bounded limits. This prevents one model invocation per entry
and gives the maintainer a mathematical reason to reorganize a crowded graph. A
`class:fast` value is a model selector, not a bundled model: semantic refactoring
runs only when the host has a compatible provider configured.

This is the append-first path: an agent records a durable fact without having to
pick its final graph position, deterministic projection makes it immediately
searchable, and the configured maintainer later classifies and organizes a
bounded batch. The graph config is the tuning surface—model class, custom agent,
prompt, traits, shape, schedule, and write policy—so changing classification
policy never changes the cold node/edge schema. The default retention policy is
`keep`; outdated or failed approaches remain in history and should be marked and
linked with `supersedes` or `superseded_by` rather than silently overwritten.

The maintainer receives bounded tools, not database access. It can inspect the
matching event range, query nodes and neighborhoods, and apply a validated batch.
Its output uses the same command path as a human or external agent edit.

## One mutation path

Manual edits, external-agent edits, and internal maintainer edits all append the
same operation event. No agent writes projection tables directly.

The operation vocabulary should reuse Chestor Graph semantics where applicable:

```text
node.add       node.update       node.remove
edge.add       edge.update       edge.remove
layout.position-set             layout.position-cleared
```

Journal-specific graph configuration remains separate from node/edge operations.
An operation batch carries:

- `graph_id` and expected graph `revision`;
- stable operation id / idempotency key;
- actor type and actor id;
- origin: `human`, `external_agent`, `internal_agent`, or `projector`;
- source Journal event ids/sequences and artifact references;
- maintainer agent, model, trait set, prompt/config revision, and run id when AI
  produced it;
- confidence when meaningful;
- the validated node, link, layout, or pin operations.

Stable semantic keys are required for automatically maintained nodes. Reprocessing
the same source event and policy revision must update/reuse the same records rather
than mint duplicates. A useful idempotency basis is:

```text
graph_id + source_event_id + config_revision + semantic_key + operation_kind
```

Automatic operations cannot override pinned/manual fields. Destructive automatic
operations should become reversible removal facts and retain evidence/provenance.
Optimistic revision checks prevent one agent from silently overwriting another
agent's newly committed view.

## Bounded read contract for UI and agents

Do not return every node and edge from the main Journal state endpoint. At real
scale that would resend thousands of records after each event and would make agent
context unusable.

The lean graph surface is three operations inside a six-operation Journal
protocol:

1. `JournalQuery` — return the compact catalog when no graph id is supplied,
   or return a bounded hierarchy window, node search, paginated evidence, or
   changes since a revision.
2. `JournalGraph` — create/configure a graph, apply one validated and attributed
   operation batch with an expected revision and idempotency key, or request its
   derived-map assembly/status.
3. `JournalContext` — open, resume, move, checkpoint, close, or integrate a
   durable agent cursor. Once opened, its short `jc_` handle resolves the journal,
   current graph/node address, and explicitly attached context references.

The other public Journal operations are `ReadJournal` for bounded operational
context, `JournalFact` for typed facts, and `ActOnJournal` for governed work
transitions. The protocol exposes six direct tools. Agents should call those
tools directly; the host's generic `call_tool` meta-operation is a discovery and
compatibility door, not the normal Journal workflow. Continuity and compaction
behavior belongs to trait policy and Wippy-hosted hooks, not to separate public
tools.

`JournalQuery` defaults to a small useful slice and exposes explicit limits.
A graph canvas asks for a bounded hierarchy branch and may then request revision
deltas. An agent asks for search, evidence, changes, or another bounded branch.
Neither needs a 5,000-node snapshot for ordinary work. A full export is not part of
the current protocol.

`ReadJournal` follows the same rule. Branch reads default to compact excerpts and
mark truncated titles and fact bodies explicitly. `detail=full` is the deliberate
door for exact stored content. Authority reads keep lease and identity facts but
collapse imported paragraph-length task titles to one bounded line; the complete
task record remains available through a full branch read.

Journal search has one canonical document per event covering every public event
type and its durable fields, tags, links, identifiers, and metadata. Exact search
is always available through the SQL text projection. Semantic search is a passive
hybrid layer: owner-scoped background jobs embed pending documents in bounded
batches, and reads combine semantic hits with exact results without mutating state.
Embedding failures remain retryable and exact search continues to work. As with
`class:fast`, `class:embed` is a selector and requires a configured provider.

## Storage projections

The Journal module owns its graph read model, partitioned by `journal_id` and
`graph_id`:

- graph catalog/configuration and current revision;
- nodes and links with stable semantic keys, origin, revision, and pin/lock state;
- evidence joins to Journal events, tasks, sessions, artifacts, components, and
  file paths;
- persisted node positions;
- local maintenance job intents with source range and config revision, plus the
  shared `kickside/jobs` run/lease/retry records.

Indexes serve catalog, semantic-key lookup, node kind/status, source evidence,
links in both directions, text lookup, revision deltas, and pending intents. Large
graph search and branch reads happen in SQL/read libraries, not by loading the
whole graph into Lua.

## Module boundaries

Implementation must preserve KickSide/Wippy ownership and entry structure:

- Journal commands only validate and append Journal facts.
- A dedicated graph configuration library owns configuration validation.
- A dedicated graph operation library owns operation validation and event building.
- A thin ordered graph projector function delegates state folding and durable
  maintenance planning to separate focused libraries.
- A maintainer process executes queued Wippy-agent jobs.
- Small reader libraries own catalog, query/traversal, evidence, and delta reads.
- Each HTTP endpoint and agent tool is its own `function.lua` entry and delegates to
  those libraries.
- Namespace declarations live in the correct `_index.yaml`; entry ids are registry
  ids, never fabricated paths. `file://` sources are filenames relative to their
  namespace index, never routing ids or folders disguised as ids.
- UI, HTTP, traits, and lifecycle bindings do not contain projection or domain
  implementation logic.

If graph command validation becomes shared with `chestor/graph`, extract or expose
a domain library/contract for it. Do not import a vertical HTTP/UI entry and do not
copy a monolithic graph implementation into Journal.

## Safety and observability

- Every node and link can show its evidence and last writer.
- Maintainer intent state is local to Journal; leased run, attempt, retry, and
  failure history remains owned by `kickside/jobs`.
- A graph revision is published only after the read model commits.
- Reads never trigger maintenance.
- Model output is schema-validated and permission-checked before append.
- Tenant/Journal access gates apply to catalog, queries, configuration, and writes.
- Automatic operation batches cannot erase or overwrite protected manual, pinned,
  or locked graph records.

## Implemented cut

The production path now includes graph configuration and operation events,
normalized catalog/node/link/evidence/request/change/job-intent tables, an ordered
transactional graph projection, deterministic Work/Decisions/Observations/Risks
graphs, validated nesting, thresholded maintenance planning, configured source
matching, bounded catalog/window/search/evidence/change queries, exhaustive exact
search plus optional hybrid embeddings, two public traits with six unique tools,
focused HTTP
endpoints, owner-scoped shared-job dispatch, and an optional Wippy agent maintainer
with frozen execution identity. Reads remain passive.

The 5,000-node graph exists only in unit tests. Production graph state is
always returned by the backend projection API and the UI mounts at most 160 nodes
and 480 links, normally a three-level branch. Realtime component-meta notifications
trigger passive reloads after a committed projection; they do not run projection
work in the request path.

Still intentionally outside this baseline: full streaming export, automatic
retention/pruning execution, driver-injected hooks for agents not hosted by Wippy,
and a dedicated operator UI for shared-job run history. Those should reuse their
own platform facilities when introduced rather than expand the two-trait Journal
protocol.
