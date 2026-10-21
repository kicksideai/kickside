# Design Gaps And Watchpoints

This page is a review aid. It lists places where future work can accidentally
create parallel paths or muddy vocabulary.

## Accepted Contract Amendments

These rules describe the current contract. They preserve existing interfaces,
stored data, and defaults; they do not require schema cleanup or new execution
mechanisms.

| Area | Accepted rule | Detail |
| --- | --- | --- |
| Writable identity | `identity_key` stays optional in the request schema; new producers supply it and new sinks require it. | [Contracts](02-contracts-and-ports.md#contract-binding) |
| Event acquisition | `payload` is the decoded body; event metadata stays on the item. Request-level `event_type` takes precedence over `config.event_type`. | [Events](03-threads-events-projections.md#declare-the-event-vocabulary) |
| Write receipts | `commit` requires `identity_key`, `payload_hash`, `dest_refs`, `outcome`, and the existing sink, key, and completion timestamp. | [Receipt signatures](02-contracts-and-ports.md#contract-binding) |
| Workflow capacity | Workflows policy owns `max_inflight_runs`; Automation round policy does not override it. | [Workflows](18-blocks-flows-workflows.md#workflow) |
| Write hash | The ledger compares the operation separately; the hash omits `sink_op`. | [Destination writes](21-automations-and-dataflows.md#write-a-destination) |
| Wake coalescing | The notice drain is bounded per claim; a burst has no universal two-empty-claim bound. | [Claims](20-execution-identity-and-jobs.md#claim-and-storage-behavior) |
| Claim history | Idle executions retain run-history settlement proof; keyless leases use guarded per-row updates. | [Claims](20-execution-identity-and-jobs.md#claim-and-storage-behavior) |
| Worker capacity | SQLite has two general workers plus one awaited slot by default; PostgreSQL has four plus one. | [Jobs](20-execution-identity-and-jobs.md#claim-and-storage-behavior) |
| Storage | Job actor columns remain without authority; fillfactor 70 and a dedicated Automation receipt identity index are not requirements. | [Jobs](20-execution-identity-and-jobs.md#claim-and-storage-behavior) |
| Projection reads | Prefetch uses the projection reader with its existing range and filter semantics. | [Projections](03-threads-events-projections.md#declare-a-projection-worker) |
| Resync authority | The current operator rule is WRITE on the Automation. | [Controls](21-automations-and-dataflows.md#drives-rounds-and-timing) |
| Opaque configuration | Optional `x-authority: subject` marks schema values whose edits require the execution subject. | [Automation kinds](21-automations-and-dataflows.md#declare-an-automation-kind) |
| Jobs options | Structured retry floors and independent completion parking are optional additions; omitted options preserve their caller shape. | [Jobs](20-execution-identity-and-jobs.md#schedule-a-durable-job) |

## Open Design Decisions

### Slot Lifetime Across Stores

Canonical slot uniqueness prevents duplicate active jobs; it does not guarantee
that a surviving owner references a live slot across independently configured
stores. A delayed cancellation, enqueue, or wake-key change can undo a newer
owner generation. A lease token fences an execution, not owner generation.

The options are a Jobs-enforced owner-generation fence with durable replay
evidence, using the owner's existing operation, or retaining the known race.
The stronger option needs an approved optional Jobs contract and persistence
design covering provision, rekey, cancellation, and deletion. Its fence must
survive job deletion, and finalization must require the matching target receipt.
An Automation-only check or a cancel-only fence is insufficient. Same-store
atomic projection paths retain their current ownership. A population scan does
not establish cross-store ordering.

### Receipt And Replay Horizon

Unbounded retry/replay and age-pruned receipt or run history cannot jointly
promise permanent deduplication. The options are an explicit finite replay
horizon or retention of evidence while durable debt can still reference it.
The decision must align receipt, prepared-output, ledger, and workflow-history
retention. Missing evidence alone does not prove an ambiguous effect absent.

### Workflow Identity On Changed Input

The run writable currently deduplicates by delivery `idempotency_key`. Stable
`identity_key` deduplication needs a rule for changed source input: reuse the
earlier run, reject the changed input, or define a new workflow effect identity.
Existing run keys can collide after rekeying, and opaque direct-call keys lack
reconstructable stable identity. A decision must cover those rows before any
bounded migration; current keys and successful later deliveries retain their
semantics meanwhile.

### Projection Pin Backfill

Existing invalid cursors need protection for unread history even when new
blocks receive pins. The options are retaining this historical limitation or
adding a bounded, resumable, idempotent pin backfill through an approved
migration capability. The current migration runner owns one transaction across
`up`, `after`, and its tracking record. Paging within that transaction does not
bound lock duration; independently committed batches need upstream support.
Already-pruned history cannot be reconstructed.

### MCP Credential Group Inheritance

Current credential resolution inherits the owner's live user-group grants;
the restricted-credential design calls for zero inherited group subjects.
The options are explicitly accepting inheritance within credential restrictions
or removing it under approved compatibility semantics. Existing empty
allowlists also need a decision: stored absence and empty values do not reliably
preserve whether the caller intended no added restriction or no access.
Neither group removal nor reinterpretation of stored lists is a silent change.

### Idle-System Liveness

The event/deadline-driven scheduler has no periodic correctness polling. If a
producer dies after committing demand but before notification, an idle pool can
leave that durable work undiscovered until another event or boot. Recovery
claims therefore exclude this notification window; durable state alone does
not imply a bounded wake-to-claim time. The options are retaining this explicit
qualification or approving a stronger notification/enrollment barrier at the
scheduler boundary. Health observation and a recovery index alone do not close
the window.

## Public Meta Ownership

Target state:

```text
domain facts/storage -> one component-state owner -> component.set_meta
```

Watch for:

- domain workers recomputing counts and calling `set_meta`
- feature-specific `get_stats` endpoints used only to patch list cards
- retry/error paths stamping fake progress into public meta
- frontend surfaces subscribing to internal worker topics for list status

Corrective action: move the render snapshot to the component-state projection or
one explicit owner, and make frontend consume `component.<id>` full meta
snapshots.

## Realtime Topic Sprawl

Canonical list status topic:

```text
component.<component_id>
```

Feature-specific topics are acceptable only for internal/detail streams that are
not component public state. They should not be required to render generic
component lists.

## Component Granularity

Risk: making every domain row a component.

Rule: use components for lifecycle/access roots. Use module-owned rows for
high-volume records beneath those roots.

## Contract Granularity

Risk: shallow single-use contracts.

Rule: use a contract when decoupling or multiple implementations are real. Use a
module library for private helpers.

## Identity Paths

Target state:

- active operations use ambient actor/scope
- deferred workers run under reconstructed execution identity
- owner columns and actor columns are not conflated
- code uses actor APIs, not metadata aliases

Watch for helpers that accept actor arguments to impersonate users. Workers
should already be running under the right actor or should use an explicit
system/internal path.

## Upload And Content Access

Target state:

- app-internal callers use ambient access and owning APIs
- decoupled/external callers use signed upload/content tokens
- tokens carry minimal authority and correlation only
- UI origin metadata stays renderable but is not authority

Watch for direct storage URLs, broad token payloads, or KB code reading upload
tables directly.

## Frontend Coupling

Target state:

- app shell renders registry-declared surfaces
- modules ship their own web components
- lists render component public meta
- details call owning APIs

Watch for app shell imports of module UI, hardcoded provider lists, or frontend
storage joins.

## ERP-Scale Modeling

Target state:

- component roots for access/lifecycle
- module-owned tables for dense business records
- events for cross-component workflows
- projections/read models for dashboards
- ports for no-code builders

Watch for either extreme: one giant component blob with no domain tables, or a
raw table model with no component/access/workflow roots.

## Review Invariants

- Every list surface that displays component status consumes public meta.
- KB public meta has one authoritative state owner.
- Upload processors expose artifacts through upload contracts/APIs.
- Connection status is public meta when rendered in component lists.
- Inbox and automation compose ports with component meta; they do not define a
  second component or execution model.
