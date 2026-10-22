# KickSide Automation

`kickside/automation` owns the runtime for installed Automations. An automation
kind is a `contract.binding` with `meta.type: kickside.automation`; its install
contract declares the source, while the shared engine
owns durable execution. Data Sync in `platform/sync` is a working kind.

## Drives and rounds

An installed Automation is a component with a `main` drive and, when declared,
one timer drive per schedule. Each active drive has one reusable
`kickside.automation:round` job slot. A round acquires a bounded page, applies
the declared transform, delivers to the sink, and commits its cursor past the
whole page together with the ledger rows of the items it did not deliver and
the receipts of destinations that changed. The drive row holds the cursor,
phase, revision, deadlines, and retry state. A failed, waiting or uncertain
item stays in the ledger in its record's order and retries on its own pacing;
it never holds the items after it, and it is never treated as complete while
its write is unconfirmed. A first-attempt delivery writes no ledger row.

Event drives pull committed thread events and wake when the source thread
appends an event. Collection drives pull from `kickside.data:pullable`. Timer
drives acquire persisted occurrences from `kickside.automation:timer_pullable`.
Schedules use interval, cron, once, or ticker cadence with a timezone and wake
the slot at an exact deadline. The automation engine owns these drives and
slots; automation kinds do not create a second polling worker.

## Source → transform → sink

Domain modules publish `registry.entry` ports with `meta.type:
kickside.automation.port`. An event source port names a declared thread event;
a collection source uses `kickside.data:pullable`. A destination port binds
`kickside.data:writable` and declares its supported operations. The installed
kind selects a source port, an optional transform, and a sink port. Rounds
carry stable item identity and per-delivery idempotency keys through that path.
The sink confirms writes with classified results; the engine records receipts
and advances only after the round's durable work succeeds.

Editors read real payload samples with `POST /api/v1/automations/source-samples`:
`{ "source": "port-entry-id", "config": {}, "limit": 1 }`. The limit is an integer
from 1 through 100. The response contains `samples` and the selected instance's
`output_schema` when declared. This reads one bounded source page under the
caller's identity through the existing acquisition path and leaves installed
drive positions unchanged. Deleted items supply no payload sample; an empty
source returns an empty array. Sync passes these samples to Transform for
validation and generation.

Writable bindings must declare `meta.delivery` (`exactly_once`, `at_least_once`,
`at_most_once`) and `meta.input_shape` (`record`, `content`); `describe_sink`
refuses missing or invalid values. Round consumers answer each input exactly
once across their outcome lists, using `key = item.delivery_key`.

Work ends at the earlier of round start plus `round.timeout` and the job's
`input.job.deadline`, minus `round.commit_reserve`. Blocking sink waits use this
work deadline. Stored ledger, receipt, command, and prepared data use age-based
retention windows. Size limits remain `max_row_bytes`,
`prepared_bytes_per_item`, and `destination_slots_per_item`; oversized rows
return refusal reason `row_too_large`.

## Commands and controls

Declaration changes and controls enter each Automation's command stream. A
command fences affected drives with a new generation so an older round cannot
commit over it. The dispatcher recovers pending steps, wakes drive slots, and
repairs missing slots. Callers read operational state through `status` and
`health` and can use `pause`, `resume`, `run_now`, `resync`, `replay`, and `discard`.
The type catalog publishes engine `controls` alongside kind-declared `actions`;
see the [control model](../README.md).
`resync` restarts source position and reconciliation; `replay` retries eligible
ledger items. `discard` resolves named uncertain item keys. All three require a caller supplied `request_id`. Repeating the same
ID with the same input returns the recorded outcome; changing the input under
that ID conflicts. `set_execution_identity` is an ADMIN control for changing the
execution principal and also requires a caller ID and expected identity
generation.

## Further reading

For authoring and operational details, use the developer handbook chapters
[Threads, Events, And Projections](https://github.com/kicksideai/docs/blob/main/building-modules/threads-events-projections.md),
[Execution Identity And Deadline Jobs](https://github.com/kicksideai/docs/blob/main/building-modules/execution-identity-and-jobs.md), and
[Automations And Dataflows](https://github.com/kicksideai/docs/blob/main/building-modules/automations-and-dataflows.md).

## Receipts and deletion

Every writable call supplies `origin`; `kickside.data:writable_sink` checks it
and its agreement with `automation_ref.id`. Rounds use the automation ID;
non-round producers use a stable explicit origin such as
`example.meetings.link`. Held or failed items create ledger rows; resolved
tombstones carry an expiry. Dead evidence remains while its recovery owner
exists, and unresolved work remains until it settles. Engine receipts change only when their destination mapping changes
or reconciliation updates their pass marker. Deleting a sync retires its
receipts and keeps destination records.
