# Workflow + Inbox stateful visual audit

Status: workflow surfaces re-driven green after integration restart; compact Inbox shell
awaits the next coordinated restart because its generated app-main bundle initially landed
outside the serving static directory.

## Driven states

- Start schema AI draft: wide, 520px, 360px; light and dark; real Towers response.
- Inbox Review AI config draft: wide, 520px, 360px; light and dark; real Towers response.
- Inbox Review applied/Undo state: wide and 360px dark.
- Inbox pending item: wide, 520px, 360px dark.
- Inbox resolved item: wide and 360px dark.
- Existing H1/H2 composition evidence parsed rather than accepted from its prose verdict.

The browser recorded computed padding, radius, overflow, scroll extents, and control
geometry in `results.json` / `inbox-results.json`. No console errors occurred in either
drive.

## Defects found and fixed

1. Start's AI result was a cramped green 10px-padding block. It is now a calm neutral
   review surface with 14px breathing room, readable copy, a separated action footer,
   canonical 34px controls, and full-width compact actions.
2. Start's **Accept** was cosmetic: the draft emitted `change` before review. Drafts are
   now provisional. Accept alone commits; Undo restores without ever writing the rejected
   schema. Focused tests prove both event sequences.
3. External-node config preview had the same cramped treatment. It now uses a 14px card,
   row separators, bounded scrolling, a persistent action footer, and canonical controls.
4. Form schema changes rendered as minified JSON walls. JSON-schema objects now read as a
   concise field/required count; arbitrary nested settings remain fully readable and
   preformatted so human-owned values stay inspectable.
5. The applied state used a tiny `wf-ctl-sm` Undo inside a green strip. It now uses the
   standard secondary button in a neutral status box.
6. Drop collision used only top-left anchor distance (`64px`), so real 216px cards still
   overlapped pinned boundary nodes. Placement now checks full node rectangles and searches
   the nearest free slot. The live reproduction placed Inbox Review over Error and the
   minimap; the pure geometry regression test covers that class.
7. The global 14rem application rail left Inbox only 176px at a 360px viewport. The shell
   now auto-collapses to its 4rem icon rail below 640px without overwriting the user's saved
   desktop preference.
8. `workflow_decision` exposed **Dismiss** even though the workflow await contract accepts
   only approve/reject. Sent to the backend contract lane: declare exactly those two actions
   on both item-type declarations and test the descriptor.

## Evidence correction

The previous `composition_final_live_reverify/results-h1.json` did record off-viewport cards
at compact sizes while its prose verdict ignored that field. Source inspection resolves the
semantics: `canvas-fit.ts` deliberately enforces a readable `0.55` zoom floor and explicitly
states that large graphs overflow, navigated by minimap/pan. A fresh 360px TB drive confirms
zero label overlaps, zero node overlaps, and the 12-port loop member inside its container;
some cards remain off-viewport as the declared navigation behavior, not DOM clipping. It
would be dishonest either to call the field empty or to lower cards below the readability
floor just to satisfy the metric.

## Post-integration live results

- Real Start/schema and Inbox/config AI requests: PASS, 9 visual states, 0 console errors.
- Start review computed style: `10px` alert radius, `14px` padding, separated action footer.
- Config review computed style: `14px` card radius, `14px` padding, bounded scroll + footer.
- Applied status: `10px` message radius with canonical secondary Undo.
- Provisional draft discarded by reload: PASS; rejected field absent.
- Undo without persistence: PASS; rejected field absent.
- Real principal selected through `wc-principal-picker` and hydrated after reload: PASS.
- Inbox Review drop clears every pinned boundary card: PASS.
- Inbox decision exposes Approve/Reject only: PASS; invalid Dismiss removed.
- Inbox pending/resolved decision matrix: 12/12 states at 1440/520/360, light/dark,
  zero console errors. Compact shell gives the component 306px at 360 (previously 176px).
- Decision actions: canonical 8px radius / 34px height in every viewport and theme.
- H2 intent overlay: initial, delayed drafting, directed error, and 14-row preview stay
  inside the canvas at all four corners; no stacking collisions, zero console errors.
- H2 auto-map: real drag renders the 14-pair reveal and persistent trace; both contained.
- H1 compact: zero node overlap, zero label overlap, loop member contained. Cards outside
  the viewport remain the documented readable-zoom/minimap behavior.

## Final computed-cascade defect

The live control sweep found focused workflow textareas computed to `4px` while their resting
radius was `8px`. The cause was a global `:host :focus-visible` rule mutating radius. The rule
now adds only outline/offset and never changes shape; a package-wide cascade test rejects any
future focus selector declaring `border-radius`. Focused tests are 17/17 and the production
bundle is built; one final restart is required for live 8px confirmation.

An adjacent backend metadata issue was reported separately: informational
`workflow_reconciliation_failure` items inherit the full Approve/Reject/Dismiss set because
their item-type declaration has no `actions`; they should expose Dismiss only. This does not
affect the workflow-decision cards graded above.

## Verification completed before restart

- Workflows UI full suite: 67 files, 557 tests green.
- New focused state/placement suite: 25 tests green.
- Workflow radius guardrail green.
- Workflow production build green.
- App shell full suite: 4 files, 25 tests green.
- App shell typecheck and production build green.

## Required final live pass

After the next coordinated restart: confirm the app-main serving-static sync gives Inbox a
4rem navigation rail at 360px; recapture pending/resolved compact light/dark; complete the H2
overlay matrix; then consume the main restart driver's accepted/rejected terminal proof.
