-- GET /inbox[?id=&status=&type=&priority=&page=&limit=] — the user's inbox items,
-- priority then recency ordered. metadata_json is decoded into metadata for the
-- UI. Auth + admin authz are enforced by the router firewall + policy.

local http = require("http")
local json = require("json")
local security = require("security")
local reader = require("inbox_reader")
local inbox_types = require("inbox_types")
local inbox_events = require("inbox_events")
local object_fields = require("object_fields")
local inbox_files = require("inbox_files")

local M = { _modules = {} }

local function dependency(name: string, original: any): any
    local override = M._modules[name]
    return override ~= nil and override or original
end

local MAX_LIMIT = 200
local DEFAULT_PAGE = 1
local DEFAULT_LIMIT = 50

local function parse_query_int(value: any, default_value: integer, name: string): (integer?, string?)
    if value == nil or value == "" then return default_value, nil end
    if type(value) ~= "string" then return nil, name .. " must be an integer" end
    local n = tonumber(value)
    if not n or n ~= math.floor(n) then
        return nil, name .. " must be an integer"
    end
    return n :: integer, nil
end

local function parse_pagination(req: any): (integer?, integer?, string?)
    local page, page_err = parse_query_int(req:query("page"), DEFAULT_PAGE, "page")
    if page_err or not page then return nil, nil, page_err or "invalid page" end

    local limit, limit_err = parse_query_int(req:query("limit"), DEFAULT_LIMIT, "limit")
    if limit_err or not limit then return nil, nil, limit_err or "invalid limit" end

    if page < 1 then return nil, nil, "page must be >= 1" end
    if limit < 1 or limit > MAX_LIMIT then
        return nil, nil, "limit must be between 1 and " .. tostring(MAX_LIMIT)
    end
    return page, limit, nil
end

local function handler()
    local http = dependency("http", http)
    local security = dependency("security", security)
    local reader = dependency("reader", reader)
    local inbox_events = dependency("events", inbox_events)
    local res = http.response()
    local req = http.request()
    if not res or not req then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    local actor = security.actor()
    local actor_id = actor and actor:id() or nil
    if not actor_id or actor_id == "" then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end

    local q = reader.query()
    local id = req:query("id")
    if id and id ~= "" then q:by_id(id) end
    -- status: omitted/"pending" -> pending; "resolved" -> any non-pending;
    -- "all" -> no status filter; otherwise a specific status.
    local status = req:query("status")
    if status == "all" then
        -- no status filter
    elseif status == "resolved" then
        q:resolved()
    elseif status and status ~= "" then
        q:by_status(status)
    else
        q:by_status(inbox_types.STATUS.PENDING)
    end
    local itype = req:query("type")
    if itype and itype ~= "" then q:by_type(itype) end
    local prio = req:query("priority")
    if prio and prio ~= "" then q:by_priority(prio) end

    local page, limit, page_err = parse_pagination(req)
    if page_err or not page or not limit then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = page_err or "invalid pagination" })
        return
    end
    local total_count, count_err = q:count()
    if count_err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = tostring(count_err) })
        return
    end

    q:page(page, limit)

    local rows, err = q:all()
    if err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = tostring(err) })
        return
    end

    local counts, counts_err = q:counts()
    if counts_err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = tostring(counts_err) })
        return
    end
    counts = type(counts) == "table" and counts or {}

    local items = {}
    for _, row in ipairs(rows or {}) do
        local r = row :: { [string]: any }
        local meta = {}
        if type(r.metadata_json) == "string" and r.metadata_json ~= "" then
            local decoded, derr = json.decode(r.metadata_json :: string)
            if not derr and type(decoded) == "table" then meta = decoded end
        end
        local files, files_err = dependency("files", inbox_files).list(r.files)
        if files_err then
            res:set_status(http.STATUS.INTERNAL_ERROR)
            res:write_json({ success = false, error = tostring(files_err) })
            return
        end
        items[#items + 1] = {
            id = r.id, item_type = r.item_type, title = r.title, content = r.content,
            files = files,
            metadata = object_fields.object(meta), source_id = r.source_id, status = r.status,
            priority = r.priority, actor_id = r.actor_id,
            created_at = r.created_at, resolved_at = r.resolved_at,
            action = r.action, form = r.form ~= nil and object_fields.object(r.form) or nil,
        }
    end

    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        count = #items,
        total_count = total_count or #items,
        item_count = counts.item_count,
        pending_count = counts.pending_count,
        resolved_count = counts.resolved_count,
        urgent_count = counts.urgent_count,
        high_count = counts.high_count,
        items = items,
        component_id = inbox_events.component_id_for_owner(actor_id),
    })
end

M.handler = handler
return M
