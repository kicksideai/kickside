# Tools return records directly; registries page their lists

Owner approval: `2026-10-15 owner: tools return full structured results`.

Success is any value a tool returns without an error. The Platform tool
(`kickside.agents.traits:platform_manager_tool`) and the Knowledge tool
(`kickside.knowledge.traits:knowledge_manager_tool`) return the owning
registry's record directly instead of wrapping it as `result` beside a
`success` flag, so their output schemas drop `result` and declare the record's
own fields (`component_id`, `created`, `agent`, `connection`,
`reply_provider`, `kb`, `rollback`, `ok`, `details`). Callers read those fields
at the top level. `kickside.contract:tool_result` `ok(value)` returns its value
unchanged, including strings.

`ViewFiles` (`kickside.uploads.traits:view_files`) returns whole text content,
so its byte-window `offset` and `limit` inputs are removed; callers stop
passing them and read `content` whole.

The registry `list` methods of `kickside.agents:agents`,
`kickside.connection:connections` and `kickside.connection:reply_providers`
page through the component service: each answers one offset page
`{ <records>, total_count, has_more }` for `pagination { limit, offset }`, and
`include_page` is removed because the paged shape is the only shape. Every
in-tree caller passes pagination and reads the page.

Proof, in the kickside repository:
- `core/contract/test/tool_result_test.lua` ("returns a success value unchanged, whatever its type").
- `platform/agents/test/src/suites/traits/platform_manager_test.lua` (mutation actions return the registry record).
- `platform/uploads/test/src/upload_cases/uploads_indexed_parts_test.lua` ("ViewFiles returns the whole text content of a long document").
- `platform/agents/test/src/suites/registry/agents_test_create_find_update_delete_cycle.lua`,
  `platform/connection/test/src/suites/registry/connections_test.lua` and
  `platform/connection/test/src/suites/registry/reply_providers_test.lua` ("paged list").

# Tool inputs and full engine records

Owner approval: `2026-10-15 owner: tools return full structured results`.

ViewFiles removes the unused `format` input. The handler never reads it, so
removing the declaration preserves file rendering. The native test
`platform/uploads/test/src/tool_errors_test.lua` checks that the schema exposes
only implemented inputs; the existing indexed-parts suite checks whole text,
images and artifact pages.

Knowledge removes `include_config` from its input schema and always returns full
engine records. Existing `id` values and limit/cursor paging remain. Engine
configuration, bindings, views and projections remain present when the engine
declares them. The native test
`platform/knowledge/test/src/knowledge_manager_test.lua` checks full records even
when an existing caller supplies `include_config=false`, then traverses every
engine page. No stored data changes.

## Knowledge engine continuation and domain failures

SearchKB keeps full engine items and resumes with a cursor containing the
configured KB position and the engine offset. The facade forwards optional offset
to the queryable binding. Queryable declares optional offset/next_offset; existing
callers that omit them retain their first-page behavior. Page limits remain 1–50
and default to 25. Invalid paging returns a typed INVALID error.

An engine domain failure returns its complete object unchanged, rather than an
empty successful page. The output schema declares both success and domain error
objects. This replaces the previous search-only object-shape transition findings
with the exact `/meta/output_schema/oneOf` finding. All other transition records
remain present.

Proof: `platform/knowledge/test/src/kb_search_paging_test.lua` checks engine offset
forwarding, multi-KB continuation including empty bases and base boundaries,
complete result fields, final pages, invalid paging and domain-error identity.
`core/contract/test/contract_smoke_test.lua` checks optional query paging schemas.
