# Tool envelope follow-ups

Owner approval: `2026-10-15 owner: tools return structured objects`.

These tools now follow the tool result convention recorded in
`provider-structured-tool-results.md` (success is any value that is not
`(nil, err)`; infrastructure failures return `(nil, err)`; domain outcomes
return `{ success = false, error = "...", <structured fields> }`):

- DiscordWrite: send_message, add_reaction and trigger_typing return
  `{ success, action, result, channel_id, message_id?, emoji? }` instead of text.
- KB10 CreateConcept, AttachDocument, MoveDocument and MergeConcept return
  `{ success, result, concept_id / document_node_id / from_id, into_id, ... }`
  instead of status text; a reused concept carries its guidance in `message`.
- RunCode returns `{ success, result }` or `{ success = false, error, error_kind }`;
  the `kickside.code_execution:run_code` runner keeps its `{ ok, ... }` contract
  for the transform strategy, the Run Code block and dry-run validation.
- DeepResearch and ReportProgress return `{ success, ... }` instead of `{ ok, ... }`.

GetKBNode returns the node whole; its `offset`/`limit` byte-page inputs are retired.
BrowseKB and SurveyKB keep their published markdown and name the next offset or
the BrowseKB call that lists the rest when a list is longer than its limit.

Proof: the providers and components branches `fix/provider-tool-followups` carry
native tests that read the envelope fields directly:

- `discord/test/suites/discord_tools_test.lua`
- `kb10/test/graph_test.lua`, `kb10/test/graph_change_publish_test.lua`,
  `kb10/test/knowledge_api_test.lua`
- `code_execution/test/suites/code_execution_trait_test.lua`
- `research/test/src/deep_research_report_test.lua` (the completed report through a
  test binding of the `kickside.research:request` contract)

Existing installations need no data migration for these tools: their results are
not stored.

PhantomBuster `control_bounds.tool.output_chars` stays in the published config
schema and validator so stored configurations keep validating after a Hub
update. No tool reads it since tool results are no longer truncated; it is a
dead published field.
