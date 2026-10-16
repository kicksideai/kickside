-- GET /api/v1/workflows/{id}/events?from_seq= — the event tail after from_seq.
-- Requires READ. Clients use this to catch up when a WS delta gap is detected.

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

    local from_seq = tonumber(req:query("from_seq")) or 0
    local limit = math.max(1, math.min(500, tonumber(req:query("limit")) or 500))
    local events, err = workflow.events(id, from_seq, { limit = limit })
    if err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = tostring(err) })
        return
    end
    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, events = events or {}, from_seq = from_seq, limit = limit })
end

return { handler = handler }
