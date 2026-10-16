# Workflows UI redundancy/dead-code audit

Scope: `platform/workflows/ui/src` (Vue 3 + VueFlow builder, ~7,900 LOC). Method: promptmap
map-mode pass (`scratchpad/gtm/impl/wf_ui_repo_map.md`, `nodes.jsonl`) for orientation, then every
non-test `.ts`/`.vue` file read in full and every finding below confirmed by grep/read against the
actual source (no finding taken from the promptmap summary alone). Cross-checked against
`platform/recipes/ui`, `platform/inbox/ui`, `platform/knowledge` (KB create dialog), and
`platform/widgets/ui/src/app` (shared PickerSelect/WcMount/ports.ts) via a sub-agent.

Overall picture: this UI is in noticeably better shape than the "several rapid waves" framing
suggested. The core (`types.ts`, `sync.ts`, `graph-sync.ts`, `catalog.ts`, `kinds.ts`,
`connect-validation.ts`) is a clean single-source-of-truth design with no state/sync duplication.
The two real problems are (a) one leftover dead creation surface from before `WorkflowSetup.vue`
was split into its own tag, and (b) two fields in `NodeConfigPanel.vue` that bypass the shared
`SchemaEditor.vue` the rest of the codebase correctly uses everywhere else.

---

## 1. Orphans (dead code)

### 1.1 `WorkflowBuilder.vue` — unreachable "create" branch — SAFE DELETE
**Files:** `app/WorkflowBuilder.vue:21-58` (script), `:117-130` (template)

`WorkflowBuilder.vue` declares `Props { route?; typeId?; componentId? }` and a `createMode`
computed (`!!typeId && !componentId`, line 36) that renders a standalone naming form
(`submitCreate`, `creating`, `createError`) when true. Its own comment claims "Mounted as an
automation create view the host sets `type-id`".

This is unreachable:
- The web component wrapper (`index.ts:25-30`, `PROPS_SCHEMA`) only declares `route` — it never
  forwards `type-id`/`component-id` as attributes, so `props.value?.typeId` can never be truthy in
  practice.
- The registry only ever points a *manage* view at `kickside-workflow-builder`
  (`platform/workflows/src/_index.yaml:920-923`, `workflow_kind` binding →
  `component.manage.view: workflow_builder_view`). The *create* view for the same binding is a
  wholly separate tag/component: `component.create.view: workflow_setup_view` →
  `kickside-workflow-setup` → `WorkflowSetup.vue` (registered `auto_register: false`,
  `_index.yaml:183-191`).
- Repo-wide grep for `type-id` usage confirms it is only ever read by `WorkflowSetup.vue`/
  `workflow_setup.ts`, never passed to `WorkflowBuilder`/`index.ts`.
- The template's own CSS classes (`wf-newform`, `wf-newform-label`, `wf-newform-input`,
  `wf-newform-hint`, `wf-newform-error`) have **zero** rules in `styles.css` — the branch was
  never even styled, consistent with being stale scaffold predating the `WorkflowSetup.vue` split.

**Consolidation:** delete the `createMode` branch (props, refs, `submitCreate`, template block)
from `WorkflowBuilder.vue`; drop `typeId`/`componentId` from its `Props` interface. `WorkflowSetup.vue`
is the one live creation surface (it also correctly handles the Triggered/Manual start-mode choice
that this dead branch never did). Risk: **safe-delete** — verified unreachable via both the props
schema and the registry, not just absence of a call site.

### 1.2 Dead "Run with input" JSON-mode-toggle + "Interface" popover CSS — SAFE DELETE
**File:** `app/styles.css:155-174` (`.wf-sim-input`, `.wf-sim-json`, `.wf-sim-modes`, `.wf-sim-mode`
/`.is-on`, `.wf-sim-note--warn`, `.wf-interface-pop`, `.wf-interface-json`)

None of these 7 classes appear in any `.vue` or `.ts` file in the tree (grepped individually). This
is the CSS residue of the pre-W10.2 design: a hand-rolled code/form mode toggle
(`.wf-sim-modes`/`.wf-sim-mode`) and a separate inline JSON textarea (`.wf-sim-json`) for the
Run-with-input dialog, plus a standalone "Interface" popover (`.wf-interface-pop`/
`.wf-interface-json`) — almost certainly the retired schema-metadata interface editor referenced in
the brief. Both were superseded: Run-with-input now mounts `SchemaEditor.vue` (`wf-sed-*` classes,
`WorkflowCanvas.vue:805-813`), and the interface is now declared solely through the Start/Finish/Error
boundary nodes' own `SchemaEditor` in `NodeConfigPanel.vue:465-472` — `WorkflowCanvas.vue:690-692`
says so explicitly: *"there is no separate schema-metadata editor."*

**Consolidation:** delete lines 155-174 of `styles.css`. Risk: **safe-delete** (pure CSS, zero
runtime references).

### 1.3 Two more never-applied CSS rules — SAFE DELETE
**File:** `app/styles.css:645` (`.wf-chiprow`), `:1113` (`.wf-panel-note--warn`)

Neither class is emitted by any component. `.wf-panel-note--warn` looks like an abandoned sibling
of the (actually used) `.wf-panel-hint--warn` (`NodeConfigPanel.vue:501`, `SchemaEditor.vue:198`).
Risk: **safe-delete**.

### 1.4 Trigger removal (W9) — verified clean, no leftovers
Grepped for `entryTriggerId`, `getTriggerInputs`, `interfaceSchema`/`metadataInterface`: zero hits.
Every remaining `trigger`-string reference is live and unrelated to the old in-canvas trigger node:
`WorkflowSetup.vue`'s Triggered/Manual start-mode (mounts the external `kickside-trigger-config`
tag by name, not a local component), `workflow-call.ts`'s `trigger_label` field on a *call*
candidate, and prose copy in `RunsPanel.vue`/`WorkflowCanvas.vue`. `types.ts:10-12` documents the
invariant explicitly ("There is no trigger kind"). No cleanup needed here — noting it as verified
since the brief specifically asked to hunt for it.

---

## 2. Schema-editor sprawl

`SchemaEditor.vue`'s own header comment states it is meant to be "the ONE component behind every
JSON-schema / JSON entry point." Verified every JSON/schema surface in the tree:

| Surface | Uses `SchemaEditor.vue`? |
|---|---|
| Boundary node schema (`NodeConfigPanel.vue:465-472`) | Yes |
| Run-with-input dialog (`WorkflowCanvas.vue:805-813`) | Yes |
| Agent **Exit schema** (`NodeConfigPanel.vue:622-632`) | **No — hand-rolled** |
| Agent **Run context** (`NodeConfigPanel.vue:634-644`) | **No — hand-rolled** |

### 2.1 Agent Exit schema / Run context — NEEDS-REWIRE
**File:** `app/NodeConfigPanel.vue:261-264` (refs), `:290-301` (commit fns), `:622-644` (template)

Both fields are raw `<textarea>` + `parseJsonObject` (`./json-field.ts`) called directly, bypassing
`SchemaEditor.vue` entirely — duplicating the exact JSON-parse/error-display logic
`SchemaEditor.vue` already implements (compare `NodeConfigPanel.vue:291-294`/`297-300` against
`SchemaEditor.vue:65-72`). Exit schema *is* a JSON schema (the agent's final output must satisfy
it) — the canonical `mode="schema"` case, which today also means it silently misses the AI-assist
affordance every other schema surface gets for free. Run context is a JSON value — a `mode="value"`
candidate (no driving schema, so it would render as code-only, same as it does now, but through the
shared component).

**Consolidation:** replace both textareas with `<SchemaEditor mode="schema" ...>` /
`<SchemaEditor mode="value" ...>`, dropping the local `agentExitSchemaText`/`agentExitSchemaError`/
`agentContextText`/`agentContextError` refs and their two commit functions in favor of `SchemaEditor`'s
`@change` event feeding `commitAgentField` directly. Risk: **needs-rewire** — mechanical, but touches
live agent-node config persistence; needs a pass to confirm empty-string vs `{}` unset semantics match
current behavior (`commitExitSchema`/`commitAgentContext` currently allow clearing the field via empty
text, `parseJsonObject('')` giving `{value: null, error: ''}` — `SchemaEditor.vue` always seeds `{}` on
empty via `seed()`, so the "unset back to no exit_schema" path needs to be preserved deliberately).

---

## 3. Helper/util duplication

### 3.1 "Parse a schema that may be a JSON string or an object" — 3 implementations — NEEDS-REWIRE
- **Canonical:** `platform/widgets/ui/src/app/ports.ts:86-90` (`export function parseSchema`) —
  already imported and used by `app/ext-config.ts:1`.
- **Duplicate 1:** `app/connect-validation.ts:20-34` (`function parse`) — same
  try/`JSON.parse`/catch-null logic, narrower local `JsonSchema` type.
- **Duplicate 2:** `app/workflow-call.ts:31-42` (`function parseSchema`) — same logic again, third
  implementation.

Functionally identical bodies (string → `JSON.parse` in a try/catch → object passthrough
otherwise), reimplemented three times instead of building on the widgets version already proven-in
by `ext-config.ts`.

**Consolidation:** have `connect-validation.ts` and `workflow-call.ts` import `parseSchema` from
`@widgets/app/ports` and cast/narrow locally instead of re-parsing. Risk: **needs-rewire**, low —
behavior is equivalent, but touches two files with their own unit tests
(`connect-validation.test.ts`, `workflow-call.test.ts`) that assert on the current local functions'
edge cases and need re-verifying against the shared one.

### 3.2 Handle-resolution / graph-sync — verified NOT duplicated
The brief specifically flagged risk of `renderedHandles`/`resolveHandle` existing in more than one
place after the edge fix. Grepped the whole tree: both are defined exactly once, in
`app/graph-sync.ts:411-424` and `:430-435`, and consumed only from within the same file
(`buildFlowData`, `buildFlowEdge`) and re-exported for `graph-sync.test.ts`. No second
implementation found anywhere (canvas, node components, or panel). This is correctly consolidated —
noting as verified-clean since it was called out as a specific risk area.

---

## 4. State/sync duplication — none found

`SyncEngine` (`app/sync.ts`) is the single source of truth for the document (nodes/edges/notes/
positions/params). `WorkflowCanvas.vue` holds no parallel node/edge array — `flowNodes`/`flowEdges`
are pure derived state rebuilt from `engine.doc` via `buildFlowData` on every mutation
(`rebuild()`, `WorkflowCanvas.vue:149-159`). Catalog is loaded once in `onMounted`
(`WorkflowCanvas.vue:720-734`) and passed down as a prop, no parallel catalog state anywhere else.
No findings here.

---

## 5. Component duplication

### 5.1 `NoteNode.vue` / `FrameNode.vue` resize boilerplate — LOW VALUE
**Files:** `app/nodes/NoteNode.vue:11-18`, `app/nodes/FrameNode.vue:11-19`

Both components independently declare the identical `hue = computed(() => noteHue(props.data.color))`,
the identical `persistSize = inject<PersistNoteSize | null>(PERSIST_NOTE_SIZE, null)`, and an
identical `onResizeEnd` handler (~10 lines each, byte-for-byte the same except `FrameNode.vue` also
derives a `title`). Templates are genuinely different (markdown body vs. click-through title strip)
so the components themselves shouldn't merge, but the resize wiring could be a 6-line composable
(e.g. `useNoteResize(id)` in `frame.ts`) shared by both. Risk: **safe rewrite**, cosmetic, low
value — flagging for completeness, not a priority.

### 5.2 `WorkflowCallPicker.vue` vs. widgets `PickerSelect.vue` — false alarm, keep separate
Checked whether the workflow-partial picker reinvents the shared `PickerSelect.vue`. It doesn't:
`PickerSelect.vue` is a collapsed single-select dropdown over a generic `PickerItem` shape;
`WorkflowCallPicker.vue` renders inline (no collapse) and carries workflow-specific logic with no
`PickerItem` analog — per-row schema-compatibility validation via `validateConnection`
(`WorkflowCallPicker.vue:48-64`) and published-version/draft-changes/I-O-summary badges
(`:81-90`, `:107-116`). Genuinely bespoke; no action.

### 5.3 "Install a template" modal vs. sibling UIs — false alarm, keep separate
No sibling module has an equivalent "browse templates → bind typed slots → install" flow. Knowledge's
KB-create dialog is an engine-selector, not a slotted-template installer; the only other "install from
catalog" surface in the platform is hub's module installer (system-package install — different
domain). `WorkflowList.vue` already correctly delegates slot pickers to shared `WcMount`/
`wc-component-picker` (`:362-368`) rather than inlining picker markup. No action.

---

## 6. Style duplication

### 6.1 `.kx-*` list/modal/table CSS — real, but platform-wide, not workflows-specific
`WorkflowList.vue`'s `.kx-list`/`.kx-modal`/`.kx-row`/`.kx-field` block (`styles.css` ~272-362)
duplicates near-identical CSS independently redefined per-module in at least
`platform/agents/ui/src/styles.css`, `platform/knowledge/ui/src/styles.css`,
`platform/mcp/ui/src/styles.css`, `platform/uploads/ui/src/styles.css`, and
`platform/inbox/ui/src/styles.css`. This is a systemic pattern across ~6-8 modules, not something a
workflows-only pass should try to fix in isolation (would need a shared stylesheet package). Noting
for a separate platform-wide ticket; **out of scope** for this audit's consolidation list.

---

## Ranked cleanup list (highest value first)

1. **Delete `WorkflowBuilder.vue`'s dead `createMode` creation branch** (§1.1) — unreachable code +
   unstyled dead template, zero risk, immediate LOC/confusion reduction for anyone reading the file
   as "how workflow creation works."
2. **Route Agent Exit schema / Run context through `SchemaEditor.vue`** (§2.1) — the one real "one
   WC" rule violation; also a user-facing gap (exit schema loses AI-assist today).
3. **Delete dead Run-with-input/Interface-popover CSS** (§1.2) — safe, and removes a red herring
   that reads as "the old interface editor must still be reachable somewhere."
4. **Consolidate `parseSchema`/`parse` on the widgets version** (§3.1) — removes 2 of 3 duplicate
   implementations of the same 8-line function.
5. **Delete `.wf-chiprow` / `.wf-panel-note--warn`** (§1.3) — trivial, bundle with #3.
6. **Extract `useNoteResize` for `NoteNode`/`FrameNode`** (§5.1) — cosmetic, do opportunistically.
7. Flag `.kx-*` CSS duplication (§6.1) as a platform-wide ticket, not a workflows fix.

Verified clean, no action needed: state/sync (single `SyncEngine`), handle-resolution
(`graph-sync.ts` only), trigger removal (no W9 leftovers), `WorkflowCallPicker`/template-install
modal (genuinely bespoke, not reinventing shared widgets).
