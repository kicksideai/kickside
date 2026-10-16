# Frontend deep-link + trigger-catalog reconciliation

Date: 2026-07-10
Base: 31738c25 · Branch: `fe/deeplink-catalog-reconciliation` (not pushed)

Consumes the backend contracts in `consume_backend_gaps.md`: canonical
`/automations?backend=<workflow-component-id>`; `GET /api/v1/automations/trigger-points`
catalog; binding-row `runnable_ref`.

## Touchpoints

### 1. workflows/ui — Automate EMIT
Builder's Automate affordance emitted `/automations?backend=kickside.workflows.partial:<id>`.
Now emits the canonical `/automations?backend=<workflow-component-id>` (plain id,
URL-encoded) via a pure `automateRoute` helper (`src/app/automate-link.ts`), consumed by
`WorkflowBuilder.vue`. The retired `partial:` namespace is never emitted.

### 2. automation/ui — PARSE + PICKER + binding rows
- (a) `deeplink.ts` `readBackendParam`/`normalizeBackend` parse the canonical `?backend=`
  as the plain workflow id and unwrap a legacy `kickside.workflows.partial:<id>` prefix
  defensively; `automations.vue` normalizes the prop-path value too. Both forms tested.
- (b) The trigger-point picker is not owned here — the manager mounts the recipes
  assembler (`kickside-recipe-config`) as its create-from-workflow surface, so the picker
  change lands once in recipes/ui (touchpoint 3). No fork.
- (c) `fetchAutomations` now also fetches the `class=automation_binding` projection
  (merged, de-duped by id) and renders a persistent `Workflow` link on binding rows via
  `runnable_ref.id` (`/workflows/<id>`). The create-time banner is unchanged.

### 3. recipes/ui — catalog picker (shared, one implementation)
The assembler is the single picker the automations manager mounts. Replaced the static
periodic-only `TRIGGER_POINTS` with `listTriggerPoints()` → `GET /api/v1/automations/trigger-points`.
`assembler.ts` gains pure `readTriggerPoints`/`readTriggerPoint`/`isPeriodicPoint`
(tolerant of minimal rows: id/kind only, with title/ui fallbacks). `RecipeConfig.vue`
renders the fetched catalog; the periodic point keeps its bespoke interval/cron editor
unchanged, every other point renders a schema-driven `wc-schema-form` over its
`selector_schema`. Falls back to the periodic point when the catalog is unreachable.

## Verification
- Suites green (baseline → after): workflows 389 → 392 (+3); automation 85 → 89 (+4);
  recipes 21 → 24 (+3).
- New coverage: emit URL (canonical + no-prefix + url-encode); parse both backend forms
  (canonical + legacy-prefix unwrap, `normalizeBackend`); catalog→point mapping with
  fallbacks + `isPeriodicPoint`; catalog-driven picker swapping schedule editor for a
  schema form; binding-row `runnable_ref` → workflow link (+ absent-ref no-link).
- vue-tsc: touched files clean. Remaining vue-tsc errors are pre-existing baseline in
  untouched files (`fontCssUrl`/HostCssKey in entry files, widgets `ports.ts` typing).
- `npm run build` passes for all three packages; rebuilt static bundles committed with
  their source per repo convention.
- Endpoint shapes fixture-verified from `automation/src/api/list_trigger_points_test.lua`
  and `automation_test.lua` (binding `runnable_ref` projection). Live 8085 predates the
  backend commits — live checks deferred.

## Commits (per package, not pushed)
1. `2e9016a4` workflows/ui: Automate emits canonical deep-link
2. `d52f8915` recipes/ui: assembler picker consumes the trigger-point catalog endpoint
3. `697a580c` automation/ui: normalize backend deep-link; link binding rows to their workflow

No src Lua, `app/wippy.lock`, or unrelated files touched; pre-existing working-tree
changes (webhooks/app) left uncommitted.
