local http = require("http")
local security = require("security")
local registry = require("registry")
local query_params = require("query_params")
local tool_schema = require("tool_schema")
local tool_visibility = require("tool_visibility")

local TOOL_TYPE = "tool"
local MAX_PICKER_LIMIT = 100
local DEFAULT_PICKER_LIMIT = 25

local M = {}

local function row_for(entry: any): any
    local id = entry.id or ""
    local meta = entry.meta or {}
    local tool = {
        id = id,
        title = meta.title or meta.name or "",
        llm_alias = meta.llm_alias or "",
        llm_description = meta.llm_description or meta.description or meta.comment or "",
        public = true,
    }
    tool.input_schema = tool_schema.decode(meta.input_schema)
    if meta.output_schema ~= nil then
        tool.output_schema = tool_schema.decode(meta.output_schema)
    end
    if meta.icon then tool.icon = meta.icon end
    return tool
end

-- page: shape a deterministic page from registry entries. The HTTP handler
-- validates query arguments before calling this helper.
function M.page(entries: { any }?, args: any): ({ any }, string?)
    args = args or {}
    local q = args.q
    local want_ids = args.want_ids
    local limit = args.limit or DEFAULT_PICKER_LIMIT
    local offset = args.offset or 0
    local matched: { any } = {}
    for _, entry in ipairs(entries or {}) do
        if tool_visibility.entry_is_public_tool(entry) then
            local id = entry.id or ""
            local meta = entry.meta or {}
            local title = meta.title or meta.name or ""
            local llm_alias = meta.llm_alias or ""
            local llm_description = meta.llm_description or meta.description or meta.comment or ""
            local include = want_ids == nil or want_ids[id] == true
            if include and q then
                include = string.find(string.lower(title), q, 1, true) ~= nil
                    or string.find(string.lower(llm_alias), q, 1, true) ~= nil
                    or string.find(string.lower(llm_description), q, 1, true) ~= nil
            end
            if include then matched[#matched + 1] = row_for(entry) end
        end
    end
    table.sort(matched, function(a, b) return tostring(a.id) < tostring(b.id) end)
    if want_ids ~= nil then return matched, nil end

    local page: { any } = {}
    local last = math.min(#matched, offset + limit)
    for index = offset + 1, last do page[#page + 1] = matched[index] end
    local next_cursor = last < #matched and tostring(last) or nil
    return page, next_cursor
end

local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then
        return
    end

    res:set_content_type(http.CONTENT.JSON)
    res:set_header("Cache-Control", "no-store")

    local actor = security.actor()
    if not actor then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end

    -- Async multi-select params for the search-based picker: `ids` returns only
    -- the listed tools (resolves selected chips, ignores q/limit), `q` is a
    -- case-insensitive title/alias/description substring filter, `limit` caps
    -- rows (defaults to 20 when q is present and 25 otherwise). `cursor` is
    -- the next numeric offset returned by the preceding page.
    local ids_param = req:query("ids")
    local want_ids = nil
    if type(ids_param) == "string" and ids_param ~= "" then
        want_ids = {}
        for id in string.gmatch(ids_param, "([^,]+)") do
            local trimmed = id:match("^%s*(.-)%s*$")
            if trimmed ~= "" then want_ids[trimmed] = true end
        end
    end
    local q = nil
    local limit = nil
    local offset = 0
    if not want_ids then
        local q_param = req:query("q")
        q = (type(q_param) == "string" and q_param ~= "") and string.lower(q_param) or nil
        local parsed_limit, limit_err = query_params.query_int(req, "limit", nil, { min = 1, max = MAX_PICKER_LIMIT })
        if limit_err then
            query_params.bad_request(res, limit_err)
            return
        end
        if parsed_limit ~= nil then limit = parsed_limit
        elseif q then limit = 20
        else limit = DEFAULT_PICKER_LIMIT end
        local parsed_cursor, cursor_err = query_params.query_int(req, "cursor", 0, { min = 0 })
        if cursor_err then
            query_params.bad_request(res, cursor_err)
            return
        end
        offset = parsed_cursor or 0
    end

    local entries, err = registry.find({
        [".kind"] = "function.lua",
        ["meta.type"] = TOOL_TYPE,
    })

    if err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = err })
        return
    end

    local tools, next_cursor = M.page(entries, { want_ids = want_ids, q = q, limit = limit, offset = offset })

    res:set_status(http.STATUS.OK)
    local payload: any = {
        success = true,
        count = #tools,
        tools = tools,
    }
    if next_cursor then payload.next_cursor = next_cursor end
    res:write_json(payload)
end

M.handler = handler
M.entry_visible = tool_visibility.entry_is_public_tool

return M
