# Intent-edge connect experience (W11.1) — impl record

The flagship interaction: drop two steps, draw the line, and the system either maps it
silently (when obvious) or asks "what should flow here?" in a micro-popover, drafts the
mapping from your words, and applies it. Everything lowers onto the one expr-lang grammar
and the one assist family — no hidden runtime.

## Heuristic rule (the trust boundary)

`autoMap(sourceSchema, targetSchema, sourceRoot)` → AUTO only when **every required target
field has exactly one name+type-compatible source candidate** (canonical name match:
case/separator-folded, so `contactId`≡`contact_id`; type via the mapper's `typeCompatible`,
where an undeclared/`any` type never conflicts). Any required-field ambiguity — zero
candidates, a name match with the wrong type, or two candidates — blocks the silent apply
and hands off to the intent popover. Optional fields never gate the decision; they map
opportunistically when they too resolve uniquely. A target with no input fields, or one
whose only matches are optional-with-nothing-resolved, connects plainly (no affordance).

## What shipped

- `mapping/auto-map.ts` (pure) — the heuristic + per-field WHY strings. Reuses the shared
  `field-mapper` model (`targetFields`, `typeCompatible`, `buildObjectExpression`).
- `canvas/canvas-connect.ts` — pure `planConnect(doc, conn, layoutDir)` classifies a landed
  edge as `plain | auto | ambiguous` and builds the command batch (adds the transform update
  for `auto`). `useCanvasConnect` owns the intent state (one pending edge; a keyed auto-map
  provenance set), `decorateEdges` paints the pending/auto classes, `pruneIntent` drops dead
  provenance on rebuild.
- `canvas/EdgeIntentPopover.vue` — ambiguous flow: one-line intent input (teaching
  placeholder), `Draft` → the assist family → compact preview rows → `Apply` / `Open mapper`
  / `Dismiss`. Honest W13 degrade keeps the typed intent.
- `canvas/AutoMapReveal.vue` — auto affordance: a transient reveal card (source→target pills,
  visible without interaction) that settles after ~2.6s into a persistent "Mapped
  automatically — view" trace whose hover shows the per-field WHY and whose click opens the
  full mapper. Reduced-motion: static, no fade.
- `canvas/intent-copy.ts` — every string a one-sentence constant (logic-copy pattern).
- `panels/assist.ts` — `assistIntentMapping` posts the typed intent + both schemas to the
  READ-gated binding endpoint (the edge endpoint drops `intent`; binding forwards it — same
  assist family, `output`-rooted transform). No src Lua touched.
- CSS: `vueflow.css` pending flowing-dash (accent, ~0.22s, reduced-motion → static) + subtle
  auto edge; `canvas.css` popover / reveal / trace, tokens-only `--p-*`.

## Live proof (isolated Chrome, admin creds, on :8085)

Real mouse drags on a fresh Start·Finish·Error workflow (boundary node schemas set via the
inspector; connection drawn by dragging the handles). Screenshots in `scratchpad/gtm/intent_edge/`.

- AUTO — Start emits `{email, name}` → Finish requires `{email}`. Draw the line →
  `auto-01-reveal.png`: "Mapped automatically — Mapped 1 field by name and type" with the
  `email → email` pill pair. `auto-02-trace.png`: fades to the "Mapped automatically — view"
  trace. Edge carries `{ email: output.email }`.
- AMBIGUOUS — Start emits `{email, name}` → Finish requires `{recipient, subject}`. Draw the
  line → `amb-01-popover.png`: animated pending edge + "What should flow here? — Needs
  subject, recipient." Typed "use the email as the recipient and 'Welcome aboard' as the
  subject" (`amb-02/03`). First draft hit the 60s budget → `amb-04-result.png` honest W13
  degrade (intent preserved, "connection stays"). Redraft returned in-budget →
  `amb-05-redraft.png`: "Here's the mapping I drafted" `output.email → recipient`,
  `'Welcome aboard' → subject`. Apply → `amb-06-applied.png`: popover closed, pending
  animation stopped, edge settled with the transform.

Note: the assist LLM (class:fast) runs near the 60s FE budget locally — one draft timed out
and degraded honestly; the retry succeeded. The preview/apply logic itself is unit-covered.

## Verify

- vitest: 420 → 449 (+29: 18 heuristic incl. the near-miss cases, 5 `planConnect` flow, 3
  intent-assist, 3 copy). All green.
- vue-tsc: clean in all touched files (the 3 remaining errors — ports.ts, WorkflowSetup.vue,
  workflow_setup.ts — are the documented pre-existing baseline).
- `npm run build`: clean. Static rebuilt on disk (live app serves it); left unstaged per the
  shared-worktree convention — only source committed.

Bug found+fixed mid-build: `watch` was used but not imported in `WorkflowCanvas.vue`, which
broke the builder mount (caught live, not by the earlier `| tail`-masked vue-tsc run).
