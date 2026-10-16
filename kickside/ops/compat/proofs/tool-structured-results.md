# Structured tool results

Owner approval: `2026-10-15 owner: tools return structured objects`.

Tools are called by workflows and code as well as agents, so structured results
are tables whose fields a caller maps directly; document text read as a
document may stay markdown. Success is any returned value that is not
`(nil, err)`; a `success` field is not required. An infrastructure failure
returns `(nil, err)` with a typed error; a domain outcome returns
`{ success = false, error = "...", <structured fields> }`. The following tools change their output schema from a
markdown string (or a string-or-object union) to an object:

| Tool | Object fields |
| --- | --- |
| `kickside.knowledge.traits:kb_query_tool` (QueryKB) | `query`, `count`, `results` (full engine items with `kb_id`) |
| `kickside.knowledge.traits:kb_retrieve_tool` (RetrieveKB) | `query`, `count`, `results` |
| `kickside.knowledge.traits:kb_search_tool` (SearchKB) | `query`, `count`, `results` |
| `kickside.knowledge.traits:kb_ask_tool` (AskKB) | `answer`, `count`, `sources` |
| `kickside.knowledge.traits:kb_find_tool` (FindKnowledgeBases) | `count`, `knowledge_bases`, `next_cursor` |
| `kickside.uploads.traits:view_files` (ViewFiles) | `files`, `_images` |
| `kickside.uploads.traits:list_files` (ListFiles) | `files`, `count`, `has_more`, `next_after_file_id` |
| `kickside.uploads.traits:count_files` (CountFiles) | `count`, `filters` |
| `kickside.skills.traits:skill_tool` (Skill) | list `skills`/`next_cursor`; use `skill`/`files`; writes `skill_id`/`message` |
| `kickside.skills.traits:skill_file_tool` (SkillFile) | list `files`/`next_cursor`; read the file record with `content` |
| `kickside.agents.traits:redirect_action` (Redirect) | list `agents`/`next_cursor`; switch `message`/`_control` |
| `kickside.agents.traits:trait_curator_tool` (Capabilities) | list `capabilities`/`next_cursor`; activate/deactivate `message`/`_control` |

Native tests read nested fields from each result: knowledge `traits_test`,
`kb_tools_test`; uploads `uploads_indexed_parts_test`,
`uploads_architecture_test`; skills `skill_tool_test`; agents
`agents_action_test`, `master_traits_test`. Inputs stay compatible; list actions
gain `limit` and `cursor`. No event, persisted record, identifier, requirement or
endpoint changes; no manual installation data conversion applies.
