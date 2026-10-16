# Automation create: no way to pick a workflow — fix

Date: 2026-07-10 · Branch `fe/deeplink-catalog-reconciliation` (not pushed)
Territory: `platform/automation/ui` only. No src Lua, no `app/wippy.lock`. The recipes
assembler (`platform/recipes/ui/RecipeConfig.vue`) was already correct and is untouched.

## Root cause

The trigger+workflow assembler was reachable ONLY from a secondary "From a workflow"
header button (`v-if="!createMode"`) and the `?backend=` deep-link. The primary create
surface — the "Add automation" type-catalog popup, which is also the ONLY thing the
workspace "+" / create-mode path mounts (`onMounted` → `openInstall()`, header hidden) —
listed trigger-bearing types (Data Sync's "When", Channel Responder) but had no entry to
run a published workflow. So from the create-mode path the assembler (hence the workflow
picker) was unreachable, and from the manager the primary green button led to a type list
with a trigger but no workflow. Two parallel create modals (`kx-modal-2p` install popup +
`kx-modal-wf` assembler modal) with the assembler siloed in the second.

## Fix

Consolidated to one create surface. The assembler is now a first-class catalog type —
`RUN_WORKFLOW_TYPE` ("Run a workflow", tag `kickside-recipe-config`) — leading the install
popup and mounted in its right pane through the existing custom-create mechanism
(`mountCustomInstallUi` sets `embedded` + threads `workflow-id`). Reachable from every
entry: the manager's primary "Add automation", the workspace "+"/create-mode popup, the
"From a workflow" shortcut (now `openRunWorkflow`), and the workflows Automate deep-link
(pre-selects the type, pins the workflow). Removed the parallel `openWfCreate`/`kx-modal-wf`
surface; the post-create workflow banner is driven from the assembler's `automation-installed`
`workflow_id`.

Files: `platform/automation/ui/src/app/automations.vue` (+ built `platform/automation/static/`).

## Verification

- Tests: automation-ui `vitest` 91 pass (wfcreate rewritten for the single-popup flow;
  +createMode-reaches-assembler test; +catalog-lists-Run-a-workflow test; interactions
  specs updated to select their specific type card now that "Run a workflow" leads).
- vue-tsc: touched files clean; the 4 remaining diagnostics are pre-existing baseline
  (`index.ts`/`trigger-config/index.ts` fontCssUrl HostCssKey, `test-setup.ts` url param,
  widgets `ports.ts`).
- `npm run build` green; served bundle confirmed carrying the new code.
- Live (8085, admin@wippy.local): manual path "Add automation" → "Run a workflow" shows
  trigger picker AND workflow picker. Selected the published workflow "Inbound lead
  pre-call wedge", mapped email/name/source, created paused → `POST /recipes/apply`
  success (binding `019f4c1e-bc13-7195-b77e-9e1415ef2bd2`, interval 30m). New row listed.
  Deleted via the UI delete path → `DELETE 200 success`, row gone.
