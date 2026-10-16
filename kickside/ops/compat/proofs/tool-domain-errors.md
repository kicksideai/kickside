# Tool domain errors

Owner approval: `2026-10-15 owner: tools fail with typed errors`.

A tool fails with a typed error `(nil, err)` or returns a structured domain
error `{ success = false, error, ... }`. The Platform tool
(`kickside.agents.traits:platform_manager_tool`) and the knowledge manager tool
(`kickside.knowledge.traits:knowledge_manager_tool`) return the owning
registry's domain error unchanged, so their output schemas declare `success`
only for that refusal (`const: false`) with an `error` message instead of
`const: true`. Successful results are the registry's records without a success
flag.

Proof: `platform/agents/test/src/suites/traits/platform_manager_test.lua` in the
kickside repository, and the MCP dispatcher test
`platform/mcp/test/repo_authorization_test.lua` ("marks a failed tool envelope
as an MCP error and preserves its content"), which returns a domain error as
`isError` with the table as `structuredContent`.
