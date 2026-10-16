-- GET /principals/search?q=&kinds=user,group&limit=20 — the frontend transport
-- for the directory seam (who you can share with). Thin HTTP shell over the
-- directory adapter; consumers never call the user backend directly.
local http = require("http")
local directory = require("directory")
local http_errors = require("http_errors")

local MAX_LIMIT = 100

local function parse_limit(req: any): (integer?, string?)
    local raw = req:query("limit")
    if raw == nil or raw == "" then return 20, nil end
    if type(raw) ~= "string" then return nil, "limit must be an integer" end
    local value = tonumber(raw)
    if not value or value ~= math.floor(value) then
        return nil, "limit must be an integer"
    end
    local limit = value :: integer
    if limit < 1 or limit > MAX_LIMIT then
        return nil, "limit must be between 1 and " .. tostring(MAX_LIMIT)
    end
    return limit, nil
end

local function handler()
    local req = http.request()
    local res = http.response()

    res:set_content_type(http.CONTENT.JSON)

    -- Require a non-empty query: an empty q matches every principal and would scan
    -- the whole roster (plus its per-user group lookups).
    local q = req:query("q") or ""
    if #q < 1 then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "q is required" })
        return
    end

    local limit, limit_err = parse_limit(req)
    if limit_err then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = limit_err })
        return
    end

    local kinds = nil
    local kinds_param = req:query("kinds")
    if kinds_param and kinds_param ~= "" then
        kinds = {}
        for k in string.gmatch(kinds_param, "([^,]+)") do
            kinds[#kinds + 1] = k
        end
    end

    local result, search_err = directory.search({ query = q, kinds = kinds, limit = limit, cursor = req:query("cursor") })
    if search_err or not result then
        local status = http_errors.classify(search_err)
        res:set_status(status)
        res:write_json({ success = false, error = tostring(search_err or "principal search returns no result") })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, principals = result.principals, has_more = result.has_more, cursor = result.cursor })
end

return { handler = handler }
