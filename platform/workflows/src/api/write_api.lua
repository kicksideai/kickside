-- Write endpoints for the definition plane. apply/undo/redo run the workflow writer,
-- which commits definition events and undo history in one transaction, then
-- broadcast the produced events to the workflow's realtime topic. All require WRITE.

local http = require("http")
local json = require("json")
local security = require("security")
local repo = require("workflow_repo")
local workflow = require("workflow")
local realtime = require("workflow_realtime")
local types = require("workflow_types")

local M = {}

local function error_message(err: any): string
    if type(err) == "userdata" then return err:message() end
    return tostring(err or "write failed")
end

local function write_error(res: any, err: any): ()
    local msg = error_message(err)
    local details = type(err) == "userdata" and err:details() or nil
    if type(details) == "table" and details.reason == types.BOUNDARY_REMOVE_REFUSED then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({
            success = false,
            error = "boundary_node_remove_refused",
            message = "Boundary nodes cannot be removed from a published workflow interface.",
            details = { node_id = details.node_id, kind = details.kind },
        })
        return
    end
    local conflict = type(err) == "userdata" and err:kind() == errors.CONFLICT
    res:set_status(conflict and http.STATUS.CONFLICT or http.STATUS.BAD_REQUEST)
    res:write_json({ success = false, error = msg })
end

local function actor_id(): string?
    local actor = security.actor()
    if not actor then return nil end
    local id = actor:id()
    if type(id) == "string" and id ~= "" then return id end
    return nil
end

local function run(exec: (string, any, string) -> (any?, any?), needs_body: boolean)
    local req = http.request()
    local res = http.response()
    if not req or not res then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    local aid = actor_id()
    if not aid then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end

    local id = tostring(req:param("id") or "")
    local access_err = repo.require_access(id, repo.ACCESS.WRITE :: number)
    if access_err then
        res:set_status(http.STATUS.FORBIDDEN)
        res:write_json({ success = false, error = "access denied" })
        return
    end

    local commands: any = {}
    if needs_body then
        local raw = req:body()
        local body: any = {}
        if type(raw) == "string" and raw ~= "" then
            local decoded, derr = json.decode(raw)
            if derr then
                res:set_status(http.STATUS.BAD_REQUEST)
                res:write_json({ success = false, error = "invalid JSON body" })
                return
            end
            if type(decoded) == "table" then body = decoded end
        end
        if type(body.commands) ~= "table" then
            res:set_status(http.STATUS.BAD_REQUEST)
            res:write_json({ success = false, error = "commands array required" })
            return
        end
        commands = body.commands
    end

    local response, err = exec(id, commands, aid)
    if err or not response then
        write_error(res, err)
        return
    end

    local broadcast_err = realtime.broadcast(id, response.events)
    if broadcast_err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "workflow realtime broadcast: " .. tostring(broadcast_err) })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        events = response.events or {},
        head_seq = response.head_seq or 0,
        state = response.state,
        can_undo = response.can_undo == true,
        can_redo = response.can_redo == true,
    })
end

function M.apply()
    return run(function(id: string, commands: any, aid: string) return workflow.apply(id, commands, aid) end, true)
end
function M.undo()
    return run(function(id: string, _: any, aid: string) return workflow.undo(id, aid) end, false)
end
function M.redo()
    return run(function(id: string, _: any, aid: string) return workflow.redo(id, aid) end, false)
end

-- POST /workflows/{id}/labels { labels: string[] }. Labels are a first-class
-- definition edit, so this uses the ordinary writer/event stream rather than
-- component metadata (which would couple grouping to the host placement tree).
function M.set_labels()
    local req = http.request()
    local res = http.response()
    if not req or not res then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    local aid = actor_id()
    if not aid then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end

    local id = tostring(req:param("id") or "")
    local access_err = repo.require_access(id, repo.ACCESS.WRITE :: number)
    if access_err then
        res:set_status(http.STATUS.FORBIDDEN)
        res:write_json({ success = false, error = "access denied" })
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
    if type(body.labels) ~= "table" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "labels array required" })
        return
    end

    local response, err = workflow.apply(id, { { type = types.COMMAND.LABELS_SET, body = { labels = body.labels } } }, aid)
    if err or not response then
        write_error(res, err)
        return
    end

    local broadcast_err = realtime.broadcast(id, response.events)
    if broadcast_err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "workflow realtime broadcast: " .. tostring(broadcast_err) })
        return
    end
    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        labels = type(response.state) == "table" and (response.state :: any).labels or {},
        events = response.events or {},
        head_seq = response.head_seq or 0,
    })
end

return M
