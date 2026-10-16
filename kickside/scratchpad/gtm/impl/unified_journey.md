# The Unified Journey — one continuous session, graded as one experience

Live on http://localhost:8085 (admin@wippy.local), driven browser-first with the
playwright-core harness (`scratchpad/gtm/journey/`, reuses the W20 builder helpers).
Structure/config mutations go through the same definition `apply` command endpoint the
builder panels call; the demo-critical moments (create dialog, palette build, intent/field
mapper, publish, run inspector, agent chat, share, flow-point WC, add-trigger form) were
driven and captured live in the real UI. Screenshots: `scratchpad/gtm/journey/shots/`
(`01`–`38` + `35_flowpoint_wc`, run/def JSON exports). No restarts/builds/git.

## Demo artifacts (KEEP)

- **JOURNEY — Lead scorer** `019f4fdf-b455-707f-853b-cc0ebaf85fd0` — published **v5**, label `journey`.
  Start{name,email} → Agent "Score the lead" → Branch "Qualified?" → [true] Score fit → Finish; [false] → Error.
- **JOURNEY — Wrapper** `019f4ffc-06b5-795d-be3e-782ba15834cb` — v1, Call node → Lead scorer v4.
- **Lead-scorer clone (slot target)** `019f5003-543f-7f2e-a631-3fba892835e0` — v1, permissive Start; bound to the CRM Qualification slot.

## Step-by-step verdicts

| # | Step | Verdict | Evidence |
|---|------|---------|----------|
| 1 | Create + build graph + intent/field mapper | **PASS** | Named "New workflow" dialog → builder (`01`–`04`). Palette drag of Score fit/Agent/Branch (`node:gtm_score_fit`, `agent:inline`, `logic:branch`) (`05`). Full chain assembled + auto-laid-out (`06`,`07`). Start→Score-fit edge drawn live by mouse-drag opened the CONNECTION field mapper: CONDITION(WHEN) `output.status=='ok'`, MAPPING "All required fields mapped", "Draft with AI", UPSTREAM OUTPUT email/name, THIS STEP'S INPUT expression (`08`). Auto-map resolved **calm** (unambiguous) rather than the loud popover. |
| 2 | Label + grouped view | **PASS** | `labels:["journey"]`; Grouped list shows a `journey` group (1) split from the 16 unlabeled (`10`). Location = root (not placed). |
| 3 | Publish (gate) + version history | **PASS** | Publish gate passed silently → "Published version 1…" banner (`11`,`12`); `versions` API confirms v1 (def_seq 40). |
| 4 | Run A + B (universality) + inspector + export | **PASS** | A `jane@acme.com` → agent scored ≥50 → qualified → Score fit → **Finish (completed)**; B `bob@gmail.com` → agent scored 25 "free consumer email domain" → **Error (rejected)**. Both reach valid terminals. Inspector: per-node I/O (INPUT `{email,name}`, AGENT TRACE "Called 1 tool"), Overview + **Timeline** (run.started/data.dataflow.input/node.created events), "Export redacted JSON", "View in Keeper" (`20`,`22`,`23`). Run JSON exported (`run_A_export.json`, 12KB). Hierarchy N/A here (no child) — shown in step 6. |
| 5 | Automate (in-builder Add-trigger) | **PASS** (pause friction) | In-builder Add-trigger renders a **full** schedule form (Name, "On a schedule", Runs-every N min, "Evaluated in UTC", input mapper "2 required fields unmapped" + Draft-with-AI, "What this creates", Enable-now) — the **W20 empty-body gap is FIXED** (`36`,`37`). Created periodic automation `019f5010`; it **fired ~40s later** → run `89549892` (trigger_kind=`binding`, **completed**). DELETE clean. Pause via `/state`+`/config`+`PUT` all returned "binding is not an automation type". |
| 6 | Compose (Wrapper Calls Lead scorer) | **PASS** | Call node `call_workflow` (ports result/failed) → Lead scorer v4; published; run `grace@navy.mil` → **completed**, child output **consumed** at Finish (`{"result":{fit,lane,…}}`); execution **hierarchy** present (child dataflow `489b8d20`, depth) (`24`). |
| 7 | Agent chat — live Workflow Execution artifact | **PASS (first live proof)** | Workflow Runner (demo) agent, asked to run Lead scorer for Jane Smith → inline **Workflow Execution artifact rendered live** with node states (Start ✓, Finish ✓, Score fit ✓, Score the lead "↓249 ↑34 Agent completed successfully"), result back in conversation ("Fit: Low, Lane: Services"), session auto-titled (`28`). |
| 8 | Share + export/import | **PASS** (import-title friction) | Share dialog → add **S9 Outsider (Read)**; access **flipped 403→200**, outsider list 1→2 (`29`–`32`). Export → portable (portable_key, 4.4KB); import → distinct **draft** `019f5003` auto-titled the raw portable_key ("Workflow 019f4fdf…"), not "Copy of…". |
| 9 | Edit → new version, compat check, diff, restore, discard | **PASS** | **Compat gate fired**: breaking edit (added required `region`) → publish **409 `compatibility_confirmation_required`** `{breaking:true, changes:[{field:"region","… required added"}]}`. Reverted; clean edit (raise bar `score>=50`→`>=55`) → **v5**. `diff?from_version=4&to_version=5` → interface before/after. Restore v1 → draft `019f5009`; discarded (DELETE). History side-panel did not render on the toolbar "History" click in-session (UI finickiness). |
| 10 | Flow point — bind to CRM Qualification slot | **PASS (via compatible clone)** | Binding Lead scorer directly → **400 `binding_incompatible: target Start does not accept point input`** (point input `{type:object}` vs Lead scorer's required `{name,email}`). Per the brief: used a **permissive-Start clone** `019f5003` → **bind 200**, slot **state=customized** (rev 1). Flow-points WC shows **"S9 — CRM Qualification Slot · Customized · Workflow 019f4fdf…v1"** with Edit/Bind-existing/Restore-default (`35`). |

## Friction log (where you had to think, hunt, or leave the flow)

1. **The intrinsic business node's data-flow contract (biggest seam, steps 1/4).** `gtm_score_fit`:
   (a) `config.profile_ref` alone never reaches the runtime — the function fails "profile_ref is
   required" until `profile_ref` is injected into the node **input** via the edge field mapper;
   (b) it flattens any `{name,email}` to `fit:low / total:0` (needs real firmographics);
   (c) edge mappings see **only the immediate upstream output** — no run-input/accumulated scope —
   so a strict linear `Start→ScoreFit→Agent` cannot feed the agent the lead identity. This forced
   the working topology (agent scores off Start; Score fit enriches on the qualified branch).
   A first-time author following the literal "Start → intrinsic → agent" order hits a dead end.
2. **Publish gate refuses a dangling node** ("success paths must terminate at Finish") — correct,
   but you discover the routing rule only at publish time, mid-authoring.
3. **Pause has no path for a binding-kind automation (step 5).** `/automations/{id}/state`,
   `/config`, and `PUT` all return "binding is not an automation type"; only DELETE works.
4. **Imported clone auto-titles the raw portable_key** ("Workflow 019f4fdf…"), not "Copy of…" (step 8).
5. **Envelope strictness blocks the obvious bind (step 10).** A schema-strict workflow can't bind to
   a permissive `{type:object}` slot without relaxing its Start — you must clone + loosen the contract.
6. **Silent/absent surfaces:** the publish gate passes with no visible checklist; the version
   **History side-panel** didn't open from the toolbar button in this session.
7. **Intent auto-map went calm, not loud** on Start→Score-fit (unambiguous) — the loud
   "what should flow here?" popover only triggers on genuinely ambiguous required mismatches.

## Frictionless / premium (worked cleanly the first time)

Named-create dialog; palette drag; the CONNECTION field mapper (upstream fields + Draft-with-AI +
"all required mapped"); label + grouped view; publish→banner; the **run inspector** (per-node I/O,
agent trace, Timeline events, Export JSON, View-in-Keeper); the **live Workflow Execution artifact in
chat**; share + instant access flip; export→portable; versions/diff/restore + the **compat warning**;
the wrapper's child-consumption + hierarchy; the **now-populated Add-trigger schedule form**; the
periodic fire producing a real run; the flow-points WC states.

## Overall grade: **B+** (core spine is A-grade)

The whole journey runs end-to-end as one continuous story and the spine —
build → publish → run/inspect → compose → agent-run-in-chat → share → version → flow-point — is
genuinely premium and demo-ready. What holds it back from an A is one deep seam (the intrinsic
business node's config/data-flow contract that forces you to re-think the topology) plus a cluster of
edge frictions (binding-kind pause, import title, envelope strictness, a couple of unrendered
surfaces). None block the demo; a prepared owner routes around them.

## Owner demo script (exact click path)

1. **Workflows → New workflow** → name **"JOURNEY — Lead scorer" → Create**. Drag **Score fit**,
   **Agent**, **Branch** from the palette. Wire Start→Agent→Branch; Branch **True**→Score fit→Finish,
   Branch **False**→Error. Click the Start→ edge to show the **field mapper** (condition + mapping +
   Draft-with-AI). Set the Agent instructions (score by email domain) + output shape `{score,reason}`,
   Branch predicate `output.score >= 55`, Score-fit profile via the mapper. **Auto layout**.
2. Row **Label → journey**; list toggle **Grouped** shows the `journey` group.
3. **Publish** → "Published version 1"; **History** shows the version.
4. **Run** → fill `name`/`email` (business email) → completes at **Finish**; run a free-email input →
   routes to **Error**. Open **Past runs** → a completed run → **Overview** (per-node I/O, agent trace)
   and **Timeline**; **Export redacted JSON**.
5. **Add trigger** → **On a schedule**, every N minutes → map `name`/`email` (Fixed value) →
   **Create automation** (Enable now). It fires and produces a run; delete it from **Automations**.
6. **New workflow "JOURNEY — Wrapper"** → drag **Start Workflow**, pick **JOURNEY — Lead scorer** →
   wire Start→Call→Finish (Call failed→Error) → Publish → **Run**; child result appears at Finish.
7. **Agents → Workflow Runner (demo) → Chat**: "Run JOURNEY — Lead scorer for Jane Smith,
   jane@acme.com." The **Workflow Execution artifact renders live** in chat; the result returns in the reply.
8. Builder **Share** → search **outsider** → pick **S9 Outsider** (Read) → **+ Share**. Then row menu
   **Export**; **Import** the file → a new draft.
9. Small edit (raise the bar) → **Publish** (confirm the compatibility warning if it appears) →
   **History** → **Diff v4↔v5** → **Restore as draft** → discard.
10. On the CRM component's **workflow settings (flow points)** → **Qualification slot → Bind existing** →
    pick the Lead-scorer clone → slot flips to **Customized**.
