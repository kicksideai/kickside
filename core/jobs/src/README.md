# kickside/jobs

Durable leased-job engine: slots, claims, leases, supervised execution and wake demand.

- `kickside.core.jobs` — shared job vocabulary, the component-facing
  durable job API, the runtime policy and the atomic thread-fact emitter.
- `kickside.core.jobs.persist` — claim/lease/lifecycle and wake demand over `kickside_job`.
- `kickside.core.jobs.service` — the supervised worker pool that claims and executes jobs.
- `kickside.core.jobs.migrations` — the `kickside_job` schema. The retired
  `kickside_effect_intent` and `kickside_effect_attempt` tables remain until
  the contract-phase migration drops them; nothing writes them.

A Hub update that changes the worker code upgrades the pool in place: the pool
keeps its PID, slots and assignments. Before admitting new claims or replacement
slots, the upgraded pool checks its own migrations through the migration
framework. Pending migrations defer admission through the existing retry timer;
registry and wake notices do not bypass that deadline. Running children remain
alive, cancellation remains available, and retention waits for the schema too.
Once ready, the pool stops reading migration status for that incarnation. A slot
running an execution lets it finish under the code it started with, then exits
and is replaced by a slot on the new code; idle slots are replaced at once. The
drain of an in-flight execution is bounded by that execution's own declared
`max_execution` ceiling (payload `max_execution_ms`, else policy
`proc.max_execution`); past it the ordinary timeout termination and retry policy
apply. An upgrade never terminates or re-runs an execution.

A job carries no execution identity: a `worker_ref` target runs under the worker frame and
resolves the identity held by its own owner record.

Sits below `kickside/core`: core depends on jobs (thread append publishes demand through the jobs wake
library); jobs depends on no core entry.

PostgreSQL migration 04 creates the Jobs-owned `updated_at` trigger function, so
Jobs can initialize its database without Core migrations. Migration 23 rebinds
legacy installations to that function without changing Core's function. Undoing
23 retains the Jobs trigger; undoing 04 removes its tables and function.

## Dependency interface

The host must supply `target_db`; it is injected into both the jobs migration and the
module-owned `db_config`. The worker, APIs, job client and lease logic
all resolve that config, so runtime SQL always follows the host's database mapping.

`jobs.get_job(id)` reads the exact job returned by enqueue and returns `(row, nil)`, `(nil, nil)` when absent, or `(nil, err)` on failure. The owning caller authorizes its resource before reading the job. Thread listings remain scoped to canonical thread owners.

Job listings and exact job reads include boolean `slot` and derived `due` fields.
`due` means the stored status is `pending` and `scheduled_at` is at or before the
database's current time. Pending-work counts use `due`, rather than status alone.
A pending slot without a schedule is idle; a future schedule waits until its due
time. An erroneous pending one-shot without a schedule is stranded. Existing
status values and status filters remain unchanged. Health uses the same schedule
eligibility rule and additionally excludes work blocked by dispatch capacity or
concurrency keys from its claimable backlog.

`jobs.get_job_statuses(ids)` reads an exact set of job IDs in one query and returns an ID-to-status map; absent or malformed UUIDs are omitted. `jobs.get_job_statuses_tx(tx, ids)` reads through the caller's transaction on the configured Jobs database, including its uncommitted writes. It neither commits nor rolls back that transaction. Both are internal-owner APIs: callers authorize their resource before reading job state.

`jobs.wake_job(id, { control = true, ensure_due = true })` ensures dispatch without rescheduling an already due pending job or requesting another execution of a running job. It retains their retry, lease, schedule and demand state and still notifies the worker pool. Parked, disabled and future pending jobs receive the ordinary control wake. A ready job returns `already_due = true` alongside the existing result fields. Omitting `ensure_due` retains the existing control and demand wake behavior.

`jobs.enqueue` and `jobs.enqueue_tx` accept optional `demand = true` with `slot = true`. Enrollment and control demand commit together: parked work becomes due, and a running attempt retains a follow-up. Reusing an active one-shot identity with demand returns a conflict. Omitting demand retains the existing enqueue behavior.

`jobs.enqueue` and `jobs.enqueue_tx` accept optional boolean `replace`. Identical
immutable inputs return the existing job. With `replace = true`, different inputs
for a pending job owned by the same owner cancel the predecessor and insert its
successor in one transaction. The result retains `{id, job_identity, existing}`
and adds optional `replaced_job_id`; a replacement has `existing = false`.
A running predecessor retains its identity and returns a retryable `CONFLICT`
with `details.job_id`; no successor is accepted. A different owner returns the
existing non-retryable conflict. Omitting `replace` preserves immutable-input
conflicts. Caller-owned transactions roll back when enqueue returns an error.

Lease expiry fences the prior execution before requesting revocation. Recovery
makes the job claimable only after its registered execution child has ended.
A gone child recovers in the same pass; a live child retains the termination fence.
Heartbeats renew only matching, unexpired executions without a termination fence.

### Heartbeats

A job opts into progress-based liveness with payload `heartbeat_timeout_ms`
beside `max_execution_ms`. Its worker calls
`jobs.heartbeat(id, { token, execution_seq }): (boolean?, error?)` at each
progress point. A heartbeat renews the execution's lease and moves its
heartbeat deadline; it returns `false` when the lease no longer holds, so the
worker stops. The job-child supervisor ends an attempt at the earlier of its
ceiling and its last heartbeat plus `heartbeat_timeout_ms`; a missed heartbeat
is an ordinary failure (`job heartbeat timed out`) that retries and, on the
final attempt, ends the job dead. Infrastructure lease renewals never move the
heartbeat deadline, and a heartbeat after the supervisor fenced termination
returns `false`. Delivery to the supervisor runs under the Jobs identity, so
callers need no process messaging authority. Jobs without
`heartbeat_timeout_ms` keep the fixed ceiling.

### Dead outcomes

A worker entry names the function that receives its dead jobs:

```yaml
meta:
  job_dead: app:process_dead
```

When a one-shot job ends `dead` (its final attempt failed for any reason,
including a ceiling, heartbeat or crash termination by its supervisor, or a
deterministic failure), the transaction that writes `dead` enqueues one outcome
job for that function with the dead job's owner and thread, identity
`(kickside.jobs.dead, <dead job id>, outcome)` and payload `{ job_id }`. The
handler reads the dead job with `jobs.get_job` (status, `last_error`) and maps
it to its own resource through the job id it recorded at enqueue. Delivery is at
least once: the outcome runs on the ordinary claim, lease and retry machinery,
infrastructure failures retry up to the largest attempt limit, and a
deterministic handler failure ends the outcome job dead. Handlers are
idempotent. A thread owner whose cleanup has started, or a worker entry removed
from the registry, receives no outcome. Enqueue refuses a job whose worker
declares an invalid `meta.job_dead`.

`jobs.health()` reports `stranded_jobs` with `job_ids` for erroneous pending
one-shot jobs without a schedule. This invariant is unhealthy immediately; the
existing `health.overdue_grace` bounds due-work diagnostics only. Scheduled retry
errors remain part of `degraded_jobs` without creating a stranded-job issue.

After committing a transaction containing `jobs.enqueue_tx(tx, dbtype, params)`,
call `jobs.nudge_workers(): (integer, error?)`. Never nudge before commit or after
rollback. The result counts notified pools (`1` when delivered, `0` when no pool
is registered); an absent pool leaves committed demand for boot recovery. Return
or handle notification errors so delivery can be retried. The facade calls the
public `kickside.core.jobs:nudge_workers` entry using ordinary Jobs runtime
access. Jobs owns its transport permission and sends under its own identity;
callers need no persistence call grant or process-send authority.

`jobs.purge_slot(params: table): (integer?, error?)` removes a retired owner's
exact slot, selected by the required nonempty strings `namespace`, `scope`, and
`key`, with its settled run history. The owning caller authorizes retirement
before invoking this operation. Each call deletes at most 100 settled runs;
it returns `1` when the slot is removed or `0` when absent. A retryable conflict
with `details.cleanup_pending` preserves the existing continuation contract:
`needs_continue = true` requests another page, while `wait_for = "lease_release"`
or `"run_history_settlement"` requires settlement before retry. Running leases
and unsettled history are retained. Callers import only `kickside.core.jobs:jobs`.

### Worker capacity declarations

A worker entry can declare a Settings-backed capacity shared with other worker
entries:

```yaml
meta:
  job_capacity: app.capacity
  job_capacity_settings:
    namespace: app.capacity
    global_limit_key: global_limit
    concurrency_key_limit_key: concurrency_key_limit
```

Workers in one group declare the same Settings values. Jobs for a declared
worker require a nonempty `concurrency_key`. Claims enforce the group-wide
global limit and the limit for each concurrency key. Both values are read from
the declared Settings namespace at claim time. Jobs for workers without this
declaration retain the ordinary single-flight behavior for a concurrency key.

Declarations and limits are observed once per claim/backlog operation; they are
not cached between operations. Invalid or unavailable declared Settings fail
admission rather than removing the limit. The declared group must remain stable
while its jobs are active. Enable declarations only after every Jobs claimant
sharing that queue has been upgraded to support capacity enforcement.

`jobs.complete_tx` accepts optional `demand_satisfied = true` when the worker proves under its durable source lock that the completed run covers the source head. It consumes ordinary demand received during that run; independent control wakes still rearm the slot. Omission retains the existing demand behavior.

Failure transitions accept an optional final `{ retry_after_ms = milliseconds }`
argument on `fail_tx` and `fail_job`. The structured floor can exceed the policy
cap. Slots use `slot_retry`; one-shot jobs use `retry`. Both retain their configured
base as the lower bound of jitter. Worker failures carry native error details to
this argument before rendering the history error text. Malformed provider retry
hints are ignored so they cannot prevent failure settlement; explicit failure
transition arguments remain validated.

Completion options accept `park = true` independently of `record.status`. Parking
suppresses ordinary wake demand while preserving the requested history status;
a pending control wake retains priority. Without `park`, completion keeps its
existing record-based parking behavior.

`wake_multi(tx, keys, dbtype?, completion_job_id?)` accepts an optional completing
job ID. When fan-out locks jobs, it includes that row in the globally ordered
prelock without waking it unless it independently qualifies for a supplied key.
With no fan-out job locks, completion takes its sole job lock itself. Wake keys
are published before any job row is locked.

## Live performance policy

The editable policy paths are Settings definitions in namespace
`kickside.core.jobs` (`kickside.core.jobs.policy.settings`):
`worker.count_postgres` (default **4**, range 1–256), `worker.count_sqlite` (1–2),
`worker.awaited_slots` (1–256), `worker.claim_batch` (1–256), `fairness.shares`
(0–1000 per tier, nonzero total), `lease.timeout`, `lease.heartbeat`,
`retry.max_attempts` (1–1000000), `retry.retry_after_ms` (1–86400000),
`retry.max_delay_ms` (1000–86400000), and `proc.max_execution` (default **10m**).

Precedence is administrator override, then the host assignment in
`kickside.core.jobs:policy` meta, then the shipped default in its `defaults`.
Settings stores only overrides; Jobs reads the keys `get_namespace` reports as
`overridden`, so a value without an override follows the host configuration
rather than the Settings default. Each override is validated by
`kickside.core.jobs.policy:validate`, which resolves the whole policy with the
candidate: durations are positive, the lease timeout is a whole number of
seconds and at least 1s, and the heartbeat is strictly shorter. Edits that move
both lease values may need the heartbeat lowered before the timeout.

Without Settings, Jobs runs on its registry and host policy.

The singleton pool owner subscribes to Settings change notifications before its
first policy read. Each notification, registry commit and startup re-resolves the
policy from the current overrides and applies it through the existing
wake/idle/registry loop: there is no policy timer, revision table or polling. A
failed read or resolution leaves the owner and its busy workers on the last good
policy and retries on the owner's existing retry deadline. A smaller pool stops
assigning surplus slots, lets busy slots finish, then retires them. An in-place
upgrade hands the live slots, their assignments and the last good policy to the
new code.

Out-of-pool readers (enqueue attempt defaults and recovery batch limits) resolve
the same committed policy through `kickside.core.jobs.policy:settings_overrides`,
which reads Settings under its own policy, so callers need no Settings access.
Fixed registry reads (`config.policy`) never include overrides.

Every claim entry point persists its execution snapshot in `kickside_job.lease_policy`
and passes it with the assignment. Dispatch, heartbeats, completion, retries,
cancellation fences and reclaim preserve that snapshot after database reloads;
live edits cannot shorten a running execution's renewal or termination window.
Migration 24 leaves pre-upgrade running rows with NULL `lease_policy`. Those jobs
started before live policy existed, so the shared execution-policy reader
resolves NULL to the registry/host policy on every execution path. It never
guesses timing from heartbeat/deadline timestamps or adopts later overrides.
New executions use the new lease pair and execution ceiling; new one-shot jobs
inherit the new attempt limit. Retry delays travel with the claim and apply when
that execution fails. Job-specific attempt/execution limits retain precedence.
