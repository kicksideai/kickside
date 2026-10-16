-- PATCH /api/v1/webhooks/{id} — update mutable webhook management fields:
-- label and validation schema. Secrets are immutable and still shown only at mint.

local http = require("http")
local json = require("json")
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

        local body: any = {}
        local raw = req:body()
        if type(raw) == "string" and raw ~= "" then
            local decoded, derr = json.decode(raw)
            if derr or type(decoded) ~= "table" then
                res:set_status(http.STATUS.BAD_REQUEST)
                res:write_json({ success = false, error = "invalid JSON body" })
                return
            end
            body = decoded
        end

        local row, err = repo.update(req:param("id"), body)
        if err or not row then
            res:set_status((http_errors.classify(err)))
            res:write_json({ success = false, error = tostring(err or "update failed") })
            return
        end
        res:set_status(http.STATUS.OK)
        res:write_json({ success = true, webhook = row })
    end
    return { handler = handler }
end

return { handler = new({}).handler, new = new }
