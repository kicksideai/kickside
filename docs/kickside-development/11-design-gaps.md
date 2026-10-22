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
| Creation identity | New components start with the creator's captured identity, including credential and link restrictions. | [Components](01-component-development.md#creation-and-import-identity) |
| Import identity | The authenticated importer is the subject; imported components start with initialized identity. | [Components](01-component-development.md#creation-and-import-identity) |
| Webhook identity | Ingress retains its actor construction, refuses missing/inactive user owners and lost thread WRITE, and supports group and service owners. | [Webhooks](04-connections-and-integrations.md#webhook-identity) |
| Resync authority | The captured operator holds Automation WRITE, directly or through a group, at admission and before finalization; execution-authorizer equality is not required. | [Controls](21-automations-and-dataflows.md#drives-rounds-and-timing) |
| At-most-once delivery | A failed write call after reservation stays uncertain without automatic resend; replay mints a new key. | [Destination writes](21-automations-and-dataflows.md#write-a-destination) |
| Reply delivery keys | `send_reply` accepts optional `idempotency_key`; Discord uses a deterministic nonce with `enforce_nonce`. Channel and Discord keep no write receipts. | [Reply providers](04-connections-and-integrations.md#reply-providers) |
| Large knowledge content | Over-budget content events carry `content_omitted`, `content_bytes`, and an upload/artifact reference; consumers read the artifact. | [Knowledge](05-knowledge-uploads-automation-inbox.md#source-materialization) |
| Opaque configuration | Optional `x-authority: subject` marks schema values whose edits require the execution subject. | [Automation kinds](21-automations-and-dataflows.md#declare-an-automation-kind) |
| Jobs options | Structured retry floors and independent completion parking are optional additions; omitted options preserve their caller shape. | [Jobs](20-execution-identity-and-jobs.md#schedule-a-durable-job) |
| Jobs failures | Infrastructure failures retry with backoff; only declaration, access, and subject failures park. | [Jobs](20-execution-identity-and-jobs.md#schedule-a-durable-job) |

## Capabilities In Review

Native scopes compose access from database lists of policy IDs returned by live
subject lookup as `scope_policy_ids`, without generated policies. They require
a runtime release with that optional lookup support. See
[native scopes](20-execution-identity-and-jobs.md#native-scopes-in-review).

Large-table data repairs use the framework's opt-in batched migrations. The
capability remains in review; existing atomic migrations keep their behavior.
See [batched repairs](13-testing.md#batched-data-repairs-in-review).

## Open Design Decisions

### Slot Lifetime Across Stores

Canonical slot uniqueness prevents duplicate active jobs; it does not guarantee
that a surviving owner references a live slot across independently configured
stores. A delayed cancellation, enqueue, or wake-key change can undo a newer
owner generation during a source change. A lease token fences an execution,
not owner generation.

The options are a Jobs-enforced owner-generation fence with durable replay
evidence, using the owner's existing operation, or retaining the known race.
The stronger option needs an approved optional Jobs contract and persistence
design covering provision, rekey, cancellation, and deletion. Its fence must
survive job deletion, and finalization must require the matching target receipt.
An Automation-only check or a cancel-only fence is insufficient. Same-store
atomic projection paths retain their current ownership. A population scan does
not establish cross-store ordering. Historical stranded-drive repair waits
for the batched migration capability; repairing old rows does not close the
source-change race.

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
adding a bounded, resumable, idempotent pin backfill through the
[batched migration capability](13-testing.md#batched-data-repairs-in-review)
in review. Pin backfill and stranded-drive repair wait for that capability.
The existing atomic runner owns one transaction across `up`, `after`, and its
tracking record; paging within it does not bound lock duration. Already-pruned
history cannot be reconstructed.

### Webhook Live Resolution

The shared live resolver supports user selections only, while webhook ingress
also supports stored group and service owners. Existing owner rows do not
contain the authorizer provenance needed to construct their captured identity.
The options are retaining ingress actor construction or defining compatible
shared resolution with trustworthy provenance for those owners. Refusing
working non-user ingress or guessing its authorizer is not a compatible
cutover.

### Custom-Scope Lookup Cost

The native scope design resolves database policy-ID lists on each live subject
lookup. The options are accepting the per-request cost or approving a cache
with explicit revocation semantics. Users and Security have independently
configurable database resources; a shared-query optimization cannot assume
their tables share a database. No cache or colocation requirement is approved.

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
