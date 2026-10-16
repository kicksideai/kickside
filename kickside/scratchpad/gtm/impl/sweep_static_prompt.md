You are a hostile static UI-code auditor. Audit these source trees for visual-defect risks:
- platform/workflows/ui/src (the workflow builder SPA)
- platform/widgets/ui/src (shared widgets used by it, incl. flow-points WC)
- platform/recipes/ui/src (trigger/recipe config surfaces)
- platform/automation/ui/src (automation surfaces)

THE DESIGN CANON (each violation = one defect row):
1. Border radius: 8px buttons/inputs/controls; 6px chips/tags; 999px pills/toggles; 14px cards/modals; 11px icon tiles; 10px alerts. Defects include: wrong value, AND interactive elements (button, a[role=button], input, select, textarea, clickable divs) with NO border-radius declared anywhere in their style chain (renders square).
2. Cramped layout risk: text containers or button rows with padding < 8px, gap < 6px between adjacent buttons, or no padding at all on bordered/filled blocks that contain text. Pay special attention to TRANSIENT/RESULT states: AI-assist suggestion blocks, inline success/error confirmations, popovers, toasts - states rendered conditionally (v-if/v-show) are where resting-surface review missed defects. One confirmed example: the SchemaEditor.vue AI-assist result block (green, Accept/Undo buttons) is cramped with non-canon button corners - find it AND every sibling pattern like it.
3. Hardcoded colors (hex/rgb not via --p-* tokens) in component styles.
4. UI copy violations: any user-visible string containing architecture words: pure, definition(s), binding, runner, contract, lowering, spawned, CQRS, arena, intrinsic, primitive, registry, DAG, lineage, envelope, resolver, invocation. Check template text, placeholder, title, aria-label, toast messages, empty states, confirm dialogs.
5. Inline style= attributes carrying radius/color/padding that bypass the stylesheet canon.
6. Duplicated near-identical style blocks across components that have drifted (same visual role, different values).

METHOD: read every .vue/.ts/.css file in the four trees. For each conditionally-rendered block (v-if/v-else/v-show), check ITS styles specifically - do not stop at the default branch. Grep is a starting point, but you must open the files and judge the actual style chains (scoped styles, class bindings, shared classes from widgets).

OUTPUT: write scratchpad/gtm/impl/ui_state_sweep_static.md with a numbered defect table:
| # | File:line | Component/state | Defect | Canon rule | Suggested fix (one line) |
Severity-ordered (user-facing interactive states first). End with: files audited count, and a list of conditional/transient UI states you found in code (v-if result states, popovers, toasts) so the browser lane can cross-check coverage. Do not fix anything. Do not touch any file except writing the report.
