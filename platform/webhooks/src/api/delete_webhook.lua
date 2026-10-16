-- DELETE /api/v1/webhooks/{id} — remove a webhook component through the shared
-- component delete path. The webhook binding's deletable cleanup removes the side row.

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

        local webhook_id = req:param("id")

        local ok, err = repo.delete(webhook_id)
        if not ok then
            res:set_status((http_errors.classify(err)))
            local body = { success = false, error = tostring(err or "delete failed") }
            if err and errors.is(err, errors.CONFLICT) then
                local details = err:details()
                if type(details) == "table" then
                    body.code = details.code
                    body.subscriber_count = details.subscriber_count
                end
            end
            res:write_json(body)
            return
        end
        res:set_status(http.STATUS.OK)
        res:write_json({ success = true, webhook_id = webhook_id })
    end
    return { handler = handler }
end

return { handler = new({}).handler, new = new }
