# Run-state / child-dataflow composition QA — 2026-07-11

## Verdict: FAIL (two product defects remain)

Read-only live replay against `http://localhost:8085` using existing durable runs. No
workflow definition or run was created, changed, or deleted. Browser cache was disabled
for the post-rebuild compact replay.

Evidence and raw geometry are under `scratchpad/gtm/impl/run_state_composition_qa/`.

## Defects

### R1 — compact toolbar actions are off-screen (high)

At a 520px browser viewport the host navigation retains 182px, leaving the workflow
editor 336px. The compact inspector fix now preserves that full 336px canvas, but the
top toolbar still has a single unwrapped intrinsic row. Six controls begin beyond the
518px measured viewport: Run at x=520, export at x=593, History at x=627, and Publish at
x=661 (ending at x=755). They are not available in the visible UI.

Evidence: `failed_light_520_drawer_closed.png`; exact rectangles in
`measurements-afterfixcompact5.json`.

### R2 — component-declared human waits render as “Running” (high, semantic)

The real 18-hour `Inbound lead pre-call wedge` run is paused at **Brief review**, a
registry node in category `Human` whose description says it waits for a decision. The
canvas node and inspector both render **Running**, not **Awaiting**; there is no awaiting
label/pulse. The measured node class is:

`wfn--precall_brief_review ... is-running wfn--ports`.

The cause is an abstraction leak in `run-overlay.ts`: the awaiting conversion is gated
on the literal built-in kind `human`. Component-declared human intrinsics such as
`precall_brief_review`, `inbox_decision`, and `crm_merge_review` cannot participate in
the same visual state despite the registry already declaring category `Human`.

Evidence: `running_light_1500.png`, `running_light_520.png`, and
`measurements-afterfixcompact3.json`.

### R3 — Auto layout makes a real 16-step run unreadably small (medium)

Driving Auto layout on the real 16-step / 27-connection pre-call workflow fits the
entire vertical graph into the available canvas. At 1500px the cards render at roughly
75–100px wide on screen; titles, outcome ports, and status states cannot be scanned
without immediately zooming. At 980px the problem is stronger. The graph is technically
present, but the run overview is not useful as an overview.

Evidence: `running_light_1500.png` and `running_light_980.png`.

## Driven passes

- Completed parent/child run: parent `JOURNEY — Wrapper` and child `JOURNEY — Lead
  scorer` render as a navigable hierarchy with both statuses. Timeline renders real
  engine events. Evidence: `nested_completed_light_1500.png` and
  `nested_completed_dark_1500.png`.
- Failed run: failure strip names the step and reason; selecting the failed step opens
  the directed error block, status, timing, input/output, and technical-details path.
  Light/dark desktop and light 980 were visually coherent. Evidence:
  `failed_light_1500.png`, `failed_light_980.png`, `failed_dark_1500.png`.
- Pinned boundary lock + terminal status: Start/Finish cards showed lock plus completed
  mark with zero measured overlap at 1500, 980, and 520. Pending Error retained its lock
  without a false failure mark.
- Call-workflow outcomes: the real Call Lead scorer node showed Finished and Failed
  together with no measured label collision at 1500, 980, or 520.
- Failed run + named outcomes: Branch True/False and the failed-step indicator remained
  distinct. The generalized failed affordance on the agent remained separate from the
  named Branch outcomes.
- Compact inspector after the responsive-drawer fix: canvas width is 336px rather than
  44px. The scrim covers the full canvas at z=29, panel is z=31, clicking the scrim
  removes both and exposes a 314px canvas plus 22px reopen rail. The formerly vertical
  failure strip is now 304×81px and reads normally. Evidence:
  `failed_light_520.png`, `failed_light_520_drawer_closed.png`, and
  `measurements-afterfixcompact5.json`.
- No status/lock/failure-mark intersections were measured on any driven node. No port
  label reported horizontal clipping in the driven graphs.
- Authenticated UI emitted no console/page errors. The sole captured error is the known
  pre-login host initialization attempt without a token.

## Not driven / no inferred pass

- No existing safe live workflow in this replay contained a Loop/For-each container
  box, so container header composition and adversarial long labels were not live-tested.
  Source has max-width + ellipsis, but that is not a visual verdict.
- No live node combined three-or-more named outcomes **and** the opt-in generalized
  Failed port on the same card. The two mechanisms were each driven, but not that exact
  composition.
- Dark mode was driven at 1500 for completed/failed/running. Dark 980 and dark 520 were
  not re-driven after the final responsive rebuild.
- A genuinely live built-in `human` node was not available; the available real pause is
  the component-declared Human intrinsic that exposes defect R2.

