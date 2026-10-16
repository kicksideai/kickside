# Proposal: external-workflow consumer demo (Face 4)

Owner ask: a host process where a published workflow can be dropped in, inputs/outputs mapped,
"click to configure" opening a rich popup. Grounded in `runner_faces_recon.md` (file:line evidence
there). Gate: proof round confirms the builder works in principle before any of this is built.

## What exists vs what's missing

| Piece | Status |
|---|---|
| Runner contract (async spawned-child run) | exists — `kickside.workflows:runner` |
| Published Start/Finish/Error schema discovery via API | exists — `GET /workflows?partial=published` + versions API |
| Workflow picker + schema-driven form widgets | exist — `wc-component-picker` (class=workflow), `wc-schema-form` |
| REST endpoint returning Finish OUTPUT of a run | **missing** — only internal `await_result` + realtime `run.finished` carry it |
| Boundary input mapping (host payload → Start input) | **missing** — every boundary today is raw passthrough |
| Face 3 agent-tool wiring | dangling — `agent_tool.lua` complete + tested, called from nowhere; no UI sets `params.agent_tool.enabled` |
| Face 4 embed/run surface | missing entirely |

## Design ruling (one grammar, one seam)

1. **Consumer step = picker + mapped input + runner call.** A "Run workflow" step binding in the
   host: `wc-component-picker` (published-only) to choose the workflow, then a config panel
   rendered from the workflow's *published* Start schema.
2. **Boundary mapping reuses the edge grammar.** The graph already has ONE mapping grammar — the
   expr-lang edge transform (`mapping.lua`). The consumer boundary uses the same transform with the
   host payload as input, instead of inventing a second mapper dialect (anti-garbage-pipe: one
   grammar). Static values are the degenerate case of the same form.
3. **Output face: one small API addition.** Extend `GET /workflows/{id}/runs/{run_id}` to include
   Finish output when the run is finished (READ-gated, same policy as today). This is net-new work
   whichever host we pick — smallest possible seam, no new endpoint family.
4. **"Click to configure" popup, v1:** modal = picker + Start-schema form + mapping fields +
   published I/O summary (reusing WorkflowCallPicker's compat-badge logic). An "Open in editor"
   action routes to the workflow's existing manage view. **v2:** embed `kickside-workflow-builder`
   itself in a large modal (tag already exists; needs a mount/route audit) — polish, not blocker.

## Demo host

Cheapest credible host per recon: an automation-port binding modeled on `run_workflow_port` —
composes entirely from existing pickers/forms + the runner contract, needs no Recipes surgery, and
demos the real product story ("create an automation out of a workflow" with actual input mapping,
which today passes trigger payload raw).

## Build order (post-gate)

1. Run-result API extension (small, unblocks any consumer face).
2. Consumer step binding: picker + schema form + runner call, static inputs first.
3. Boundary expr-lang mapping (host payload → Start), same grammar as edges.
4. Configure-popup polish; v2 embedded editor.
5. Opportunistic: wire the dangling Face-3 agent-tool path (descriptor → agent tool catalog +
   `agent_tool.enabled` toggle in the builder) — it's built and tested, just unplugged.
