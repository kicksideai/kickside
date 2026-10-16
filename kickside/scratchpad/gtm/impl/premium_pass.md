# Workflows premium pass + duplicates root-cause fix

Commits (scoped, not pushed): `6733a717` workflows, `db49b57b` uploads.
Screenshots: `/tmp/claude-1000/-home-wolfy-j-kickside/3fc3674e-309e-47a5-a3d8-89305debb90f/scratchpad/premium/`
(before_* captured against the pre-build bundle, after_* against the rebuilt bundle, live app :8085).

## 1. Duplicates — root cause and fix

**Root cause.** Create was a non-atomic two-step: `createWorkflow` persists the workflow
component immediately (server-side, no idempotency guard), then a separate `applyCommands`
writes the Start/Finish/Error scaffold. If the scaffold call failed — or the user abandoned
the dialog before it ran — the component was already stranded as an empty, untitled draft,
and a retry called `createWorkflow` again, minting a second one. Empty = scaffold never
applied; untitled = the silent `'Untitled workflow'` default; multiple = one per retry. The
workspace-"+" path (`WorkflowSetup.install`) had no re-entrancy guard, so its footer button +
Enter key could fire two `POST /api/v1/automations` and duplicate that way too. Both paths
mint components of the same impl id (`kickside.workflows:workflow_kind`), so they also
double-surface across the Workflows list and the Automations manager.

**Fix (frontend only, no Lua).**
- `create-flow.ts` — `WorkflowCreateFlow`: holds the created id and **reuses it on retry**
  instead of minting a second workflow; `abandon()` best-effort deletes a draft the user
  walked away from before it was scaffolded.
- `WorkflowList.submitCreate` routes through the flow; **a name is now required** (Create is
  disabled when empty), killing the "Untitled workflow" default; `closeCreate` sweeps a
  pending partial draft.
- `WorkflowSetup.install` — added `if (saving.value) return` re-entrancy guard.
- Cleanup affordance for the orphans already in the list: a per-row **Delete** in the
  overflow menu → confirm modal → `DELETE /api/v1/workflows/{id}` (new `deleteWorkflow` in
  `api.ts`), removing the row.

**Verified live** (`scratchpad/premium_verify.mjs`): Create disabled with empty name → true;
enabled after typing → true; create makes exactly one workflow (rows 3→4) and navigates to
the canvas (no orphan); Delete confirm → row removed (4→3). Round-trip CLEAN.

## 2. Premium pass (tokens-only, both themes, reduced-motion respected)

- Elevation token scale `--wf-elev-1/2/3` (neutral ink; deepened for dark via data-theme and
  prefers-color-scheme, data-theme wins) replaces ad-hoc raw-rgba shadows: dialogs = tier 3,
  menus/popovers = tier 2, list table card = tier 1. Three planes instead of flat borders.
- Micro-transitions on `--wf-ease`: row hover, button press (`translateY(1px)`), modal + mask
  entrance (`wf-modal-in`/`wf-mask-in`) — all added to the reduced-motion guard.
- Panel section labels strengthened (`.wf-panel-label` toward text) so label/value/hint tiers
  separate — the "gray soup" complaint.
- Delete-affordance chrome: `.kx-btn-danger`, row-menu separator, danger menu item, confirm
  modal.
- Bug: `.wf-setup-req/.wf-setup-error` referenced an undefined `--wf-red` → error/required
  text rendered in default color. Fixed to `--wf-danger`.

## 3. Uploads select (never authored)

`platform/uploads/ui/src/styles.css` `.kx-select` — `appearance:none` + shared styled chevron
(automation pattern), dropping the leaked OS dropdown chrome. Source + build committed; stays
pack-frozen until wired (orchestrator).

## Screenshot pairs

| Surface | Before | After |
|---|---|---|
| List (table card) | before_list.png | after_list.png |
| List row hover | before_list_hover.png | after_list_hover.png |
| Create dialog | before_dialog.png | after_dialog.png (Create disabled, empty name) |
| Row overflow menu | (n/a — new) | after_row_menu.png (Export + Delete) |
| Builder canvas | before_canvas.png | after_canvas.png |
| Node config panel | before_panel.png | after_panel.png |

## Verify

- Tests: `create-flow.test.ts` +8; full workflows UI suite **398/398 green**.
- vue-tsc: 3 errors remain — all pre-existing baseline, none in my changed lines
  (`widgets/ports.ts:71`, `WorkflowSetup.vue:35` the documented dual-vue `useParentId` Ref
  issue, `workflow_setup.ts:28` `fontCssUrl`). My changes add zero new type errors.
- Builds: workflows + uploads both clean.

## Coordination note

Shared working tree with the field-mapper lane. Mapper-owned files
(`NodeConfigPanel.vue`, `assist.ts`, `assist.test.ts`, `connect-validation.ts`, `index.ts`)
were left modified-uncommitted — not staged. Workflows `static/` was rebuilt for
verification but **not committed** (it embeds the mapper's WIP); its authoritative rebuild is
an integration step once both lanes' source is committed. Uploads `static/` was committed
(isolated module, my change only).
