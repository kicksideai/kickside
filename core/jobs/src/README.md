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
