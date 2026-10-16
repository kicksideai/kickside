# W15c FE Stage-1 — Combine logic node (frontend)

Commit `383e9ddd` on `main`, built on ui HEAD `0d642ef9`. Scoped, not pushed.
Backend contract fixed at `9e380137`; `platform/workflows/src` untouched, `app/wippy.lock` untouched, no production build, `static/` untouched.

## What renders

One **Combine** palette entry (Logic category, teal, `tabler:arrow-merge`) replaces the former Join and Merge entries. Its config panel is:

- A **When to continue** toggle: `wait_all` ("Wait for all — every incoming path must finish first") | `first_wins` ("First wins — continue as soon as one path arrives"), each with a one-line engine-honest description of the actual semantics (wait_all waits for every path then continues once; first_wins continues on the first arrival, reconverging Branch arms).
- A **Combine as** `output_mode` select (object | array), exposed per the contract, default object.

Both selects commit through `combineNodePatch`, which emits the backend-canonical shape: `kind='combine'`, `config = { mode, output_mode }` with the retired first-arrival flags stripped so `mode` is authoritative.

## Legacy render + heal

`kindDef` resolves retired kinds through `LEGACY_KIND_ALIAS` (`join`/`merge` -> `combine`), so a stored legacy node renders with the Combine identity (label, icon, hue) with no palette entry of its own — proven by `buildFlowData` giving a stored `join`/`merge` node `kindLabel: 'Combine'`.

`combine-node.ts` mirrors `logic_nodes.combine_mode` / `legacy_mode`:
- `join` -> `wait_all`, `merge` -> `first_wins`; a legacy Join carrying a first-arrival override (`first_arrival`/`strategy`/`merge_strategy`/`mode`) stays `first_wins`.
- `output_mode` preserved (default object).

On the first edit the panel sends `kind='combine'` + explicit `mode`/`output_mode`; the reducer merges `kind` on `node.update`, so the card heals to Combine optimistically, matching `heal_node_update` and `workflow_test.lua:124-130` (legacy `join {output_mode:array}` edit -> `combine{wait_all, array}`). Existing documents load correct and healable, same as `branch-node.ts` then/else.

## Guard-rail UX

`combineExclusiveBranchConflict(doc, nodeId)` (pure ts) returns the Branch id whose `true` AND `false` arms are the combine's only inputs (canonicalizing legacy then/else ports), else null. `WorkflowCanvas` resolves it over the whole graph and passes the Branch title to the panel; when `wait_all` is selected under that conflict, a directed warning names the Branch and steers to first-wins.

This is the direct-arm heuristic the contract asks the panel to discourage up front; it does not hard-block (the FE sees only direct arms, the compiler proves the transitive case). The backend's `combine_wait_all_exclusive_paths` refusal — message names the branch and directs to `first_wins` — surfaces on publish through the existing Branch-work error surface (`refusalMessage` -> `humanError` -> canvas error banner), no new code needed.

## Files

- new: `src/app/combine-node.ts`, `src/app/combine-node.test.ts`
- `src/app/kinds.ts` (combine KindDef, `LEGACY_KIND_ALIAS`, `kindDef` alias resolution)
- `src/app/catalog.ts` (one Combine STATIC_ITEM)
- `src/app/types.ts` (add `combine`; join/merge are legacy string kinds)
- `src/app/NodeConfigPanel.vue` (Combine block + guard hint; Branch/Parallel copy no longer says Join/Merge)
- `src/app/WorkflowCanvas.vue` (`selectedCombineConflict` prop)
- `src/styles.css` (combine palette/card hue)
- `src/app/graph-sync.test.ts` (vocabulary tests -> Combine)

## Verification

- vitest **273 passed** (baseline 255 + 18 new in `combine-node.test.ts`; `graph-sync.test.ts` net 0). Covers: canonical round-trip shape, legacy load + heal preserving output_mode, first-arrival override, guard predicate (both arms / same arm / two branches / non-branch input / <2 inputs / non-combine), warning copy.
- vue-tsc clean in every touched file. The 3 remaining repo errors (`widgets/ui/src/app/ports.ts`, `WorkflowSetup.vue`, `workflow_setup.ts`) are pre-existing baseline, unrelated to this change.
- **Build deferred / static-only**: no production build, `static/` untouched. Live backend on 8085 predates `9e380137`, so no live publish-verify; the canonical shape is proven statically against the backend's own tests/fixtures (`compile_test.lua:367-431`, `workflow_test.lua:110-136`).

## Withheld (not rendered, emitted, or scaffolded)

`for_each`, `call_workflow` rename, generalized failed port, `continue_on_error` — backend for these does not exist; `workflow_call` rendering unchanged.
