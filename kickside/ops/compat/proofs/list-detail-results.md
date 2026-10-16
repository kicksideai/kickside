# Compact list results and complete details

Owner approval: `2026-10-15 owner: lists are compact summary rows; detail returns the whole object`.

List and search actions return only identifiers and the fields needed to choose
an item, together with their documented continuation cursor or provider page.
They do not put bodies, descriptions, block descriptors, or JSON schemas in a
default row.  A `fields` input includes provider-selectable fields where the
provider supports selection.  The corresponding get or detail action returns
the complete object.

The following native tests exercise the changed product surfaces, including a
default compact row, requested fields or a complete detail where applicable,
and continuation to a later page:

- `platform/blocks/test/suites/contract_test.lua` — block summaries and full
  descriptors.
- `platform/mcp/test/src/meta_tool_list_test.lua` — compact meta-tool pages and
  the complete protocol `tools/list` schema result.
- `platform/knowledge/test/src/kb_search_paging_test.lua` and
  `platform/knowledge/test/src/kb_tools_test.lua` — requested fields and
  cursor continuation.
- `platform/automation/test/src/suites/agent/automations_read_test.lua` and
  `platform/automation/test/src/suites/recurring/recurring_test.lua` — compact
  automation and schedule reads.
- `platform/workflows/test/src/suites/agent_tools_test.lua` — workflow list
  rows and complete run detail.
- `platform/agents/test/src/suites/traits/platform_manager_test.lua`,
  `platform/skills/test/src/suites/traits/skill_tool_test.lua`, and
  `platform/uploads/test/src/upload_cases/uploads_indexed_parts_test.lua` —
  compact list rows and their existing detail reads.

The change has no stored-data, identifier, endpoint, event, requirement, or
contract-method migration.  Existing callers that omit new optional paging or
field inputs receive the first compact page; callers obtain complete content
through the corresponding detail action or an explicit fields request.
