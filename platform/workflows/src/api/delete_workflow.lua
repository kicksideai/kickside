local http = require("http")
local security = require("security")
local repo = require("workflow_repo")
local http_errors = require("http_errors")

local function new(dependencies: any): any
    local d = type(dependencies) == "table" and dependencies or {}
    local h, auth, workflows = d.http or http, d.security or security, d.repo or repo
    local function handler()
        local req, res = h.request(), h.response()
        if not req or not res then return nil, "no http context" end
        res:set_content_type(h.CONTENT.JSON)
        if not auth.actor() then
            res:set_status(h.STATUS.UNAUTHORIZED)
            res:write_json({ success = false, error = "authentication required" })
            return
        end
        local id = tostring(req:param("id") or "")
        local access_err = workflows.require_access(id, workflows.ACCESS.DELETE)
        if access_err then
            res:set_status((http_errors.classify(access_err)))
            res:write_json({ success = false, error = tostring(access_err) })
            return
        end
        local ok, err = workflows.delete(id)
        if not ok then
            res:set_status((http_errors.classify(err)))
            res:write_json({ success = false, error = tostring(err or "delete failed") })
            return
        end
        res:set_status(h.STATUS.OK)
        res:write_json({ success = true, id = id })
    end
    return { handler = handler }
end

return { handler = new({}).handler, new = new }
