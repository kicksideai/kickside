# W15 (a)+(b) — Branch contract repair + logic-node port clarity

Frontend lane, `platform/workflows/ui`. Two scoped commits on current HEAD (base
`5dc7828e`, then rebased-forward over the backend lane's `95229486`). vitest 206 baseline
→ 223 green. vue-tsc: 3 pre-existing errors in untouched files, none in touched files.
No production build (live 8085 keeps serving the old bundle) — see build-deferred note.

Commits:
- `d101071a` workflows/ui: repair Branch publish contract (W15a)
- `79e012e5` workflows/ui: logic-node port clarity pass (W15b)

---

## STAGE A — Branch publish contract repair

**The break (from the audit, reproduced live below):** the compiler requires
`config.predicate` on the node and arms leaving ports named exactly `true`/`false`
(`graph.lua`). The shipped UI offered no predicate field, emitted `then`/`else` ports, and
the panel told the user to "set the condition on the True connection" — a dead end
(`branch_predicate_missing`, then `branch_port_unknown`).

**Fix (presentation contract only — no backend change; the compiler already accepts the
valid shape):**
- `kinds.ts`: branch arm ports `then`/`else` → `true`/`false` (labels stay True/False).
- `branch-node.ts` (new, mirrors `human-node.ts`): `readBranchPredicate` /
  `branchConfigPatch` (the round-trip), `canonicalBranchPort` + `BRANCH_LEGACY_ARM_ALIAS`
  (then→true, else→false), `branchArmRewrites` (the heal command set).
- `NodeConfigPanel.vue`: an on-node **Condition** field (the module's `wf-input wf-mono`
  expression affordance, same as edge `when_expr`) writing `config.predicate`; the
  placeholder `output.status == 'ok'` is in scope (branch predicate compiles over the
  upstream output, same scope as an edge condition). Panel copy now states the true/false
  routing and no longer instructs the retired edge-condition model.
- `graph-sync.ts`: a legacy `then`/`else` arm renders on its canonical `true`/`false`
  handle (`canonicalBranchPort`), so a pre-fix branch loads correct-side and never
  dangling (VueFlow keeps the edges layer).
- `WorkflowCanvas.vue`: `select()` heals a legacy branch on open — applies
  `branchArmRewrites` (then→true, else→false) via `edge.update`. Idempotent (a canonical
  branch yields no rewrites); never while viewing a past run.

**Legacy migration (how it heals):** a stored branch built before this fix has then/else
arms AND no predicate — per the audit's probes 1/2 such a branch was **never publishable**,
so there are no working legacy branches to preserve. On load its arms alias to true/false
(render-correct, no explosion). Opening it (a) heals the stored arm ports to true/false via
`branchArmRewrites`, and (b) surfaces the now-present Condition field; entering the
predicate completes the publishable shape. Proven end-to-end below.

**Live publish proof** (read-only on existing workflows; new throwaway workflows via the
same API the builder uses; token = `scratchpad/gtm/.tok`):

| Fixture | Shape | Result |
|---|---|---|
| `W15 VERIFY — branch` (`019f48f7…`) | the document the fixed UI produces: `config.predicate` + arms on `true`/`false` | **publish 200**, `version 1`, no branch_predicate errors |
| `W15 VERIFY — branch legacy heal` (`019f48f8…`) step 1 | retired shape: then/else arms, no predicate | **publish 422 `branch_predicate_missing`** (the break, reproduced) |
| same, step 2 | after the heal: `edge.update` then→true / else→false + `node.update` config.predicate | **publish 200**, `version 1` |

**Stage A tests** (`branch-node.test.ts` +9, `graph-sync.test.ts` updated): predicate
config round-trip → compiler-valid shape; legacy then/else doc loads without dropping the
edges layer and the false arm never collapses onto true; `branchArmRewrites` rewrites
then/else→true/false, is idempotent on a canonical branch, ignores non-branch nodes;
`outPortsFor('branch')` ids are `['true','false']`.

---

## STAGE B — port clarity pass (all logic kinds, presentation only)

No behavior/vocabulary changes (Combine/renames/output-shape/parallel-default are W15c).
Labels + hints extracted to testable data (`kinds.ts` outPorts, `logic-copy.ts`).

| Node (kind) | Out ports | Labels | Honesty applied |
|---|---|---|---|
| Branch (`branch`) | true, false | True / False | Stage A: on-node Condition; "True runs when it holds, False otherwise" |
| Loop (`cycle`) | body, done | **each pass →** / **→ when done** | placeholder `result.has_more` (was out-of-scope `output.has_more`); hint names in-scope `result`/`state`/`iteration`; cap hint says "the run fails" (was "the loop stops" — it fails, `MAX_ITERATIONS_EXCEEDED`) |
| Run in parallel (`parallel`) | body, done | **each item →** / **→ after all items** | blurb + panel drop "all at once" (batch 1 is sequential); "wire steps from the each item port"; **removed the "Add a Join" hint**; palette subtitle "Run the same steps once per array item" |
| Join (`join`) | default out | — | dropped the misleading "after a Parallel step" (parallel already aggregates); warns against joining exclusive arms (Branch/Human/Start Workflow) which deadlock |
| Merge (`merge`) | default out | — | unchanged — already honest (continues on first arrival) |
| Wait for (`signal`) | default out | — | unchanged — already honest |
| Human Decision (`human`) | then, else | Approve / Reject (config-driven) | unchanged — audit found it clear + honest; its then/else ports work |
| Start Workflow (`workflow_call`) | result, failed (bound) | Finished / Failed | blurb now states it "waits for it to finish" (was fire-and-forget-implying); Finished/Failed ports already render for a bound call (`CALL_PORTS`) |
| Error (`error`) | terminal | — | unchanged — structure boundary; per-node error routing is W15c |

Nodes with only a default output port (Join/Merge/Wait for/Error) expose one self-evident
outgoing port; their meaning lives in the (now-corrected) panel copy, not a named port.

**Stage B tests** (`logic-copy.test.ts` +8): Loop/Parallel directional port labels;
Loop placeholder in scope (no `output.`); cap hint says "fails" not "stops"; parallel copy
never says "all at once" and names the each-item port; parallel blurb drops the concurrency
claim; Start Workflow blurb states it waits.

---

## src handoff (backend `platform/workflows/src` — NOT touched; W15c/behavior)

No **blocking** src change was needed for W15a/b — the base logic-node port labels are
FE-only (`kinds.ts`/`graph-sync.ts`), and the compiler already accepts the valid Branch
shape. The honest copy now exposes these backend behaviors that only W15c can change:

1. **Loop cap-exhaustion fails the run** (`cycle.lua` `MAX_ITERATIONS_EXCEEDED`). UI now
   says "the run fails"; W15c may make it a graceful exit with the last result.
2. **Parallel default `batch_size=1` runs sequentially**, and "after all items" emits the
   `{successes, failures, counts}` wrapper, not a results array (`parallel.lua`,
   `materialize.lua`). UI copy is honest about the sequential default; array output +
   real-parallel default are W15c.
3. **Join+Merge → one Combine node** (wait-all|first-wins toggle) + publish-time detection
   of Join-after-exclusive-arms deadlock — W15c vocab migration.
4. **Opt-in per-node Failed port / branch-on-error** — W15c/backend.

---

## Test delta & build-deferred

- vitest: **206 → 223** (17 new: `branch-node.test.ts` +9, `logic-copy.test.ts` +8;
  `graph-sync.test.ts` branch assertions updated for true/false). All green.
- vue-tsc: clean in every touched file; the 3 pre-existing errors
  (`widgets/ui/src/app/ports.ts`, `WorkflowSetup.vue`, `workflow_setup.ts`) are unchanged.
- No snapshots changed (the only snapshot, `run-node-output.test.ts.snap`, is untouched by
  these changes).
- **Build deferred:** no `npm run build`, `static/` untouched — live 8085 keeps serving the
  old bundle by design. The contract is proven via the API publish fixtures above, not a
  live-bundle click-through. The Stage-A/B changes reach the live builder on the next
  deliberate build + `static/` sync.
