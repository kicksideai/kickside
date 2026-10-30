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
keeps its PID, slots and assignments and keeps claiming on the new code. A slot
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

`jobs.get_job_statuses(ids)` reads an exact set of job IDs in one query and returns an ID-to-status map; absent or malformed UUIDs are omitted. `jobs.get_job_statuses_tx(tx, ids)` reads through the caller's transaction on the configured Jobs database, including its uncommitted writes. It neither commits nor rolls back that transaction. Both are internal-owner APIs: callers authorize their resource before reading job state.

`jobs.wake_job(id, { control = true, ensure_due = true })` ensures dispatch without rescheduling an already due pending job or requesting another execution of a running job. It retains their retry, lease, schedule and demand state and still notifies the worker pool. Parked, disabled and future pending jobs receive the ordinary control wake. A ready job returns `already_due = true` alongside the existing result fields. Omitting `ensure_due` retains the existing control and demand wake behavior.

`jobs.enqueue` and `jobs.enqueue_tx` accept optional `demand = true` with `slot = true`. Enrollment and control demand commit together: parked work becomes due, and a running attempt retains a follow-up. Reusing an active one-shot identity with demand returns a conflict. Omitting demand retains the existing enqueue behavior.

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

Jobs owns `kickside_job_policy_override`; it contains only admin overrides, as
JSON values keyed by policy path. Settings uses the Jobs library, never the
platform settings store, to administer this policy:

- `jobs.get_policy()` returns `{ policy, fields, revision }`. Each editable field includes
  `value`, `source` (`default`, `host`, `admin`), `default`, `fallback`, unit and
  numeric bounds. The registry declaration keeps shipped defaults in `defaults`
  and explicit host assignments in `meta`; a host assignment remains Host even when equal
  to its default.
- `jobs.set_policy_overrides(values, unset?)` atomically sets a path/value map
  and removes paths in `unset`. It requires `jobs.policy.write` on
  `kickside.core.jobs:policy`, even for a direct library caller. Invalid writes
  return native `errors.INVALID` errors and persist nothing. Removing an Admin
  override reveals the Host value when configured, otherwise the Default.
  A successful commit returns `committed = true`, the committed `revision`, and
  the authoritative fields without awaiting the owner. Empty writes are invalid
  and never advance the revision. A nudge transport failure retains the committed
  fields in a native error response.
- `jobs.get_pool_state()` reads the Jobs-owned applied-state row and durable
  queued/running counts by tier. It returns `applied_revision`, last recorded
  total/general/awaited slots, database, `updated_at`, and `apply_error` (a native
  error envelope or null). Busy/idle counts use the running aggregation. Queued
  includes future scheduled work and excludes parked slots. This is durable
  applied state, not a process-liveness probe.

The editable paths are `worker.count_postgres` (default **4**, range 1–256),
`worker.count_sqlite` (1–2), `worker.awaited_slots` (1–256),
`worker.claim_batch` (1–256), `fairness.shares` (0–1000 per tier, nonzero total),
`lease.timeout`, `lease.heartbeat`, `retry.max_attempts` (1–1000000),
`retry.retry_after_ms` (1–86400000), `retry.max_delay_ms` (1000–86400000), and
`proc.max_execution` (default **10m**). All flow through `config.resolve`. Durations are positive;
lease timeout is at least one whole second and heartbeat is strictly shorter.

Overrides and a monotonically increasing revision commit in one SQL transaction.
A write nudges the consistent singleton owner and returns immediately. The owner
checks the committed revision on start and every in-place handover; nudges
accelerate discovery. It reads override
values once per new revision and resolves an immutable runtime snapshot without
editor metadata. A failed read or resolution leaves the owner and its busy
children running on the last good snapshot. Existing events and deadlines retry
pending application; there is no new retry timer. Registry-only readers keep their
registry-version cache; they never read the override table or a memory store.
All out-of-pool readers of editable values use the same committed-policy
resolver on their existing SQL handle. Enqueue reads the committed attempt
default only when no job-specific attempt limit is supplied. Recovery resolves
its default batch limit once, outside its per-row loop.
There is no policy cache, bootloader, polling or publication retry loop.

The existing wake/idle/registry event loop applies capacity, batch and fairness
changes. It adds no watcher, process or polling timer. A smaller pool stops
assigning surplus slots, lets busy slots finish, then retires them. An in-place
upgrade preserves those retiring assignments and the last good policy snapshot.
Every claim entry point persists its execution snapshot in `kickside_job.lease_policy`
and passes it with the assignment. Dispatch, heartbeats, completion, retries,
cancellation fences and reclaim preserve that snapshot after database reloads;
live edits cannot shorten a running execution's renewal or termination window.
Migration 22 leaves pre-upgrade running rows with NULL `lease_policy`. Those jobs
started before admin overrides existed, so the shared execution-policy reader
resolves NULL to the cached registry/host policy on every execution path. It never
guesses timing from heartbeat/deadline timestamps or adopts later admin overrides.
New executions use the new lease pair and execution ceiling;
new one-shot jobs inherit the new attempt limit. Retry delays travel with the claim and apply when that execution fails. Job-specific attempt/execution limits retain precedence.

After resizing and activating the snapshot, the owner writes
`kickside_job_pool_applied` and sends a realtime wakeup. Apply failure records a
native error envelope while preserving the last good snapshot and applied
revision. Status reads only SQL; there is no HTTP-to-owner request/reply,
publication watermark or latched delivery error. Coalesced
`kickside.jobs.performance.changed` invalidations run asynchronously off dispatch.
A delivery error is reported to the process log; a newer pending event still
sends its wakeup and otherwise the next owner event retries. The optional
`kickside.core.jobs.performance:realtime` requirement is unbound by default,
so backend-only hosts need no realtime implementation. The application binds its
chosen realtime implementation explicitly. Jobs grants contract-open access only to the
selected resource and never depends on its platform.
