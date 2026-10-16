-- Version restore endpoint isolated from the shared execution API so normal run
-- handlers do not acquire a write-capable import dependency.
local http = require("http")
local http_errors = require("http_errors")
local security = require("security")
local repo = require("workflow_repo")
local definitions_api = require("definitions_api")

local function new(dependencies: any?): any
    local deps = dependencies or {}
    local http = deps.http or http
    local security = deps.security or security
    local repo = deps.workflow_repo or repo
    local definitions_api = deps.definitions_api or definitions_api

local M = {}

local function actor_id(): string?
    local actor = security.actor()
    local id = actor and actor:id() or nil
    return type(id) == "string" and id ~= "" and id or nil
end

function M.handler()
    local req, res = http.request(), http.response()
    if not req or not res then return end
    res:set_content_type(http.CONTENT.JSON)
    local actor = actor_id()
    if not actor then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end
    local id = tostring(req:param("id") or "")
    local access_err = repo.require_access(id, repo.ACCESS.WRITE :: number)
    if access_err then
        res:set_status((http_errors.classify(access_err)))
        res:write_json({ success = false, error = tostring(access_err) })
        return
    end
    local restored, err = definitions_api.restore_version(id, req:param("n"), actor)
    if err or not restored then
        res:set_status((http_errors.classify(err)))
        res:write_json({ success = false, error = tostring(err or "restore failed") })
        return
    end
    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, flow = restored })
end

return M
end

local default = new()
default.new = new
return default
