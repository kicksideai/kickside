# W20 live acceptance verification — 2026-07-10

Driven live on http://localhost:8085 (admin@wippy.local). Browser: isolated headless Chrome
via playwright-core, harness + step scripts in `kickside/scratchpad/w20/`. Screenshots in
`/tmp/claude-1000/-home-wolfy-j-kickside/3fc3674e-309e-47a5-a3d8-89305debb90f/scratchpad/w20/`.
No restarts / builds / git. The running process DID hot-load the keeper-aligned endpoints
(versions/diff/restore/run-events/run-export/dataflows all 200), so that recon caveat is moot.

## W20 scenario matrix

| # | Scenario | Verdict | Evidence |
|---|----------|---------|----------|
| 1 | Workflow as agent TOOL | PASS | "Workflow Runner (demo)" agent: real chat — listed all runnable workflows (incl. new W20 ones), then ran "Inline Agent Smoke" via run_workflow; haiku output landed in chat. `s1-chat-result.png` |
| 2 | Inline (custom) agent | PASS | Agent palette node = `agent:inline`; config: plain-language INSTRUCTIONS ("becomes the agent's prompt"), "Use an existing agent" toggle, OUTPUT SHAPE + AI assist, MODEL. `s2/s3` |
| 3 | Inline agent + selected tools | PASS | ADVANCED tier: TOOL CALLING (Auto/Any/None), ADDITIONAL TOOLS "Search tools to add…" picker, RUN CONTEXT. `s3-agent-advanced.png` |
| 4 | Sequential easy | PASS | Built Start→Agent→Finish by palette drag + handle-drag edges; connection inspector: CONDITION(WHEN), "All required fields mapped", Draft-with-AI, expression. `s4-sequential.png` |
| 5 | Conditional (Branch) visual | PASS | Branch node with explicit **TRUE/FALSE** source ports; per-edge WHEN predicate in inspector. `s5-branch.png` |
| 6 | Call workflow from workflow | PASS | "Start Workflow" (call_workflow) node picks a published child w/ typed IN/OUT + result/failed ports; published parent v1; ran → child output **consumed** at Finish (`{"result":{"haiku":…}}`). Child run carries `parent_run_id`+`depth:1`+`workflow_stack:[parent,child]`. `s6-*` |
| 7 | Universal — different inputs | PASS | Run dialog renders schema-driven Form (`topic *`); launched two runs (Onboarding / Checkout) — both **completed**. `s7-form-mode.png` |
| 8 | Editor pre-seeded with contract | **GAP** | Only template instantiation seeds boundary schemas + slot bindings (wedge Start seeded w/ email/message/…; `template_lineage` present). Direct "New workflow" creates bare boundaries (`{properties:{}}`, no lineage). No path passes an arbitrary interface/slot contract into a blank editor — that path = flow points (#9, not built). |
| 9 | Canonical rebindable slot (flow points) | **DESIGNED-NOT-BUILT** | Repo-wide grep for flow.point/flow_points/flow.binding = 0 matches. Design FINAL (`flow_points_design_v2.md`) pending owner sign-off. Not faked. |
| 10 | Templates as registry entries | PASS | "Install a template" modal lists 2 registry templates (ICP 2-slot, wedge 4-slot) w/ owner module + "No external writes"/"P1a" badges; bound 4 slots → installed `019f4ef4` (15 steps) with "From template" note + full `template_lineage`. `s10-*` |
| 11 | Intrinsics (business nodes) | PASS | Placed `crm_resolve` ("Find or create record") + `contacts_resolve_contact` ("Resolve contact"); multi-output ports RESOLVED/REVIEW-REQUIRED, declared CRM config surface. Catalog also: research→result/failed, lane_guard→pass/block, crm_merge_review→4 ports. `s11-intrinsic-config.png` |
| 12 | Competes with n8n | PASS (grade A-) | See paragraph below. |
| 13 | Webhook trigger | **PARTIAL/GAP** | Trigger point in catalog (`kickside.webhooks:webhook_received` + precall Inbound-lead); webhook create + **fire via HTTP → 202 accepted**; live webhook→wedge automations exist ("Inbound lead → pre-call wedge", "New lead → pre-call brief"). BUT in-builder **Add-trigger recipe-config renders EMPTY** (header only), so a fresh binding can't be created from the builder; single-flow fire→run not completed in-session. `s13-*` |
| 14 | Sync per-message destination (sink) | PASS (API) | `kickside.workflows:run_workflow_port` present in `/automations/sinks` (Run Workflow); destination picker source `/workflows/runnables`; a write launches a run through the shared launch seam (the `/run` path = kind_write; verified launching runs). |
| 15 | Loops/cycles intuitive | PASS | Loop: REPEAT WHILE + **MAX ITERATIONS** cap, each-pass/when-done ports. For each: ITEMS + **BATCH SIZE**(8) + Stop/Continue-on-item-failure + each-item/all-results + optional **Failed port `{code,message}`**. Excellent inline copy. `s15-foreach-config.png` |
| 16 | Component config WC (+ clone) | PASS (w/ GAP) | `kickside-workflow-embed` mounted on the **Dashboard** (foreign surface) → picked + **ran** Inline Agent Smoke, haiku RESULT shown inline + Run-again/Open-in-editor. Clone = export→import round-trip works (new draft). Share affordance ABSENT = GAP; full multi-stage rebindable = flow points (#9). `s16-embed-run.png` |

## Regression pulse

| Surface | Verdict | Evidence |
|---|---|---|
| Run timeline tab | PASS | Overview/Timeline tabs; lifecycle+engine events (run.started, data.dataflow.input, node.created…) w/ raw-data expanders; nodes show green completion. `reg-run-timeline.png` |
| Hierarchy | PASS | Child run shows "EXECUTION HIERARCHY — parent · 4973e64f / this run · 40523a53 Completed" (clickable). `reg-hierarchy.png` |
| Export download | PASS | Builder export button + row-menu Export; `GET /workflows/{id}/export` → portable {slots,spec,checksum,schema_version,portable_key,refs}. |
| Keeper deep-link | PASS | "View in Keeper" → `GET /api/v1/dataflows/{dataflow_id}` → 200, correct dataflow (matching id, 6 nodes, interfaces). |
| Version diff | PASS | History popover → Diff → "v1 → v2 delta, READ-ONLY, no changes recorded". `reg-vers-diff` |
| Restore-as-new-draft | PASS | Select v2 → "Restore as new draft" → confirm → new editable draft `019f4efb` created. |
| Add-trigger in-builder | **GAP** | Modal opens w/ clean copy ("Run on a trigger — Choose when this workflow runs; find and manage it in Automations.") but the recipe-config **body renders empty** (post-rebuild + cache-clear). |
| Intent-edge auto-map + popover | PASS | Ambiguous {name,email}→{recipient,subject}: loud green dashed edge + "What should flow here? Needs recipient, subject" popover. `l2-01` |

## Owner-ask ledger rows driven

| Row | Verdict | Note |
|---|---|---|
| L1 (intent draw/popover/auto) | PASS | Ambiguous popover fired live; edge animates loud. |
| L2 (dismiss→reload still loud; fix→calm) | **PASS (queued gap appears RESOLVED)** | Dismiss → edge is loud **red dashed + red "2" unmapped-count badge**; RELOAD → **still loud**; applied mapping → **calm** (0 pending). `l2-02/03/04` |
| L3 (no architecture-speak) | MOSTLY PASS | Copy improved live: "Run another workflow", "Describe a task for an AI agent", "Run on a trigger — …". Residual: the **automation "Workflow" type description** ("…definition plane is module-owned. Running the workflow is a write through the Run workflow port.") is still architecture-speak. |
| L4 (premium on new surfaces) | MOSTLY PASS | Timeline tab, diff, restore, run-inspector all hold the premium bar. The **Add-trigger modal's empty body** is the one premium letdown. |
| L5 (logic ports incl. newest) | PASS | call_workflow → result/failed; Loop/For-each → body/done/failed; Branch → true/false; all labelled. |
| L6 (universality) | PASS | = S7. |
| L7 (use-as-tool trait, real convo) | PASS | = S1 — agent lists + runs a workflow, output in chat. |
| L8 (timeline/hierarchy/export/diff/restore + keeper) | PASS | All driven in browser; keeper deep-link opens the right dataflow. |
| L10 (add-trigger → def unchanged + copy) | PASS | Wedge version list stays v2,v1 across Add-trigger; copy is user-voice. (Body-empty gap is separate.) |
| L16 (export/import + embed + share) | PARTIAL | export/import + embed foreign-mount PASS; **share affordance absent = GAP** (no kickside-share in workflows UI — grep empty). |

## S12 — n8n competitiveness (subjective, after driving everything)

Grade **A-**. The builder is materially more opinionated and more premium than n8n for this
audience: palette-drag placement, handle-drag wiring with an **intent layer** (auto-map when
unambiguous, a plain-language "what should flow here?" popover when not, loud red edges for
unmapped required fields that survive reload) is a genuinely nicer connect experience than
n8n's manual expression editors. Typed boundary schemas + a per-run schema form, a real
version/keeper/timeline debug surface, subworkflow calls with parent/child run hierarchy,
121 tool nodes + business intrinsics with multi-output/failed ports, and a foreign-mountable
run WC together exceed n8n's ergonomics on the "compose tools + agents into a typed, callable
function" job. Where n8n still leads: breadth of prebuilt SaaS connectors, and — locally — the
webhook/trigger authoring loop: n8n's in-canvas trigger config is instant, whereas here the
in-builder Add-trigger panel renders empty and you must detour to the Automations page. Close
that (and the flow-points slot story) and this is an A.

## GAPS — ranked (what stands between current state and 16/16)

1. **Add-trigger in-builder renders empty (S13 + regression + L4).** The `kickside-recipe-config`
   panel mounts but shows no trigger catalog/config in the builder context (persists after the
   copy-lane rebuild + cache clear). This blocks creating a webhook/schedule trigger from the
   builder and is the single biggest live blocker; the Automations-page "Add automation" type
   picker DOES render, so the gap is the embedded builder mount. **Highest priority.**
2. **Scenario 9 flow points DESIGNED-NOT-BUILT.** The canonical rebindable-slot primitive
   (and by extension the arbitrary-contract editor pre-seed of #8 and the full multi-stage
   component-config vision of #16) does not exist. Design is FINAL, awaiting sign-off.
3. **Scenario 8 contract pre-seed is template-only.** Only template instantiation seeds
   boundary schemas; a system slot cannot hand a blank editor its expected in/out/error
   contract. Subsumed by #2.
4. **Share affordance absent on workflows (L16).** No kickside-share / Share button in the
   workflows UI — export/import is the only clone/share story.
5. **Residual architecture-speak (L3).** The automation "Workflow" type description leaks
   "definition plane / write through the Run workflow port"; the imported-clone auto-title is
   the raw portable_key ("Workflow 019f4dc6…"). Cosmetic.

## Artifacts (KEEP = demo-valuable, all W20-prefixed)

KEEP: `W20 Sequential` (S4), `W20 — Conditional Branch` (S5), `W20 — Loops (Loop + For each)`
(S15), `W20 — Intrinsic (CRM + Resolve)` (S11), `W20 — Parent (calls child)` (S6, published,
ran), `W20 — Wedge (template install)` (S10, published, lineage). Deleted transient: imported
clone `019f4f10`, restored draft `019f4efb`, test webhook `3686e7b3`. `Intent Edge — Auto Map`
edge was re-mapped to a valid (calm) state.
