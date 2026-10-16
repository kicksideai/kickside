# Field mapper — the mapping-visibility build

The #1 gap vs n8n (raw expression text, guessed `output.*` paths, no field picker) is
closed by a shared schema-aware field mapper deployed at every builder mapping surface.

## What shipped

One implementation, in the shared widgets layer (both apps consume `@widgets/app/*` from
source):

- `platform/widgets/ui/src/app/field-mapper.ts` — the pure model. Source pill tree
  (nested, dotted paths, root-prefixed `output.x` / `input.x`), target field rows,
  static-literal + expression compile into the ONE grammar (`{ key: <rhs> }`), required
  tracking, completeness line, `typeCompatible`/`pillCompat`, and a depth/quote-aware
  `parseObjectExpression`/`seedRows` so a stored transform round-trips back into rows (a
  complex or extra-key expression is preserved verbatim as raw).
- `platform/widgets/ui/src/app/FieldMapper.vue` + `field-mapper.css` — the two-column
  component. SOURCE pills (name + type, nested expandable) → click-a-pill-then-a-row or
  drag = map; TARGET rows with a REQUIRED marker, unmapped-required rows visually loud,
  per-row static value, per-row expression escape hatch (prefilled by the pill, stays
  editable), a whole-transform raw toggle, a live completeness line, and an AI-draft
  button. Keyboard-navigable (native controls, focus rings, Esc clears the armed pill),
  tokens-only `--p-*`, calm.

Deployed at:
1. Edge transform panel — `platform/workflows/ui/src/app/NodeConfigPanel.vue`. Replaces
   the raw transform textarea (the routing `when` condition stays; the raw expression
   stays reachable via the mapper's escape hatch). AI draft runs the existing
   `assist_edge` pipeline; FE budget raised to 60s with an honest pending/degrade state
   (`assist.ts`).
2. Recipes assembler payload→Start step — `platform/recipes/ui/src/app/RecipeConfig.vue`.
   Same component, `source-root="input"`, source pills from the trigger context schema
   (periodic point gets a fallback context schema). No AI button here — see src handoff.
3. Run-with-input left as the schema-form (not a mapping), per spec.

## Consolidation (no parallel model)

- `platform/recipes/ui/src/assembler.ts` no longer carries its own mapping primitives; it
  re-exports the widgets model (`startFields`=`targetFields`, `MappingField`,
  `mappingFieldExpr`, `defaultMappingFields`, `unmappedRequired`) and wraps
  `buildObjectExpression` into the binding `mapping_spec`.
- `connect-validation.ts` reuses the model's `typeCompatible` (one type-compat rule; the
  connect badge and the mapper's per-pair verdict can't diverge).

## Verify

- Tests green: widgets 62→90 (+28: 27 model/interaction + FieldMapper smoke), workflows
  390, recipes 24. New pure-model coverage: pill→expression, required tracking, type
  compat, nested paths, object round-trip, seedRows.
- vue-tsc: no new errors in touched files (pre-existing baseline errors in ports.ts,
  WorkflowSetup.vue, workflow_setup.ts, recipeConfig.ts are unrelated).
- `npm run build` clean for widgets, workflows, recipes.
- Live: the running app on :8085 serves the mapper — `/kickside-workflows/index.js` and
  `/kickside-recipes/recipe-config.js` both contain it (fs.directory live-disk serve).
  Authenticated in-app edge screenshot was not reachable (shared MCP browser locked by
  another session; form login needs credentials not available). Instead the REAL
  component + REAL css were rendered with sandwich-shaped schemas in an isolated Chromium:
  `scratchpad/mapper/mapper-before-unmapped.png` (3 required loud), `-after-mapped.png`
  (each row shows its `output.*` path, completeness clears), `-armed-expanded.png` (nested
  `contact` expanded, `output.summary` armed, every row a drop target).

## Src handoffs

1. `platform/workflows/src/assist.lua:20` — `LLM_TIMEOUT_SECONDS = 20` (×`LLM_ATTEMPTS = 2`).
   The towers model outruns a single 20s attempt; bump the per-attempt LLM timeout (~45–60s)
   so a slow draft completes within the FE's 60s budget instead of retry-failing.
2. Recipes AI draft: the only mapping-assist endpoint (`assist_edge`) is WRITE-gated to the
   workflow, which an automation creator over a published workflow often can't write. A
   read-gated binding-mapping assist (actor-gated, taking context + Start schemas — the one
   assist family per W11.3) is needed before the recipes mapper can carry the AI button.

Commit `8bf6c308` (branch `field-mapper-work`), scoped to source files, not pushed. The
static bundles were rebuilt on disk (so the live app serves it) but left unstaged — the
shared worktree has concurrent writers, so only source was committed.
