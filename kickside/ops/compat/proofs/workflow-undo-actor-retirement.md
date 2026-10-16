# Workflow undo actor retirement

Owner approval: `2026-10-15 owner: remove per-workflow undo actor, editor writes run in the request`.

Published baseline: kickside/workflows 0.1.114. The per-workflow undo actor
(`kickside.workflows.undo:undo_process`), its dispatch client
(`undo_client`), message delivery (`undo_signal`, `undo_signal_deliver`,
`undo_signal_transport`), the `undo_registry` and `undo_spawn` policies and the
`process_config` entry are removed. Apply, undo, redo and state run in the
caller's request through `kickside.workflows:workflow`, whose writer commits
definition events and undo history in one transaction under the history lock.
Results and errors are unchanged. A writer conflict returns "workflow changed
since you opened it, reload and retry" (HTTP 409) instead of being retried.

No stored data changes. The `kickside.workflows:process_host` requirement stays
and configures the maintenance service.

Proof: `platform/workflows/test/src/suites/undo_test.lua`,
`platform/workflows/test/src/suites/undo_restart_test.lua` (durable history,
rollback when history persistence fails, bounded batches, access gate) and
`platform/workflows/test/src/history_errors/history_native_errors_test.lua`
(a conflict returns the error and commits nothing).
