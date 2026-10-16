# Lane F1 — workflows UI visual canon fixes

| Row | Files touched | Fix |
|---:|---|---|
| 1 | `styles/controls.css`, `styles/runs.css`, `styles/vueflow.css`, action call-site Vue files | Replaced the shared chip actions with `wf-action-btn`; all named actions now use the 8px control class and the obsolete chip classes are removed. |
| 2 | `styles/schema.css`, `SchemaEditor.vue` | Made the draft confirmation a 10px result block with an 8px, wrapping action row. |
| 3 | `styles/schema.css` | Set schema view segment controls to 8px radius and 8px vertical padding. |
| 4 | `styles/runs.css` | Set run tabs to 6px gap, 8px padding, and 8px radius. |
| 5 | `styles/controls.css` | Made banner close controls 8px-radius, 32px hit targets with 8px padding. |
| 6 | `styles/canvas.css` | Set intent actions to 8px vertical padding and wrapped their action rows. |
| 7 | `styles/canvas.css` | Expanded trace and dismiss controls to 8px-radius, 8px-padding controls. |
| 8 | `styles/runs.css` | Added 8px radius and padding to payload toggle, copy, and expansion controls. |
| 9 | `styles/runs.css` | Added 8px-radius, 8px-padding treatment to hierarchy and retry controls. |
| 10 | `styles/panels.css`, `styles/runs.css` | Standardized disclosures, swap links, raw-details summaries, and run tabs as rounded controls. |
| 11 | `styles/runs.css` | Raised run and version picker row padding to 8px. |
| 12 | `styles/palette.css` | Set category and subcategory controls to 8px radius and vertical padding. |
| 23 | `styles/panels.css`, `styles/nodes.css` | Added explicit 8px radius to workflow checkbox inputs. |
| 26 | `styles/list.css` | Made the row menu a 14px popover with 8px outer and item padding. |
| 27 | `styles/nodes.css` | Set the triggered setup block to the 14px card radius. |
| 28 | `styles/vueflow.css`, `styles/nodes.css` | Scoped the zero-radius reset to direct VueFlow positioning wrappers; rendered node cards retain their 14px radius. |
| 31 | `styles/tokens.css` | Removed contrast/shadow literals and derived workflow surfaces, contrast, and elevation from `--p-*` tokens. |
| 32 | `styles/controls.css`, `styles/canvas.css`, `styles/nodes.css`, `styles/vueflow.css` | Replaced contrast and shadow literals with host-derived tokens and `color-mix`. |
| 33 | `styles/panels.css`, `styles/list.css` | Replaced fixed-color SVG select chevrons with `currentColor` CSS-gradient chevrons. |
| 34 | `WorkflowSetup.vue` | Changed the triggered-mode hint to “incoming events.” |
| 37 | `WorkflowNode.vue`, `NoteNode.vue`, `FrameNode.vue`, `NodeConfigPanel.vue`, `NotePanel.vue`, `catalog/kinds.ts`, `mapping/graph-sync.ts`, `styles/nodes.css` | Replaced inline hue variables with named hue and swatch classes; inline styles no longer carry those colors. |

The radius guardrail now asserts the canonical radius for every fixed control, result block, card, input, menu, and the scoped VueFlow wrapper.

## Verification

`cd platform/workflows/ui && npx vitest run`

```text
Test Files  54 passed (54)
Tests  481 passed (481)
Duration  1.75s
```

`cd platform/workflows/ui && npm run build`

```text
✓ 231 modules transformed.
✓ built in 1.92s
```
