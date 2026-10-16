-- Traits: runtime capability packs declared in the registry (meta.type=mcp.trait).
-- A trait bundles tool ids + a description + tags + an optional prompt. An agent
-- discovers traits (find_traits) and activates them (use_trait) mid-session,
-- changing its visible tool surface without re-minting. This lib is the read facade
-- over the registry: list, get, search (ranked), and expand trait ids -> tool ids.

local registry = require("registry")
local consts = require("mcp_consts")
local tool_resolver = require("tool_resolver")

local M = {}

local function str_list(v: any): { string }
    local out: { string } = {}
    if type(v) == "table" then
        for _, x in ipairs(v :: { any }) do
            if type(x) == "string" and x ~= "" then out[#out + 1] = x :: string end
        end
    end
    return out
end

-- Only public traits are surfaceable over MCP (meta.private hard-overrides). This
-- is the same gate the agent trait picker (GET /api/v1/agents/traits) applies.
local function is_public(meta: any): boolean
    return type(meta) == "table" and meta.public == true and meta.private ~= true
end

-- expand_tool_ids: declared tool ids -> concrete registry tool ids. An id ending in
-- ":*" names every tool in that namespace and resolves through the wippy/agent tool
-- resolver's find_tools, the expansion the agent compiler applies to the same trait
-- declarations; exact ids pass through. Order is preserved, duplicates collapse.
function M.expand_tool_ids(ids: { string }): ({ string }?, any?)
    local out: { string } = {}
    local seen: { [string]: boolean } = {}
    local function add(id: string)
        if not seen[id] then seen[id] = true; out[#out + 1] = id end
    end
    for _, id in ipairs(ids) do
        if id:match(":%*$") then
            local namespace = id:gsub(":%*$", "")
            local tools, err = tool_resolver.find_tools({ namespace = namespace })
            if err then return nil, err end
            for _, tool in ipairs((tools or {}) :: { any }) do add(tostring((tool :: any).id)) end
        else
            add(id)
        end
    end
    return out
end

local function entry_to_trait(entry: any): (any?, any?)
    local meta: any = entry.meta or {}
    local data: any = entry.data or {}
    -- Tools use the canonical agent.trait declaration.
    local tools = str_list(data.tools)
    local expanded, err = M.expand_tool_ids(tools)
    if err then return nil, err end
    return {
        id = tostring(entry.id),
        name = type(meta.title) == "string" and meta.title or tostring(entry.id),
        description = type(meta.comment) == "string" and meta.comment or "",
        tags = str_list(meta.tags),
        tool_ids = expanded,
        prompt = type(data.prompt) == "string" and data.prompt or "",
        web_component = type(meta.web_component) == "string" and meta.web_component or nil,
    }
end

-- list_all: every public trait.
function M.list_all(): ({ any }?, any?)
    local entries, err = registry.find({ ["meta.type"] = consts.TRAIT_META_TYPE })
    if err then return nil, err end
    local out: { any } = {}
    for _, e in ipairs(entries or {}) do
        if is_public((e :: any).meta) then
            local trait, trait_err = entry_to_trait(e)
            if trait_err then return nil, trait_err end
            out[#out + 1] = trait
        end
    end
    return out
end

-- get: one public trait by registry id, or nil.
function M.get(id: any): (any?, any?)
    if type(id) ~= "string" or id == "" then return nil end
    local entries, err = registry.find({ [".id"] = id })
    if err then return nil, err end
    if not entries or #entries == 0 then return nil end
    local e = entries[1]
    local meta: any = e.meta or {}
    if meta.type ~= consts.TRAIT_META_TYPE or not is_public(meta) then return nil end
    return entry_to_trait(e)
end

function M.is_allowed(id: string, allowed_set: any, restrict_traits: boolean?): boolean
    if type(allowed_set) ~= "table" then return restrict_traits ~= true end
    if restrict_traits ~= true and next(allowed_set) == nil then return true end
    return allowed_set[id] == true
end

function M.allowed(declared: { any }, allowed_set: any, restrict_traits: boolean?): { any }
    local out = {}
    for _, trait in ipairs(declared) do
        if M.is_allowed(trait.id, allowed_set, restrict_traits) then out[#out + 1] = trait end
    end
    return out
end

-- resolve_tool_ids: the union of tool ids across a set of trait ids.
function M.resolve_tool_ids(trait_ids: { string }): ({ [string]: boolean }?, any?)
    local set: { [string]: boolean } = {}
    for _, tid in ipairs(trait_ids) do
        local t, err = M.get(tid)
        if err then return nil, err end
        if t then
            for _, toolid in ipairs((t :: any).tool_ids :: { string }) do set[toolid] = true end
        end
    end
    return set
end

-- find: rank traits against a free-text query + optional tag hints. Cheap text
-- scoring over name/description/tags/tool ids -- no model call -- returning one
-- relevance-ordered page. This is the token-saving discovery path before list_traits.
function M.find(traits: { any }, query: any, tags: any, limit: integer, cursor: string?): ({ any }, string?)
    local q = type(query) == "string" and (query :: string):lower() or ""
    local terms: { string } = {}
    for term in q:gmatch("[%w_]+") do terms[#terms + 1] = term end
    local tag_hints = str_list(tags)

    local scored: { any } = {}
    for _, t in ipairs(traits) do
        local hay = ((t :: any).name .. " " .. (t :: any).description .. " " .. table.concat((t :: any).tags, " ") .. " " .. table.concat((t :: any).tool_ids, " ")):lower()
        local score = 0
        for _, term in ipairs(terms) do
            if hay:find(term, 1, true) then score = score + 1 end
        end
        for _, tag in ipairs(tag_hints) do
            for _, tt in ipairs((t :: any).tags) do
                if tt:lower() == tag:lower() then score = score + 2 end
            end
        end
        if score > 0 or #terms == 0 then
            scored[#scored + 1] = { trait = t, score = score }
        end
    end
    table.sort(scored, function(a: any, b: any): boolean
        if a.score ~= b.score then return a.score > b.score end
        return tostring(a.trait.id) < tostring(b.trait.id)
    end)

    local out: { any } = {}
    local n = limit > 0 and limit or consts.DEFAULTS.FIND_LIMIT
    local start = 1
    if cursor then
        for index, item in ipairs(scored) do
            if item.trait.id == cursor then start = index + 1; break end
        end
    end
    for index = start, math.min(start + n - 1, #scored) do out[#out + 1] = scored[index].trait end
    local last = out[#out]
    return out, last and start + n <= #scored and last.id or nil
end

return M
