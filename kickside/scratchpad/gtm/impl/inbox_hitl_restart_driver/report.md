# Inbox HITL UI + restart proof

Status: **scaffolded; not yet driven**

Acceptance is intentionally split at the real process boundary. Phase 1 must stop with a
published run visibly Awaiting and a pending Inbox item. Only then may the parent coordinate
an application restart. Phase 2 must rediscover both artifacts through the UI before resolving
the item.

Mutation rule: no direct workflow/Inbox API authoring or resolution is allowed. Network
responses initiated by UI interactions may be observed only to capture IDs for correlation.
No token, cookie, authorization header, or credential may enter the report or console output.


## Phase 1 — ready for coordinated restart

- Workflow: `019f53fc-65b8-70df-9a99-60a67a6e0b87` — CODEX-HITL-2026-07-12-01-41-13
- Inbox review node: `9dd1e88b-a02b-4730-9b3e-706c7fa9dd59`
- Awaiting run: `a438d1cb-8f50-48f1-b552-f0df75d6e283`
- Pending Inbox item: `workflow-decision:b0195c85-170d-466c-95f2-5b2d77066b77:595c631b-b2ce-4e6d-862e-069832b94ae9`
- Assignee selected through `wc-principal-picker`: Default Administrator
- UI-only authoring: PASS
- AI preview + explicit Accept: PASS
- All eight controls inspectable; manual edit persisted across reload: PASS
- Screenshots: `01-created-workflow.png`, `02-ai-draft-preview.png`, `03-all-eight-controls.png`, `03a-compact-light.png`, `03b-compact-dark.png`, `04-reload-persistence.png`, `05-wired-review.png`, `06-published.png`, `07-run-waiting-for-approval.png`, `08-inbox-pending-before-restart.png`
- Console errors: none

**Checkpoint:** stop here. Restart has not been performed by this driver.

## Phase 1 — ready for coordinated restart

- Workflow: `019f5661-fffd-7a58-9042-ad95dbd396d5` — CODEX-HITL-2026-07-12-12-51-21
- Inbox review node: `b1d25ec2-5dc0-4fe2-a1dd-61aaadc289fe`
- Awaiting run: `9c11c0a6-959d-4677-ab15-828a3a383cc5`
- Pending Inbox item: `workflow-decision:5368e359-3212-44af-a139-e6020a560de8:430c54a4-f23c-4ed9-bb24-e1a056601572`
- Assignee selected through `wc-principal-picker`: Default Administrator
- UI-only authoring: PASS
- AI preview + explicit Accept: PASS
- All eight controls inspectable; manual edit persisted across reload: PASS
- Screenshots: `01-created-workflow.png`, `02-ai-draft-preview.png`, `03-all-eight-controls.png`, `03a-compact-light.png`, `03b-compact-dark.png`, `04-reload-persistence.png`, `05-wired-review.png`, `06-published.png`, `07-run-waiting-for-approval.png`, `08-inbox-pending-before-restart.png`
- Console errors: Facade initialization failed: Error: no token
    at http://localhost:8085/:76:43

**Checkpoint:** stop here. Restart has not been performed by this driver.

## Phase 1 — ready for coordinated restart

- Workflow: `019f5662-aa25-7052-9abf-84221d7fbc98` — CODEX-HITL-2026-07-12-12-52-09
- Inbox review node: `ac213047-138b-4e27-abf9-582df9f0d6f1`
- Awaiting run: `152cb428-17f1-499b-91e6-3f4c676e25f3`
- Pending Inbox item: `workflow-decision:90c469ae-353d-47ac-a2db-58575de1aa34:d726356b-e05d-4c84-8279-cc3c8f8749f1`
- Assignee selected through `wc-principal-picker`: Default Administrator
- UI-only authoring: PASS
- AI preview + explicit Accept: PASS
- All eight controls inspectable; manual edit persisted across reload: PASS
- Screenshots: `01-created-workflow.png`, `02-ai-draft-preview.png`, `03-all-eight-controls.png`, `03a-compact-light.png`, `03b-compact-dark.png`, `04-reload-persistence.png`, `05-wired-review.png`, `06-published.png`, `07-run-waiting-for-approval.png`, `08-inbox-pending-before-restart.png`
- Console errors: none

**Checkpoint:** stop here. Restart has not been performed by this driver.
