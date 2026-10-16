# Chestor Journal — Rebuild Plan (v2 architecture, adversarially reviewed 2x)

Status: STORED ARCHITECTURE. Codex round-2 verdict: sound to store and build
against, conditional on B0 resolving the X-list below into testable
invariants before any implementation code. USER APPROVAL REQUIRED before B0.

Purpose: the durable working memory for agents on very long tasks. An agent must
never lose the task, the verification, the sequence, the composition, the
judgments, or its position; it must plan wide, experiment, fold, leave and
resume; a human must see whole-work status at a glance. Verdict driving v2:
v1 had a strong information model and a weak enforcement model — guarantees
must be transitions the server refuses, not conventions an agent remembers.

## 1. Failure modes this must cure (observed, two sessions)
F1 unrecorded/false verification · F2 lost sequence (work outside the plan)
F3 contract drift between composed agents · F4 unfindable judgments
F5 lost/ambiguous position · F6 silent subsystem death

## 2. Information model
- TASK TREE = the plan. Infinite nesting (parent_task_id), created ahead
  (decompose, wide and deep). Dependency edges (blocks/relates) are separate
  from the tree; the server rejects self-deps, cycles, and duplicate edges (F2).
- FACTS attach to a task branch: decision / observation / risk / note /
  verification / artifact / checkpoint. Free-floating facts are exceptional.
- DECISIONS form supersedes-chains, searchable, branch-anchored (F4).
- EXPERIMENTS: branches opened with a hypothesis; end adopted|abandoned via
  FOLD — distilled result becomes a parent fact, branch leaves working views,
  evidence retained.
- BRANCH DIGEST: every branch keeps a rolled-up digest with PROVENANCE
  (which events/receipts it derives from), FRESHNESS (source seq + age), and
  unresolved contradictions surfaced, updated on checkpoint/complete/fold.
- AGENT CONTRACTS (F3): a task handed to a child agent carries a typed,
  versioned input/output contract; the parent validates the child's declared
  output against it on completion.

## 3. Enforcement model (all server-side; the API refuses, never trusts)
- SESSION CAPABILITY: every write requires a lease token issued by OpenBranch.
  No lease → no write. "Enter first" is structural, not instructed (F5).
- PER-AGENT LEASES: the active pointer is per-agent and lease-backed
  (heartbeat, expiry, handoff, crash recovery). Facts attach through the
  writing agent's lease, never a shared global pointer. A separate
  journal-level nominated focus exists only for the shared UI.
- TRANSITION AUTHORITY: task state is a server-owned state machine
  (open → in_progress → done/closed/abandoned; experiment → folded). Invalid
  transitions, gate bypass (starting work behind an unpassed gate), dependency
  cycles, stale concurrent writes (expected-revision), receipt deletion or
  rebinding — all refused at the write path, not filtered in queries.
- CONCURRENCY: idempotency keys on every command; expected_revision on every
  mutation; defined conflict semantics (retry vs refuse). "Idempotent" is a
  design, not an adjective.
- CHECKPOINT SAFETY NET: leases that expire without a checkpoint trigger an
  automatic snapshot (last activity window distilled) plus an explicit
  "abandoned lease" handoff record — leaving without a checkpoint cannot lose
  state (F5, F1-adjacent).
- HEALTH OF HEALTH: projections/embeddings/maintainer jobs surface their state
  on the journal; a watchdog marks the health data itself stale when the
  monitor dies (F6 becomes visible even when the visibility layer fails).

## 4. Verification & gates
- Each task declares a VERIFIER POLICY (not a universal boundary ladder):
  what claim must be proven, by which typed verifier (test-run / http-probe /
  browser-render / human-ack), and what counts as a pass. Machine-evaluated
  verdicts wherever feasible; reviewer identity otherwise.
- A RECEIPT binds: claim, task revision, code/data revision, environment,
  method, verdict, timestamp, immutable artifact (managed store; external refs
  only with hash + availability state). Receipts are append-only.
- INVALIDATION: when the task's work or acceptance criteria change after a
  receipt, the receipt is marked stale; done cannot rest on a stale receipt.
- GATE PASS and TASK COMPLETION are separate transitions: a gate passes on
  evidence; work completes on result + valid receipt. The frontier never
  serves work behind an unpassed gate, AND the server refuses to start it
  (belt and suspenders).
- REFUSE, with audited exceptions as two DISTINCT states: WAIVED authorizes
  the absence/staleness of required evidence; ACCEPTED-RISK accepts known
  failed evidence. Both: separate authority from the requester where warranted,
  rationale schema, expiry, revocation, searchable counts, no blanket or
  recursive waivers, never silently equal to done.

## 5. The visibility lens (amended)
Standing at node N an agent sees:
(a) ancestor spine root→N: goal, status, digest (+freshness) each — not their
    subtrees;
(b) N in full: facts, deps, verifier policy and receipt status, owner/lease,
    "changed since my last checkpoint" delta;
(c) N's children as rollups: title, status, open count, digest, digest age;
(d) BOUNDED CROSS-BRANCH EXCEPTIONS: dependencies and blockers from other
    subtrees that materially affect N, as one-line summaries (the absolute
    "never other subtrees" rule bends exactly here and nowhere else);
(e) FRONTIER WITH REASONS: next actionable work; exclusions come back as
    categorized counts (behind-gate / blocked-by / leased / folded) with
    drillable reasons per category — individual explanations on demand, never
    6,000 at once. An empty frontier always explains itself.
Navigation moves the lens anywhere at the same bounded shape. Whole-work
understanding = Digest() (bounded picture: tree + status + risks + frontier)
+ Search(text|semantic) across all facts — complete queryability of the whole
journal without ever rendering it at once.

## 6. Protocol operations (thin verbs over the enforcement model)
OpenBranch(task?) → lease + lens · Decompose(parent, subtasks[, contracts])
Link(a, blocks|relates, b) · Record(kind, data) [attaches via lease]
Decide(text, supersedes?) · OpenExperiment(parent, hypothesis)
Fold(experiment, outcome, distilled) · MarkGate(task, verifier policy)
Verify(task, receipt) · Complete(task, result) · Waive(task, authority, reason)
Checkpoint(summary) · Frontier() · Digest() · Search(q, mode) · Handoff(to?)

## 7. UI — full rebuild (remove old shell after parity)
S1 WHERE AM I (landing): active branch card — breadcrumb, goal, owner/lease,
   digest + freshness, receipt status, latest checkpoint, "changed since
   checkpoint" feed, open children in sequence order, blockers with reasons,
   and ONE authoritative next action with rationale (alternatives listed with
   why they're blocked).
S2 THE MAP: compound nested LAYERED graph (dagre-family; deterministic,
   persisted layout — never physics for structure): branch = collapsible
   container with rollup counts + digest; dependency edges rolled up across
   collapsed containers; status encoded by color AND shape/badge (a11y);
   defined zoom semantics (journal → branch → task); cycles, if ever present
   in relates-edges, rendered explicitly; active halo; drill = the lens.
   Server sends focus slices only — never all nodes.
S3 FIND: judgments & evidence — search decisions/receipts/checkpoints with
   filters (kind, subtree, date, contradiction), decision chains navigable,
   receipt preview with integrity (hash) and artifact availability, saved
   queries.
CHANGE FEED (first-class, not buried): "what happened" since checkpoint /
   since revision, scoped journal | subtree | branch. Timeline survives only
   as this audit lens (Q5).
HEALTH STRIP: projection lag, embedding backlog, maintainer queue, dead jobs,
   health-data staleness.
SEMANTIC OVERLAY (optional lens): force layout strictly for embedding-
   similarity neighborhoods, on demand (the one job physics is right for).

## 8. Map representation — research + constraint
Evidence: force-directed hairballs past ~200 nodes (Obsidian field data);
layered DAG is the industry standard for dependency/pipeline legibility
(dagre/Sugiyama; Dagster/CI); mature tools pair a structural graph with
run-state coloring + drill + durable resume (Dagster/Temporal/LangGraph);
outliners are where daily navigation happens.
Decision R*: outline (S1) as primary work surface; compound nested layered
graph (S2) for whole-work status; force only as the semantic overlay.
BINDING CONSTRAINT (user): chestor/journal and chestor/graph remain fully
independent components — no cross-component UI imports, no shared rendering
library. The proven nesting/drill/collapse/edge-rollup interaction semantics
carry over as design knowledge, implemented independently in the journal's ui/.
The journal map is read-only projection (no node editing).

## 9. Acceptance criteria (each closes only with a recorded receipt)
A1 whole-work status: journal opens to a legible, drillable status surface;
   completeness = full queryability (Digest/Search/lens reach everything),
   never simultaneous rendering of all nodes. Browser receipt.
A2 plan-ahead: agent decomposes wide+deep with deps before work; visible in
   map. Scripted MCP + browser receipt.
A3 deep linking: 5+ level branch with cross-links legible in outline and map.
A4 position: fresh session resumes correctly from the journal alone after a
   simulated compaction; UI shows position. Receipt = the resume transcript.
A5 verification unmissable: forbidden transitions refused (no receipt, stale
   receipt, behind gate, no lease, stale revision — each attempted and
   refused). Receipt = refusal log.
A6 experiment/fold end-to-end.
A7 semantic search + digest on real migrated data.
A8 health: kill a projection on purpose; journal shows degraded; kill the
   monitor; health shows stale.
No completion claims outside recorded receipts. Chat claims don't count.

## 10. Build order (spec-first, enforcement before surface, UI last)
B0 SPEC: state machines (task/gate/experiment/verification/lease), event
   schemas + agent contracts, concurrency semantics (idempotency, revisions,
   conflicts), verifier-policy types, invariants catalog, failure semantics.
   Reviewed (Codex) and stored before any code.
B1 Enforcement core: transitions, leases/capabilities, dependency validation,
   receipt store + invalidation, refusals. (Backend only.)
B2 Adversarial protocol tests: scripted agents try to cheat (skip verify,
   bypass gate, stale writes, lease theft, receipt rebinding) — all refused.
   This gate passes before any UI work (A5 receipt produced here).
B3 Lens + Frontier-with-reasons + Digest + change feed APIs.
B4 Health + health-of-health.
B4.5 Protocol usability pass: a scripted honest agent runs the whole protocol
   through MCP (not adversarial — ergonomic); friction fixed before UI exists.
B4.6 Migration rehearsal: legacy journals replayed into the new model on a
   scratch journal; counts/trees/receipts verified — BEFORE any UI consumes
   "real data".
B4.7 API-level child-agent dry run (the B8 scenario, headless) — proves the
   protocol end-to-end before a single UI surface is built.
B5 UI S1 (landing) + S3 (find) + change feed, browser-verified on rehearsed
   real data.
B6 UI S2 layered compound map (deterministic layout, focus slices).
B7 Cutover: migrate journals, re-verify A1-A8 on migrated data, rollback path
   tested, THEN delete the old shell on explicit approval.
B8 Deterministic-loop dry run repeated through the finished surface; its
   receipts are the final acceptance.

## B0 exit criteria (unresolved items from adversarial round 2 — B0 is not
## done until each is a testable invariant or an explicit threat-model entry)
X1  Verifier honesty: receipts prove provenance, not honest execution — define
    trusted verifier execution (runner-signed receipts) or reviewer attestation.
X2  Work authority: OpenBranch grants journal-write, not work authority; define
    what (if anything) gates external work on plan acceptance — or accept and
    document the boundary.
X3  Agent contracts: compatibility rules, executable validation, semantic (not
    just syntactic) checks; independent validator for high-impact contracts
    (parent-only validation is circular).
X4  Decision capture: policy for which transitions demand a Decide (e.g.
    supersessions, waivers, gate changes) so consequential choices cannot ride
    in notes.
X5  Pointer truth: lease expiry proves inactivity, not correctness; define
    reconciliation on resume.
X6  Independent health channel: watchdog cannot report through the channel it
    monitors; define the out-of-band heartbeat.
X7  Digest freshness: incremental recomputation triggers, generator version,
    failure behavior; raw immutable event slice preserved alongside any
    generated distillation.
X8  Receipt invalidation: exact revision scope + automatic triggers.
X9  Lease/capability mechanics: scope, audience, replay resistance, fencing,
    renewal races, clocks, revocation, multi-agent same-task access; blocked
    tasks yield planning-only capabilities.
X10 State machine closure: done vs closed, reopen, abandoned recovery, waiver
    states, experiment lifecycle interactions.
X11 Dependency mutation semantics: direction, removal, late-added blockers,
    completed-task invalidation, audit.
X12 Projection upgrade (PROVEN defect, 2026-08-13): per-thread projection
    bodies freeze at journal creation; module upgrades adding event types are
    silently dropped by old journals (log accepts, cursor advances, read model
    lies by omission). Spec: projection-definition refresh/versioned bodies
    with catch-up replay on upgrade, plus health flag for input-filter drift.

## Resolved questions
Q1 per-agent leased pointers NOW; journal-level nominated focus for shared UI.
Q2 managed immutable artifacts preferred; external refs only with hash +
   availability + retention.
Q3 hard-refuse; separately authorized, visible waiver transition.
Q4 virtualized outline + server-computed focus slices + collapsed containers;
   never ship all nodes.
Q5 Timeline lives on solely as the scoped change/audit feed.
