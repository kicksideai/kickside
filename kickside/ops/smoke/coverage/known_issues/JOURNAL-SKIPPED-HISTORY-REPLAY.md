# JOURNAL-SKIPPED-HISTORY-REPLAY: skipped-history replay

Status: OPEN, known failing Journal materialization ordering probe.

Journal replay does not materialize skipped history in the required order.
The strict focused `journal_history_replay_test` scenario and its
`Scenario.issues` declaration are retained in
`ops/smoke/fixtures/known_issues/journal_history/scenarios.py`, outside automatic
smoke discovery. The native assertion remains in
`journal/test/src/projection_test.lua` in the owning chestor source tree.
The former external harness declaration points to that native file on SQLite
and Postgres. It is not active in the coverage catalog while this product
failure remains unresolved; no passing credit is supplied.

Original failure evidence and analysis:
`scratchpad/sol-lanes/mig-chestor-sync/REPORT.md`.

When the owning ordering fix passes its strict regression on both engines,
restore the retained scenario and its issue to the active catalog, restore
`journal/skipped-history-replay` as a harness guard for the native file, and
regenerate the scenario map. Keep every assertion unchanged.
