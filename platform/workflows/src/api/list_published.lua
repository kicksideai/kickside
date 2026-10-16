-- GET /workflows/published — actor-scoped, bindable published workflows for
-- automation destinations. The endpoint projects the canonical published catalog
-- directly; agent tooling consumes the same catalog without sitting in this API path.

local http = require("http")
local http_params = require("http_params")
local http_errors = require("http_errors")
local security = require("security")
local published_catalog = require("published_catalog")

local function new(dependencies: any): any
    local d = type(dependencies) == "table" and dependencies or {}
    local h, params, auth = d.http or http, d.http_params or http_params, d.security or security
    local catalog = d.catalog or published_catalog
    local classify = (d.errors or http_errors).classify
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

    local id = tostring(req:query("id") or "")
    if id ~= "" then
        local rows, err = catalog.catalog({ id = id, limit = 1 })
        if err then
            res:set_status(classify(err))
            res:write_json({ success = false, error = tostring(err) })
            return
        end
        if not rows or not rows[1] then
            res:set_status(h.STATUS.NOT_FOUND)
            res:write_json({ success = false, error = "published workflow not found" })
            return
        end
        res:set_status(h.STATUS.OK)
        res:write_json({ success = true, item = rows[1] })
        return
    end
    local limit, limit_err = params.query_int(req, "limit", 25, {min = 1, max = 100})
    if limit_err then params.bad_request(res, limit_err:message(), limit_err); return end
    local offset, offset_err = params.query_int(req, "offset", 0, {min = 0})
    if offset_err then params.bad_request(res, offset_err:message(), offset_err); return end
    local items, err, next_offset = catalog.bindable_items({limit = limit, offset = offset})
    if err then
        res:set_status(classify(err))
        res:write_json({ success = false, error = tostring(err) })
        return
    end
    res:set_status(h.STATUS.OK)
    res:write_json({ success = true, items = items or {}, count = #(items or {}), next_offset = next_offset })
end
    return { handler = handler }
end

return { handler = new({}).handler, new = new }
