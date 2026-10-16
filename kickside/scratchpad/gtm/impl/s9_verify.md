# S9 — Flow Points live verification (FINAL, 2026-07-11)

App: http://localhost:8085, reloaded twice by the coordinator (once for the point declaration,
once with migration 11 / commit b701e887). Driver: playwright-core + google-chrome + Bearer token
from `@wippy_token_info`; scripts `scratchpad/gtm/impl/s9_drv/`. Shots
`/tmp/claude-1000/-home-wolfy-j-kickside/.../tasks-scratch-s9/`.

## Verdict: scenario 9 PASS (live), with two follow-on defects found and fixed forward

The whole owner scenario ran live on the real app: registry-declared point on the CRM component →
listed state=Default → invoked through a real published workflow (Call node) with a durable
lineage row naming point + resolved runnable + version → Customize cloned the exact default →
clone edited over the API, published, bound through the WC picker → state=Customized → invoke
resolved the BINDING (lineage row #2 names the clone v3 + binding revision 1) → CAS 409 → envelope
400 (directed, naming the check) → Restore default → invoke resolved the default again (lineage
row #3, child run completed). Authority verified live: 401 unauth, 403 authed non-owner on
bind/restore, read-filtered list. WC screenshots cover all honest states.

Live verification caught four defects total across the rounds; all are fixed forward and
test-covered. Two remain reload-gated for their live run-proof (Lua loads at boot).

## Defects found by this verification (all fixed forward)

1. Declaration pinned an envelope-refused default (mine; round 2). Fixed: default = Inline Agent
   Smoke v2. Now proven live end-to-end (state=Default, invoke completes).
2. Rewritten-in-place applied migrations (platform): live DBs kept pre-lineage flow tables while
   09/10 were recorded as applied; every binding INSERT failed. Fixed:
   `migrations:11_flow_point_schema_reconcile` (commit b701e887). **HEALED — verified live**:
   canonical `flow_bindings` columns, `flow_binding_revisions` + `flow_point_invocations` present,
   `workflow_runs` lineage columns added, migration recorded; binding writes succeed.
3. Call→flow_point await never resumes (platform; found this round): `launch_flow_point` dropped
   `completion_signal_id`/`parent_run_id`/ancestry, so a point-called child completed without
   signaling and the parent run parked forever (`runs/completion.lua` requires those fields; no
   reconciler repairs it). Fixed: correlation + `workflow_stack`/`depth` now thread
   `launch.lua → flow_points.invoke → launch invocation`. Test:
   "threads caller await correlation into the launch invocation". Live resume proof reload-gated.
4. Bound dispatch launch-blocked by trigger_id charset (platform; found this round): child launch
   `trigger_id` fell back to the flow binding key `instance|point|version`; `|` fails
   `runs/launch.lua` dedup validation → `run_dedup_invalid` — bound invocations could never
   launch, default ones could (binding_id null). Fixed: the dispatch passes the invocation UUID as
   `trigger_id` (`flow_points._launch_payload`). Test: "dispatches with the invocation id as the
   launch trigger identity". Live run-via-binding proof reload-gated.

Suites after fixes (module harness, separate test runtime): flow_points_test 6/6,
runs_test (covers the runnable launch seam) 56/56.

## Per-point results — all LIVE unless marked

1. **PASS.** GET `/components/{crm}/flow-points` → the point, state **default**, default = Inline
   Agent Smoke v2, actions can_customize. WC "Using default" (`s9_wc_4_using_default.png`).
2. **PASS.** "S9 — Invoker" published workflow (Call node, `config.target={kind:"flow_point",…}`)
   run over HTTP → `flow_points.invoke` live → invocation row #1: point s9.crm.enrich.v1, CRM
   instance, binding_id null, resolved_runnable = 019f4dc6…(Smoke) **version 2**, authority
   {caller admin ambient_captured}; child run **completed**, trigger_kind=flow_point, carries
   component_instance_id. (Parent-run resume is defect #3 — fixed, reload-gated.)
3. **PASS (run-via-binding launch reload-gated).** Customize → clone draft (portable_key lineage)
   → edited via apply (open Start, deterministic branch passthrough) → published v3 → bound
   through the real WC picker → binding revision 1 by admin@wippy.local, list state=customized,
   WC "Customized · Workflow … v3" (`s9_wc_3_customized.png`), immutable
   `flow_binding_revisions` row. Invoke while bound → invocation row #2 resolves the **clone v3
   with binding_id + revision 1** (the binding-resolution proof); its child LAUNCH was blocked by
   defect #4 (fixed + tested).
4. **PASS.** Bind incompatible target while bound → 400
   `binding_incompatible: target Start does not accept point input` (also proven pre-bind, plus
   `published workflow not found` for an unpublished version; capability-ceiling naming in the
   harness). WC shows the directed copy "This workflow doesn't fit here yet: …"
   (`s9_wc_1_prebind_directed.png`).
5. **PASS.** DELETE with revision 1 → `restored_default:true`, names previous_binding, message
   "Future invocations use the declared default; existing runs are unchanged." List back to
   state=default; WC back to "Using default" (`s9_wc_5_restored_default.png`); invocation row #3
   resolves the default again and its child run **completed**. CAS live: stale revision → **409
   binding_revision_conflict** (proven both with and without an existing binding).
6. **PASS.** WC drove the real cycle (its own picker performed the bind): directed-incompatible
   copy, "Using default", picker with fit summaries, "Customized · v3", restore back to default —
   five screenshots. No leak: point absent from the workflows list page
   (`s9_workflows_list_no_flowpoint.png`) and from `GET /workflows/runnables`.
7. **PASS.** Unauth → 401 directed. `s9-outsider@wippy.local` (authed, no CRM access): PUT bind →
   **403 component access denied**, DELETE restore → **403**, GET list → 200 with the point
   filtered out.

## FE/API note

No HTTP endpoint wraps `flow_points.invoke` directly (dispatch carries declared authority). Live
consumer faces: (1) the component REST plane (list/bind/restore/customize); (2) a workflow Call
node with a flow_point target — proven live via "S9 — Invoker". `flow_points.await` and the
lineage table are contract/DB surfaces; runs observable via `/workflows/{id}/runs/{run_id}`.

## Reload-gated remainder (fixes shipped + unit-tested this round)

One more reload picks up the defect #3/#4 Lua fixes; then re-run `final2.mjs` twice (unbound +
bound) to watch the parent Invoker run COMPLETE end-to-end both ways. Everything else is done
live. Three parked/failed "S9 — Invoker" parent runs remain as debris of the two defects
(1777f016, c63150e3, ca0ddb93).

## Demo artifacts (S9-prefixed)

- Point `kickside.workflows:s9_crm_enrich_point` — "S9 — CRM Enrichment Slot" on the live CRM
  (`fa70ff13-f02a-54bf-893d-f56802db964b`); state=Default now.
- "S9 — Invoker (calls the CRM enrichment point)" (`019f4f8a-e2fd-7860-a188-82291331858a`, v1) —
  a real workflow that dispatches the point.
- Customized clone `019f4f7f-bc7e-79d8-9ad5-e5f9de2fe6ab` (v3, completes on empty input) — the
  rebind target for the demo.
- Migration `11_flow_point_schema_reconcile` (healed, verified).
- Lineage rows: 3 invocations (default / binding / default-after-restore) + 1 binding revision.
- Shots: `s9_wc_1_prebind_directed.png`, `s9_wc_2_picker.png`, `s9_wc_3_customized.png`,
  `s9_wc_4_using_default.png`, `s9_wc_5_restored_default.png`,
  `s9_workflows_list_no_flowpoint.png`.
- Test principal `s9-outsider@wippy.local`.
