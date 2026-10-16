-- Inject a retrieval envelope into the production tool's presentation probe.
local ctx = require("ctx")

type Passage = {
    id: string,
    content: string,
    meta: { similarity: number }?,
}
type QueryOptions = { query: string, limit: integer? }
type QueryResult = { items: { Passage } }

local function query(_kb_id: string, _opts: QueryOptions): (QueryResult, string?)
    return { items = ctx.get("passages") :: { Passage }, next_offset = ctx.get("next_offset") }, nil
end

return { query = query }
