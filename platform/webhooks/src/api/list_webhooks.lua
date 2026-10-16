-- GET /api/v1/webhooks — the current user's webhooks (no secrets, just prefixes).

local http = require("http")
local security = require("security")
local repo = require("webhook_repo")
local http_errors = require("http_errors")

local function new(dependencies: any): any
    local d = type(dependencies) == "table" and dependencies or {}
    local http, security, repo = d.http or http, d.security or security, d.repo or repo
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

        local rows, err, next_cursor = repo.list({ limit = req:query("limit"), cursor = req:query("cursor") })
        if err then
            res:set_status((http_errors.classify(err)))
            res:write_json({ success = false, error = tostring(err) })
            return
        end
        res:set_status(http.STATUS.OK)
        res:write_json({ success = true, webhooks = rows or {}, next_cursor = next_cursor })
    end
    return { handler = handler }
end

return { handler = new({}).handler, new = new }
