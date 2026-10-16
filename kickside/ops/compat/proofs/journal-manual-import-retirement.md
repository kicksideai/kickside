# Journal legacy import retirement

Owner 2026-10-14 Section A moves the legacy importer, purge and NDJSON conversion
into the single manual existing-installation procedure before the package update.
The verified current Hub baseline is `chestor/journal` 0.2.48.

The operator inventories and validates the immutable export, imports its events
through the currently installed operation, resumes to completion, explicitly
inventories any obsolete journals before purge, and verifies event identities and
counts. Those count/change/verification statements are in the single
`scratchpad/sol-lanes/decisions/existing-installation-script.md` procedure.
No installation operation runs during this lane and no engine migration imports data.

`chestor.journal.traits:migrate_legacy_tool` retains its registry identity and
`handle` method for the existing `reconcile` and `reembed` callers. Its import/purge
actions and their input/output properties retire after the manual pre-update step.
The administrative title/LLM alias describes maintenance. Journal ids, canonical
events, stored rows, workspace paths, HTTP endpoints and maintenance behavior remain.
The importer-only native migration tests retire with that operation; current
projection, graph derivation, lease-less command and workspace tests remain.
