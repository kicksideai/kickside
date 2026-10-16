# Slop & Abstraction-Leak Audit — Workflows Program Surface

Scope: `platform/workflows` (src + ui), `platform/recipes` (src + ui), `platform/automation` (src + ui), `wippy/dataflow` changed files (472d000..HEAD), and the recipes/automation/agents → workflows seams. Read-only. Every finding below was verified by reading source; promptmap (gemma-4-26b) was used only as a lead generator and its false positives are noted where relevant.

Counts: SLOP 8 · ABSTRACTION LEAKS 7 · CONTRACT DRIFT 4 · (promptmap false positives discarded: `find_trigger_point` "dead", most workflows-UI "historical comment" flags).

---

## 1. SLOP

| # | File:line | Evidence | Severity |
|---|-----------|----------|----------|
| S1 | `wippy/dataflow/REGRESSION_FIX.md` (whole file, git-tracked, added in this range) | AI implementation-report doc committed into module root. Body: "The requested external scratchpad path was not writable from this workspace, so this report is stored here instead." Contains a fix-log table + "Verification: make test — 902 tests passed". A report, not source. | cleanup |
| S2 | `platform/workflows/src/runner.lua:64-65` **and** `platform/workflows/src/runnable/launch.lua:80-81` | Verbatim-duplicated disabled path + future-promise message: `return nil, "inline_fold_in workflow launch is disabled until child output readiness is fixed"`. A disabled feature branch carrying an editorial "until … is fixed". `compiler/graph.lua:369` also branches on the mode. | cleanup |
| S3 | `platform/workflows/ui/src/app/api.ts:426` | `const unavailable = 'Simulate isn't available yet — the workflow engine hasn't shipped this endpoint.'` — but the endpoint **is** shipped (`src/api/_index.yaml:375` `simulate.endpoint` → `src/api/exec_api.lua:210`). Stale defensive fallback. | cleanup |
| S4 | `platform/workflows/ui/src/app/assist-schema.ts:23-26,56` | Defensive "The endpoint may not be deployed yet (it lands via a parallel lane + restart)…" — assist endpoints are shipped (`src/api/_index.yaml:465,482`). Stale staged-lane remnant. | cosmetic |
| S5 | `platform/recipes/ui/src/assembler.ts:344` | Comment: "WorkflowBuilder.vue navigates to /automations?backend=kickside.workflows.partial:`<id>`." Contradicted by the real emitter `platform/workflows/ui/src/app/automate-link.ts:7-8`, which emits the **plain** id and whose own comment states the `partial:` spelling "is never emitted". Stale/incorrect comment. | cosmetic |
| S6 | `store.lua:311` ("written before the vocabulary cleanup"); `runs.lua:1207` ("Older workflow-state formatting added…"); `ui/src/app/template-lineage.ts:3` ("there is no backfill for workflows created before the marker existed"); `ui/src/app/graph-sync.test.ts:180` ("used to be two placeable kinds") | Historical / negative-assertion comments (present-tense rule). Low weight — most workflows-UI comments promptmap flagged as "historical" are actually valid present-tense design rationale. | cosmetic |
| S7 | 19 files define `local function trim`, 19 define `local function str`, 9 define `local function map` across workflows/automation/recipes src | Systemic per-file re-implementation of trivial coercion helpers. Not tonight-specific but consolidation debt the owner's standard targets. | cleanup |
| S8 | `recipes/src/healing.lua:31`, `recipes/src/retired_recipe.lua`, `recipes/src/lowering.lua` (each own `trim`); `workflows/src/runner.lua:15-21` + `runnable/launch.lua` (each own `map`/`str`) | Same-lane copy-paste of helpers between files edited together tonight — the concrete instances of S7. | cleanup |

---

## 2. ABSTRACTION LEAKS

| # | File:line | Evidence | Severity |
|---|-----------|----------|----------|
| A1 | `platform/workflows/src/runner.lua` (`M.run`) vs `platform/workflows/src/runnable/launch.lua` (`launch_workflow_definition`) | **Parallel launch implementations.** Both reimplement the mode dispatch over `runs.launch` (default `spawned_child_run`, disabled `inline_fold_in`, `unsupported … mode`). They have **diverged**: `launch.lua:87-102` enforces a recursion guard (`recursive workflow launch rejected`) and `MAX_WORKFLOW_DEPTH`; `runner.lua` (the `kickside.workflows:runner` contract, consumed by `agent_tool.lua`) passes `workflow_stack`/`depth` straight through with **no recursion/depth check**. Two entry points, inconsistent safety. | blocker |
| A2 | `platform/workflows/src/store.lua:573,613,617` | Workflows store reads **and** writes `automation_bindings` (`SELECT binding_id, runnable_ref FROM automation_bindings`; `M.replace_automation_binding_consumer`). That table is created/owned by `platform/automation/src/migrations/01_automation_bindings.lua`. Split ownership of one table across two modules (workflows owns the row logic, automation owns the schema/migration); works only because both share `app:db`. | cleanup→blocker |
| A3 | `recipes/ui/src/assembler.ts:346` + `automation/ui/src/app/deeplink.ts:8` (FE) and `workflows/src/store.lua:16` + `automation/src/automation.lua:1550` (BE) | Same retired constant `kickside.workflows.partial:` + strip logic re-implemented in **4 sites** across 3 modules. No emitter of the prefix remains anywhere (verified repo-wide) — this is 4 copies of dead-except-legacy-URL normalization. | cleanup |
| A4 | `workflows/ui/src/app/WorkflowCanvas.vue:418`; `run-detail.ts:63-64` | FE reaches raw BE vocab: subscribes to topic `` on(`workflow.${workflowId}`) `` (prefix owned by `src/types.lua:166 REALTIME_TOPIC_PREFIX = "workflow."`); and matches raw engine event strings `r.type === 'node.error'` / `'node.result'` + `discriminator.startsWith('result.error')`. Pub/sub + event-type contract duplicated as string literals on the FE. | cosmetic |
| A5 | `platform/recipes/src/lowering.lua:22,43` | Recipes calls a workflows function by hardcoded id: `TEMPLATE_INSTANTIATE = "kickside.workflows:instantiate_flow_template"`; `(funcs).new():call(TEMPLATE_INSTANTIATE, args)`. Automation reaches workflows through a declared **contract** (`WORKFLOW_RUNNER_CONTRACT = "kickside.workflows:runner"`, `automation.lua:1146`). Inconsistent seam — recipes binds to an internal function id, not a contract. | cleanup |
| A6 | `workflows/ui/src/app/api.ts:72-79` | `listWorkflows` extracts rows from `inner.workflows \|\| inner.items \|\| inner.components` — backend only ever emits `{ workflows }` (`src/api/list_workflows.lua:26`). Defensive over-handling of two shapes the backend never sends. | cosmetic |
| A7 | `workflows/ui/src/app/WorkflowList.vue:41-46` | `parentId` reads `v.parentId \|\| v['parent-id']`. Under Wippy `useProps` host attrs are camelCased, so the kebab `['parent-id']` branch is permanently `undefined` (see MEMORY: useProps camelCases attributes). Dead fallback. | cosmetic |

---

## 3. CONTRACT DRIFT

| # | File:line | Evidence | Severity |
|---|-----------|----------|----------|
| C1 | `automation/src/api/errors.lua:27-40` vs `workflows/src/runs.lua:57,500,505,848` + `recipes/src/api/apply.lua:20,26,32` | **Error-object vocabulary split.** recipes + workflows emit `{ code, message }`. automation emits `{ message, kind }` and derives HTTP status by **substring-scanning the human message** (`status_for(msg:lower())`). Three modules, two incompatible error contracts + a brittle message-text→status path. | cleanup |
| C2 | `workflows/ui/src/app/run-detail.ts:69-89` | `errorFromContent` straddles **three** node-failure shapes at once: bare string / `BARE_FAILURE` token ("failed/failure/error…"), structured `{ code, message }`, and nested `{ error: { code, message } }` + aliases (`error_code`, `reason`, `detail`). Comment: "The structured shape (once propagation lands)" / "the backend today may record only the bare token 'Failed'". This is the FE hedging the exact in-flight dataflow migration (472d000..HEAD "preserve structured failure reason"). Migration seam left half-open. | cleanup |
| C3 | `workflows/ui/src/app/api.ts:64-68` vs `workflows/src/api/list_workflows.lua:19-26` (+ `repo.lua:168`) | FE `listWorkflows({ partial?: 'all'\|'partial'\|'published'\|boolean })` builds `?partial=…`, but the backend handler calls `repo.list()` with **no args** and never parses the query — the filter is a no-op; the picker compensates client-side (`EmbedWorkflowPicker.vue:25 .filter(published_version)`). Phantom param + over-broad union (only `'published'` is ever passed; `'partial'`/`'all'`/boolean are dead). | cleanup |
| C4 | `automate-link.ts:7` (emits plain id) vs `deeplink.ts:12` / `assembler.ts:348` (both strip `partial:`) + `assembler.ts:344` stale comment | Deep-link emit/strip drift: canonical emit is the plain component id; two FE strippers + one stale comment still describe the retired `partial:` emit. Emit side retired, strip side triplicated. | cosmetic |

---

## Ranked fix list

### Backend
1. **A1** — Consolidate the two launch paths. Make `runner.lua` (the `kickside.workflows:runner` contract) route through the same recursion/`MAX_WORKFLOW_DEPTH`-guarded core as `runnable/launch.lua`, or have one delegate to the other. Today the agent-tool/runner contract path has no recursion or depth protection. (blocker)
2. **A2** — Decide single ownership of `automation_bindings`. Either move the migration + row logic wholly into one module, or expose the read/write through a declared contract instead of workflows `store.lua` issuing raw SQL against an automation-owned table.
3. **C1** — Pick one error-object shape (`{ code, message }` is used by 2 of 3 modules) and retire automation's `{ message, kind }` + message-substring→status classifier; classify on `code`.
4. **S1** — Delete `wippy/dataflow/REGRESSION_FIX.md`; it is a report doc, not source.
5. **S2** — Remove the disabled `inline_fold_in` branch (or implement it) and drop the "until … is fixed" wording; de-duplicate the guard between `runner.lua` and `runnable/launch.lua` once A1 lands.
6. **A5** — Route recipes→workflows template instantiation through a declared contract rather than the hardcoded `kickside.workflows:instantiate_flow_template` function id.
7. **A3 (BE half)** — Share one `RETIRED_WORKFLOW_PARTIAL_PREFIX` (or drop it if stored refs are already migrated) instead of copies in `store.lua` + `automation.lua`.
8. **S7/S8** — Consolidate `trim`/`str`/`map` into a shared util per module.
9. **C3 (BE half)** — Either honor `?partial=` in `list_workflows.lua`/`repo.list()` or remove the param from the contract.

### Frontend
1. **C2** — Once dataflow structured-failure propagation lands, collapse `run-detail.ts` to the single `{ code, message }` shape; drop the bare-token and alias branches.
2. **C3 (FE half)** — Narrow `listWorkflows` to the one value actually used (`published`); drop the `'all'`/`'partial'`/boolean union and the client-side compensation once the backend filters (or keep client filter and delete the query param).
3. **S3 / S4** — Remove the "Simulate isn't available yet"/"endpoint may not be deployed yet" stale fallbacks now that both endpoints ship.
4. **A3 (FE half)** — Extract one shared `normalizeBackend`/`workflowIdFromBackend` util; `recipes/assembler.ts` and `automation/deeplink.ts` currently each own a copy.
5. **S5 / C4** — Fix the stale `assembler.ts:344` comment (builder emits the plain id, not `partial:`).
6. **A4** — Centralize the realtime topic prefix and engine event-type names as shared constants rather than inline literals in `WorkflowCanvas.vue` / `run-detail.ts`.
7. **A6 / A7** — Drop the `items`/`components` response-shape guesses (`api.ts`) and the dead kebab `['parent-id']` fallback (`WorkflowList.vue`).
