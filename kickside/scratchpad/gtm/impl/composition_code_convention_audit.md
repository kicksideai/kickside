# Composition wave — code/convention audit

Scope: current working tree in `platform/workflows/ui`, `platform/widgets/ui`, `platform/automation/ui`, and `platform/agents/ui`. Read-only review after the modal QA fixes. Findings below prioritize defects introduced or made load-bearing by this wave; older debt is separated.

## Verdict

No source/runtime mismatch blocker was found: the current workflow and agent static bundles contain the new trigger scroll owner, responsive canvas CSS, and Agent modal focus contract. `git diff --check` is clean for the four packages.

There are **four high-priority gaps** before this composition work should be treated as a durable platform contract.

## High — introduced / load-bearing

### H1. Variable node width has two competing geometry models

`nodeWidthForPorts()` grows cards to 272/304px (`graph-sync.ts:38-45`) and `WorkflowNode.vue:28-35,54` renders that width. Auto-layout uses it (`graph-sync.ts:547-567`), but container and drag geometry still hard-code `NODE_W = 216`: `boxFor()` at `graph-sync.ts:202-218`, `clampRegionFor()` at `262-283`, and the default in `clampToRegion()` at `285-292`.

Result: a multi-output node can be laid out at one width while its loop/for-each container, membership hit area, and drag clamp reason about another. The wider card can visibly escape its declared container or be clamped with its right side outside the region.

The label capacity rule also stops at 304px regardless of declaration size (`graph-sync.ts:41-45`). `WorkflowNode.vue:33-36` imposes a 64px minimum label width while `nodes.css:312-323` places all labels on one flex row. Five or more ports cannot satisfy both constraints; 12 declared outputs get ~25px centers with 64px labels and necessarily overlap. The test currently asserts the 304px cap (`graph-sync.test.ts:16-21`) rather than testing non-overlap.

Minimal rectification: define one `nodeDimensions(node)` function and use it in renderer data, dagre, `boxFor`, `clampRegionFor`, and drag-clamp calls. Either remove the arbitrary 304px cap or switch high-cardinality outputs to a readable stacked/collapsed port presentation. Add geometry tests for 4/8/12 ports inside containers, not only numeric width assertions.

### H2. Edge-overlay placement uses guessed heights for dynamic content

`WorkflowCanvas.vue:543-553` clamps the ambiguous intent panel as if it were always 260px tall and the automatic-map reveal as if it were 210px. Both surfaces are content-sized: intent can add errors, raw output, and up to 180px of preview rows (`styles/canvas.css:121-168`), while automatic mapping can render an arbitrary number of pairs (`canvas.css:75-94`). The pure tests only feed the same assumed numbers (`overlay-placement.test.ts:4-18`).

Result: the anchor can be mathematically “clamped” while the real rendered panel still crosses the top rail or canvas edge. This is the same class of state-dependent miss the visual sweep was intended to eliminate.

Minimal rectification: make placement own the rendered element, measure after mount, and re-place through a `ResizeObserver` when assist results change its height. Prefer the existing shared anchored-surface primitive over another estimated-size path. Add a browser test with maximum preview/error content at every canvas edge.

### H3. Compact toolbar commands destroy keyboard focus before opening the next surface

The new More menu correctly focuses its first action and handles arrows/Escape (`CanvasToolbar.vue:44-83`), but `choose()` calls `closeMore()` without focus restoration, then emits (`63-66`). The focused menu item is removed. For Add Trigger, Share, Runs, and History this means the next modal/popover records `BODY` (or a disconnected item) as its previous focus; closing cannot return to More. For non-modal actions, keyboard focus simply disappears. The tests verify Escape restoration but explicitly omit command restoration (`canvas-toolbar.test.ts:43-59`).

Minimal rectification: make command activation async: close, await the DOM update, focus More, then emit the command (or pass an explicit restore target into the opened surface). Add an Enter-on-Add-trigger test proving close returns to More, plus a non-modal Fit test proving focus remains stable. Close the menu on Tab/focusout as well.

### H4. The shared modal utility does not inert across a shadow-root boundary

`useModalDialog.ts:67-81` walks only `parentElement`. When the dialog is inside a web component shadow root, traversal stops at the shadow root and never reaches the host’s parent tree. Siblings inside the component are inerted, but the shell/navigation outside the custom-element host remains exposed to pointer and accessibility-tree interaction. The document-level focus listener hides part of this from keyboard tests, so the current tests pass without proving composed-tree isolation (`useModalDialog.spec.ts:32-58`; `AgentForm.modal.spec.ts:22-55`).

Minimal rectification: traverse composed ancestry: when `parentNode` is a `ShadowRoot`, continue via `parent.host`, inerting siblings at every light/shadow boundary. Add a test mounting the modal inside an open shadow root with a focusable sibling outside the host, and assert that sibling becomes inert and is restored.

## Medium

### M1. Responsive tests mostly test source spelling, not composition

`workflows/app/responsive-layout.test.ts:42-102`, `automation/responsive-layout.test.ts:8-18`, and `AgentForm.modal.spec.ts:57-66` read CSS/source text and assert that declarations exist. They do not establish computed layout, clipping, stacking, or scroll ownership. This is especially risky because the prior Add Trigger implementation had the expected-looking declarations while live rendering was 136px × 2420px.

Rectification: retain small pure tests for breakpoints, but add browser-level fixture tests that assert bounding rectangles, overflow, and overlap at 320/360/520/980 with the transient states open.

### M2. Picker placement has a shared algorithm but not a shared lifecycle owner

`AnchoredPanel.vue:37-105` owns placement/outside-click/Escape/reflow, yet IconPicker (`IconPicker.vue:64-112`), ModelPicker (`model-picker/ModelPicker.vue:72-120`), ConnectionPicker, ComponentPicker, ChannelPicker, and MultiSelect repeat the same document/window listener lifecycle. Every mounted closed picker keeps four global listeners; cleanup is correct, but ownership and behavior can drift.

Rectification: converge pickers on AnchoredPanel (or a shared `useAnchoredOverlay` composable) so placement, open-only listener attachment, Escape, focus return, and shadow `composedPath()` semantics live once.

### M3. Embedded AgentForm claims modal semantics without owning a modal

`AgentForm.vue:37-38` correctly disables `useModalDialog` when embedded, but the template always renders `role="dialog" aria-modal="true"` (`382-383`). In embedded mode the outer owner is supposed to provide popup/modal semantics, so this creates an aria-modal surface with no corresponding focus/inert contract.

Rectification: conditionally apply dialog/aria-modal only when `!embedded`, or make the outer owner the single declared modal and render AgentForm as a form section.

### M4. Hot files remain above the project’s decomposition bar

`automation/ui/src/app/automations.vue` is 1400 lines (1292 at HEAD) while the new builder is another 551 lines; `graph-sync.ts` is 570 lines; `WorkflowCanvas.vue` is improved but still 845 lines. The current wave added modal-stack, fixed-menu, and responsive concerns without fully extracting existing manager responsibilities.

Rectification: extract Automation modal state/custom-element mounting into composables and modal components; split graph geometry from VueFlow adaptation. Preserve the current public imports as facades.

### M5. Workflow radius guardrail duplicates the shared scanner

Automation and other packages use `registerRadiusCanon`, but workflows retains a second ~200-line scanner in `workflows/ui/src/radius-canon.test.ts` while widgets owns the canonical implementation in `widgets/ui/src/app/radiusCanon.ts`. The expanded role list is useful; the duplicated parser/resolver is not.

Rectification: pass workflow `required` roles and documented allows into `registerRadiusCanon`; keep one scanner/parser.

## Pre-existing debt carried forward (not caused by this wave)

- Workflow row menus already lacked a complete keyboard-menu contract. The new fixed layer solves clipping, but `WorkflowTable.vue:79-112,223-258` still does not focus the first menu item, handle Escape/arrows, restore the row action button, or declare `aria-haspopup="menu"`.
- Agent styling still contains module-local literal capability colors and `#fff`/RGBA shadows (`agents/ui/src/styles.css:125,137,390-401`). The responsive/modal change did not introduce them, but they remain outside the universal token claim.
- `useResponsiveRails` schedules two animation frames without cancellation (`use-responsive-rails.ts:20-27,60-63`). The generation check prevents stale reframes, but an unmounted component can still retain callbacks briefly; low-risk cleanup debt.

## What is structurally good

- Canvas toolbar extraction reduced `WorkflowCanvas.vue` from 858 to 845 lines while keeping mutation ownership in the canvas.
- JS and CSS responsive thresholds align at 1180/640, and the `ResizeObserver` is disconnected on unmount.
- `AnchoredPlacement` is a pure public geometry contract with real edge-case tests; live QA confirmed Icon/Model placement at all four viewport edges.
- Modal integrations now use one shared focus/scroll stack; Agent and Add Trigger fixes are present in both source and generated runtime bundles.
- Global event listeners added in this wave have matching unmount cleanup; `git diff --check` is clean.
