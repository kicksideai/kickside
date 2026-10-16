# Inbox HITL restart proof driver

This is a two-phase, browser-only acceptance harness for the real Inbox review
workflow node. It does not call workflow or Inbox mutation APIs. Workflow creation,
node placement, AI drafting, acceptance, field editing, publishing, launching, and
Inbox decisions are all performed through visible UI controls.

The harness observes the browser's own JSON responses only to record durable IDs in
`checkpoint.json`; it never sends a `fetch`, reads local-storage tokens, or logs request
headers. Screenshots and the redacted interaction journal are written under `evidence/`.

It reuses the authenticated `scratchpad/gtm/journey/profile` Chrome profile. It refuses
to run if that profile is active and refuses to type or store credentials. If the profile
has expired, open it interactively, authenticate, close Chrome, and rerun.

## Phase 1 — stop at the restart boundary

```bash
node scratchpad/gtm/impl/inbox_hitl_restart_driver/phase1_to_awaiting.mjs
```

Success ends with `RESTART_READY` after:

1. creating a workflow in the UI;
2. placing and wiring the Inbox review node;
3. drafting all non-identity settings from plain language;
4. visibly reviewing and accepting the AI draft;
5. selecting the assignee through `wc-principal-picker`;
6. inspecting all eight declared controls and editing the accepted draft;
7. reloading and verifying those visible controls persist;
8. publishing and launching from the UI;
9. seeing the run as Awaiting and the pending Inbox item;
10. recording workflow, node, run, and Inbox item IDs.

Do not run phase 2 until the app has been deliberately restarted and is healthy.

## Phase 2 — after the coordinated restart

```bash
node scratchpad/gtm/impl/inbox_hitl_restart_driver/phase2_after_restart.mjs
```

Phase 2 proves the Awaiting run and pending Inbox item survived, resolves the item from
the Inbox UI, and confirms the same run completes in workflow history. It then drives a
second run through the alternate decision when possible.

