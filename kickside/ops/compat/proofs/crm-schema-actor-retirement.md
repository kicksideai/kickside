# CRM schema actor retirement

Owner approval: `2026-10-15 owner: remove per-CRM schema actor, schema edits run in the request`.

Published baseline: kickside/crm 0.4.1. The per-CRM schema actor
(`kickside.crm.service:schema_authority`), its host config
(`kickside.crm.service:config`), the dispatch client
(`kickside.crm.schema:client`) and the `kickside.crm:process_host` requirement
are removed. Schema apply, import, provision, rollback and object contribution
run in the caller's request through `kickside.crm.schema:mutation`, inside the
storage transaction that already checks `expected_revision`. Results and errors
are unchanged; a stale revision returns "CRM schema revision conflict".

No stored data changes. Installations that set `process_host` need no action;
the value is no longer read.

Proof: `crm/test/src/crm_schema_mutation_test.lua` (stale expected revision
refused, schema unchanged) and `crm/test/src/crm_schema_import_remove_test.lua`.
