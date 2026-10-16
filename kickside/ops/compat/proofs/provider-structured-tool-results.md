# Provider tools return structured results

Owner approval: `2026-10-15 owner: provider tools return structured objects`.

Provider tools are real tools used by agents, workflows and code. Each tool
follows the tool result convention: success is any returned value that is not
`(nil, err)`, here a table of full records with the data fields flat in the
table (a `success` field is not required); an infrastructure failure returns
`(nil, err)` with a typed error; a domain outcome returns
`{ success = false, error = "...", <structured fields> }`. Each tool's
`output_schema` declares the success table and the domain error table. The earlier JSON-text and plain-text encodings
(`encode()`, `MAX_OUTPUT`, `json_preview` truncation envelopes and text
renderings) are removed.

Single objects return whole with their published fields. Collections keep the
provider's own pagination as limit and cursor inputs with a next cursor in the
result: Jira startAt/maxResults/nextPageToken, Confluence start/limit/cursor,
Slack cursor, Discord after/before, Google pageToken, HubSpot after, GitHub
page/per_page with next_page, Fireflies skip, SimpleFIN date windows and KB10
offsets. Document content (Confluence page body, Google Doc and Drive file,
Gmail body) is complete text inside the envelope. ReadPage and BrowseTree keep
their published markdown-string results, now complete, and need no record.

The recorded findings are the `output_schema` type change from `string` to
`object` (GitHub read: `object` or `array` of full GitHub records) for each
listed tool. Input schemas keep their published properties, with the
result-window byte-page parameters retired.

Proof: the providers branch `fix/restore-provider-tool-shapes` carries one
native test per tool family that calls the handler and reads nested fields of
the returned object directly:

- `atlassian/test/suites/jira_traits_test.lua`, `atlassian/test/suites/confluence_traits_test.lua`
- `discord/test/suites/discord_tools_test.lua`
- `fireflies/test/suites/traits_test.lua`
- `github/test/suites/traits_test.lua`
- `google/test/suites/tools_test.lua`
- `hubspot/test/suites/traits_test.lua`
- `kb10/test/graph_test.lua` (GetConceptDocuments)
- `phantombuster/test/suites/traits_test.lua`
- `simplefin/test/row_output_test.lua`
- `slack/test/suites/slack_tools_test.lua`
- `telegram/test/suites/telegram_tools_test.lua`

Existing installations need no data migration: tool results are not stored by
these modules, and agents read the declared schema from the registry on the
next turn.
