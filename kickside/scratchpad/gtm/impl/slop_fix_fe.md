# FRONTEND slop cleanup — fixes 4, 7, 8 + stale copy (S3/S4)

Territories: platform/workflows/ui, platform/recipes/ui, platform/automation/ui.
BE report `slop_fix_be.md` was NOT present when this ran — C3/error shapes implemented
defensively against current BE shapes (notes below). No src Lua, wippy.lock, or BE-lane
files touched or staged. Two scoped commits, not pushed.

## Commits
- `87f5eaea` workflows/ui — findings 4, 7, S3, S4 + rebuilt static
- `e308e20e` recipes/ui — finding 8 + rebuilt static

BE codex lane's edits (workflows/automation src *.lua, app/wippy.lock, deps/_index.yaml)
were left uncommitted and unstaged — verified no `.lua`/lock in either commit.

## Fix 4 — run-detail.ts three-shape error hedging (C2)
- `errorFromContent` collapsed to: record → `{ code, message }` + whole payload as detail;
  non-record → the single honest no-detail fallback. Deleted the nested-`{error:{}}`
  unwrap, the field aliases (`error_code`/`reason`/`detail`), and the bare-string branch.
- `runErrorFromRecord` (run-level) collapsed the same way: reads `{ code, message }` only.
  Kept the `Node [uuid] failed:` prefix-peel + bare-token→`generic` detection — that is the
  real current run-error STRING shape (confirmed live: `run.error = "Node [uuid] failed:
  Failed"` in fixtures + api.test), not hedging.
- Comments updated to present-tense structured reality (dropped "backend today may record
  only the bare token / once propagation lands").
- No new live fixture pulled: the existing bare-`"Failed"` node fixture now exercises the
  honest fallback path (non-record → fallback), and the structured `{ code, message }` path
  is covered by the synthetic `extractNodeError` test. Re-fetch was unnecessary for green.

## Fix 7 — phantom ?partial= list filter (C3, FE side)
- BE not ready: `list_workflows.lua` still calls `repo.list()` with no args and does NOT
  parse the query (server does not filter). So per the fallback path: kept sending
  `partial=published`, but behind one function `listWorkflowsQuery(filter)` — the switch to
  a server-honored param is now one line.
- Narrowed the option: `{ partial?: 'all'|'partial'|'published'|boolean }` →
  `{ filter?: 'published' }`. Renamed the key `partial`→`filter` (the value is "published",
  not "partial") and updated the 3 callsites (EmbedWorkflowPicker, WorkflowCallPicker,
  EmbedWorkflow) + test. The query param name stays `partial` (what BE will parse).
- Pickers keep their client-side `published_version` compensation — server does not filter
  yet, so removing it would surface unpublished rows. To retire once BE honors the filter.

## Fix 8 — legacy-prefix normalization helper (A3, FE side) + stale comment (S5/C4)
- recipes/ui and automation/ui are independent Vite bundles (separate tsconfig, no
  cross-package path) — cross-import is wrong here, so per the fallback: one copy per bundle,
  byte-identical. `PARTIAL_PREFIX` + `normalizeBackend` in recipes `assembler.ts` are now
  byte-identical to automation `deeplink.ts`.
- Renamed recipes `workflowIdFromBackend` → `normalizeBackend`; updated `RecipeConfig.vue`
  and `assembler.test.ts` (now mirrors `deeplink.spec.ts`'s normalizeBackend test — a single
  test each). automation/ui was already canonical and untouched.
- Deleted the stale `assembler.ts` comment claiming the builder navigates to
  `?backend=kickside.workflows.partial:<id>` — the builder emits the plain component id
  (`automate-link.ts`).

## Stale copy (S3 / S4)
- S3 `api.ts` simulate: removed the `'Simulate isn't available yet — the engine hasn't
  shipped this endpoint'` message + the 404 "not deployed" hedge + the SPA-HTML branch. Now
  routes through the shared `post()` like `launchRun` and throws the honest "did not return a
  run id". Dropped the now-unused `httpStatus` import. WorkflowCanvas already wraps this in
  `humanError(e, 'Couldn't start the run.')`, so real errors surface their own message.
- S4 `assist-schema.ts`: reframed the "endpoint may not be deployed yet (lands via a parallel
  lane + restart)" / "route isn't registered … isn't deployed here yet" comments as runtime
  degradation (assist can be disabled on a stack or its provider can error). Behavior kept
  (404 / non-JSON / success:false → degrade). Updated the test description "(endpoint not
  deployed yet)" → "(assist unavailable here)". Shared `ASSIST_UNAVAILABLE` constant left
  as-is (legit "assist not enabled here" runtime message; changing it ripples to the edge
  client + SchemaEditor and is out of the audited scope).

## Verify
- vitest: workflows 390 pass (was 392; −2 removed run-detail tests that encoded the
  nested-envelope + string-message node-error shapes) · recipes 24 pass (rename only, same
  count) · automation 91 pass (untouched).
- vue-tsc: touched files clean. Pre-existing baseline errors remain in files NOT in this
  lane's diff — `widgets/ui/src/app/ports.ts`, `WorkflowSetup.vue`, `workflow_setup.ts`,
  `recipeConfig.ts` entry (`fontCssUrl` HostCssKey) — unrelated.
- `vite build`: workflows exit 0, recipes exit 0. Rebuilt static committed (module serves
  its `./static` via `http.static`).
