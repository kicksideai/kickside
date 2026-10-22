# AUTOMATION-STALE-SLOT-REFERENCE

Status: OPEN, strict native probe fails on SQLite and Postgres before the owning fix.

Missing-slot selection only considers null job references, so a sourced drive with a terminal non-null reference remains unselected.

This product defect remains open and receives no passing credit.

The unchanged strict assertion and its `Scenario.issues` declaration are retained
in `ops/smoke/fixtures/known_issues/automation_slot_lifetime/`, outside product
and smoke discovery. Record-purge and source-finalization regressions remain in
the active product suite and coverage catalog.

To validate the owning fix in an isolated test worktree, restore the retained Lua
and YAML files to `platform/automation/test/src/suites/`, register the retained
scenario, restore this issue's active harness declaration, and run on both
engines. Keep every assertion unchanged.
