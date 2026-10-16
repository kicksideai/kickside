# Chestor ROADMAP — Semantics Spec

Module `chestor/roadmap`, namespace `chestor.roadmap`, component class `roadmap`,
thread class `workspace.roadmap`. Same architecture as `chestor/graph`: commands are
validated → produce events → events are appended to the component thread → a
projection worker materializes them into component-owned read-model tables. Reads
never touch the thread except for undo/redo history.

One model, several lenses. The lens (timeline / horizons / strata / outcomes) is
view state; it never changes what is stored.

---

## 1. Entities

| Entity | Role | Key fields |
|---|---|---|
| **layer** | Lane / stratum. Ordered bottom→top by `sort_order` (platform below product below cloud …). | `id, title, description?, color?, icon?, sort_order` |
| **outcome** | Why a bet exists. Every initiative may file under one outcome. | `id, title, description?, sort_order` |
| **initiative** | The planning unit. | `id, title, description?, layer_id, outcome_id?, status, confidence, size, start_period?, span, progress, owner?, tags[], properties{}, sort_order` |
| **dependency** | Directed edge `from_id` → `to_id`: `to` needs `from`; `from` unlocks `to`. | `id, from_id, to_id, kind, note?` |
| **milestone** | A named point on the period axis. | `id, title, description?, period, layer_id?, initiative_ids[]` |
| **settings** | One row per roadmap. | `period_kind, origin, columns, default_lens, lens_state{}` |

### Vocabularies (closed, validated on write)

- `status`: `idea | planned | active | done | dropped`
- `confidence`: `low | med | high`
- `size`: `S | M | L | XL`
- `dependency.kind`: `requires` (default, hard) | `informs` (soft, never on the critical path)
- `period_kind`: `quarter | month`
- `lens`: `timeline | horizons | strata | outcomes`

### Period keys

Canonical string keys, sortable lexically within one kind:
- quarter: `YYYY-Qn` (`2026-Q3`)
- month: `YYYY-MM` (`2026-09`)

`settings.origin` is the first visible column; `settings.columns` the visible count.
`initiative.start_period` is optional (an idea may be unscheduled); `span >= 1`.
Server-side `period_index(key)` and `current_period(period_kind)` (UTC now) are the
only period arithmetic; the UI never computes calendar math.

### Derived (never stored)

- `horizon(initiative)`: `done|dropped → past`; unscheduled or `start > current+2 → later`; `start <= current → now`; else `next`. Thresholds live in `types.lua`.
- `unlocks(id)`: inverse of `requires` dependencies.
- `outcome.progress`: mean over its initiatives of `done → 1`, `active → progress`, else `0`; `dropped` excluded.
- `blocking_score(id)`: count of transitive `requires` descendants — the "what blocks the most" query.

---

## 2. Commands and events

As in graph, the command vocabulary IS the event vocabulary: a command is
`{ type = "chestor.roadmap.events:<event>", body = {...} }`, validated against the current read
model plus the in-batch fold, then appended verbatim to the component thread. `apply(entry_id,
commands)` fails the whole batch on the first invalid command with `nil, err`; nothing is appended.

| Event type | Body |
|---|---|
| `layer.added` | `{ id, title, description?, color?, icon?, sort_order? }` |
| `layer.updated` | `{ id, title?, description?, color?, icon?, sort_order? }` |
| `layer.removed` | `{ id }` — refused while any initiative or milestone references it |
| `outcome.added` | `{ id, title, description?, sort_order? }` |
| `outcome.updated` | `{ id, title?, description?, sort_order? }` |
| `outcome.removed` | `{ id }` — refused while any initiative references it |
| `initiative.added` | `{ id, title, layer_id, description?, outcome_id?, status?, confidence?, size?, start_period?, span?, progress?, owner?, tags?, properties?, sort_order? }`; defaults `status=planned, confidence=med, size=M, span=1, progress=0` |
| `initiative.updated` | `{ id, ...any subset of the above except id }` — also the drag/move event |
| `initiative.removed` | `{ id }` — refused while any dependency or milestone references it; callers remove edges first (the UI and the trait prompt do this) |
| `dependency.added` | `{ id, from_id, to_id, kind?, note? }` — `to` needs `from` |
| `dependency.updated` | `{ id, kind?, note? }` |
| `dependency.removed` | `{ id }` |
| `milestone.added` | `{ id, title, period, description?, layer_id?, initiative_ids? }` |
| `milestone.updated` | `{ id, title?, period?, description?, layer_id?, initiative_ids? }` |
| `milestone.removed` | `{ id }` |
| `roadmap.settings-updated` | `{ settings: { period_kind?, origin?, columns?, default_lens? } }` |
| `roadmap.lens-state-set` | `{ lens, state }` — per-lens view state; folded but excluded from undo history |

Removal is explicit rather than cascading so that every appended event is a fact the caller
asserted; the inverse of a removal is therefore always a single re-add. Ids are caller-supplied
(the UI and agents mint UUIDs, as graph does).

### Invariants (validated in the command layer)

1. `layer_id`, `outcome_id`, `from_id`, `to_id`, `milestone.initiative_ids[*]`, `milestone.layer_id` reference existing rows (after in-batch adds); updates and removes reference existing ids.
2. `from_id != to_id`; the pair `(from_id, to_id)` is unique regardless of kind.
3. `requires` edges are acyclic. Cycle check runs on the post-batch edge set (DFS); the error names the cycle path.
4. `period` / `start_period` keys match `settings.period_kind`.
5. `span >= 1`; `0 <= progress <= 1`; enumerations closed.
6. `status = done` forces `progress = 1`; `status = dropped` keeps progress and is hidden from horizon/timeline lenses by default.
7. `layer.removed`, `outcome.removed`, `initiative.removed` are refused while referenced (see §2).

---

## 3. Read model (component-owned tables)

All tables carry `roadmap_id` (== component id == thread id) as the first key column; every index is prefixed with it. No foreign keys; referential rules live in the command validator.

- `chestor_roadmap_layers (roadmap_id, id, title, description, color, icon, sort_order, created_at, updated_at)`
- `chestor_roadmap_outcomes (roadmap_id, id, title, description, sort_order, created_at, updated_at)`
- `chestor_roadmap_initiatives (roadmap_id, id, title, description, layer_id, outcome_id, status, confidence, size, start_period, span, progress, owner, tags JSON, properties JSON, sort_order, created_at, updated_at)`
- `chestor_roadmap_dependencies (roadmap_id, id, from_id, to_id, kind, note, created_at)`
- `chestor_roadmap_milestones (roadmap_id, id, title, description, period, layer_id, initiative_ids JSON, created_at, updated_at)`
- `chestor_roadmap_settings (roadmap_id, period_kind, origin, columns, default_lens, lens_state JSON, updated_at)`
- `chestor_roadmap_history (roadmap_id, id, stack, stack_seq, forward_events JSON, inverse_events JSON, created_at)` with `UNIQUE (roadmap_id, stack, stack_seq)`, mirroring graph migration 02.

Table names are `chestor_roadmap_<table>`; the component id column is `roadmap_id` (graph convention); every read path resolves the thread through `kickside.core:threads.find` under the ambient actor before touching these tables.

Timestamps are RFC3339 UTC strings in TEXT.

---

## 4. Undo / redo

Identical to graph: every applied batch records `{ events, inverse }` on the history
stack; `undo` appends the inverse events (as a new batch, marked `origin=undo`) and
moves the pointer; `redo` re-appends. Lens-state events never enter the stack.
Inverse construction:

- `*.added` ↔ `*.removed`
- `*.updated` ↔ `*.updated` with the pre-image of the touched keys
- `initiative.removed` inverse re-adds the initiative with its full prior body (edges were removed by their own events, so they carry their own inverses)
- `roadmap.settings-updated` inverse carries the previous settings

---

## 5. HTTP API (`chestor.roadmap.api:*`)

Same envelope, auth, and error conventions as graph (actor from the security system,
access via the scope resolver, `data, err` seams).

| Endpoint | Purpose |
|---|---|
| `GET  /workspace/roadmaps/{id}` | full snapshot: settings, layers, outcomes, initiatives, dependencies, milestones, `current_period`, history position |
| `POST /workspace/roadmaps/{id}/apply` | `{ commands: [{ type, body }] }` → `{ success, roadmap: <full state> }` (state folded locally from the validated batch, as graph does) |
| `POST /workspace/roadmaps/{id}/undo`, `/redo` | as graph |
| `GET  /workspace/roadmaps/{id}/initiatives?layer=&outcome=&status=&horizon=&period_from=&period_to=` | filtered list |
| `GET  /workspace/roadmaps/{id}/dependencies?of=<initiative_id>&direction=needs|unlocks|both&transitive=1` | dependency chain |
| `GET  /workspace/roadmaps/{id}/critical?top=N` | initiatives ranked by `blocking_score` with their chains |
| `GET  /workspace/roadmaps/{id}/schema` | closed vocabularies + period rules for editors and agents |

---

## 6. Agent surface (traits)

`chestor.roadmap.traits:roadmap_model` — "Model Roadmap", the MCP surface:

| Tool | Args | Returns |
|---|---|---|
| `get_roadmap` | `{ entry_id, lens?, filter? }` | snapshot; with `lens` the response is pre-shaped for that lens (timeline rows / horizon columns / strata bands / outcome ledger) so the agent reasons in the same frame the user sees |
| `apply_roadmap` | `{ entry_id, commands: [{ type, body }] }` | applied events + history state |
| `query_roadmap` | `{ entry_id, question: "needs|unlocks|critical|horizon|overloaded", ... }` | the derived queries in §1 |

A second, prompt-only trait `roadmap_planning` carries the planning protocol
(layers are strata, `requires` is the only hard edge, ideas stay unscheduled, etc.)
and composes with `roadmap_model`, mirroring journal's `journal_work_trait`.

---

## 7. Lenses (UI)

- **timeline** — layers as lanes, periods as columns, bars packed into sub-rows, milestone rail, today marker, drag to move/resize (`initiative.move`), dependency arrows for the selection.
- **horizons** — now / next / later columns grouped by layer; drag between columns is *not* a move (horizon is derived) — it opens the schedule editor.
- **strata** — layers stacked bottom→top, every `requires` edge drawn behind the pills, selection lights the chain both ways, `critical` toggle ranks by blocking score.
- **outcomes** — outcome cards with weighted progress and their bets.

Shared: one selection, one inspector panel (initiative / dependency / milestone / layer / outcome), undo/redo, live sync from thread events, `preview` mode = compact timeline without editing.
