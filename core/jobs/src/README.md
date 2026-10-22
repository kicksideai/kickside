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

`jobs.wake_job(id, { control = true, ensure_due = true })` ensures dispatch without rescheduling an already due pending job or requesting another execution of a running job. It retains their retry, lease, schedule and demand state and still notifies the worker pool. Parked, disabled and future pending jobs receive the ordinary control wake. A ready job returns `already_due = true` alongside the existing result fields. Omitting `ensure_due` retains the existing control and demand wake behavior.

`jobs.enqueue` and `jobs.enqueue_tx` accept optional `demand = true` with `slot = true`. Enrollment and control demand commit together: parked work becomes due, and a running attempt retains a follow-up. Reusing an active one-shot identity with demand returns a conflict. The caller of `enqueue_tx` notifies the pool after commit. Omitting demand retains the existing enqueue behavior.

`jobs.complete_tx` accepts optional `demand_satisfied = true` when the worker proves under its durable source lock that the completed run covers the source head. It consumes ordinary demand received during that run; independent control wakes still rearm the slot. Omission retains the existing demand behavior.

Failure transitions accept an optional final `{ retry_after_ms = milliseconds }`
argument on `fail_tx` and `fail_job`. The structured floor can exceed the policy
cap. Slots use `slot_retry`; one-shot jobs use `retry`. Both retain their configured
base as the lower bound of jitter. Worker failures carry native error details to
this argument before rendering the history error text. Malformed provider retry
hints are ignored so they cannot prevent failure settlement; explicit failure
transition arguments remain validated.
