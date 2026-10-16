# CRM structured tool results

Owner approval: `2026-10-15 owner: tools return structured objects`.

Published baseline: kickside/crm 0.4.1. The fourteen CRM agent tools declared
`output_schema` as a string holding a JSON envelope. Each tool now returns
a table on success, `(nil, err)` with a typed error for infrastructure
failures and `{ success = false, error = "...", <structured fields> }` for
domain outcomes, and declares the success and domain error schemas. Field names are flat: `rows`/`total`/`limit`/`offset`, `record`,
`board`, `entries`, `schema`, or the written identity fields.

`list_records` pagination is unchanged: `limit` and `offset` in, `rows`,
`total`, `limit` and `offset` out. No stored data changes.

Proof: `crm/test/src/crm_tool_shapes_test.lua` and
`crm/test/src/crm_privacy_test.lua`.
