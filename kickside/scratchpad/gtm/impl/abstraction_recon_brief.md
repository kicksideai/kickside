# Recon: complete inventory of behavior-mounting abstractions + UI audit vs John's interface spec

Read-only recon. Two deliverables, written to files.

## Deliverable 1: `kickside/scratchpad/gtm/abstraction_inventory.md`
Sweep repos: kickside/ (platform/*, core/*), wapps/*, providers/*, crm/. Inventory EVERY mechanism by which a behavior/automation/workflow gets mounted, declared, or installed:
- registry meta.types: kickside.automation.installable, kickside.automation.suggested_binding, kickside.flow.point, kickside.workflows.flow_template, trigger point declarations, sync source/sink port declarations, workflow_node declarations, automation binding kinds, script automation kinds, cron/schedule declarations, agent trait/tool declarations, inbox item_type declarations — plus ANY other meta.type that mounts behavior I haven't listed.
For each: where defined (module/file), who consumes it (which service/UI reads it), how many declarations exist per repo, what its config surface is (config_schema? slots? parameters?), overlap with the others (what could express the same thing).
Then a matrix: for each of the ~19 automation-catalog installables, what does its binding_spec/sync_spec actually DO at install time, and which GENERAL abstraction (flow.binding on a flow.point, automation binding on a trigger point, sync pair, published workflow template) could express the identical behavior with no installable type.
Also inventory: which behaviors today are CODE-path only (no user-visible redefinable workflow behind them) — e.g. score, qualify, suppression, research stages, extraction — anything a user cannot open in the workflow builder and replace.

## Deliverable 2: `kickside/scratchpad/gtm/ui_audit_vs_john.md`
John's interface spec (scratchpad/gtm/digest.md §1.3 interface spec + requirement rows 29-35): six nav views — Dashboard (spine status + daily stats), Approval Queue (ONE queue, urgency-sorted: imminent-meeting briefs first, high-intent follow-ups, comments, SOWs; two-click Review→Edit/Approve&Send/Regenerate/Reject; <15min/day), per-spine workflow views (row: name, phase, status, last run, output count, run-manually button), per-agent Config (trigger, inputs, prompt with version history, KB attachments, output type, approval-required toggle default ON, run logs), Connections grid (status, last successful call, which agents depend on it — blast radius), KB upload/organize/version UI.
Audit the LIVE app (screenshots exist under scratchpad/gtm/e2e-shots/; the running instance is :8085 — read UI source in wapps/*/ui and app/views rather than browsing) against each: exists? partial? missing? where does the current UI deviate (extra clutter, missing urgency sort, missing run-manually, missing prompt version history, missing blast-radius on connections, variable-weight review tiers rows 30)?
Be specific: file/surface per finding. No fixes — findings only.

Constraints: read-only (no edits, no commits). Wippy docs at https://wippy.ai/llm/toc if kind semantics are unclear.
