# Workflow UI hostile state audit

Read-only source review of `platform/workflows/ui/src` on 2026-07-11. I inspected every Vue conditional/transient branch and the complete CSS radius/color surface. The worktree already contained an uncommitted radius/layout fix batch while this audit ran; those edits are called out separately and are **not treated as verified product state**.

## Verdict

The current radius test is a value allowlist, not a semantic canon. It proves that a declaration uses one of `0,2,4,6,8,10,11,14,999`, but it cannot detect a button using `999`, an alert using `8`, a card using `8`, or a badge using `999`. That is how the UI passed while the first transient state a user opened still had visibly wrong controls.

The highest-risk state is exactly the reported schema-assist result. At HEAD it used a cramped single flex row and inherited stadium-shaped `wf-chip` buttons. A dirty-tree change now separates the actions and changes the shared chip radius, but that broad shared-class change still needs state-by-state browser verification.

## Findings

### Critical / high

| Severity | File:line | State | Finding | Required fix |
|---|---|---|---|---|
| Critical | `app/panels/SchemaEditor.vue:229-235`, `styles/schema.css:19-28`, `styles/panels.css:135-144` | AI schema draft returned | HEAD lays icon, note, Accept, and Undo in one compact row; both actions inherit the shared chip style that was `999px`. This is the reported green cramped block. Dirty-tree remediation changes it to a two-row grid and 8px controls, but it is not committed or browser-proven. | Keep message and actions on separate rows, put Undo before a clearly primary Accept, use 8px controls and 10px result alert, verify at 312px inspector width with short and wrapping assist notes. |
| High | `radius-canon.test.ts:13-19,66-75,78-103` | All states | The test only checks whether a radius value is sanctioned. It has no selector/DOM role classification and therefore blessed every wrong role/value pairing above. It also scans declarations, not computed style, so inheritance and runtime-mounted external controls escape. | Add semantic rules: interactive controls 8; tags/badges 6; alerts/status results 10; cards/popovers 14; 999 only switches, dots, truly circular controls. Fail with selector + expected role. Add mounted computed-style tests for transient states. |
| High | `styles/dialogs.css:8-12`; `app/list/TemplatesModal.vue:127` | Template catalog populated | `.wf-tpl-card` is an actual selectable card but uses 8px control radius. | Change to 14px; browser-check hover, selected/install transition, and narrow modal. |
| High | `styles/embed.css:9-13`; `app/embed/EmbedWorkflow.vue:200-204` | Embedded workflow cannot resolve / directed refusal | `.wf-embed-directed` is an alert/status block with 8px radius. | Use 10px alert radius and test the resolve-error state, not only ready/running. |
| High | `styles/runs.css:192-205`; `app/runs/RunNodeOutput.vue:141-153` | Selected node failed | `.wf-run-fail` is an error alert but uses 8px; at HEAD its error-code badge used 999px. The dirty tree changes only the badge to 6px, leaving the alert wrong. | Use 10px for failure alert, 6px for code badge; verify long message, missing detail, structured detail, and dark theme. |
| High | `styles/vueflow.css:117-130`; `app/panels/EdgePanel.vue:87-110` | Edge mapping compatible, mismatched, neutral, assist error | `.wf-assist`, including mismatch and success status cards, uses 8px. It is semantically an alert/result region. | Use 10px for mismatch/ok result blocks; leave the neutral action unboxed; verify all four branches. |
| High | `styles/palette.css:58`; `app/catalog/Palette.vue:167-170` | Node catalog partially fails | At HEAD `.wf-palette-errors` uses 8px although it is an alert. Dirty tree changes it to 10px but remains uncommitted/unverified. | Keep 10px and drive the partial-catalog failure state in the browser. |
| High | `styles/runs.css:243-253`; `app/canvas/WorkflowCanvas.vue:789-793` | Viewing a failed run on canvas | At HEAD `.wf-run-fail-strip` is a full-width alert rendered as a 999px capsule, which becomes especially bad with a long failure reason plus View details. Dirty tree changes it to 10px/padding but is not verified. | Use 10px, allow text to wrap without squeezing the action, and test long error text at narrow canvas widths. |

### Medium

| Severity | File:line | State | Finding | Required fix |
|---|---|---|---|---|
| Medium | `styles/canvas.css:71-73,133-137`; `app/canvas/AutoMapReveal.vue:52-62`; `app/canvas/EdgeIntentPopover.vue:99-106` | Auto-map reveal and intent preview | Source/target pair tokens are tags but use 8px control radius. | Use 6px tag radius. Verify long dotted field paths and 3+ mapping rows do not crowd or overflow. |
| Medium | `styles/canvas.css:79-99`; `app/canvas/AutoMapReveal.vue:68-82` | Persistent auto-map trace / why popover | HEAD uses 999px on the trace container, trace action, and dismiss action. Dirty tree broadly changes these to 8px, but the container is a compact trace badge while its actions are controls; one shared value still erases roles. The “why” overlay uses 8px though it is a popover/card. | Trace badge 6px, action and dismiss controls 8px, why popover 14px. Test hover, keyboard focus, pinned-open, and dismiss. |
| Medium | `styles/runs.css:55-59,177-181`; `app/runs/RunNodeOutput.vue:157-169`; `app/runs/RunPayload.vue:40-59` | Run input/output/error/tool-call payloads | Read-only payload/result surfaces use 8px even though they are nested content cards. Copy/expand actions were 999px at HEAD (dirty tree changes them to 8px). | Use 14px for payload/markdown cards, 8px for copy/show-more actions. Verify expanded/truncated/string/object variants. |
| Medium | `styles/runs.css:96-100`; `app/runs/VersionHistoryPanel.vue:127-131` | Version history draft status | `.wf-vers-draft` is a status alert but uses 8px. | Use 10px; check both “unpublished edits” and “nothing to publish” states. |
| Medium | `styles/runs.css:84-91`; `app/runs/RunTimeline.vue:42-53` | Timeline populated / raw event expanded | Each timeline event and raw event payload uses 8px despite acting as nested cards. | Use 14px for event card; use 8px only for code/pre structural inset if intentionally treated as a field. Verify expanded raw events and pagination. |
| Medium | `styles/panels.css:108-132`; `app/panels/HumanNodePanel.vue:157-196` | Human form fields and preview | Each `.wf-hf-field` and preview is a card-like builder block but uses 8px. | Use 14px for field/preview cards; retain 8px for delete/add controls. Check select-options branch, required toggle, and 4+ fields. |
| Medium | `styles/panels.css:152-155`; `app/panels/WorkflowCallPicker.vue:76-89` | A workflow is selected in Call workflow | `.wf-callpick-selected` is a selected workflow summary card but uses 8px. | Use 14px; keep its status badges at 6px. Verify draft-change and compatibility badges together. |
| Medium | `styles/list.css:279-286`; `app/list/WorkflowTable.vue:198-225` | Row overflow menu / destructive confirmation | `.wf-row-menu` uses 10px although it is a floating card/menu (14px canon); confirmation alert at `.wf-delete-confirm` correctly uses 10px. | Change only menu container to 14px; keep confirm alert 10px and menu item controls 8px. |
| Medium | `styles/canvas.css:40-43`, `styles/controls.css:17-22`, `styles/nodes.css:43-45,62-76,86-89` | Connect validity hints, primary actions, node run/failure badges | Direct `#fff/#000/rgba(...)` values bypass semantic contrast/elevation tokens. Several are theme-sensitive action/status states. | Introduce/use contrast and shadow tokens; retain literal colors only inside token definitions. Test light, dark, and forced/high contrast. |

### Copy / abstraction leaks

| Severity | File:line | State | Finding | Required fix |
|---|---|---|---|---|
| High | `app/list/TemplatesModal.vue:117,131,134,141` | Template browse/install | User copy exposes implementation vocabulary: “Bind its slots,” “portable workflows,” “P1a,” and “slots to bind.” | Replace with task language (“Choose what this template should use,” “ready-made workflows,” capability names). Never display `P1a` or raw slot terminology. |
| High | `app/flow-points/FlowPoints.vue:73` | Component workflow setting | “Bind existing” exposes the binding abstraction. | Use “Choose workflow” or “Use another workflow.” |
| Medium | `app/list/ImportModal.vue:73` | Import opened | “portable workflow export” is internal portability vocabulary. | “Paste an exported workflow or choose a file. We’ll create a draft copy.” |
| Medium | `app/canvas/RunWithInputDialog.vue:31,45`; `app/embed/EmbedWorkflow.vue:240,276` | Simulate/embed no-input/no-result | “Start schema” and “payload” read like implementation details. | “Checks the expected input”; “needs no input”; “returned no result.” Keep JSON only behind the JSON editor toggle. |
| Medium | `app/panels/NodeConfigPanel.vue:255-263`; `app/panels/SchemaEditor.vue:213-237` | Start/Finish/Error inspector and schema assist | The primary editor repeatedly says “schema” and “A JSON schema,” even while the owner-facing action is “describe the expected input/result/error.” | Primary labels: Expected input / Result / Error details; assist placeholder “Describe the expected input…”; keep “JSON schema” as advanced/code-view help only. |
| Medium | `app/runs/VersionHistoryPanel.vue:187-192` | Version diff loaded | “Version graph delta,” “delta,” “Nodes,” and “Edges” expose the graph model in ordinary history UX. | “Changes between vX and vY,” “Steps added/removed/changed,” “Connections added/removed/changed.” |
| Medium | `app/runs/RunNodeOutput.vue:115,131`; `app/runs/RunPayload.vue` | Debug drawer | “Export redacted JSON,” “engine … parent … process …” is raw runtime vocabulary shown without an Advanced/technical disclosure. Technical debugging data is valuable, but currently competes with the actual failure reason. | Headline action “Download run details”; move engine/process ids and redaction/JSON wording under “Technical details.” |

## States with acceptable radius roles after source review

- Edge intent dialog itself: 14px card; its input/actions are 8px.
- Version compatibility and restore confirmation: 10px alerts.
- Add-trigger modal: 14px; success result: 10px.
- Flow-point row: 14px; directed incompatibility: 10px; point tag: 6px; actions: 8px.
- Standard dialogs (`kx-modal`) and workflow list container: 14px; standard controls: 8px.
- Boundary tag and call-picker status badges are 6px in the dirty tree (HEAD still had 999px for call-picker badges).

## Why `radius-canon.test.ts` failed as a guardrail

1. `SANCTIONED_PX` is a flat union; it encodes no mapping from semantic role to value.
2. `isSanctioned()` validates only the declaration value, never the selector or rendered element type.
3. `selectorAt()` is used only for error text/ALLOW matching; no selector-role assertions exist.
4. Inheritance is invisible. HEAD’s `SchemaEditor` buttons had no local radius; the bad 999px came from shared `.wf-chip`.
5. Mounted web components and runtime state classes are not rendered, so computed styles are never checked.
6. Mixed shorthand radii such as `14px 0 8px 0` pass because every token is individually sanctioned, regardless of element role.
7. The broad `calc(var(--wf-radius...))` ALLOW accepts any derived use based only on syntax, not selector intent.
8. No negative fixtures prove that wrong-but-sanctioned pairings fail (button/999, alert/8, card/8, badge/999).

### Required test structure

- Static semantic map with explicit selector families and expected radii, plus an allowlist keyed by exact file+selector+reason.
- Negative fixtures for each wrong role/value pairing.
- Vue mount tests that force every conditional state named above and assert `getComputedStyle(...).borderRadius` for the actual buttons/cards/alerts/tags.
- A browser state sweep at the 312px inspector width and at the responsive breakpoint; CSS tests cannot prove that action rows are not cramped.

## Dirty-tree note

During this audit, another lane modified `SchemaEditor.vue`, `schema.css`, `panels.css`, `controls.css`, plus radius declarations across canvas/runs/list/dialogs/palette. The changes address many of the obvious HEAD violations, including the reported Accept/Undo state, but they are neither committed nor sufficient evidence of coverage. Fix/review should diff against HEAD, preserve those edits, and re-drive every state in this report before declaring the UI polished.
