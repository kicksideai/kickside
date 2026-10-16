# Workflow Builder UX Friction Audit — "UX Audit Sandwich"

Built one real workflow end-to-end entirely through the live UI (http://localhost:8085), first-time-user style, measuring every schema entry point. Workflow id `019f487a-472e-74d2-927a-a2a1fe92130e`, published as version 1. Evidence screenshots referenced inline are in `./wf_ux_evidence/`.

Graph built: **Start {topic, audience} → Google Search (tool) → Refund Triage (agent, typed exit schema) → Read Web Page (tool) → Finish {content, source_url}**, plus **Agent → Error** boundary edge.

## Outcome summary

- Everything was buildable through the UI. **Zero API fallbacks / dead ends.**
- Publish succeeded first try, no compile refusal.
- Run **FAILED** at the first tool: `Node [...] failed: Google Search API key not configured` — an environment credential gap, not a build/UX defect. Start completed; the run view surfaced the failure clearly.

## Measurement totals

- **UI interactions (human-equivalent): ~60–65** clicks / typing sessions / drags.
- **Time-equivalent:** ~20–30 min for a first-timer (competent user ~12–18 min). Most of the cost: arranging nodes, drawing edges, and authoring the two hand surfaces (agent exit schema + edge transforms).
- **Schema surfaces: 3 assist-covered-and-working, 2 structured (no JSON needed), 4 hand-written (incl. 1 where assist failed).**

## Schema-by-hand table (the core measurement)

| # | Surface | Assist offered? | Assist quality | Hand-written? | Evidence |
|---|---------|-----------------|----------------|---------------|----------|
| 1 | **Start input schema** | Yes (`AI assist` + "Describe the schema") | Excellent — generated `{topic, audience}` typed, with descriptions + `required`, shown as a **diff with Accept/Undo** | No | `s17_startassist.png` |
| 2 | **Finish output schema** | Yes | Good — generated `{content, source_url}` | No | (Finish panel) |
| 3 | **Error schema** | Yes | Good — generated `{step_name, message}` | No | `s27_movegs.png` (Error panel) |
| 4 | **Agent exit schema** | **No** — raw JSON textarea only | — | **Yes** (typed `{summary, url}` by hand) | `s35_agentpanel.png` |
| 5 | **Agent run context** | **No** — raw JSON textarea only | — | Would be by hand (left empty) | `s35_agentpanel.png` |
| 6 | **Tool config** (Google Search `query`/`num`, Read Web Page args) | N/A — **structured `wc-schema-form` fields**, not JSON | Good — typed inputs with descriptions/defaults | **No JSON at all** | `s20_addgoogle.png` |
| 7 | **Run-with-input payload** | N/A — **schema-driven Form** generated from Start schema (Form/JSON toggle) | Good — `topic *` / `audience *` fields with descriptions, validated | No (form; JSON optional) | `s49_form.png` |
| 8 | **Edge mapping (transform)** ×2 | Yes (`Map fields with AI`) but **FAILED: "OpenAI API error: 504"** | Unavailable at test time | **Yes** — hand-wrote `{ query: output.topic }` and `{ url: output.url }` | `s43_mapai.png` |
| 9 | **Edge condition (when)** | No assist — raw expression input (placeholder `output.status == 'ok'`) | — | Would be by hand | `s33_autolayout.png` |

Assist-covered & working: **3** (Start / Finish / Error boundary schemas). Assist offered but broken: **1** (edge mapping, 504). No-JSON structured: **2** (tool config, run input). Pure hand-written raw JSON/expression: **agent exit schema, agent run context, 2 edge transforms, edge condition**.

Note: the boundary-schema assist (describe → generate → Accept/Undo) is genuinely strong — better than n8n, which has no prompt-to-schema. The inconsistency is that the **agent** exit-schema and **edge** mapping — the two surfaces a non-developer is most likely to get stuck on — are exactly the ones without working assist.

## Friction log (in sequence)

1. **Creation discoverability: easy.** Workflows list has a primary `+ New workflow` button with a dropdown (`Blank workflow` / `Partial`). `s06_wf_open.png`, `s07_newwf.png`. Minor: "Partial" jargon unexplained beyond a one-liner.
2. Name dialog is clean (`s08_blank.png`); lands on an empty canvas with a helpful empty-state ("Drag a Start, agent or tool… or press ⌘K"). `s09b_create.png`.
3. **Palette is rich and real:** Structure(3), Agents(2), Automations(1), Workflows(1), Logic(6), Human(3), **Tools(126)**, Destinations(10), plus GTM/CRM tool groups. Web-search/research tools exist (Google Search, Deep Research, Read Web Page, Fetch URL). No substitution needed.
4. **Click-to-add drops nodes at a cascaded center that overlaps existing nodes** (`s20_addgoogle.png` — Google Search landed on top of Start). Required zoom-out + manual repositioning; `Auto layout` fixes it once edges exist. Medium friction.
5. **Agent-node model split (real finding):** the generic agent node (`Refund Triage`) exposes Tool-calling / Model / Additional tools / **Exit schema** / Run context — but **no inline instructions** (instructions live in the pre-built agent). The one node kind that *does* take inline instructions (`Research`, a Prompt textarea) has **no exit schema** — its output is an opaque reference. So "an agent with instructions AND a typed exit schema" cannot be expressed in a single node. `s28_research_panel.png` (Research: Prompt, no schema) vs `s35_agentpanel.png` (agent: schema, no prompt).
6. **Agent exit schema / run context are bare JSON textareas with no AI assist** — inconsistent with the boundary schemas. Had to hand-author the typed `{summary, url}`. (Expected for this pre-consolidation bundle; recorded as a hand surface.)
7. **Edge drawing works** (handle-to-handle drag) with live green/red/amber compatibility ghosting; mismatches are downgraded to "needs a mapping", not blocked. But long diagonal drags to an awkwardly-placed node failed once and needed a retry after `Auto layout` (`s33_autolayout.png`).
8. **Edge "Map fields with AI" failed with `OpenAI API error: 504`** (`s43_mapai.png`) — the single assist that would most help a non-developer map fields was unavailable, forcing hand-written transforms.
9. **Field mapping = raw expression authoring.** Transforms/conditions are free-text (`{ query: output.topic }`, `output.status == 'ok'`) with only a placeholder example — **no field picker, no autocomplete, no data pills** from the upstream schema. You must guess `output.*` paths. Medium-high friction for non-developers.
10. **Edge into the Error boundary is permitted** (agent → Error created fine), but for plain tool/agent nodes there's **no dedicated failed-port**; the Error node reads as a pinned global catch. Explicit per-branch error routing really wants a failed-port node (Research/Branch/Human). Minor semantic ambiguity.
11. **Publish: one click, instant success** — "Published version 1. It's now callable — as an automation, a Call node, or an agent tool." No refusal despite the fan-out to Error. `s47_publish.png`. Low friction.
12. **Run-with-input is schema-driven** (`s49_form.png`): "validated against the Start schema. Nothing is published", Form/JSON toggle, typed `topic`/`audience` fields. Good.
13. **Run failed, well surfaced** (`s51_poll.png`, `s53_rundetail.png`): red banner with node id + reason "Google Search API key not configured"; run overlay shows **Start = green ✓ completed, Google Search = red ✗ failed, downstream = pending**, read-only "Viewing run" mode with "Click a step … to see what it received and produced". Strong debuggability. Minor: the banner names the failing node by UUID, not "Google Search".

## Dead ends forcing API fallback

**None.** Every construction step — creation, node add, all schemas, edges, mappings, publish, run — was done through the UI. (The edge AI-assist 504 is a feature failure, but the transform was still authored in-UI by hand, not via API.)

## Top 5 friction points

1. Agent **exit schema + run context are bare JSON textareas with no AI assist**, while boundary schemas have excellent assist — the inconsistency lands on the harder surface.
2. **Edge "Map fields with AI" failed (OpenAI 504)** — forced hand-written transform expressions.
3. **No single node kind offers both inline agent instructions and a typed exit schema** (Research = prompt/no-schema; generic agent = schema/no-prompt).
4. **Field mapping is raw expression text with guessed `output.*` paths** — no field picker / autocomplete / upstream-data pills.
5. **Click-to-add overlaps new nodes** on existing ones, requiring manual repositioning or Auto-layout.

## Verdict

**Could a non-developer have done this?** Partly. The scaffolding is genuinely non-developer-friendly and in places better than n8n: discoverable creation, a describe→generate→Accept schema assistant for the three boundary schemas, structured (no-JSON) tool config, a schema-driven run form, one-click publish, and a clear green/red run overlay. A non-developer would sail through those.

They would **stall at two developer walls**: (a) hand-writing the agent exit schema as raw JSON, and (b) authoring edge transform/condition expressions with guessed field paths — made worse because the AI mapper (the intended escape hatch) returned a 504. Understanding the agent-instructions-vs-exit-schema split and the Error-routing model also assumes workflow literacy.

**Where it falls short of an n8n-class experience:** n8n gives a visual field mapper with drag-from-previous-node data pills and expression autocomplete resolved against real upstream data, plus per-node "execute step" input/output panels. Here, cross-node mapping is a raw expression textarea whose only assist failed, and there's no schema-aware field picker. The run inspector (status badges + click-to-inspect) is close to n8n; the **mapping authoring is the gap**.

**Did the run complete?** No — it **failed** at Google Search with "Google Search API key not configured" (missing credential), after Start completed. Build and publish were clean; the failure is environmental and was reported clearly.
