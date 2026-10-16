-- GET /api/v1/workflows/blocks projects canonical Blocks for the optional
-- visual editor. The same declarations remain discoverable through
-- kickside.blocks when Workflows is absent.

local http = require("http")
local http_params = require("http_params")
local security = require("security")
local block_catalog = require("block_catalog")

type Map = { [string]: any }

local DETAIL_FIELDS = {
    blurb = true, input_schema = true, config_schema = true, config_wc = true, output_schema = true,
    error_schema = true, ports = true,
}

local function requested_fields(raw: any): (Map?, string?)
    if raw == nil or raw == "" then return {}, nil end
    if type(raw) ~= "string" then return nil, "fields must be comma-separated field names" end
    local selected: Map = {}
    for field in (raw :: string):gmatch("[^,]+") do
        if not DETAIL_FIELDS[field] then return nil, "unsupported Block field: " .. field end
        selected[field] = true
    end
    return selected, nil
end

local function block_record(block: Map, fields: Map): Map
    local row: Map = {
        id = block.id, kind = "block", label = block.label, category = block.category,
        icon = block.icon, hue = block.hue, waits = block.waits == true,
        public = true, source_kind = block.source_kind, tool = block.tool == true,
    }
    for field, _ in pairs(fields) do row[field] = block[field] end
    return row
end

local function new(dependencies: any): any
    local d: Map = type(dependencies) == "table" and dependencies or {}
    local h, params, auth = d.http or http, d.http_params or http_params, d.security or security
    local catalog_source = d.catalog or block_catalog
    local function handler()
    local req = h.request()
    local res = h.response()
    if not req or not res then return nil, "no http context" end
    res:set_content_type(h.CONTENT.JSON)
    if not auth.actor() then
        res:set_status(h.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end

    local catalog, err = catalog_source.catalog()
    if err then
        res:set_status(h.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = tostring(err) })
        return
    end
    local id = tostring(req:query("id") or "")
    if id ~= "" then
        local block = type(catalog) == "table" and (catalog :: Map)[id] or nil
        if type(block) ~= "table" or (block :: Map).public ~= true then
            res:set_status(h.STATUS.NOT_FOUND)
            res:write_json({ success = false, error = "Block not found" })
            return
        end
        res:set_status(h.STATUS.OK)
        res:write_json({ success = true, block = block })
        return
    end
    local fields, fields_err = requested_fields(req:query("fields"))
    if fields_err then params.bad_request(res, fields_err); return end
    local limit, limit_err = params.query_int(req, "limit", 25, {min = 1, max = 100})
    if limit_err then params.bad_request(res, limit_err:message(), limit_err); return end
    local offset, offset_err = params.query_int(req, "offset", 0, {min = 0})
    if offset_err then params.bad_request(res, offset_err:message(), offset_err); return end
    local rows: { Map } = {}
    for _, block in pairs(catalog) do
        if type(block) == "table" and (block :: Map).public == true then rows[#rows + 1] = block_record(block :: Map, fields :: Map) end
    end
    table.sort(rows, function(left: Map, right: Map): boolean return tostring(left.id) < tostring(right.id) end)
    local finish = math.min(#rows, offset + limit)
    local page: { Map } = {}
    for index = offset + 1, finish do page[#page + 1] = rows[index] end
    res:set_status(h.STATUS.OK)
    res:write_json({ success = true, blocks = page, count = #page, next_offset = finish < #rows and finish or nil })
end
    return { handler = handler }
end

return { handler = new({}).handler, new = new }
