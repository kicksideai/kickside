# kickside/jobs

Durable job slots, leases, worker supervision, and persisted wake demand.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/jobs
wippy install
```

Apply host bindings and migrations through the application install plan.
Review the manifest and registry requirements before enabling the module.
Host resources and security groups bind through the install plan.


## Requirements

For repository validation, use the Wippy release pinned in
[CI](https://github.com/kicksideai/kickside/blob/main/.github/workflows/ci.yml). Use current Hub dependencies
for the contracts declared by the module.
The standalone harness uses SQLite and declares a PostgreSQL test profile.
Development uses Make and the Wippy CLI.

## Development

From this module directory:

```sh
make lockrefresh
make lint
make test
(cd test && wippy test --profile postgres --set vars.pg_database=kickside_readme_test)
```

Create a dedicated PostgreSQL database before the profile run and drop it
afterward. Set the `pg_host`, `pg_port`, `pg_username`, and `pg_password`
variables in the harness configuration for your test server.

## Use

Enqueue work through the existing domain owner, using an exact worker entry ID and immutable payload. Workers retain the enclosing deadline and resolve owner-held execution identity. Use transactional enqueue when a durable fact and its job must commit together.
Optional `replace = true` atomically cancels a pending job with changed immutable
inputs and inserts its successor for the same owner. A running predecessor
returns a retryable conflict with its job ID. See the dependency interface for
the optional `replaced_job_id` result.

Owners enumerate retained jobs in bounded pages with
`jobs.list_owner_jobs({kind = "component", id = owner_id}, filters, limit, after)`.
Authorize the owner first, then use the returned native continuation through all
pages. See the dependency interface for the position and authority contract.
Rows include the canonical `job_identity`, so an owner can retire an orphaned
slot with `jobs.purge_slot({job_identity = row.job_identity, owner_locator = owner})`.
Jobs requires the locator to match the stored slot. Read the next page before
purging its anchor, or drain bounded first pages without a continuation anchor.

After a caller-owned `jobs.enqueue_tx(tx, dbtype, params)` transaction commits,
call `jobs.nudge_workers()` to notify the worker pool. Retired slot owners call
`jobs.purge_slot({ namespace = namespace, scope = scope, key = key })` and honor
its bounded cleanup continuation errors. Both operations use the public
`kickside.core.jobs:jobs` facade without persistence call grants. See the
[dependency interface](src/README.md#dependency-interface) for return values,
authorization, and retry semantics.


Termination recovery keeps the active identity until the execution ends. A
termination marker invalidates the lease even when a future deadline schedules
another liveness check. Cancellation clears the heartbeat timestamp, which
persists as its intent while the lease deadline schedules termination rechecks.
Expiry settlement returns the job to pending, while cancellation settlement
makes it cancelled. Completion, failure, and unstarted-assignment release all
honor the fence; confirmed child exits settle by that durable intent. Committed
`lease_lost` history remains immutable. A finalizer leaves a fenced running run
for confirmed settlement. The supervisor's own stop can apply its failure
outcome to that running run; an expiry's committed `lease_lost` takes priority.

`reclaim_expired` returns the preliminary candidate page size, so callers drain
all pages even when a renewal wins locked revalidation. `reclaim_terminated`
retains its settled count and returns the preliminary candidate page size as its
third result, including candidates settled concurrently before revalidation.
The pool drains on this progress.

The row data budget reserves separate bounded space for safety control values:
a running job's termination marker (prefix plus at most 36 token bytes) and its
two deadline timestamps (at most 40 bytes each), or a lost run's status, finish
timestamp (at most 40 bytes), and diagnostic (at most 256 bytes). These values
can exceed `max_row_bytes` by their bounded encoded size during termination;
application data remains subject to the configured limit. This also permits
termination of existing rows admitted before this reserve applies, without
rewriting or truncating their data. Both claim paths clear the settlement-only
diagnostic atomically and exclude it from their admission size projection.

### Lease ownership and progress

Automatic lease renewal proves ownership, even when the handler is blocked.
A job without payload `heartbeat_timeout_ms` keeps its existing execution policy.
To bound time without useful work, declare a positive integer `heartbeat_timeout_ms`
and call `jobs.heartbeat(id, { token, execution_seq }): (boolean?, error?)` after
progress. This uses the existing `lease_valid` read fence and execution control channel.
Progress does not write the job row or extend ownership; automatic `extend_lease`
renewals persist ownership in `heartbeat_at` and `lease_until`.

The supervisor starts the progress deadline when it spawns the execution child.
Each received, token-and-sequence-matching progress heartbeat resets that deadline
to receipt time plus `heartbeat_timeout_ms`. Automatic ownership renewals never
reset it. The same supervisor wait ends the attempt at the earlier of that deadline
and the spawn time plus `max_execution_ms` (or the captured policy ceiling).
A missed deadline is `job heartbeat timed out`: it consumes the attempt, retries
under the existing policy, and ends `dead` on the final attempt. Termination fences
late heartbeats. `false` means the lease no longer holds; an error means progress
could not be reported. Callers need Jobs access, with control delivery under the
Jobs identity. Useful checkpoints remain the worker's responsibility.

## Reference

- [Module reference](src/README.md)

### Host requirements

Bind these exact requirement IDs through the module’s dependency declaration
or Hub plan. Existing explicit bindings take precedence over defaults.

| Requirement | Declared default |
| --- | --- |
| [`kickside.core.jobs:target_db`](src/_index.yaml) | Host supplies the value |
| [`kickside.core.jobs:process_host`](src/_index.yaml) | Host supplies the value |
| [`kickside.core.jobs.security:user_security_scope`](src/security/module_access/_index.yaml) | `kickside.security.groups:members` |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/jobs)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.

Administrators tune the worker pool, leases, retries and the execution limit
in **System → Settings** when the host installs Settings. Postgres uses 4
general workers and a 10-minute execution limit by default. Changes apply to the
running pool without a restart; see
[the runtime policy](src/README.md#live-performance-policy) for precedence,
bounds and graceful slot retirement.
