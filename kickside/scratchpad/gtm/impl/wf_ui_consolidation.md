# Workflows UI consolidation — application report

Applies items 1-6 of the ranked list in `wf_ui_redundancy.md`. Scope: `platform/workflows/ui/src`
(plus imports from the existing `@widgets` ports module). No Lua/yaml, widgets, or other modules
touched. No build run — see the DEFERRED note at the end.

Commit: **46339e4ada02cd376a33e6fef421da2cd02218de** (on `main`, not pushed; only the 9
workflows/ui source files staged — the other agent's in-progress `runs_test.lua`/`scratchpad`
changes were left untouched and uncommitted).

## Test counts
- Before: 17 files / **156 tests passed**, 0 failed.
- After:  17 files / **156 tests passed**, 0 failed.
- `connect-validation.test.ts` (16) and `workflow-call.test.ts` (4) pass **unmodified** — the shared
  `parseSchema` produced no edge-case divergence, so no STOP was needed.

## Typecheck
- `tsc --noEmit -p tsconfig.json`: 4 errors before, **4 after** — identical, all pre-existing and
  outside scope (`widgets/ui/src/app/ports.ts:71`, two `.vue`-module-resolution artifacts of plain
  tsc that can't parse SFCs, `workflow_setup.ts:28`).
- `vue-tsc 5.9.3 --noEmit` (real SFC type-check, binary borrowed from
  `app/frontend/applications/main`): **3 errors, all in files I did not touch**
  (`widgets .../ports.ts:71`, `WorkflowSetup.vue:35`, `workflow_setup.ts:28`). None of the 8 edited
  source files appear — the item-2 emit/handler wiring, the composable, and the `parseSchema`
  narrowing all type-check clean.

## Per-item

### 1. WorkflowBuilder.vue — dead createMode branch removed (§1.1)
`app/WorkflowBuilder.vue`. Removed `typeId`/`componentId` from `Props` (now `interface Props`
:16 = `{ route? }` only), the `createMode` computed, `title`/`creating`/`createError` refs,
`submitCreate`, the `automation-installed`/`submit-state` emit declarations (`useEvents` :21 now
declares `navigate` only), the `useParentId` + `createWorkflow`/`humanError` imports (now unused),
and the `<form v-if="createMode">` template block (root is now `<div ref="rootEl" class="wf">` :82).
`index.ts` already declared `route` only, so no change there. `WorkflowSetup.vue` remains the sole
creation surface (still owns `useParentId`, correctly).

### 2. Agent Exit schema / Run context routed through SchemaEditor (§2.1)
`app/NodeConfigPanel.vue` + `app/SchemaEditor.vue`.
- Dropped the four `agentExitSchemaText/Error` + `agentContextText/Error` refs, the two watch lines
  that seeded them, `commitExitSchema`/`commitAgentContext`, and the `parseJsonObject` import.
- Added `agentExitSchema` (:269) and `agentContext` (:273) computeds (null when unset), and
  `onExitSchemaChange`/`onExitSchemaClear`/`onAgentContextChange` handlers (:291-300).
- Template: exit schema now `<SchemaEditor mode="schema" allow-empty ...>` (:622) with
  `@change="onExitSchemaChange" @clear="onExitSchemaClear"`; run context now
  `<SchemaEditor mode="value" ...>` (:636) with `@change="onAgentContextChange"` (code-only, no
  driving schema — same as before, now through the shared component, and exit schema gains the
  AI-assist affordance for free).
- SchemaEditor extended minimally: `allowEmpty?: boolean` prop (:41), a `clear` emit (:50),
  `seed()` (:60) leaves the textarea blank instead of seeding a default when `allowEmpty` and
  modelValue is empty, and `commitCode()` (:74) emits `clear` on blank+allowEmpty.

**Unset-semantics decision:** The report flagged that the old exit-schema code deliberately let a
blank field commit back to *unset* (`exit_schema: null`), while `SchemaEditor.seed()` always seeded
`{}`/`{type:object,properties:{}}` on empty. SchemaEditor's existing API could not express "unset"
(empty text is a no-op commit there). Rather than keep the hand-rolled textareas, SchemaEditor was
extended with `allow-empty` — a blank editor stays blank and emits a dedicated `clear` event, which
`onExitSchemaClear` maps to `commitAgentField({ exit_schema: null })`. A separate `clear` event
(not widening `change`/`update:modelValue` to `| null`) was chosen so the two existing consumers
(boundary schema `@change="commitBoundarySchema"`, run-with-input `@update:model-value`) keep their
non-null handler types with zero risk of a strict-function-type regression — vue-tsc confirms clean.
Run context is unchanged in intent: `mode="value"` seeds `{}` on empty, matching the old
`context: value || {}` (empty context = `{}`, which was never a deliberate unset), so it does not
use `allow-empty`.

### 3. Dead CSS deleted (§1.2, §1.3)
`app/styles.css`. Removed `.wf-sim-input`, `.wf-sim-json`, `.wf-sim-modes`, `.wf-sim-mode`
(+`.is-on` compound), `.wf-sim-note--warn`, `.wf-interface-pop`, `.wf-interface-json` (former
lines 155-174) and `.wf-chiprow` (former :645), `.wf-panel-note--warn` (former :1113). Each class
re-grepped across `.vue`/`.ts` after all other edits: **zero references**. Live sibling rules
(`.wf-sim-head/hint/field/label`, `.wf-sim-note`, `.wf-sim-err/foot`, `.wf-chip`, `.wf-panel-note`)
were kept intact (surgical deletes, not a line-range blast).

### 4. parseSchema consolidated on the widgets version (§3.1)
- `app/connect-validation.ts`: added `import { parseSchema } from '@widgets/app/ports'` (:7); `parse`
  (:24) now delegates to it and re-narrows to the object-schema shape (`v && typeof v === 'object' &&
  !Array.isArray(v)`), dropping the local string/`JSON.parse`/try-catch.
- `app/workflow-call.ts`: added `import { parseSchema as parsePortSchema } from '@widgets/app/ports'`
  (:1); local `parseSchema` (:34) now delegates to it and re-narrows to `Record<string, unknown>`.
- Local type narrowing kept in both; both unit suites pass unmodified.

### 5. useNoteResize composable extracted (§5.1)
`app/frame.ts`: added `useNoteResize(id, data: () => WfNoteData)` (:19) returning `{ hue,
onResizeEnd }` (hue via a `data` getter to stay reactive; persist via the injected
`PERSIST_NOTE_SIZE`). `NoteNode.vue` (:11) and `FrameNode.vue` (:11) both consume it, dropping their
duplicated `noteHue`/`inject`/`onResizeEnd` boilerplate; FrameNode keeps its own `title` computed.
No import cycle (`graph-sync.ts` does not import `frame.ts`).

## DEFERRED — dist rebuild (next lane)
No production build was run; `platform/workflows/static` (served output) and any `dist` are
untouched, so the live 8085 bundle is unchanged and these source edits are NOT yet live. After the
proof round closes, the next lane must run, from `platform/workflows/ui`:

    npm run build     # === vite build; outputs to platform/workflows/static

Caveat (per memory "Workflows module vendored static"): the workflows module serves from vendored
static via the `wippy.lock` replacement `kickside/workflows -> ../platform/workflows`; confirm that
replacement is in place so the rebuilt `static/` actually serves, otherwise the edits still won't
surface.
