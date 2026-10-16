-- GET /api/v1/workflows — the current user's accessible workflow components.
-- `published=true` is the only picker filter.

local http = require("http")
local http_params = require("http_params")
local http_errors = require("http_errors")
local security = require("security")
local repo = require("workflow_repo")

type Map = { [string]: any }

local DETAIL_FIELDS = {
    labels = true, head_seq = true, interface = true, published_interface = true,
    published_def_seq = true, has_draft_changes = true, parent_id = true, parent_name = true,
    breadcrumb = true, last_run = true, node_count = true, run_count = true,
}

local function requested_fields(raw: any): (Map?, string?)
    if raw == nil or raw == "" then return {}, nil end
    if type(raw) ~= "string" then return nil, "fields must be comma-separated field names" end
    local selected: Map = {}
    for field in (raw :: string):gmatch("[^,]+") do
        if not DETAIL_FIELDS[field] then return nil, "unsupported workflow field: " .. field end
        selected[field] = true
    end
    return selected, nil
end

local function summary(record: Map, fields: Map): Map
    local row: Map = {}
    for _, field in ipairs({ "id", "title", "status", "created_at", "updated_at", "published_version" }) do row[field] = record[field] end
    for field, _ in pairs(fields) do row[field] = record[field] end
    return row
end

local function handler()
    local req = http.request()
    local res = http.response()
    if not req or not res then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    if not security.actor() then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end

    local limit, limit_err = http_params.query_int(req, "limit", 25, {min = 1, max = 100})
    if limit_err then http_params.bad_request(res, limit_err:message(), limit_err); return end
    local offset, offset_err = http_params.query_int(req, "offset", 0, {min = 0})
    if offset_err then http_params.bad_request(res, offset_err:message(), offset_err); return end
    local fields, fields_err = requested_fields(req:query("fields"))
    if fields_err then http_params.bad_request(res, fields_err); return end
    local rows, err, next_offset = repo.list({limit = limit, offset = offset, published_only = req:query("published") == "true"})
    if err then
        res:set_status((http_errors.classify(err)))
        res:write_json({ success = false, error = tostring(err) })
        return
    end
    local items: { Map } = {}
    for _, row in ipairs(rows or {}) do items[#items + 1] = summary(row :: Map, fields :: Map) end
    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, workflows = items, count = #items, next_offset = next_offset })
end

return { handler = handler }
