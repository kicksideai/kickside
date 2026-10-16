# Chestor Journal — B0 Specification

Companion to journal-plan.md. B0 exit = every X-item below is a testable
invariant (I-numbered) or an explicit threat-model entry. No implementation
code until B0 is reviewed and closed.

Status legend: [SPEC] written · [OPEN] pending.

---

## X10 State machine closure [SPEC]

### Task states
```
open ──start──▶ in_progress ──complete──▶ done
  │                  │                      │
  │                  ├──block──▶ blocked ──unblock──▶ in_progress
  │                  │                      
  │                  └──abandon──▶ abandoned ──reopen──▶ open
  │
  └──cancel──▶ canceled (terminal unless reopened by authority)
done ──reopen──▶ open        (audited; invalidates receipts, see X8)
done ──close──▶ closed       (archival freeze; no further transitions)
```
- `done` = result + valid receipt per verifier policy (or WAIVED/ACCEPTED-RISK
  annotation — distinct, audited states attached to the transition, never
  silently equal).
- `closed` = archival: done + parent acknowledged (rollup consumed). Only
  `closed` is fully terminal.
- `abandoned` = explicit semantic abandon; recovery = `reopen` (a PLANNING
  lease plus Decide, followed by a fresh WRITE lease; prior facts/receipts
  remain and receipts are marked stale). Lease expiry is not task state: it
  releases authority while `in_progress` work remains directly resumable.
- Experiment tasks add: `in_progress ──fold──▶ folded(adopted|abandoned)`.
  `folded` is terminal; the distilled result lands on the parent as a fact
  carrying provenance (experiment task id + evidence refs). A folded branch
  is excluded from working views, included in audit/find.

### Transition guards (server-refused unless all hold)
| Transition | Guards |
|---|---|
| start | valid lease; not behind unpassed gate; deps(blocks→this) all done/waived; expected_revision |
| complete | valid lease; result present; receipt valid+fresh per verifier policy, or waiver/accepted-risk authorized (X-authority) |
| block/unblock | valid lease; recorded reason (fact) |
| abandon | lease owner |
| reopen | authority ≥ branch owner; audited Decide required (X4) |
| fold | experiment only; outcome + distilled result required |
| gate-pass | separate transition on GATE tasks: verifier receipt only (no result needed); passing ≠ completing (plan §4) |

### Invariants (testable)
- I10.1 No agent transition succeeds without a valid, unexpired lease bound to
  the acting agent.
- I10.2 `done` without valid receipt/waiver is unrepresentable (refused at
  write; no DB state can hold it).
- I10.3 Behind-gate `start` refused even when requested directly by id
  (not merely absent from Frontier).
- I10.4 Reopen of `done` marks all its receipts stale atomically.
- I10.5 `folded` tasks never appear in Frontier or open counts; in lens
  children they appear ONLY as collapsed tombstones (outcome badge, no
  internals) — the durable spine stays complete (I-F4.1), the working set
  stays clean. One rule, no audit-mode exception.
- I10.6 Every transition emits exactly one event carrying: actor lease id,
  expected_revision consumed, guard evaluations (which passed), timestamp.
- I10.7 State is a pure fold of the event log: replay(events) == read model,
  byte-equal, for every journal (the adversarial suite replays and diffs).

---

## X9 Lease / capability mechanics [SPEC]

- Lease = (journal_id, agent_id, lease_id UUIDv7, task_id focus, issued_at,
  ttl, fencing_token = monotonic per task). Issued by OpenBranch; renewed by
  any successful lease-carried write. Expiry releases concurrency authority;
  `in_progress` state remains resumable and the reaper snapshots only when the
  final TTL window contains no agent checkpoint (plan §3).
- Fencing (corrected after review): the fencing token is PER TASK, issued
  monotonically at write-lease acquisition and FIXED for the lease's
  lifetime. The server records the highest token ever GRANTED for the task
  and refuses any write whose token is lower — so a lease's own writes
  always pass (same token), and a zombie of agent A is refused the moment
  agent B acquires the task (B's grant is higher). Classic fencing-token
  semantics.
- Multi-agent on one task: one WRITE lease per task at a time; unlimited
  read. Handoff = explicit transfer event or expiry. A second OpenBranch on
  a leased task returns a read lens + "leased by X, expires T" (visible,
  not an error).
- Blocked/behind-gate/terminal tasks: OpenBranch grants PLANNING only.
  Decompose/link/record-fact remain available; blocked work may unblock and an
  explicitly abandoned/done/canceled task may run the Decide-backed reopen;
  start/complete remain refused. An already `in_progress` task with no live
  lease receives WRITE so it can resume directly — I9.1.
- Revocation: journal owner may revoke a lease (audited); revoked lease's
  pending writes refuse via fencing.
- Clocks: TTL enforced by server time only; agents never supply timestamps
  for lease logic.
- Invariants: I9.1 (above); I9.2 two concurrent writers on one task is
  unrepresentable (fencing test); I9.3 no write without lease (I10.1 alias);
  I9.4 lease expiry always releases the lease, preserves `in_progress`, and
  has either an agent checkpoint or one auto-snapshot for recovery.

---

## X8 Receipt invalidation [SPEC]

- Receipt binds: claim, task_id, task_revision, work_revision (the journal
  seq of the last fact under the task at verification time), environment
  tag, verifier type+version, verdict, artifact hash (managed store) or
  external ref {url, sha256, availability}.
- Automatic staleness triggers: (a) any new fact under the task after
  work_revision that carries tag `work` (vs `note`); (b) task revision bump
  (title/contract/verifier policy change); (c) reopen (I10.4); (d) verifier
  version marked unsound.
- Stale receipts block `complete` exactly like missing ones; UI shows
  "receipt stale: superseded by seq N".
- I8.1 A receipt's binding tuple is immutable (append-only store; rebinding
  unrepresentable). I8.2 `complete` re-evaluates staleness at transition
  time, not at receipt creation.

---

## X12 Projection upgrade (proven defect) [SPEC]

- Defect: kickside_projection.body freezes per thread at creation; module
  upgrades adding event types are silently dropped by old journals (cursor
  advances, no error). Proven 2026-08-13 on Home Lab Journal (task.linked).
- Spec (corrected after review): projection bodies carry (module, version,
  input_hash). On upgrade, a reconciler detects drift per thread; the fix is
  a SHADOW REBUILD — fold the full log with the new definition into shadow
  tables, verify, then atomically swap — never an in-place partial replay
  (which can double-apply or misorder effects on existing state). Idempotent
  and resumable; failure leaves the live projection untouched.
- Health: input-filter drift is a first-class degraded state on the journal
  (surfaced before reconciliation runs, cleared after).
- I12.1 After reconciliation, replay-equality (I10.7) holds for journals
  created on ANY prior module version. I12.2 The drift detector itself is
  covered by health-of-health (X6).

---

## X1 Verifier honesty [SPEC]

- Verifiers are RUNTIME-EXECUTED, never agent-executed. Verification facts
  with a verdict can only be appended under the verifier runner's identity;
  agents may only REQUEST verification (RequestVerify(task) → runner job).
- Typed runners: test-run (wippy test invocation, output artifact),
  http-probe (request/response captured), browser-render (driven headless
  page; screenshot + DOM assertions as artifacts), contract-check (X3),
  human-ack (kickside inbox approval; reviewer identity recorded).
- Receipts are runner-signed: identity, runner version, raw output hash.
- Threat model: (a) agent fabricates a receipt → unrepresentable (identity
  gate at append); (b) agent games the check itself (trivial test) →
  verifier POLICY is pinned by the gate/parent authority at creation, not by
  the executor; changing policy requires a Decide (X4); residual risk: a
  colluding authority — accepted and audited. (c) runner compromise →
  runner runs under its own restricted lease; health-of-health observes it.
- I1.1 No verification fact with a verdict exists whose author is not a
  registered runner identity. I1.2 Verifier policy hash at receipt time must
  equal the policy hash pinned on the gate/task.

## X2 Work-authority boundary [THREAT-MODEL ENTRY — accepted boundary]

- The journal cannot police work performed outside it (agents hold their own
  tools). Enforcement covers STATE: no transition, no receipt, no fold, no
  done happens outside the protocol. Externally-performed work only enters
  as facts and cannot move state without leases + guards.
- Operationally closed by the deterministic loop: child agents receive work
  exclusively from Frontier(); an agent acting outside it produces facts but
  cannot complete anything, which surfaces immediately in S1 (work without
  transitions is visible drift).
- Documented residual risk; no invariant possible by construction.

## X3 Agent contracts [SPEC]

- Contract = { input_schema, output_schema (JSON Schema, bounded size),
  semver, validator: contract-check | named independent verifier }.
  Attached at Decompose; carried on the task.
- On Complete: server runs executable schema validation of the declared
  output (syntactic); semantic validation = the task's verifier policy (X1).
- High-impact tasks (gate, P0/P1) REQUIRE an independent validator identity
  (≠ executing agent); parent-only validation is refused for them (the
  parent that wants to finish is not a neutral judge).
- Compatibility: child may satisfy same-major contract; a BREAKING change
  = task revision bump (invalidates receipts per X8) + Decide (F6 is the
  single trigger table; X4 defers to it).
- I3.1 Complete with output failing schema validation is refused. I3.2 A
  high-impact task whose validator equals its executor is unrepresentable.

## X4 Decision-trigger policy [SPEC]

Transitions that hard-require an attached decision_id (server refuses bare):
reopen(done) · waive / accepted-risk · gate policy change · contract change
on in_progress · dependency REMOVAL · fold(adopted) that supersedes a prior
decision. The decision is a normal supersedes-chain fact, so every
consequential choice is findable from the transition that consumed it.
- I4.1 Each listed transition's event carries a decision_id resolving to a
  decision fact under the same branch (or ancestor).

## X5 Pointer reconciliation on resume [SPEC]

- OpenBranch(resume) compares the lease's claimed focus against reality:
  task folded/done/reassigned/leased-elsewhere since ⇒ lens returns
  resolved=stale_pointer with the change feed since the agent's last
  checkpoint; NOTHING auto-attaches. The agent must explicitly re-focus
  (new lease) before any write.
- I5.1 A write through a stale pointer is refused (fencing token from the
  reconciled OpenBranch is required); silent misattachment unrepresentable.

## X6 Out-of-band health heartbeat [SPEC]

- The health writer publishes a heartbeat (timestamp + component states) to
  a channel OUTSIDE the journal read models: the workspace component meta
  (separate table/path, already surfaced by workspace listing) on an
  interval job.
- Staleness is computed by the READER from heartbeat age — so a dead health
  writer is detectable by pure absence: UI shows "health unknown since T"
  with no backend cooperation required.
- I6.1 Killing the health writer produces a visible unknown-state within
  2 intervals (A8 test kills it on purpose).

## X7 Digest freshness [SPEC]

- Recompute triggers: checkpoint, complete, fold, gate-pass, and every 25
  facts on an active branch. Digest row: (source_seq, generator_version,
  computed_at, provenance event ids, stale flag).
- Age is displayable: journal.last_seq − digest.source_seq; the lens carries
  it (plan §5). Generated text never replaces events; the raw slice is the
  immutable log itself, digests are labeled derived.
- Generator failure: previous digest kept, stale=true, health event emitted.
- I7.1 digest.source_seq is monotonic per branch. I7.2 A digest never claims
  a source_seq beyond the last event it actually folded.

## X11 Dependency mutation semantics [SPEC]

- Edges are append-only with tombstones (removal = event with reason +
  decision_id per X4). Direction fixed at creation. Cycle check on add
  against live (non-tombstoned) edges only.
- Late-added blocker onto an in_progress task: takes effect at the next
  transition attempt (no retroactive state flip; the lens shows it
  immediately as a pending blocker).
- Dependency on a completed/waived task is auto-satisfied; on a folded
  experiment it is refused (fold first, then depend on the parent fact).
- I11.1 The live dependency graph is cycle-free after every accepted write.
  I11.2 No dependency disappears without a tombstone event + decision.

## B0 REVISION LIST (review verdict: NOT closable yet)
The full 20-item review is stored at journal-spec-b0-review.txt. Fixed in
this revision: fencing semantics (per-task grant tokens), X12 shadow rebuild.
Still required before B0 closes: formal transition/authority tables
(capability types, waiver authority model, cancel/close guards); transition
request identity + atomicity for I10.6; canonical replay scope/serialization
for I10.7 (exclude derived digests/health, define read-model subset);
Frontier/lens/open-count schemas (I10.5); gate membership + "behind" +
passed-but-incomplete semantics, gate-pass in the state model; fold
atomicity + collapsed tombstone in the spine; X1 signature/request/artifact
validation chain + runner-lease interaction; X3 schema dialect + pinned
compatibility algorithm + "independent" definition; Decide-trigger table
unified across X1/X3/X4/X10; X11 guard coverage on complete/fold/gate-pass;
digest/health SLAs (deadlines, intervals, test clocks); corrected invariant
count and 1:1 test catalog.

## Invariants catalog (complete for B0)
I10.1-7 · I9.1-4 · I8.1-2 · I12.1-2 · I1.1-2 · I3.1-2 · I4.1 · I5.1 ·
I6.1 · I7.1-2 · I11.1-2 — 24 invariants; each becomes an adversarial test
in B2 before any UI exists. X2 is the single accepted (documented)
non-invariant boundary.


---

# FORMAL MODEL (revision pass 2 — answers the review's formalization demands)

## F1 Capability & authority model

Capability types (issued by OpenBranch, encoded in the lease):
| Capability | Granted when | Permits |
|---|---|---|
| WRITE | task startable (no unpassed gate ahead, no blocking deps open, not leased) | all verbs on the branch |
| PLANNING | task blocked / behind gate / done | decompose, link, record fact kinds note/observation/risk/decision, checkpoint, unblock (T4), reopen-request |
Recovery verbs never deadlock: T4 needs PLANNING (not WRITE); T6/T7 need a
READ lease + the stated authority (capability gates work, authority gates
recovery).
| READ | always (also while another agent holds WRITE) | lens, frontier, digest, search |

Authorities (identity classes, checked server-side):
| Authority | Who | Exclusive rights |
|---|---|---|
| agent | any leased agent | verbs per its capability |
| branch-owner | assignee of the nearest ancestor with an assignee, else journal owner | reopen(done/canceled), revoke child lease |
| journal-owner | workspace component owner | waive, accepted-risk, gate policy change, lease revocation, close |
| runner | registered verifier runner identities | append verification facts with verdicts (only author allowed) |
Waiver authority = journal-owner AND ≠ requesting agent when the requester is
an agent (separation); human owner may self-waive (audited).

## F2 Complete transition table

Request identity: every transition command carries (command_id UUIDv7,
lease_id, fencing_token, expected_revision). Atomicity boundary: one command
= one transaction = exactly one transition event appended + read-model fold;
retry with same command_id returns the original result (idempotent by
command_id, I10.6 becomes testable: duplicate command_id ⇒ no second event).

| # | From | Verb | To | Guards (all) | Authority |
|---|---|---|---|---|---|
| T1 | open | start | in_progress | WRITE cap; deps(blocks→task) each satisfied — non-gate dep: done∨waived; gate dep: passed∨waived (F3 is the single rule); exp_rev | agent |
| T2 | in_progress | complete | done | WRITE; result; receipt valid ∧ fresh per policy ∨ waiver/accepted-risk attached; contract output valid (X3); deps STILL satisfied (X11 guard) | agent |
| T3 | in_progress | block | blocked | WRITE; reason fact | agent |
| T4 | blocked | unblock | in_progress | PLANNING; blocking condition cleared or Decide attached | agent |
| T5 | in_progress | abandon | abandoned | lease owner | agent |
| T6 | abandoned/canceled | reopen | open | Decide; PLANNING lease | branch-owner |
| T7 | done | reopen | open | Decide; receipts→stale atomically | branch-owner |
| T8 | done | close | closed | parent rollup consumed (parent digest folded this result) | journal-owner ∨ automatic on parent complete |
| T9 | open | cancel | canceled | Decide if any child not open | branch-owner |
| T10 | in_progress(experiment) | fold | folded | outcome; distilled result; no open children; atomic: ONE event carries parent-fact payload + state change (projector folds both or neither) | agent |
| T11 | gate: open/in_progress/blocked/done | gate-pass | (flag passed=true, state unchanged) | runner receipt valid ∧ policy-hash match; refused on closed/folded/canceled | runner-verified, agent-requested |
| T12 | non-terminal states only | waive / accept-risk | (ANNOTATION consumed by T2/F3 — never a state) | rationale; expiry; Decide (F6); authority per F1 | journal-owner |
System transitions such as automatic close T8 carry a synthetic command
identity and obey the same one-command/one-event idempotency. Lease reaping is
ephemeral authority cleanup, not a task transition; its optional recovery
snapshot remains idempotent by lease id.

## F3 Gate semantics

- A GATE is a task with gate=true + pinned verifier policy (hash).
- "Behind gate G" ≔ task T is behind G iff there is a blocks-path G ⇒ T in
  the live dependency graph, or T is a descendant of a task behind G.
  (Gates block through the SAME edge mechanism — no second ordering system.)
- gate-pass (T11) sets passed=true; the gate task itself may still need
  complete (its own work). BLOCKING derives from passed only: passed=false
  blocks; passed=true unblocks dependents even while the gate's own state is
  in_progress. A gate that is done but never passed still blocks (must pass).
- Waived gate ⇒ treated as passed for blocking, annotation visible.

## F4 Fold & spine integrity

- Fold event payload: {experiment_id, outcome, distilled, evidence_refs[]}.
  The projector, in one transaction: sets folded state, writes the parent
  fact (provenance = experiment_id), sets the child's spine entry to
  collapsed-tombstone (a leaf with outcome badge; excluded from open counts
  and Frontier; internals reachable via Find/audit navigation, consistent
  with I10.5 as amended).
- I-F4.1 The spine never loses a node: folded children remain enumerable
  under the parent (tombstone), so the durable task tree stays complete.

## F5 Canonical replay scope (I10.7 made precise)

- Replay-equality covers the CANONICAL read model: tasks (all columns),
  task_deps (live + tombstones), events index (id, seq, task_id, type,
  payload_sha256 — so lost/corrupted fact payloads fail equality),
  journal_state (active pointers). EXCLUDED: derived digests, embeddings,
  health, graph layouts — each is re-derivable and carries its own
  generator version.
- Comparison: canonical JSON (sorted keys, no whitespace, integers as-is)
  row-by-row ordered by primary key. "Byte-equal" applies to that
  serialization.

## F6 Unified Decide-trigger table (supersedes scattered mentions)

Decide REQUIRED for: reopen (T6, T7) · cancel with non-open children (T9) ·
waive / accepted-risk (T12) · gate policy change · BREAKING contract change
(any task state; X3 aligned to this — non-breaking changes are free) ·
dependency removal · fold(adopted) superseding a prior decision (T10 guard) ·
unblock without cleared condition (T4). Nothing else hard-requires one.

## F7 X11 guard coverage (dependency effects per verb)

- start (T1): refused while any blocks-dep open / behind unpassed gate.
- complete (T2): re-checked — a late-added blocker refuses completion.
- fold (T10): deps irrelevant (experiments conclude regardless).
- gate-pass (T11): unaffected by deps (evidence is evidence).

## F8 SLAs & test clocks

- Lease TTL default 30 min; reaper scan 5 min. I9.4 unified: expiry ⇒ revoke
  the lease while preserving resumable `in_progress`, plus auto-snapshot ONLY
  when no agent checkpoint exists within the lease's final TTL window;
  snapshot contents = open state +
  distillation of facts since the last checkpoint, labeled derived (X7
  rules). Deadline: release and any snapshot within 2 scan intervals.
- Health heartbeat interval 60 s; I6.1: reader shows unknown within 2
  intervals (test uses injected clock).
- Digest staleness SLA: a branch with ≥25 unfolded facts must have a fresh
  digest within 1 maintenance cycle; violation emits a health event
  (closes the review's "permanently stale while invariants pass" gap:
  I7.3 staleness beyond SLA is itself a health-visible state).

## F9 Corrected invariant catalog (26 + 2 new)

I10.1-7 · I9.1-4 · I8.1-2 · I12.1-2 · I1.1-2 · I3.1-2 · I4.1 · I5.1 ·
I6.1 · I7.1-3 · I11.1-2 · I-F4.1 = 28 invariants. B2 ships exactly one
adversarial test per invariant, named after it; the suite fails if any
invariant lacks a test (count check is itself a test).


---

# DEFINITIONS (revision pass 3 — the tail)

## D1 Wire schemas (lens / frontier / counts)

LENS (OpenBranch response):
```
{ resolved: task|roots|active|stale_pointer,
  lease: {lease_id, capability: WRITE|PLANNING|READ, fencing_token, ttl_s, expires_at} | null,
  task: Task | null,
  ancestors: [{id, title, status, digest, digest_age_seq}],       // spine only
  children:  [{id, title, status, open_count, digest, digest_age_seq,
               folded: {outcome} | null}],                        // rollups; folded = tombstone
  facts: [Event],                                                 // recent, this task only
  deps: {outgoing: [Dep], incoming: [Dep]},                       // live only; tombstones via Find
  receipt_status: valid|stale|missing|waived|accepted_risk | null,
  cross_exceptions: [{task_id, path, kind, one_line}],            // bounded, relevance-scored, max 5
  changed_since_checkpoint: {count, first_seq, last_seq},
  next: {task_id, rationale} | null }                             // one authoritative next action
Task = {id, parent_task_id, title, description?, status, gate?, passed?,
        priority?, assignee?, contract_ref?, verifier_policy_hash?,
        revision, result?, created_at, updated_at}
Dep  = {from_task_id, to_task_id, kind, evidence_event_id}
```
open_count ≔ count of descendants with status ∈ {open, in_progress, blocked}
(folded/canceled/done/closed excluded). Computed by the read model, never
client-side.

FRONTIER:
```
{ actionable: [{task_id, path, why_now}],                          // startable per T1
  excluded: {behind_gate: n, blocked_by: n, leased: n, folded: n},  // categorized counts
  drill: (category) → [{task_id, reason}] }                        // on demand
```

## D2 Receipt validity predicate (executable)

valid(receipt, task) ≔
  receipt.task_id == task.id
∧ receipt.task_revision == task.revision
∧ receipt.verifier_policy_hash == task.verifier_policy_hash
∧ receipt.verdict == pass
∧ receipt.author ∈ registered_runners
∧ artifact_available(receipt)            // managed store hit ∨ external ref sha256 verified
fresh(receipt, task) ≔
  ¬∃ event e: e.task_id == task.id ∧ e.seq > receipt.work_revision
             ∧ e.tags ∋ work
∧ receipt.verifier_version ∉ unsound_set
T2 requires valid ∧ fresh at transition time (I8.2). Facts default to tag
work; note/observation/risk/decision/checkpoint default to non-work unless
explicitly tagged.

## D3 X1 verification-request lifecycle

RequestVerify(task, lease) → verification_request event {request_id,
policy_hash} → runner job (jobs engine; runner identity; retries per engine)
→ runner executes the TYPED check → runner appends verification fact
{request_id, verdict, artifact_hash, runner_version, policy_hash} signed by
authorship (only runners may author verdict facts — enforced at append by
identity, the runtime's existing actor model; no cryptographic signature in
v1, DOCUMENTED as trust-the-runtime boundary) → receipt materialized.
Runner leases: runners hold NO task lease; verdict facts are exempt from the
single-writer rule (they are evidence, not work) — I9.2 scopes to work verbs.

## D4 X3 pins

Dialect: JSON Schema draft 2020-12, pinned. Size ≤ 32 KiB per schema.
Compatibility: same-major ≔ new output schema accepts every instance the old
one accepted (checked by the contract-check runner via test-instance corpus
recorded with the contract; algorithmic subset checking is NOT attempted —
corpus-based, documented approximation). Independence ≔ validator identity
differs from executor identity AND from the executor's parent-branch
assignee.

## D5 Health-of-health + digest cycle

health-of-health ≔ the heartbeat reader path (D1 of X6): because staleness
is computed by readers from heartbeat age, the ONLY unmonitored element is
the reader itself — which is the UI/API surface the human is looking at;
its failure is self-evident. No third watcher (turtles stop here,
documented). Digest maintenance cycle ≔ the journal maintenance scheduler
interval, pinned at 10 min (I7.3 SLA measured against it).

## D6 Test catalog (28 invariants → 28 adversarial tests)

Format per entry: SETUP → ADVERSARIAL ACTION → EXPECTED (refusal code or
state predicate). Catalog completeness is itself asserted (count test).
 1  I10.1 write with expired lease → REFUSED lease_expired
 2  I10.2 complete without receipt → REFUSED receipt_missing; DB probe: no row done∧¬(receipt∨waiver)
 3  I10.3 start task behind unpassed gate by direct id → REFUSED behind_gate
 4  I10.4 reopen(done) → all its receipts stale in same txn (probe)
 5  I10.5 fold → task absent from Frontier+open_count; present as tombstone in lens
 6  I10.6 duplicate command_id replay → single event (count probe)
 7  I10.7 full replay vs live read model → byte-equal per F5
 8  I9.1 planning-capability start attempt on blocked task → REFUSED capability
 9  I9.2 second WRITE lease on leased task → REFUSED leased (read lens returned)
10  I9.3 write with no lease → REFUSED
11  I9.4 kill agent mid-task → lease released + resumable state + snapshot within 2 scans (clock injected)
12  I8.1 receipt rebind attempt (update) → REFUSED append_only
13  I8.2 work fact after receipt → complete REFUSED receipt_stale
14  I12.1 old-journal shadow rebuild → replay-equality passes
15  I12.2 drift present → journal health shows degraded before rebuild
16  I1.1 agent-authored verdict fact → REFUSED author_not_runner
17  I1.2 receipt with mismatched policy_hash → invalid per D2
18  I3.1 complete with schema-invalid output → REFUSED contract
19  I3.2 high-impact task, validator==executor → REFUSED independence
20  I4.1 listed transition without decision_id → REFUSED decide_required
21  I5.1 write through stale pointer after refocus elsewhere → REFUSED fencing
22  I6.1 kill heartbeat writer → reader shows unknown ≤ 2 intervals
23  I7.1 digest source_seq regression attempt → REFUSED monotonic
24  I7.2 digest claiming unfolded seq → REFUSED provenance
25  I7.3 25 work facts, no digest within cycle → health event emitted
26  I11.1 dep insert creating cycle → REFUSED cycle
27  I11.2 dep removal without decision → REFUSED; with → tombstone event exists
28  I-F4.1 fold → child enumerable as tombstone under parent (spine complete)


---

# CLOSING EDITS (revision pass 4 — final reviewer change set applied)

C1 (receipt binding, closes review#2): a verification_request pins
   {claim_text_hash, task_id, task_revision, work_revision, environment,
   verifier_type+version, policy_hash}; the receipt repeats that tuple plus
   {result_hash, raw_output_hash, artifact_hash}. valid() (D2) additionally
   requires request-tuple equality, and T2 verifies the receipt's claim_hash
   equals the hash of the completing task's declared claim — a receipt for a
   different claim can never complete a task.

C2 (gate freshness, closes #3): T11 requires valid ∧ FRESH (same D2
   predicates as T2); a stale or unsound-verifier receipt cannot pass a gate.

C3 (done semantics, closes #4): done ≔ evidence was valid∧fresh AT T2 commit
   (the transition event records the receipt id + its evaluated predicates).
   Later staleness is visible on the task (receipt_status=stale) but does not
   retroactively violate I10.2 — I10.2 tests the commit-time record. Replay
   (I10.7) re-evaluates NOTHING external: it folds the recorded predicate
   results from the transition event; artifacts are never re-fetched.

C4 (actor model, closes #5): every event's actor is a LEASE REFERENCE or a
   REGISTERED SYSTEM PRINCIPAL (reaper, maintenance scheduler, verifier
   runner, projection reconciler — closed enumerated set). I10.1 reads: no
   transition without valid lease OR enumerated system principal; I10.6's
   command identity covers both (system principals generate command_ids).

C5 (mutation-lease exclusivity, closes #6): WRITE and PLANNING are both
   MUTATION leases under one fencing rule — at most one mutation lease per
   task, of either kind (I9.2 scope: mutation leases). RequestVerify and
   gate-pass requests are explicitly permitted from PLANNING, so done or
   blocked gates remain operable without a WRITE lease.

C6 (descendant guard, closes #7): T2 complete, T9 cancel, and T10 fold all
   require NO NON-TERMINAL DESCENDANTS (statuses outside
   {done, closed, canceled, folded}); "no open children" is superseded.
   You cannot complete, cancel, or fold over live work.

C7 (X3 conservatism, closes #8): only soundly PROVEN compatibility is
   non-breaking; corpus-based evidence is advisory and classifies the change
   as BREAKING (revision bump + Decide). No approximation can waive a bump.

C8 (trust boundary, closes #9): runner honesty is an EXPLICIT ACCEPTED TRUST
   BOUNDARY: the runtime's actor identity is trusted; a compromised runner
   producing dishonest successful output is out of scope for v1 (documented
   risk register entry, alongside X2). Heartbeats detect absence only.

C9 (catalog extension, closes #10): D6 gains table-driven cases:
 29 every F6 trigger row without decision_id → REFUSED (8 sub-cases)
 30 I10.6 field completeness: transition event carries actor ref, command_id,
    expected_revision, guard evaluations; txn rollback leaves no partial fold
 31 I9.4 both branches stay resumable: checkpoint-exists (no snapshot) / absent (snapshot)
 32 C1 receipt-claim mismatch → T2 REFUSED claim_mismatch
 33 C2 stale receipt gate-pass attempt → REFUSED receipt_stale
 34 C6 complete/cancel/fold with in_progress descendant → REFUSED descendants
Catalog: 34 tests; the count assertion updates accordingly.

B0 STATUS: reviewer's minimal change set fully applied. Ready for close
pending final human approval (user gate stands above all reviews).
