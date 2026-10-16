# Upload processing admission

Owner approval: `2026-10-14 owner: approved DECISIONS.md section B` (B5).

Uploads 0.1.71 publishes `kickside.uploads.service:intent_maintenance`,
`kickside.uploads.service:intent_reconcile`, and
`kickside.uploads.service:intent_bootstrap`. Atomic creation/finalization writes
the upload, queued event, Jobs enqueue and acknowledgement in one transaction.
These three repair entries retire together; endpoint paths, upload types,
processing worker ids, table columns and stored uploads retain their identities.

The single manual pre-update procedure is
`scratchpad/sol-lanes/decisions/existing-installation-script.md`, section
“B5: drain upload enqueue intents and retire the repair slot”. It inventories and
drains pending intents with the installed reconciliation operation, verifies
terminal acknowledgements against existing jobs, cancels the repair slot through
Jobs, and requires zero unresolved intents/runnable retired slots before updating.
The lane does not execute the procedure. Historical job rows remain stored.

The permanent guards are `uploads_component_ownership_test`,
`uploads_gateway_completion_test`, and `intent_bootstrap_test` in the Uploads
native harness. They verify rollback during a Jobs outage, successful atomic
retry, idempotent completion metadata and absence of a repair slot. Both engines
use the official runtime v0.3.47a. No engine migration performs legacy conversion.
