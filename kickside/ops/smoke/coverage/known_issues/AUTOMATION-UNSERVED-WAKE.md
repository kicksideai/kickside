# AUTOMATION-UNSERVED-WAKE

Status: separate owning fix; the strict native probe fails on SQLite and Postgres before that fix.

The dispatcher acknowledges durable demand after Jobs refuses a wake without returning an error.

The wake-result correction belongs to its separate owning fix; its active recovery-dispatch guard stays in the catalog.

The unchanged strict assertion and its `Scenario.issues` declaration are retained
in `ops/smoke/fixtures/known_issues/automation_slot_lifetime/`, outside product
and smoke discovery. Record-purge and source-finalization regressions remain in
the active product suite and coverage catalog.

To validate the owning fix in an isolated test worktree, restore the retained Lua
and YAML files to `platform/automation/test/src/suites/`, register the retained
scenario, restore this issue's active harness declaration, and run on both
engines. Keep every assertion unchanged.
