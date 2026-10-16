# Test debt cleanup

Run date: 2026-07-10. All commands below ran against isolated package test
harnesses; the live service on port 8085 was not restarted or written to.

## Target resolutions

| Target / failure | Which side was wrong | Resolution | Before → after |
| --- | --- | --- | --- |
| `providers/kb10` — 11 ingest provenance assertions | The tests were stale. `source_ref.origin` is now the canonical `{ type, id }` provenance envelope, not the retired flat string. | Updated all 11 assertions to check `origin.type` and its durable `origin.id`; coverage was retained and strengthened. | 326 pass / 11 fail → 337 pass / 0 fail |
| `providers/kb10` — private `storage_id` / `storage_path` exposed after the stale assertions were unmasked | The code was wrong. Agent-supplied source references crossed the durable event boundary with private upload locators, unlike the upload path. | Sanitized private upload locators from both metadata and source references in the shared `thread_ingest` producer. The existing privacy assertion remains. | Hidden behind the 11 failures → covered and green in 337 / 0 |
| `platform/connection/ui` realtime rename | The test was stale. Component public metadata calls the display field `title`; `name` belongs to the list-row API shape and is deliberately not a public-meta field. | Changed the realtime fixture to emit `title`, retaining assertions for rename, reauth state, and scope coercion. | 16 pass / 1 fail → 17 pass / 0 fail |

## Sweep

| Module | Source harness | UI suite | Outcome / follow-up |
| --- | ---: | ---: | --- |
| hub | 4 pass | 98 pass | Green |
| knowledge | 69 pass | 19 pass | Green |
| models | 27 pass | 14 pass | Green |
| uploads | 144 pass | 10 pass | Green |
| inbox | 29 pass | 27 pass | Green |
| settings | 19 pass | 14 pass | Green |
| automation | 0/17 harness entries loaded → 17/17 green | 94 pass | Test target was wrong: it ran `test/run-tests.sh` from the package root, loading the production lock instead of `test/wippy.lock`. Changed `make test` to `cd test && bash ./run-tests.sh`. |
| recipes | 5 pass | 31 pass | Green |
| widgets | n/a (no source harness) | 98 pass | Green (`make test` is its UI suite) |
| sync | 51 pass / 1 fail → 52 pass | 11 pass | Test stale: dispatcher contract supplies `trigger_id`, not `component_id`; fixture now asserts the actual canonical dispatch field. |
| webhooks | 29 pass | 16 pass | Green |
| core/cron | 100 pass | n/a | Green |

No other tolerated failures remained in the requested sweep. The expected
happy-dom teardown warnings in several UI suites did not change their zero exit
status and are not test failures.
