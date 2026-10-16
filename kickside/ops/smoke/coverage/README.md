# KickSide feature coverage

Run commands with the owner-specified Wippy runtime on `PATH`. The tools use Python's standard library. Inventory generation queries registry declarations and resolved module sources; it starts no gateway, database service, browser, model, or Wasm converter.

```sh
cd ops/smoke/coverage
python3 -m unittest
python3 inventory.py --bootstrap "$SMOKE_INVENTORY_ROOT"
python3 report.py --results "$SMOKE_RESULTS" --output "$SMOKE_COVERAGE_REPORT"
```

`SMOKE_INVENTORY_ROOT` names an empty scratch directory outside the repository. Registry subprocesses set `TMPDIR` inside this scratch runtime. Remove that directory after generation. The bootstrap resolves `kickside/kickside` and its transitive dependencies from the Hub, discovers optional packages from the published onboarding profiles, and includes the unversioned module names in `modules.json`. Every dependency declaration requests `*`. The generated inventory records resolved versions and content hashes as evidence. The module list covers Chestor workspace, graph, journal, roadmap, and db-schema; dashboard, research, and agent-onboarding; CRM; providers; and converters.

`--runtime DIRECTORY` queries an existing lock-resolved app. `--snapshot FILE` saves only structural registry facts for offline regeneration with `--entries FILE`. The offline input includes `id`, `kind`, `registry.owner`, discovery metadata, router declarations, binding contracts, and the MCP constants source. Credentials, environment values, provider URLs, executable module code other than the MCP constants declaration, and source paths do not enter the inventory.

## Feature identity and denominator

The identity is `component|category|semantic-key`. HTTP semantic keys contain method and resolved path, including router prefixes. Other keys contain registry entry IDs. Built-in MCP tools use the declaring library ID plus their source declaration and tool name. Titles, registry iteration order, and module versions do not change identity. IDs retain exact route parameter names; a route declaration change updates its ID.

Each component owns its registry entries through `registry.owner`. The inventory includes exposed dependency surfaces, including the session APIs, facade, views, and Keeper System UI. Their feature groups retain their resolved module owners. Framework implementation libraries remain outside the denominator. HTTP static mounts, test functions, migrations, dependency declarations, and internal libraries do not count as product features. Components with no declared user surface appear in module provenance and have no denominator.

The inventory includes every product HTTP endpoint; navigation items, settings tabs and blocks, account items, splash screens and steps, and pages; every class-bearing component binding used by workspace discovery; automation types; collection sources, event triggers, and writable sinks; traits; registry tools available to MCP credential grants and source-declared MCP meta-tools; connection bindings, OAuth and SSO provider descriptors; upload kinds; converter Wasm methods and rasterizers. Transform strategies, workflow blocks, inbox item kinds, and model provider presets also count. Event ports derive from `data.event` and the binding's declared output events. Store ports derive from `data.operations` and the writable contract. Collection ports derive from the pullable contract. A port ID counts once in its direction; its backing binding does not count again in that direction.

Every feature has equal weight. Inventory generation fails on duplicate identities, missing ownership, unresolved routers, invalid port backing, and undeclared event markers. Host route requirements use the explicit bindings in `modules.json`.

## Scenario declarations

Each `Scenario` declares the inventory feature ids it exercises in `features=`; only asserted or exercised behavior counts (catalog reads cover the catalog endpoint, not every item it lists). The suite loads `REGISTRY` from `scenarios.py` and every `scenarios_*.py` module in name order, so feature areas live in their own modules. `export_map.py` regenerates `scenario_map.json` from those declarations; a unit test fails when the committed map drifts. Results carry each scenario's `features`, and the report requires them to match the map.

## Gate

The default overall threshold is **80%**. The documented per-component floor is **80% for every component with inventory features**, including optional modules and single-feature components. There are no exemptions or component-specific discounts. `--threshold` sets the overall threshold; `--component-floor` explicitly sets the common component floor. Release acceptance uses the defaults.

Only the suite's exact `passed` status contributes feature IDs. `failed` and `skipped: REASON` contribute none. A feature counts overall only when a passed scenario covers it on both SQLite and Postgres. The JSON report includes separate engine percentages and their intersection. The input supplies result rows for one smoke run, not a union of historical runs. Every failed scenario or cleanup failure blocks acceptance independently of the coverage percentage. Each engine must include its cleanup result before the gate accepts a run. Missing engines or cleanup results, unknown scenarios, unknown IDs, duplicate result rows, invalid statuses, mismatched result declarations, and malformed inventories fail validation. Successful cleanup adds no coverage.

The report uses the unrounded ratio for threshold comparisons and exits 1 for an unmet gate. It never infers passes from aggregate counts or evidence filenames. `--planned quick` and `--planned full` show the declaration upper bound with an explicit non-execution basis and always exit 1. Planned coverage does not satisfy the release gate.

```sh
python3 report.py --planned quick --output "$SMOKE_QUICK_PLAN"
python3 report.py --planned full --output "$SMOKE_FULL_PLAN"
```

Each smoke run creates and drops its scratch databases through the existing runtime lifecycle. Coverage unit tests exercise the engine intersection with both engine labels and require no application database. Measured baseline evidence comes from actual SQLite and Postgres smoke result rows.

## Issue regressions

`issues.json` lists the release's guarded defects. Scenario declarations attach
`issues=("ISSUE-ID",)` alongside `features=`; the exported map preserves both.
`--tier regression` runs those guards and their setup on both engines, and the
full tier includes them. The report's `issues` section gives each issue's
guarding scenarios, each engine's result and the combined verdict. Missing
guards, missing execution, failures and skips block acceptance. Planned reports
give no issue passing credit.

To capture a new defect, add its issue ID to `issues.json` and a failing
real-browser regression scenario before the fix. Assert the user's visible
outcome, reuse the fixture and lifecycle helpers, then regenerate
`scenario_map.json` with `python export_map.py`. Keep the scenario after the fix
and run it with `--scenario SCENARIO_ID --engine both`.

Harness regressions declare `harness_guards` in `issues.json`. Each named guard
specifies its `repository`, source `test` path, `issues`, and required `engines`
(`sqlite` and `postgres`, or `independent` for frontend tests). The result JSON
contains `harness_results` alongside smoke `results`, with one explicit row per
required guard and engine:

```json
{"guard": "core/retention-notifier-authority", "engine": "sqlite", "status": "passed"}
```

Only an executed passing test supplies `passed`. Missing, failed, and skipped
harness results block the issue gate. Harnesses add no feature coverage and do
not replace smoke results or cleanup requirements. Existing scenario declarations
and issue catalogues retain their behavior when harness fields are absent.

An owner-handled runtime defect declares `state: runtime-blocked` on its external
harness guard, with the verification `runtime`, strict probe `test`, two distinct
`evidence` paths for SQLite and Postgres, and a `ledger` entry. The probe asserts
the required behavior and stays outside product gates while the runtime blocks
it. The report retains its raw execution results and provenance, reports the
issue as `runtime-blocked`, and lists it in `runtime_blocked_issues`. This state
supplies no passing credit or feature coverage. Active product guards still
require execution on both engines; failures, skips and missing results block
acceptance even when the issue also has a runtime blocker. An issue without a
guard still blocks acceptance.

`RUNTIME-META-WAKE-CAPABILITY` uses the constrained-writer component lifecycle
and retention notifier harnesses. A smoke app grants authenticated users
`user.runtime_process_notifications`, masking the missing producer capability;
its browser scenarios cannot turn red for this defect. The harnesses exercise a
producer without that grant.

External native-error probes use `runtime-blocked` for runtime defects and
`upstream-blocked` for SDK module defects. Both states require the verification
runtime, a strict probe path, distinct SQLite/Postgres evidence and a ledger
reference; SDK blockers also require the resolved module identity/version.
Their issue status stays blocked, including when a probe result is supplied.
Product scenarios and active harnesses still require successful execution on
all declared engines: missing, skipped or failed product guards fail the gate.
The report retains the existing runtime fields and adds separate
`upstream_blockers` and `upstream_blocked_issues` fields for SDK defects.
