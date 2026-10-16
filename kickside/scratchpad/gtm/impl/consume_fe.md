# CONSUME-stage FE — recipes assembler + automation-from-workflow

Rebuild of the two CONSUME surfaces against the lowered recipe / trigger-point backend.
Territories touched: `platform/recipes/ui`, `platform/automation/ui` only. No src Lua,
no `app/wippy.lock`, `platform/workflows/ui` untouched (reused by tag).

## Architecture decision (no parallel paths)

The only REST seam that creates an Automation binding is `POST /api/v1/recipes/apply`
(via `lowering.lua` -> `automations_lib.create_binding`). The automation module exposes
no binding-create or `list_trigger_points` REST route. Creating an automation that runs
an existing published workflow (trigger point + runnable + mapping) is therefore exactly a
workflow-ref recipe apply. So the whole assembler is built once in `recipes/ui`
(`kickside-recipe-config`), and the automations manager's create-from-workflow flow
mounts that same web component by tag with the workflow pinned — one implementation, both
surfaces.

## SCOPE 1 — Recipes UI (lowered model)

`platform/recipes/ui` — the old body/backend/sink/composer editor is gone; `RecipeConfig.vue`
is now a declarative assembler.

- Source: a flow-template picker (`/workflows/templates`, slots via `wc-component-picker`)
  or a published-workflow picker (`/workflows/runnables`). Templates render their declared
  slot bindings; workflows render a schema-driven payload->Start mapping.
- Trigger: a trigger-point picker (periodic `kickside.automation:periodic_trigger_point`)
  with a schema-driven interval/cron/`tz:UTC` form. Emits the exact `trigger_config`
  `{ schedule: { type: interval|cron, expression, tz: UTC } }` the periodic point accepts.
- Mapping: per-Start-field form (fixed value | expression over `input.*` | skip) compiled to
  the one `{ mode: expr, expr }` mapping_spec the binding API accepts, plus a raw-expression
  escape hatch (same expr-lang grammar as the workflow edge transform). Empty form -> `{}`
  pass-through.
- "What this creates" summary (new workflow from a template / runs an existing workflow +
  the automation binding, named honestly) and enable-now toggle.
- Submit -> `POST /api/v1/recipes/apply`; success panel links to both artifacts
  (`/workflows/<id>` + Automations).
- Legacy tombstone (`legacy-component-id`): honest "this ran its own code, rebuild it"
  banner; submit routes to `POST /api/v1/recipes/heal` with the same declaration.
- Retired every generation/Action/Code/backend/sink/composer surface and the
  `/automations/compose`, `/automations/body-backends`, old-`POST /automations`,
  reconfigure, and trigger-spec-v1 dependencies.

Pure core `assembler.ts` (schedule build/validate, mapping compile, declaration assembly,
deep-link parse) is fully unit-tested.

## SCOPE 2 — Automation-creation flow (HFR gap #3)

`platform/automation/ui/src/app/automations.vue`.

- (a) Consumes the workflows Automate deep-link `?backend=kickside.workflows.partial:<id>`
  (prop or query, then strips the param) and opens create-from-workflow with the runnable
  pre-bound. `deeplink.ts::readBackendParam` reads the query; the assembler owns unwrapping
  the `kickside.workflows.partial:` prefix (no duplicated parse).
- (b) The create flow mounts `kickside-recipe-config` embedded: trigger point (periodic,
  schema-driven) -> published-workflow picker -> mapping -> confirm -> apply. A manual
  "From a workflow" header action opens the same flow with the assembler's own picker.
- (c) On success the list reloads and a banner links to the bound workflow
  (`/workflows/<id>`). The bound workflow already lists in the manager (workflow_kind
  `class: [workflow, automation]`) with status + an Edit deep-link into its builder. The
  binding component itself is `announced: false` (a hidden shell with no manage/pause/delete
  surface), so it is deliberately not surfaced as a separate dead row.

## Tests / typecheck / build

- recipes: 21 tests (`assembler.test.ts` 18 pure-TS mapping/schedule/declaration/deep-link,
  `RecipeConfig.spec.ts` 3 component — pin/map/submit + unpublished honesty). Added
  `vitest.config.ts` + `tsconfig.json` (package had neither). vitest green.
- automation: 85 tests (was 79; +6: `deeplink.spec.ts` 5, `automations.wfcreate.spec.ts` 3
  minus recount — new files add the deep-link parse + create-from-workflow mount/success/
  failure). vitest green.
- vue-tsc: clean in every touched file. Remaining diagnostics are pre-existing and
  repo-wide (`*/index.ts` `fontCssUrl` HostCssKey, `widgets/ui/src/app/ports.ts`,
  `automation test-setup.ts`) — not introduced here. Fixed one pre-existing error inside the
  touched `automations.vue` (`meta.comment` cast).
- `npm run build` green for both; bundles written to each module's served `static/`.

## Live verification (port 8085, no restart)

- Both freshly-built bundles are served live and confirmed to carry the new code
  (grepped server-side for the new strings).
- Every endpoint the UI calls exists on the live registry: `/recipes/apply`,
  `/recipes/heal`, `/workflows/runnables`, `/workflows/templates`, `/automations/*` all
  return 401 unauthenticated, whereas a nonexistent route falls through to the SPA shell
  (200) — so 401 confirms the route is present + auth-gated.
- Not live-driven: the authenticated happy-path write (does apply actually create a
  binding). The shared MCP browser profile was locked (same blocker as the HFR) and the
  MCP server can't be relaunched `--isolated` from here; no destructive live writes were
  made. Request/response shapes are fixture-verified against `lowering.lua`, `healing.lua`,
  `automation.lua::create_binding` + `normalize_periodic_trigger_config`, and unit-tested.

## Known gaps / needs backend

- No `list_trigger_points` REST endpoint: the trigger-point picker offers only the periodic
  point (a documented platform constant). Source-derived trigger points need that endpoint
  before the picker can honestly list them. The catalog (`TRIGGER_POINTS`) is structured to
  absorb more points when it lands.
- Per-row workflow link in the manager list: the `automation_binding` list projection
  carries no `runnable_ref`, so a persistent binding row can't link to its workflow. The
  create-time success banner provides the link instead; a durable per-row link needs the
  list projection to carry the runnable ref (moot while the binding kind stays
  `announced: false`).
