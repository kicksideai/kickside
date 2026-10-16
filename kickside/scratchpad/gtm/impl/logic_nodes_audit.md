# Logic / control-flow node audit — workflow builder

Owner charge: "their behavior is very ambiguous for users; I want the workflow interface as easy and intuitive as possible." This audits every logic/control-flow primitive for the gap between **what a user assumes** and **what the node actually does**, with live probes.

- **App:** http://localhost:8085 (read-only on code; probes created via the same API the builder uses, all prefixed `LOGIC AUDIT —`).
- **Live-bundle note:** the served builder bundle is `platform/workflows/static/index.js` (Jul 9 16:19, source-loaded via the wippy.lock replacement). It matches current `ui/src` — verified by the Branch panel text and the `then`/`else` port ids present in the minified bundle. So findings below are LIVE unless marked otherwise.
- **Screenshots:** `/tmp/claude-1000/-home-wolfy-j-kickside/3fc3674e-309e-47a5-a3d8-89305debb90f/scratchpad/logic_audit/`

## The set as swept (palette)

| Palette label | kind | Group | Ports (label) | Engine node type |
|---|---|---|---|---|
| Branch | `branch` | Logic | True/False (`then`/`else`) | *dissolves* → edge predicates |
| Merge | `merge` | Logic | default | STATE (no required inputs) |
| Join | `join` | Logic | default | STATE (required = all inputs) |
| Run in parallel | `parallel` | Logic | Each item/All done (`body`/`done`) | PARALLEL |
| Loop | `cycle` | Logic | Each pass/Done (`body`/`done`) | CYCLE |
| Wait for | `signal` | Logic | default | SIGNAL |
| Human Decision | `human` | Human | Approve/Reject (`then`/`else`) | AWAIT (inbox.decision) |
| Start Workflow | `workflow_call` | Workflows | default (no Failed port) | AWAIT (spawned_child_run) |
| Error | `error` | Structure | terminal | FUNC passthrough → failed output |

Plus **edge conditions (`when_expr`) and edge transforms** which act as logic. `kinds.ts` block header claims "Logic blocks are productized — Branch, Loop, Wait for, Join, Merge — never their raw kind string," and the productization is genuinely good; the ambiguity is in *what each productized block does at runtime*.

---

## 1. Branch (`branch`) — BROKEN LIVE, cannot publish

**WHAT IT ACTUALLY DOES.** A branch materializes **no engine node** — it dissolves into edge predicates (`graph.lua:340-420`). The compiler reads the condition from **`config.predicate` on the node** (`graph.lua:50-55, 240-242`), compiles it to `C`, and rewrites the outgoing edges: the `true` port carries `C`, the `false` port carries `!C` (`graph.lua:367-401`). It requires (a) a non-empty `config.predicate` and (b) out-edges leaving ports **named exactly `true` / `false`** (`graph.lua:367-374`).

**WHAT THE UI IMPLIES.** The node renders **TRUE / FALSE** ports (`kinds.ts:48-52`, labels `True`/`False`, **ids `then`/`else`**). The config panel (`NodeConfigPanel.vue:539-543`) has **no condition field** — only prose: *"Set the condition on the True connection (click the wire from the True port). The False port runs when it doesn't hold."* So the UI teaches the user to put the condition on the **edge** (`when_expr`), and the port ids it emits are **`then`/`else`** (`WorkflowCanvas.vue:479` stores `source_port = sourceHandle`).

**THE AMBIGUITY GAP — this is not ambiguity, it is a dead end.** The panel's own instructions cannot produce a publishable branch:
- No node predicate exists → **`branch_predicate_missing`**.
- Ports `then`/`else` ≠ compiler's `true`/`false` → **`branch_port_unknown`**.

The two models (node-predicate + true/false vs edge-condition + then/else) are out of sync in the shipped code.

**PROBE (live, backend is shared regardless of bundle):**
- UI-shaped branch (then/else, no predicate) → publish **422 `branch_predicate_missing`** ("branch node requires config.predicate (the If condition)"). `04_branch_publish_error.png` — the red banner a user sees, leaking the internal field name `config.predicate`.
- then/else + a predicate → publish **422 `branch_port_unknown`** ("branch node out-edges must leave the true or false port").
- true/false + `config.predicate` → branch compiles clean (only my incomplete test graph's leaf error remained). This is the compiler contract; the UI cannot express it.
- Live panel screenshot `03_branch_panel.png` confirms the no-field "set the condition on the True connection" panel.

**SOTA.** n8n **IF** node: the condition lives **on the node** (field / operator / value builder), two outputs hard-labeled **true / false**. n8n **Switch**: rules on the node + a **fallback** output. Zapier **Paths**: rules per path on the path itself. Every SOTA tool sets the predicate **on the node**, never asks the user to hand-author it on the wire, and never ships a node whose two halves disagree.

**RECOMMENDATION.** Restore a condition field to the Branch panel writing `config.predicate` (mirror n8n's on-node builder), and change the port ids in `kinds.ts` from `then`/`else` to `true`/`false` so the UI matches `graph.lua` — one edit each; this is a ship-blocking regression, not a UX nicety.

---

## 2. Loop (`cycle`)

**WHAT IT ACTUALLY DOES.** Materializes a CYCLE engine node (`materialize.lua:169-183`). It re-runs the **body** subgraph (the `body` port template) and after each pass evaluates `continue_condition` against a context of `{ input, state, result, last_result, iteration }` (`cycle.lua:892-909`). `result` = the body's last output; `state` only changes if the body returns an envelope `{state,result,continue}` (`cycle.lua:509-533`). Bare refs in the condition compile to **`state.*`** (`materialize.lua:174`, `conditions.lua:26-38`). **Hitting `max_iterations` while the condition still holds FAILS the run** with `MAX_ITERATIONS_EXCEEDED` (`cycle.lua:936-942, 950-953`); default cap 8 (`materialize.lua:35,170`).

**WHAT THE UI IMPLIES.** Panel `NodeConfigPanel.vue:544-552` / `07_loop_panel.png`:
- **Repeat while** placeholder = **`output.has_more == true`**.
- **Max iterations** hint: *"the loop stops after this many passes even if the condition still holds. 0 uses the default (8)."*

**THE AMBIGUITY GAP.**
- **The placeholder names a variable that isn't in scope.** The condition context has `result`, `state`, `last_result`, `iteration`, `input` — **no `output`**. `output.has_more` qualifies through unchanged (it has a dot) and evaluates against a nil `output` → the condition never holds → loop runs once and exits (or the body never repeats). A user copying the placeholder gets a silently-non-looping loop. The correct root is `result.has_more` (body output) or bare `has_more` (→ `state.has_more`), and those two are different scopes with no cue which to use.
- **"the loop stops" is false — it FAILS.** Reaching the safety cap with the condition still true is a hard `n:fail`, so a bounded-retry loop that doesn't converge terminates the **whole workflow as failed**, not "stop with the last result." A user reads the cap as a graceful ceiling; the engine treats it as an error.

**SOTA.** n8n **Loop Over Items** is honestly a batch iterator with `loop`/`done` outputs; a runaway is bounded by item count, not a failure. Make/Zapier repeat constructs expose the loop variable explicitly (`{{iteration}}`, current item) with autocomplete, never a free-text root the user must guess.

**RECOMMENDATION.** Replace the placeholder with an in-scope example (`result.has_more` or bare `has_more`) and a one-line "you can reference `result`, `state`, `iteration`"; and make cap-exhaustion a **graceful exit with the last result** (or, if failure is intended, relabel to "Fail the run after N passes") so the word "stops" is true.

---

## 3. Run in parallel (`parallel`)

**WHAT IT ACTUALLY DOES.** PARALLEL engine node (`materialize.lua:165-168`): `source_array_key` (default `items`), `batch_size` (default **1**), `on_error` (default **`continue`**). It runs the `body` template once per array item, `batch_size` at a time. Its completion output — with the UI's config (no reduction/output_shape) — is the **raw wrapper object** `{ successes:[{iteration,item,result}], failures:[{iteration,item,error}], success_count, failure_count, total_iterations }` (`parallel.lua:446-453, 1604, 1615`). With `on_error=continue`, a failed item is recorded in `failures` and the **step still completes successfully** (`parallel.lua:1017-1057`); only `fail_fast` aborts.

**WHAT THE UI IMPLIES.** Blurb (`kinds.ts:75-79`) + panel (`NodeConfigPanel.vue:559-573`) / `06_parallel_panel.png`:
- *"Runs the steps inside its body once per array item, **all at once**, then gathers the results on **All done**."*
- Batch size **1**, hint *"1 runs them one by one."*
- On item error default *"Continue — keep running the other items."*
- *"Add a Join after this step to wait for every item before continuing."*

**THE AMBIGUITY GAP.**
- **"all at once" vs batch size 1.** The blurb promises concurrency; the shipped default (batch 1) runs items **sequentially**. The contradiction is visible in a single panel.
- **"gathers the results" ≠ an array of results.** "All done" emits the `{successes, failures, counts}` wrapper. A user wiring All done → Finish expecting `[result, result, …]` gets a bookkeeping object; extracting the real results needs `output.successes[*].result`, surfaced nowhere.
- **Silent partial failure.** Default `continue` means the step reports **success even if every item failed** — the failures hide inside the output object. "Continue" doesn't tell the user the run won't be marked failed.
- **"Add a Join" is misleading.** The node already waits for all items and aggregates on All done; a Join after it receives the one aggregated object, so wait-all-on-one is a no-op. It also collides with the Join panel's own "use after a Parallel step."
- **Which port is the body?** Panel says "Wire the steps to run from this node's own outgoing connection — that becomes the per-item body," but there are two source ports (Each item / All done); "its own outgoing connection" is ambiguous, and a body wired to All done instead of Each item silently isn't a body.

**SOTA.** n8n splits concurrency honestly: "Loop Over Items" (sequential batches) is separate from genuinely-parallel execution, and its aggregation is an explicit array. Make's Iterator→Aggregator pair names the collect step and its array output. None ship a node named "in parallel" that defaults to sequential, and none bury failures in the success payload without a visible "N failed" signal.

**RECOMMENDATION.** Default `batch_size` to a real parallel value (or rename to "For each item" and drop "all at once"); make the default output the results **array** (fold `successes[*].result`) with the wrapper behind progressive disclosure; surface failure count on the node/run and offer "fail the step if any item fails" as a first-class toggle; delete the "Add a Join" hint.

---

## 4. Join (`join`)  &  5. Merge (`merge`) — two kinds for one concept

**WHAT THEY ACTUALLY DO.** Both are STATE engine nodes (`materialize.lua:29-33`). The difference is one bit: `JOIN_KINDS = { join, parallel }` (`graph.lua:31`) so a **Join** with >1 input gets `inputs.required = all discriminators` — it waits for **every** arm (`graph.lua:651-658, 760-766`). **Merge** is not in that set, so all its inputs collapse to discriminator `default` and it has no required set — the state node fires on the **first** arrival and completes with it (`state.lua:50-109`). `output_mode` object|array shapes the combine.

**WHAT THE UI IMPLIES.** Join `08_join_panel.png`: *"Waits for every incoming connection to arrive… Use it after a Parallel step, or after any independent paths that must all finish."* Merge `09_merge_panel.png`: *"Continues as soon as one incoming connection arrives… Use it to bring Branch arms back together… a Join would wait forever there."* Both offer Object/Array combine.

**THE AMBIGUITY GAP.**
- **The user must pre-diagnose their own topology.** Choosing wrong is catastrophic and silent: **Join after exclusive arms (Branch, Human approve/reject, Start-Workflow finished/failed) deadlocks** — nothing at publish stops it.
- **Merge silently drops data on concurrent paths.** Its first-arrival semantics are correct for exclusive branch arms but, used to combine two paths that both run, it keeps one and discards the other (multiple `default` inputs collapse, `state.lua:83-109`) — no warning.
- **"Use a Join after a Parallel step"** contradicts §3 (Parallel already aggregates); a Join there waits on one input.
- The names **Join / Merge** are near-synonyms in English; nothing in the labels signals "wait-all vs first-wins." `kinds.ts:63-74` explicitly keeps them separate "never one node with a toggle," which pushes the wait-semantics decision onto the user as two look-alike palette entries.

**PROBE (live).** Built Branch(true/false+predicate) → arm A / arm B → **Join** → Finish; published clean (200); simulated with `status:ok`. Result: **run FAILED**. Node states: Start ✓, A1 ✓, **A2 pending**, **Join pending**, **Finish pending** — the untaken arm never runs, the wait-all never completes. The surfaced error is the cryptic **"No input data provided"** (the state node's empty-input failure, `state.lua:73`) — it never says "Join is waiting on an arm that didn't run," a W13 good-errors miss. (Reachable today via Human/Start-Workflow exclusive ports even though Branch itself can't publish.)

**SOTA.** n8n ships **one Merge node** with a **mode** (append / combine-by-key / combine-by-position / wait/SQL) and a documented "wait for all inputs" behavior — one palette concept, the wait/first choice is a dropdown, not a second node. Make's Aggregator is the single converge primitive.

**RECOMMENDATION (W12).** Collapse Join + Merge into **one "Combine" node** with a wait-mode toggle (Wait for all / Continue on first, default inferred from upstream: first-after-Branch, all-after-Parallel), and detect the Join-after-exclusive-branch topology at publish with a real error ("this waits for a path that can never run — use Continue-on-first"). Two convergence kinds is one over the primitive budget.

---

## 6. Wait for (`signal`)

**WHAT IT ACTUALLY DOES.** SIGNAL engine node (`materialize.lua:149-150`); pauses until the run is resumed with a matching `signal_id` (`kinds.ts:59-62`). Requires a `ref`/`config.signal_id` (`graph.lua:201-205`).

**WHAT THE UI IMPLIES.** Panel `NodeConfigPanel.vue:553-558`: "Wait for signal" name field, *"Pauses here until something resumes the run with this exact signal name… For a person's decision, use Human decision instead."* Publishes fine bare (probe `signal` → 200).

**THE AMBIGUITY GAP.** Minor but real: the node names a signal to wait for but **nothing in the builder shows who sends it or how** — a first-timer has no path from "approval_received" to an actual sender. It overlaps conceptually with **Human Decision** (both pause) and with a **timed delay** (there is no dedicated Delay/Wait-N-minutes node, so users may reach for this expecting a timer — it is not one).

**SOTA.** n8n separates **Wait** (resume on time / webhook / form) with an explicit resume URL surfaced in the node; Zapier **Delay** is time-only and obvious. Both make the resume mechanism concrete in the UI.

**RECOMMENDATION.** Rename to "Wait for external signal," show the resume mechanism (the signal id + "send this signal to resume, e.g. via …") inline, and add a separate time-based **Delay** so "wait" doesn't get overloaded onto signals.

---

## 7. Human Decision (`human`)

**WHAT IT ACTUALLY DOES.** AWAIT node with `resume_trigger inbox.decision` (`materialize.lua:151-162`); Approve routes `output.outcome=='approve'`, Reject its negation (`graph.lua:426-451`). Ports `then`/`else` labeled Approve/Reject (`kinds.ts:81-85`) — and unlike Branch, the compiler handles `then`/`else` here correctly.

**WHAT THE UI IMPLIES.** Panel `NodeConfigPanel.vue:648-750`: prompt, Approve/Reject labels, context expression, assignee, timeout, answer-form builder. Clear and honest.

**THE AMBIGUITY GAP.** Small. (a) The Reject/Approve arms are exclusive, so **Human → Join deadlocks** exactly like Branch (see §4/§5) — buildable today. (b) Timeout default waits **indefinitely** ("Waits indefinitely for an answer") — a workflow can hang forever on an unanswered decision with no default SLA. (c) It is the one logic node whose then/else ports work, making Branch's breakage look like an oversight rather than a design.

**SOTA.** n8n/Make approval patterns pair with an error/timeout branch; a default "no infinite wait" is common.

**RECOMMENDATION.** Keep it; add a visible default timeout (or a "what happens on timeout" cue), and route its exclusive arms through the same Combine fix so reconvergence can't deadlock.

---

## 8. Start Workflow (`workflow_call`)

**WHAT IT ACTUALLY DOES.** AWAIT node, **spawned child run**, **blocks until the child finishes** (`materialize.lua:125-138`). Success edges receive the child's Finish payload (default transform `output.output_sample.result`), failed edges receive `output.error` (`graph.lua:453-481`). Failed routing needs `source_port='failed'/'error'` (`graph.lua:469`). Inline mode is disabled (`graph.lua:236-238`).

**WHAT THE UI IMPLIES.** Label **"Start Workflow"**, subtitle "Start another workflow as a child run" (`catalog.ts:154-163`). Panel `10_startworkflow_panel.png`: *"Runs a published partial with this step's input, branching on its Finished / Failed result,"* + a "Search published partials" picker.

**THE AMBIGUITY GAP.**
- **"Start" implies fire-and-forget; it actually awaits.** The node blocks on the child's completion. A user reading "Start Workflow" expects to kick it off and continue; the run pauses for the whole child.
- **No Failed port exists.** `kinds.ts:86-89` declares no `outPorts`, so the node renders a single default handle. The blurb promises "branching on its Finished / **Failed** result," but the user **cannot draw the Failed branch** — there's no Failed handle. Probe `workflow_call no-failed-port` publishes fine with only the success path, so the Failed branch is silently optional-and-unreachable.
- **"published partial" jargon** — "partial" is unexplained (flagged in the sandwich audit too); the picker also lists Draft items despite saying "published."
- Publish does **not** verify the target workflow exists (probe pointed at `nonexistent.wf:demo`, published 200) — failure only surfaces at run.

**SOTA.** n8n **Execute Workflow** ("Call another workflow") is explicitly a call-and-wait with a sub-workflow picker; naming makes the blocking clear. Both n8n and Make expose the sub-workflow's error path as a wireable output.

**RECOMMENDATION.** Rename to **"Call workflow"** (matches owner's own W12 vocabulary and the blocking reality), render an explicit **Finished / Failed** port pair (add `outPorts` to `kinds.ts`), and validate the picked workflow exists at publish.

---

## 9. Error boundary (`error`) + edge conditions/transforms as logic

**WHAT THEY ACTUALLY DO.** The **Error** boundary is a FUNC passthrough that terminates the **failed** run output (`materialize.lua:109-110, 278-281`); it declares the failure shape. A node's real failure reaches it only via an **error edge** (`source_port='failed'/'error'`, `graph.lua:278, 469`; `materialize.lua:285-298`). **Edge `when_expr`** compiles to a predicate over `output.*` (`conditions.lua`), acting as a router/filter; an **unconditional edge that coexists with conditional siblings silently becomes the negated-union "else"** (`graph.lua:680-691`). **Edge transform** reshapes the payload.

**THE AMBIGUITY GAP.**
- **No per-node failed port.** Regular tool/agent/func nodes render no `failed` handle, so there is **no way to route a specific node's error** to the Error boundary or to a recovery path — the Error node reads as a global catch (sandwich-audit finding #10). There is **no way to branch on error type** at all.
- **The implicit "else" edge.** A user drawing an unconditional edge next to a conditional one expects it to always fire; it actually only fires when the conditional doesn't (`graph.lua:685-689`) — invisible logic.
- Edge conditions/transforms are raw expr text with guessed `output.*` paths and no field picker (sandwich-audit finding #4/#9) — the logic that lives on wires is the least discoverable logic in the builder.

**SOTA.** n8n gives every node an optional **error output** branch (toggle "Continue On Fail" → a second output) and Error-Trigger workflows; Make attaches per-module error handlers with directives (Resume/Ignore/Rollback/Break). Per-node error branching is table stakes.

**RECOMMENDATION.** Add an opt-in **failed port** to executable nodes (agent/tool/func) that routes to a recovery path or the Error boundary, so "what happens when this step fails" is wireable per node; make the implicit-else visible (badge the fallthrough edge "else"); give edge conditions a field picker.

---

## Probe evidence (all live, prefixed `LOGIC AUDIT —`)

| Probe | Setup | Result |
|---|---|---|
| Branch UI-shaped | then/else ports, no predicate (exactly what the panel guides) | publish **422 `branch_predicate_missing`** — `04_branch_publish_error.png` |
| Branch + predicate, then/else | isolates the port id | publish **422 `branch_port_unknown`** |
| Branch true/false + predicate | compiler contract | compiles clean |
| Bare publishability | signal / join-1-input / merge-1-input / workflow_call-no-failed / parallel-no-body / cycle-no-body | **all publish 200** — compiler is lenient everywhere except Branch |
| Join after exclusive Branch | true/false arms → Join → Finish | publish 200; simulate → **run FAILED**, A2+Join+Finish pending, error "No input data provided" |

Panels: `03_branch_panel.png`, `06_parallel_panel.png`, `07_loop_panel.png`, `08_join_panel.png`, `09_merge_panel.png`, `10_startworkflow_panel.png`; canvas `02_branch_canvas.png`; palette in every shot.

---

## Ranked top ambiguities

1. **Branch cannot be published as the UI guides it** — no predicate field + `then`/`else` vs compiler `true`/`false`; the error even leaks `config.predicate`. The single most-used logic node is a dead end. (BROKEN LIVE.)
2. **"Run in parallel" defaults to sequential** (batch 1) and its "All done" emits a `{successes,failures,counts}` wrapper, not the results array — plus silent partial-failure (still "succeeds") and a misleading "Add a Join" hint.
3. **Join vs Merge is a silent-deadlock trap** — two look-alike names force the user to pre-diagnose wait-all vs first-wins; Join-after-exclusive-arms deadlocks with a cryptic "No input data provided," nothing guards it.
4. **Loop's condition example (`output.has_more`) references an out-of-scope variable**, and hitting the max-iteration cap **fails the run** despite the panel saying it "stops."
5. **"Start Workflow" implies fire-and-forget but blocks on the child, and exposes no Failed port** to wire despite promising Finished/Failed branching.

Runner-up: **no per-node error branch / no branch-on-error-type**, and the **implicit "else" edge** — the logic that lives on wires is invisible and hand-authored.

## Proposed target logic set (W12 minimal vocabulary)

**Condition (Branch, fixed: on-node predicate + true/false ports), Loop, For-each (Parallel, honestly labeled, array output), Combine (one node, Wait-all | First-wins toggle — replaces Join+Merge), Wait (external signal + a separate time Delay), Human approval, Call workflow (renamed, Finished/Failed ports), + an opt-in per-node Failed port for error routing** — each explainable in one sentence, convergence reduced from two kinds to one, and the two broken/misleading nodes (Branch, Parallel) brought in line with n8n-class expectations.
