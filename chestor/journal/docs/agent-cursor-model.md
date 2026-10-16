# Journal agent-cursor model (superseded work ontology)

The canonical graph-first model is now
`canonical-graph-architecture.md`. This document remains as the specification
for the optional work/verification ontology and its migration fixtures; its
work-node vocabulary is not the Journal's base schema.

Status: binding backend design for the Journal rebuild. The Pechka/Forge
`go-lua engineering journal` is the reference workload: a multi-month project
with 2,673 events, 1,074 checkpoints, 260 decisions, 61 blockers, handoffs,
supersession chains, and several agents. A full recovery response from that
journal reached roughly 294k tokens. The design below preserves its useful
timeline while replacing session-centric recovery with bounded cursors.

## Problem statement

An agent process and its context window are disposable. A project, a branch of
work, and the reasons governing that branch are not. After compaction, a child
agent return, an eight-hour orchestrator rotation, or a restart weeks later, the
system must answer all of these without reconstructing the project from chat:

1. Where am I in the work hierarchy?
2. Why am I here, who delegated this, and what result was requested?
3. Which ancestor decisions, constraints, assumptions, and observations govern
   this work?
4. What changed since this agent last looked?
5. What blocks the work and which dependencies are already satisfied?
6. What proof is required before this node can close?
7. Which audit surface was checked, including areas checked clean?
8. What must be integrated by the parent after a child finishes?
9. Which facts are authoritative and which are generated or inferred?
10. What was omitted from this bounded answer and how can it be continued?

## Durable layers

The model has four different lifetimes. They must not be collapsed into a
single `session` record.

| Layer | Lifetime | Purpose |
|---|---:|---|
| Project | months/years | Security, retention, event-stream, and ownership boundary. |
| Work node | hours/weeks | Hierarchical goal, workstream, task, gate, or experiment. |
| Agent cursor | days/months | One agent's durable position and consumption watermark. |
| Episode | at most 8h | One disposable orchestrator tenure on a cursor. |

An episode may die without closing its work node. A cursor may rotate through
many episodes. Multiple cursors may read a node, but the existing task fencing
rules still allow only one mutation lease for a task at a time.

## Authoritative model

The component-owned KickSide thread is the only historical authority. Every
accepted state change appends an immutable event with a stable event id,
journal sequence, actor, cursor, episode, correlation id, causation id, and
expected revision where applicable. SQL tables, full-text search, vectors,
digests, context envelopes, health, and future UI are rebuildable projections.

The authoritative work graph has one containment parent per work node and
typed cross-links. Work nodes use the existing task identity during migration.
Facts attach to a work node and may be scoped to inherit down its subtree.

### Work-node kinds

`project`, `goal`, `workstream`, `task`, `gate`, `experiment`, `audit`

### Durable record kinds

`observation`, `decision`, `assumption`, `constraint`, `finding`, `risk`,
`question`, `blocker`, `evidence`, `artifact`, `checkpoint`, `handoff`,
`verification`, `coverage`, `integration`

Records have lifecycle (`active`, `resolved`, `superseded`, `retracted`), scope
(`local`, `subtree`, `project`), confidence, subject, evidence references, and
provenance. Generated summaries never supersede source records.

### Edge kinds

`contains`, `blocks`, `depends_on`, `supports`, `contradicts`, `supersedes`,
`derives_from`, `governs`, `delegated_to`, `reports_to`, `verifies`, `covers`,
and `integrates`.

Structural edges are asserted and guarded. Model-inferred semantic edges live
in a separate projection plane and carry confidence, model, model version,
prompt hash, and source event ids. Inference can never invent a hard blocker,
containment parent, completion receipt, or authority relation.

## Agent cursor

A cursor contains:

```text
cursor_id, agent_id, parent_cursor_id
current_work_node_id, state, revision
purpose, assignment, why
close_requirements[]
last_seen_seq, checkpoint_seq, checkpoint
current_episode_id
created_event_id, updated_event_id
```

Delegation creates a child cursor and an explicit `delegated_to` link. Child
completion produces an integration receipt containing its output, evidence,
coverage, unresolved issues, and source range. The parent must accept, reject,
or supersede that receipt. A child summary alone never marks evidence consumed.

Cursor updates use optimistic revision checks. A stale process cannot silently
move or checkpoint a cursor after another process advanced it. Cursor identity
does not replace the task's write lease; it supplies location and continuity,
while the lease supplies mutation authority and fencing.

## Episode

Opening or rotating a cursor starts an episode with server time and a hard
deadline no later than eight hours. Expiry does not erase the cursor or abandon
the work node. It changes the episode to `rotation_required`; subsequent work
writes are refused until the agent records a checkpoint and rotates. This makes
orchestrator drift an explicit boundary rather than a convention.

An episode checkpoint records completed work, active reasoning, decisions,
blockers, unverified claims, next safe actions, and proof state. All referenced
facts remain independently addressable.

## Cursor context envelope

`ReadJournal(view="cursor")` returns one deterministic, bounded envelope:

```text
identity: cursor, agent, episode, revision, consumption watermark
position: current node and root -> current ancestor chain
assignment: purpose, delegation reason, expected result
governing: active inherited decisions, constraints, assumptions, observations
local: recent local facts, latest checkpoint, children
coordination: dependencies, blockers, child integration receipts, conflicts
delta: event index after last_seen_seq
closure: claim, acceptance contract, verifier policy, receipt state
next: server-derived safe transitions/actions
omissions: counts, reason, and continuation cursor for every truncated section
provenance: exact event ids and source sequences for every item
```

Selection order is fixed: hard blockers and closure obligations, current-node
facts, inherited governing facts nearest-first, unseen delta, then recent
supporting material. Callers choose a character/token budget only within server
bounds. Required obligations are never silently dropped. If they alone exceed
the budget, the response returns their index plus explicit continuations rather
than pretending the context is complete.

## Audit memory

An audit has a declared scope and enumerated coverage units. Each unit records
one of `finding`, `checked_clean`, `gap`, or `not_applicable`, its method,
evidence, agent cursor, and source revision. Negative coverage is first-class:
"checked and clean" must survive as durably as a defect. Completion requires
all required units accounted for or an authorized gap decision.

This prevents repeated two-hour audits, forgotten clean areas, and parent
summaries that mention only the interesting failures.

## Verification and closure

A work node closes only through a claim plus its pinned acceptance contract and
fresh verifier receipt, or an explicit authorized waiver/accepted risk. A
receipt binds task revision, work sequence, verifier version, environment, and
artifact hash. New work, reopening, policy changes, or a verifier marked
unsound makes the receipt stale. Closure is therefore a server-checked state,
not an agent assertion.

## Search and embeddings

Exact search and typed graph traversal remain the correctness path. Semantic
recall indexes immutable canonical documents/chunks with:

```text
document_id, source_event_id, work_node_id, cursor_id
content_hash, chunk_index, text
embedding_model, model_version, dimensions, embedding
status, attempts, next_retry_at, created_at
```

PostgreSQL uses pgvector and SQLite tests use sqlite-vec through the same
bounded `near_vector(...).limit(n)` contract. Queries are scoped by journal and
optionally work subtree before nearest-neighbor ranking. Model changes write a
new version; they never reinterpret old vectors. Missing providers degrade
semantic recall but never block event projection or exact search.

## Projection topology

Projection workers are supervised `proc://` workers, as required by current
KickSide. Reads never advance a cursor. A projector upgrade uses a shadow
rebuild from the complete event stream, verifies replay equality, then swaps
the derived state atomically. Projection definitions carry version and input
hash so an old per-thread event filter cannot silently discard new event types.

## Binding invariants

- C1: project duration is independent of cursor and episode duration.
- C2: each cursor is scoped to one journal and one agent; cursor revision is
  monotonic and stale expected revisions are refused.
- C3: an episode deadline is server-generated and never more than eight hours
  after its start.
- C4: every cursor position resolves to a live work node or returns an explicit
  stale-pointer state; it never silently reattaches.
- C5: every context item carries event provenance; generated text is labeled.
- C6: context sections are bounded and report omissions plus continuations.
- C7: subtree-scoped governing records inherit deterministically; retracted and
  superseded records do not govern descendants.
- C8: task mutation still requires the task lease and fencing token; a cursor
  is not authority.
- C9: a child result remains pending until a parent integration disposition is
  recorded.
- C10: audit completion is refused while required coverage units are missing.
- C11: `checked_clean` coverage is immutable evidence, not absence of findings.
- C12: completion without fresh proof is unrepresentable.
- C13: replay of the authoritative event stream yields byte-identical canonical
  work, cursor, episode, coverage, and integration projections.
- C14: semantic index failure cannot lose or reject an authoritative write.
- C15: all vector searches are journal-scoped and bounded before result return.
- C16: projection crash/retry is idempotent by event id and command id.

## Required test classes

1. Two agents keep independent positions and watermarks in one project.
2. A stale cursor revision and an expired task fencing token are refused.
3. Eight-hour episode expiry requires checkpoint/rotation without abandoning
   week-long work.
4. Root-to-leaf inheritance includes active constraints and excludes unrelated,
   retracted, and superseded facts.
5. Child findings, clean coverage, and gaps survive handoff; parent integration
   disposition is explicit.
6. Proof becomes stale after later work and blocks completion.
7. Event replay after random projection interruption is byte-identical.
8. A Go–Lua-shaped fixture (at least 2,673 events and 1,074 checkpoints) returns
   a bounded cursor envelope with truthful omission counts.
9. A 100k-event generated journal keeps cursor lookup, delta paging, exact
   search, and scoped vector search bounded and index-backed.
10. PostgreSQL pgvector and SQLite sqlite-vec produce the same scoped top-k
    contract across model-version rollover.
