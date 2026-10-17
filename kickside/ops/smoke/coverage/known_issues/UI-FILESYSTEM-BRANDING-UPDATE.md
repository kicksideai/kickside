# UI-FILESYSTEM-BRANDING-UPDATE: Filesystem branding update

Status: OPEN, known failing probe on SQLite and Postgres with Wippy v0.3.47a.

Normal migrations leave the configured filesystem image unreadable and retain an obsolete logo URL. The module has no registered migration database path. This remains a product defect; it is not classified as a runtime or upstream blocker.

The unchanged strict native probe is retained in
`ops/smoke/fixtures/known_issues/hub_update/ui/` and its `Scenario.issues`
declaration is retained in `ops/smoke/fixtures/known_issues/hub_update/scenarios.py`.
These sources are outside native-test and smoke registry discovery. This issue
supplies no passing credit and stays outside the active coverage catalog until
the owning fix can make the probe pass on both engines.

Original failure evidence: `scratchpad/sol-lanes/mig-users-ui-skills/evidence/ui-red/{sqlite,postgres}/focused-kickside-ui-branding_test.json`.

To validate an owning fix in an isolated test worktree, restore the fixture
to `platform/ui/test/hub_update/`,
register its retained scenario, restore this issue to the active catalog, and
run the focused scenario on both engines. Keep every assertion unchanged.
