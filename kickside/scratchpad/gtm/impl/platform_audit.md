# Platform-wide quality audit

Read-only audit of the source-loaded replacements named in `app/wippy.lock`, excluding `platform/workflows` as requested. `promptmap` was unavailable (`command not found`), so no promptmap leads were used. Every finding below was verified directly in source. Counts exclude the oversized-file inventory and avoid double-counting cross-module duplicates.

## Per-module findings

### platform/hub

| File:line | Class | Evidence | Severity |
|---|---|---|---|
| — | — | No source-verified finding. | — |

### platform/connection

| File:line | Class | Evidence | Severity |
|---|---|---|---|
| `platform/connection/ui/src/app/Onboard.vue:85-94`; `connections.vue:92-104` | FE failure swallowing | Failed connections/provider catalog requests are converted to empty arrays before the outer `catch`; the UI renders an empty state instead of the actual API failure, violating the directed-error/no-fallback rule. | high |
| `platform/connection/ui/src/styles.css:20-31` | FE canon drift | Invents private color/radius aliases and hardcoded fallback colors (`--gn`, `--rd`, `--am`, `--r-card`) despite the platform radius/token canon. | cleanup |

### platform/knowledge

| File:line | Class | Evidence | Severity |
|---|---|---|---|
| `platform/knowledge/ui/src/app/KbCreate.vue:40-43` | FE failure swallowing | Engine/model catalog failures become `[]`; the create dialog opens with a false “no options” state and no error or retry path. | high |

### platform/models

| File:line | Class | Evidence | Severity |
|---|---|---|---|
| `platform/models/ui/src/styles.css:1-28` | FE duplicate/canon drift | This is the copied base of `chestor/workspace/ui/src/styles.css`; both retain private `--km-radius*` aliases. The first 1,484 lines are nearly identical, then Workspace appends its own shell. | cleanup |

### platform/uploads

| File:line | Class | Evidence | Severity |
|---|---|---|---|
| — | — | No source-verified finding. | — |

### platform/inbox

| File:line | Class | Evidence | Severity |
|---|---|---|---|
| — | — | No source-verified finding. The owner cascade claim is backed by the core component/thread lifecycle and the module’s own event-sourced design. | — |

### platform/settings

| File:line | Class | Evidence | Severity |
|---|---|---|---|
| — | — | No source-verified finding. | — |

### platform/automation

| File:line | Class | Evidence | Severity |
|---|---|---|---|
| — | — | No new finding beyond the separately audited workflows/automation seam and oversized-file inventory. | — |

### platform/recipes

| File:line | Class | Evidence | Severity |
|---|---|---|---|
| — | — | No new finding beyond the separately audited workflows/recipes seam. | — |

### platform/widgets

| File:line | Class | Evidence | Severity |
|---|---|---|---|
| `platform/widgets/ui/src/radius-canon.test.ts:1-104` | Copy-paste test block | Byte-identical 104-line test is duplicated in automation, connection, hub, knowledge, models, recipes, uploads, and kb10. It is a repo-wide guard, but each copy independently implements walking, token resolution, and validation. | cleanup |

### platform/sync

| File:line | Class | Evidence | Severity |
|---|---|---|---|
| — | — | No source-verified finding. | — |

### platform/webhooks

| File:line | Class | Evidence | Severity |
|---|---|---|---|
| — | — | No source-verified finding. | — |

### core/core

| File:line | Class | Evidence | Severity |
|---|---|---|---|
| — | — | No source-verified finding. | — |

### kickside/crm

| File:line | Class | Evidence | Severity |
|---|---|---|---|
| — | — | No source-verified finding. | — |

### wapps/contacts

| File:line | Class | Evidence | Severity |
|---|---|---|---|
| — | — | No source-verified finding. | — |

### wapps/gtm_core

| File:line | Class | Evidence | Severity |
|---|---|---|---|
| `wapps/gtm_core/src/_index.yaml:111-136,319-362` | Requirement leak / incomplete host wiring | `api_router` is declared, but its targets omit `list_profiles.endpoint`, `get_profile.endpoint`, and `update_profile.endpoint`; those endpoints remain hardcoded to `app:api`. A deployment’s firewalled replacement router therefore does not reach those three profile endpoints. | high |
| `wapps/gtm_core/src/migrations/01_import_session.lua:5-12`; `src/import_repo.lua:107-143,467-486`; `src/_index.yaml:842-850` | Owner-delete cascade gap | Import sessions have no owner/component/thread key, only `crm_id`; their cleanup is manually callable by session id. Deleting the associated CRM component or user has no declared lifecycle cleanup for `kickside_gtm_import_session`, candidates, reviews, funnel, or pull-usage rows. | high |
| `wapps/gtm_core/ui/src/playbooks.css:68-79`; `ui/src/acquisition.css:110-124`; `ui/src/surface.css:68-70` | FE duplicate UI chrome | Three independently maintained modal/scrim implementations. The two `.ax-*` blocks are near copies; `.gx-*` reproduces the same overlay behavior with different naming and dimensions. | cleanup |
| `wapps/gtm_core/src/import_api.lua:90-98,107,137,145,155,173` | Error-contract drift | HTTP status is inferred by substring-scanning free-form errors, and responses expose scalar `error` values. This is incompatible with the `{ code, message }` boundary canon and brittle to wording changes. | cleanup |

### wapps/precall

| File:line | Class | Evidence | Severity |
|---|---|---|---|
| `wapps/precall/ui/src/app/Briefs.vue:23-27,60-63`; `wapps/precall/src/api.lua:79-86` | FE/BE contract drift | UI says the API was “authored on a separate lane” and accepts `briefs`, `rows`, or `items`; the current backend emits only `briefs`. Dead shape guessing masks API drift rather than keeping one contract. | cosmetic |

### wapps/research

| File:line | Class | Evidence | Severity |
|---|---|---|---|
| `wapps/research/src/status.lua:22-39`; `detail.lua:34-70`; `submit.lua:19-28,45-67` | Error-shape drift | Public endpoints emit scalar `error` strings for authentication, invalid input, contract-opening, and persistence failures rather than stable `{ code, message }` errors. The client cannot distinguish retryable, input, access, and internal failures reliably. | cleanup |

### providers/kb10

| File:line | Class | Evidence | Severity |
|---|---|---|---|
| `providers/kb10/src/_index.yaml:20-28`; `src/persist/ops.lua:13-21` | ns.requirement leak | `target_db` rewrites only migration metadata, while all production reader/writer/export paths resolve literal `app:db` through `ops.get_db()`. A non-default DB deployment creates `kb10_*` tables in one DB and queries another. | blocker |
| `providers/kb10/src/migrations/02_wiki_merge.lua:14-25`; `src/migrations/03_injection_worker_refs.lua:18-46` | Cross-module raw-table access | kb10 migration code writes core/component-owned tables (`kickside_component_meta`, `kickside_projection`) directly. It bypasses the component/projection contracts and couples kb10 releases to private table schemas and JSON representation. | high |
| `providers/kb10/ui/src/styles.css:19-30`; `ui/src/document.css:7` | FE canon drift | Private radius aliases (`--kb-r`, `--kb-r-card`, `--kb-r-sm`, `--doc-radius`) duplicate the platform’s explicitly prohibited per-module radius-token pattern. | cleanup |

### chestor/workspace

| File:line | Class | Evidence | Severity |
|---|---|---|---|
| `chestor/workspace/ui/src/styles.css:1-30,1490-1623`; `ui/src/app/shared/*.vue` | FE duplicate/canon drift | Workspace vendors the Models shell: 16 shared Vue components are byte-identical, and 1,490 lines of shared CSS remain copied before Workspace additions. It also retains the same private `--km-radius*` aliases. | cleanup |

## Cross-module duplicate map

| Duplicate | Verified locations | Impact |
|---|---|---|
| Models/Workspace shared shell | `platform/models/ui/src/app/shared/{Avatar,Button,Confirm,Drawer,EmptyState,FormField,IconButton,Notice,Pill,RailHeader,SearchField,SelectField,Shell,Spinner,TagInput,TextInput}.vue`; identical Workspace paths | Two module trees must be changed together for any shared-shell bug, accessibility fix, or visual correction. |
| Models/Workspace stylesheet base | `platform/models/ui/src/styles.css` and `chestor/workspace/ui/src/styles.css` | Workspace carries a near-complete copy of Models’ 1,484-line CSS, including visual-token drift. |
| Radius-canon test | `platform/{automation,connection,hub,knowledge,models,recipes,uploads,widgets}/ui/src/radius-canon.test.ts`; `providers/kb10/ui/src/radius-canon.test.ts` | Nine copies of the same generic filesystem/CSS scanner; changes to canon enforcement are likely to drift. |
| GTM modal chrome | `wapps/gtm_core/ui/src/{surface,playbooks,acquisition}.css` | Three local overlay/modal systems with duplicated geometry and behavior. |
| Lua coercion helpers | 100+ local `trim` definitions across selected production Lua, concentrated in kb10, gtm_core, core, crm, research, automation, and knowledge | Inconsistent implementations and unnecessary local utility cloning; consolidate per module/shared core where imports are already available. |
| Error/status translation | GTM `import_api.lua`, Precall `api.lua`, Research handlers, plus several platform APIs | Scalar errors and message-substring status mapping coexist with `{ code, message }`; callers must defensively guess failure shapes. |

## Oversized-file inventory

All source files over ~700 lines in the requested modules, including tests because copy-paste test debt was in scope:

| Lines | File |
|---:|---|
| 4,759 | `platform/automation/src/automation_test.lua` |
| 3,818 | `platform/automation/src/automation.lua` |
| 1,959 | `wapps/precall/test/src/precall_test.lua` |
| 1,742 | `platform/sync/src/sync_test.lua` |
| 1,623 | `chestor/workspace/ui/src/styles.css` |
| 1,557 | `core/core/src/projections/persist/catchup.lua` |
| 1,484 | `platform/models/ui/src/styles.css` |
| 1,438 | `providers/kb10/src/injection/source_worker.lua` |
| 1,291 | `platform/automation/ui/src/app/automations.vue` |
| 1,235 | `providers/kb10/src/injection/source_materializer.lua` |
| 1,205 | `platform/hub/ui/src/app/useModulesPage.ts` |
| 1,149 | `wapps/gtm_core/src/import_sessions.lua` |
| 1,129 | `core/core/src/threads/contract.lua` |
| 1,068 | `core/core/src/threads/persist/writer.lua` |
| 995 | `platform/sync/src/sync.lua` |
| 958 | `providers/kb10/ui/src/styles.css` |
| 931 | `providers/kb10/src/persist/writer.lua` |
| 914 | `platform/uploads/src/persist/artifact_repo.lua` |
| 897 | `platform/uploads/src/persist/upload_repo.lua` |
| 887 | `platform/knowledge/src/injection/thread_ingest.lua` |
| 885 | `platform/knowledge/ui/src/app/knowledge.vue` |
| 875 | `core/core/src/threads/contract_test.lua` |
| 865 | `core/core/src/projections/runner/runner_test.lua` |
| 862 | `wapps/gtm_core/test/src/import_sessions_test.lua` |
| 861 | `core/core/src/projections/persist/writer.lua` |
| 820 | `platform/uploads/src/uploads.lua` |
| 796 | `platform/automation/src/trigger/mode_poll_test.lua` |
| 773 | `crm/src/materializer.lua` |
| 748 | `platform/hub/ui/src/app/useInstallDialog.ts` |
| 743 | `platform/uploads/ui/src/app/uploads.vue` |
| 724 | `platform/hub/ui/src/styles.css` |
| 724 | `crm/src/merge_test.lua` |
| 716 | `crm/src/policy.lua` |

## Ranked fix plan

### Backend

| Rank | Work | Modules | Effort |
|---:|---|---|---|
| 1 | Make kb10 runtime DB resolution read a registry value targeted by `target_db`; add a non-`app:db` integration test covering migration and read/write paths. | kb10 | M |
| 2 | Replace kb10’s raw `kickside_projection` / `kickside_component_meta` migrations with migration-owned compatibility contracts or move the migration responsibility to the owning core/component module. | kb10, core/component | M-L |
| 3 | Add GTM session ownership: persist owner/component linkage, ACL/filter on it, and register lifecycle cleanup for CRM/user deletion. Retain explicit audit policy for quarantined CRM records. | gtm_core, crm, core lifecycle | L |
| 4 | Add the three missing GTM endpoint targets to `api_router`; add a declaration test asserting every `http.endpoint` is targeted by the requirement. | gtm_core | S |
| 5 | Standardize public errors on `{ code, message }`; map status from `code`, not text. Start with GTM, Precall, and Research. | gtm_core, precall, research | M |
| 6 | Split oversized persistence/orchestration units along existing seams: repositories, command handlers, reducers, workers, and test fixtures. | automation, core, uploads, kb10, gtm_core, crm | L |

### Frontend

| Rank | Work | Modules | Effort |
|---:|---|---|---|
| 1 | Remove empty-catalog fallback behavior. Preserve request failure, render a directed error, and offer retry for Knowledge create and Connection onboarding/listing. | knowledge, connection | S |
| 2 | Extract Models/Workspace shared shell into one owned shared UI package or make Workspace consume the existing shell by tag/component. Delete copied files. | models, chestor/workspace | M |
| 3 | Replace module radius aliases with literals from the canon and host tokens; remove `--km-*`, `--kb-r*`, connection, and hub radius layers. | models, workspace, kb10, connection, hub | M |
| 4 | Move the radius scanner into one reusable test helper/package; leave thin module-local invocations only if source-root isolation is required. | nine UI modules | S |
| 5 | Collapse GTM overlay/modal CSS into one component/base class, parameterized only by size/content. | gtm_core | S |
| 6 | Narrow Precall’s UI decoder to the documented `{ briefs }` response and remove the stale “separate lane” comment. | precall | XS |
| 7 | Decompose oversized views/composables: `automations.vue`, `knowledge.vue`, `uploads.vue`, `useModulesPage.ts`, and their style sheets. | automation, knowledge, uploads, hub | L |

## Counts per module

| Module | Findings |
|---|---:|
| platform/hub | 0 |
| platform/connection | 2 |
| platform/knowledge | 1 |
| platform/models | 1 |
| platform/uploads | 0 |
| platform/inbox | 0 |
| platform/settings | 0 |
| platform/automation | 0 |
| platform/recipes | 0 |
| platform/widgets | 1 |
| platform/sync | 0 |
| platform/webhooks | 0 |
| core/core | 0 |
| kickside/crm | 0 |
| wapps/contacts | 0 |
| wapps/gtm_core | 4 |
| wapps/precall | 1 |
| wapps/research | 1 |
| providers/kb10 | 3 |
| chestor/workspace | 1 |
| **Total** | **15** |

## 10 worst findings platform-wide

1. **kb10 — blocker:** runtime hardcodes `app:db` while `target_db` rewrites only migrations; non-default DB deployments split schema from runtime data access.
2. **gtm_core — high:** import sessions have no lifecycle owner and no CRM/user-delete cascade, leaving session/candidate/review data behind.
3. **kb10 — high:** migrations directly mutate core/component private tables (`kickside_projection`, `kickside_component_meta`).
4. **gtm_core — high:** three profile endpoints bypass the declared `api_router` requirement and can attach to the wrong security boundary.
5. **connection — high:** onboarding/list failures silently become empty catalogs, presenting infrastructure failure as “nothing available.”
6. **knowledge — high:** KB creation hides engine/model catalog outages as empty selectable options.
7. **gtm_core — cleanup:** error HTTP status derives from human-message substrings rather than stable codes.
8. **models/workspace — cleanup:** a large copied shared UI shell and stylesheet creates two drifting sources of truth.
9. **kb10 — cleanup:** private radius-token system directly violates frontend radius canon.
10. **widgets plus eight consumers — cleanup:** identical 104-line radius-canon test is copied nine times instead of being shared.
