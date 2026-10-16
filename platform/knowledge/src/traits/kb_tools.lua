local util = require("util")
local kb_render = require("kb_render")
local kb_search = require("kb_search")
local kb_answer = require("kb_answer")
local kb_types = require("kb_types")
local component = require("component")
local keyset = require("keyset")

-- Deterministic, runtime-targeted KB tools for agents: the generic dispatch tools
-- (find/search/ask). find discovers a KB, then search and ask retrieve over it by
-- passing the kb_id at call time (or pinned via tool context). Every read is gated by
-- the caller's access, so an agent only reaches KBs its user can read — the same rule
-- the HTTP boundary enforces. Shared rendering/resolution helpers live in kb_render.
local M = {}

local trim = util.trim

-- The tool-result error for a failed retrieval or answer: the cause keeps its kind,
-- retry flag and details; an error without a kind is internal.
local function tool_failure(err: any, fallback: string): any
    local message = "_" .. tostring(err or fallback) .. "_"
    if type(err) ~= "userdata" then
        return errors.new({ message = message, kind = errors.INTERNAL })
    end
    return errors.new({ message = message, kind = err:kind(), retryable = err:retryable(), details = err:details() })
end

-- find: discover the KBs the calling user can access, so the agent can choose one
-- before searching/asking. Optional `q` filters by name/description substring;
-- matches are paged in component id order.
function M.find(args: any, _context: any): any
    local a = (type(args) == "table") and (args :: { q: any, limit: any, cursor: any, fields: any }) or {}
    local limit, cursor, page_err = keyset.args(a, kb_render.MAX_LIMIT)
    if page_err then return nil, page_err end
    local fields, fields_err = kb_render.requested_fields(a.fields)
    if fields_err then return nil, fields_err end
    local svc, svc_err = component.get_service()
    if svc_err or not svc then
        return nil, errors.new({ message = "_knowledge service unavailable_", kind = errors.INTERNAL })
    end
    local result, err = svc:list({ filters = { meta = { class = kb_types.COMPONENT_CLASS } } })
    if err or not result or not result.success then
        return nil, errors.new({ message = tostring("_" .. tostring(err or "failed to list knowledge bases") .. "_"), kind = errors.INTERNAL })
    end
    local q: string? = nil
    if type(a.q) == "string" and a.q ~= "" then q = string.lower(a.q :: string) end
    local matched: { any } = {}
    for _, comp in ipairs((result.components :: { any }?) or {}) do
        local c = comp :: { component_id: string?, meta: any }
        local component_id = c.component_id
        if component_id and component_id ~= "" then
            local meta = (type(c.meta) == "table") and (c.meta :: { [string]: any }) or {}
            local name = (type(meta.title) == "string") and (meta.title :: string) or component_id
            local desc = (type(meta.comment) == "string") and (meta.comment :: string) or ""
            local match = q == nil
                or string.find(string.lower(name), q :: string, 1, true) ~= nil
                or string.find(string.lower(desc), q :: string, 1, true) ~= nil
            if match then
                matched[#matched + 1] = kb_render.selected({
                    kb_id = component_id,
                    name = name,
                    type = meta.kb_type,
                }, { description = desc, meta = meta }, fields :: { [string]: boolean })
            end
        end
    end
    local page, next_cursor = keyset.page(matched, keyset.field("kb_id"), limit :: integer, cursor)
    return { success = true, count = #page, knowledge_bases = page, next_cursor = next_cursor }, nil
end

-- search: manual vector/graph retrieval — ranked passages, no answer. Spans every
-- configured KB; each result is the engine's full item with its kb_id. The
-- cursor carries the configured KB position and engine offset; every KB is
-- access-gated before read. Continue with the same query and configured KBs.
function M.search(args: any, context: any): any
    local a = (type(args) == "table") and (args :: { query: any, limit: any, cursor: any, fields: any }) or {}
    local kb_ids = kb_render.pick_kb_ids(args, context)
    if #kb_ids == 0 then return nil, errors.new({ message = "_kb_id is required_", kind = errors.INVALID }) end
    for _, kb_id in ipairs(kb_ids) do
        local gate = kb_render.deny(kb_id)
        if gate then return nil, gate end
    end
    if type(a.query) ~= "string" or a.query == "" then
        return nil, errors.new({ message = "_query is required_", kind = errors.INVALID })
    end
    local limit, cursor, page_err = keyset.args(a, kb_render.MAX_LIMIT)
    if page_err then return nil, page_err end
    local fields, fields_err = kb_render.requested_fields(a.fields)
    if fields_err then return nil, fields_err end
    local base, offset = 1, 0
    if cursor then
        local base_text, offset_text = string.match(cursor, "^([1-9]%d*):(%d+)$")
        base, offset = tonumber(base_text) or 0, tonumber(offset_text) or -1
        if base < 1 or base > #kb_ids or offset < 0 or offset == math.huge then
            return nil, errors.new({ kind = errors.INVALID, message = "cursor must be a next_cursor value from a previous page" })
        end
    end
    local rows: { any } = {}
    local next_cursor: string? = nil
    for index = base, #kb_ids do
        local kb_id = kb_ids[index]
        local result, err = kb_search.query(kb_id, { query = a.query, limit = (limit :: integer) - #rows, offset = offset })
        if err or not result then
            return nil, tool_failure(err, "search failed")
        end
        if result.success == false then return result, nil end
        local items = (type((result :: { items: any }).items) == "table") and ((result :: { items: any }).items :: {any}) or {}
        for _, raw in ipairs(items) do
            rows[#rows + 1] = kb_render.result_summary(raw, kb_id, fields :: { [string]: boolean })
        end
        if result.next_offset ~= nil then
            next_cursor = tostring(index) .. ":" .. tostring(result.next_offset)
            break
        end
        offset = 0
        if #rows >= (limit :: integer) then
            if index < #kb_ids then next_cursor = tostring(index + 1) .. ":0" end
            break
        end
    end
    return { success = true, query = a.query, count = #rows, results = rows, next_cursor = next_cursor }, nil
end

-- ask: grounded answer over one KB (built-in synthesis or the agentic driver per
-- the KB's config) plus the source passages it used.
function M.ask(args: any, context: any): any
    local a = (type(args) == "table") and (args :: { query: any, limit: any }) or {}
    local kb_id = kb_render.pick_kb_id(args, context)
    local gate = kb_render.deny(kb_id)
    if gate then return nil, gate end
    if type(a.query) ~= "string" or a.query == "" then
        return nil, errors.new({ message = "_query is required_", kind = errors.INVALID })
    end
    local result, err = kb_answer.ask(kb_id :: string, { query = a.query, limit = kb_render.norm_limit(a.limit) })
    if err or not result then
        return nil, tool_failure(err, "ask failed")
    end
    return M.format_ask_result(result)
end

-- format_ask_result shapes a grounded answer and the full source passages it used.
function M.format_ask_result(result: any): any
    local r = (type(result) == "table") and (result :: { answer: any, results: any, count: any }) or {}
    local sources = (type(r.results) == "table") and (r.results :: {any}) or {}
    return { success = true, answer = trim(r.answer), count = #sources, sources = sources }
end

return { find = M.find, search = M.search, ask = M.ask, format_ask_result = M.format_ask_result }
