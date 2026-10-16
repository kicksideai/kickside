# Periodic automation trigger

## Result

`kickside.automation:periodic_trigger_point` is the first-class **On a schedule**
trigger source. It is a normal Automation binding source, not a workflow node and not
a new scheduler:

```text
periodic trigger point -> trigger service timer mode -> kickside.cron task
-> scheduled_action -> automation binding execute -> runnable launch
```

The cron task remains component-class/lifecycle-owned. Timer attach records the existing
`kickside.automation:delete_schedule` rollback; binding pause/disable detaches that
lowering, resume creates it again, and delete performs no second teardown after pause.
The existing cron cleanup/reaper remains the fallback for old disabled rows.

Each fire now reaches the normal binding mapping with:

```json
{
  "fired_at": "2026-07-10T13:00:00Z",
  "occurred_at": "2026-07-10T13:00:00Z",
  "schedule": {
    "schedule_id": "cron-task-id",
    "type": "cron",
    "expression": "0 9 * * 1-5",
    "tz": "UTC"
  }
}
```

`fired_at` is scheduler-issued, and periodic binding launches use
`<schedule_id>:<fired_at>` as their idempotency key. Mapping and workflow launch stay
on the same `execute_binding`/runnable-launch route as all other trigger points.

## FE contract

Use this trigger-point id:

```text
kickside.automation:periodic_trigger_point
```

Use this `trigger_config` shape in the trigger picker and binding-create request:

```json
{
  "schedule": {
    "type": "interval",
    "expression": "15m",
    "tz": "UTC"
  }
}
```

or:

```json
{
  "schedule": {
    "type": "cron",
    "expression": "0 9 * * 1-5",
    "tz": "UTC"
  }
}
```

`type` is exactly `interval` or `cron`; `expression` is respectively the existing
cron-module duration grammar or five-field POSIX cron. `tz` is required and currently
only accepts `UTC`, because core cron evaluates expressions in UTC. The picker must not
offer unsupported IANA zones until the cron calculator itself gains timezone evaluation.
The declaration exposes the same selector and fire-context JSON schemas through
`list_trigger_points`.

Bad interval values and malformed cron field counts are rejected before a binding shell
is created. Full cron semantic validation (for example an out-of-range minute) remains
authoritative in the existing core scheduler during schedule registration and returns its
directed calculation error.

## TDD evidence

- Automation: **331/331** (`platform/automation`, baseline 326; +5 cases).
  Coverage includes source declaration, enabled-create lowering registration, real
  timer-row context, fire -> mapping -> workflow runnable launch, pause/delete teardown,
  and directed malformed-cron rejection.
- Cron: **99/99** (`core/cron`).
- Workflows: **259/259** (`platform/workflows`, requested baseline suite).

## Compatibility warning ground truth

The holistic-review claim was not a defect.

1. `UX Audit Sandwich` v3's frozen interface still has `topic` and required `audience`.
   The live removal of `audience` is definition event 15, after v3's publish marker at
   event 14, so it is an unpublished current draft in this reset database. Independently,
   removing a required Start-input field is input relaxation and is compatible under the
   implemented rule.
2. The HFR Call node is in the unpublished `HFR Lead Router` draft. The live
   `workflow_consumer_index_meta` is complete (`v1`), and its consumer table contains no
   row for `UX Audit Sandwich`; that is correct because only published Call documents are
   indexed.
3. A live API reproduction used temporary published child/caller workflows. The caller's
   Call row appeared in the consumer index; removing child Finish output field `removed`
   then publishing returned **HTTP 409**, `confirmation_required: true`, with
   `finish_output/finish_field_removed` and the exact Call consumer. The temporary
   workflows were deleted after confirmation.

No compatibility code change was needed. An informational success notice for Start-input
relaxation was not added: current publish success has no established informational result
contract, and adding one without a consumer-facing use would be speculative.
