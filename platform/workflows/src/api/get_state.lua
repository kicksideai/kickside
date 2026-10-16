-- GET /api/v1/workflows/{id}/state — the folded definition snapshot
-- (nodes, edges, notes, layout, viewport, params, head_seq). Requires READ.

local http = require("http")
local security = require("security")
local repo = require("workflow_repo")
local workflow = require("workflow")

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

    local id = tostring(req:param("id") or "")
    local access_err = repo.require_access(id, repo.ACCESS.READ :: number)
    if access_err then
        res:set_status(http.STATUS.FORBIDDEN)
        res:write_json({ success = false, error = "access denied" })
        return
    end

    local snapshot, err = workflow.state(id)
    if err or not snapshot then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = type(err) == "userdata" and err:message() or tostring(err or "state unavailable") })
        return
    end
    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, state = snapshot })
end

return { handler = handler }
