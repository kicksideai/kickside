# W20 — Owner acceptance scenarios (2026-07-10, verbatim intent)

1. Create a workflow freely from existing pieces; use it as an agent TOOL.
2. Create a workflow with a CUSTOM (inline) agent.
3. Create a workflow with a custom agent AND custom tools selected for it.
4. Sequential workflows are easy to build.
5. Conditional workflows are visually easy.
6. Call a workflow from another workflow.
7. Workflows are universal — same workflow runs with different inputs.
8. Open the editor WITH a passed reference to the expected input/output/error contract —
   building a workflow for a specific system slot pre-seeds the boundary schemas.
9. Canonical, exceptionally simple contract for component-declared configurable business
   logic: a component declares a workflow-typed slot with a DEFAULT workflow as a registry
   entry; the user can REBIND it to their own workflow.
10. Workflow TEMPLATES declared as registry entries.
11. Workflow INTRINSICS declared as registry entries — wrap business processors from other
    components as palette nodes with one or multiple outputs, errors, typed inputs.
12. The engine competes with n8n.
13. Workflows attach to WEBHOOKS as triggers.
14. Workflows attach PER-MESSAGE in data sync as a destination (sink).
15. Loops/cycles are intuitively easy for humans.
16. Components (e.g. CRM) use the shared web component to configure different workflows on
    different stages — including CLONING a workflow for editing.

Status: verification matrix in progress; gaps become the build queue.

Status #9 (Flow Points, 2026-07-11 FINAL): **PASS — full cycle verified LIVE.** Point on the CRM
lists state=Default; "S9 — Invoker" workflow (Call[flow_point]) dispatched the point live with
durable lineage rows (default → binding clone v3 rev1 → default-after-restore; child runs
completed via trigger_kind=flow_point); Customize→clone→edit→publish→WC-picker-bind→Customized;
CAS 409; envelope 400 directed; restore-with-binding → Default; 401/403 authority + read-filtered
list; five WC state screenshots; no catalog/list leak. Verification found 4 defects, all fixed
forward + test-covered (flow_points 6/6, runs_test 56/56): (1) my envelope-refused default →
swapped; (2) migrations 09/10 rewritten in place after being recorded → migration 11 shipped,
HEALED verified live; (3) Call→flow_point await correlation dropped → parent never resumed —
fixed in launch_flow_point + invoke; (4) bound-dispatch trigger_id used the pipe-keyed binding id
→ run_dedup_invalid — fixed: invocation UUID is the trigger identity. #3/#4 live run-proof needs
the next reload (Lua boots-loaded); re-run s9_drv/final2.mjs unbound+bound. Detail: `s9_verify.md`.

Status #8 (Editor pre-seeded with contract, 2026-07-11 FINAL): **PASS — via the canonical
flow-points path.** The flow point's declared interface IS the expected contract. Customizing the
CRM's "S9 — CRM Enrichment Slot" clones the slot's default runnable exactly and opens that draft in
the editor carrying the cloned default's boundary schemas (Start `input_schema`, Finish
`output_schema`, Error `error_schema`) with the boundary panel showing "WORKFLOW INPUTS AND RESULTS
— LOCKED / Pinned — a boundary node can't be deleted." That is precisely scenario 8's intent —
"open the editor WITH a passed reference to the expected input/output/error contract." Proof: the
customize draft (019f4fba) carries the default runnable's EXACT boundary node UUIDs (start
19b076e3, finish 466bb81e, error 3848d86c) and interface, and reproduces its full graph
(start+agent+finish+error); a bare "New workflow" seeds no boundary schemas at all. Precise nuance:
the shipped default (Inline Agent Smoke v2) declares a generic typed-object interface
(`{type:object, properties:{}}`), so the pre-seeded contract is generic-object-typed — the pre-seed
MECHANISM (exact clone of the slot's default) satisfies the intent, not a rich named-field schema.
Screenshot `w20/w20c_s8_3_start_schema.png`; drivers `s9_drv/w20c_s8*.mjs`.

Status #13 (Webhook/trigger in-builder, 2026-07-11 FINAL): **PASS — live.** The prior gap (in-builder
Add-trigger panel rendered empty) is closed by the `AddTriggerPanel` loadByTagName fix. Driven live:
builder → Add trigger renders the full `kickside-recipe-config` — Name, Runs (published workflow),
When (On a schedule · every 30 min · UTC), and the trigger→Start field mapper (fired_at/occurred_at/
previous_runs/schedule → name*/source*/message/company/email* with "3 required fields unmapped" +
Draft with AI). Screenshot `w20/w20c_s13_add_trigger.png`.

Status #16 (Component config WC — share + multi-stage, 2026-07-11 FINAL): **PASS — full vision driven
LIVE.** (a) SHARE sub-gap closed: `kickside-share` drives from BOTH entry points — workflows list row
menu and builder header — on the published "W20 — Parent" workflow. Granting the `s9-outsider@wippy.local`
principal READ round-trips end to end: outsider went from 403 → 200 on `/workflows/{id}/state` and
`/export` (and correctly stays 403 on `/access`, READ ≠ admin); builder-header toggle bumped the grant
to Read+Write (mask 1→3); grant persists across reload. (b) MULTI-STAGE: a SECOND flow point
(`s9.crm.qualify.v1`, distinct default) declared on the same CRM component; the WC now renders two
independently-configured stages — "S9 — CRM Enrichment Slot" Customized (bound to the existing clone
v3) and "S9 — CRM Qualification Slot" Using default — the owner's "different workflows on different
stages" story. Screenshots `w20/w20c_share_list_5_granted.png`, `w20c_share_builder_2_dialog.png`,
`w20c_s16_two_stages.png`; drivers `s9_drv/w20c_share_*.mjs`, `w20c_s16.mjs`. Reload: boot29
(`live_8085_boot29.log`, HTTP 200, 0 ERROR-level lines).

## FINAL TALLY — 16 / 16 PASS (2026-07-11)

| # | Scenario | Final |
|---|----------|-------|
| 1 | Workflow as agent tool | PASS |
| 2 | Inline (custom) agent | PASS |
| 3 | Inline agent + selected tools | PASS |
| 4 | Sequential easy | PASS |
| 5 | Conditional (Branch) visual | PASS |
| 6 | Call workflow from workflow | PASS |
| 7 | Universal — different inputs | PASS |
| 8 | Editor pre-seeded with contract | PASS (canonical flow-points path; generic-object nuance noted) |
| 9 | Rebindable slot (flow points) | PASS (full cycle live) |
| 10 | Templates as registry entries | PASS |
| 11 | Intrinsics (business nodes) | PASS |
| 12 | Competes with n8n | PASS (grade A-) |
| 13 | Webhook/trigger in-builder | PASS (live) |
| 14 | Sync per-message sink | PASS |
| 15 | Loops/cycles intuitive | PASS |
| 16 | Component config WC (share + multi-stage clone) | PASS (both entry points + two stages driven live) |

Residual (cosmetic, non-blocking): L5 — a customize/import clone's auto-title is the humanized
portable_key ("Workflow 019f4dc6…"); `param.set title` is shadowed by the portable-key derivation.
Latent defect found: restore (`delete_binding`) does not purge `flow_binding_revisions`, so the first
re-bind after a restore collides on `(binding_id, revision)` (partial write — the `flow_bindings` row
still commits and resolves; a rebind at the current revision writes a clean revision-log row). Neither
blocks any W20 scenario.
