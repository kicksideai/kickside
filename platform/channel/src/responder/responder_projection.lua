-- Channel responder read-model: pause/resume controls emit typed events on the
-- responder component thread; this projection owns the public status meta.

local component = require("component")

local M = {}

local STATUS_CHANGED = "kickside.channel.responder.events:status.changed"
local SESSION_ACTIVATED = "kickside.channel.responder.events:session.activated"
local SESSION_COMPLETED = "kickside.channel.responder.events:session.completed"

type Map = { [string]: any }

local function apply(body: Map, ev: any)
    if type(ev) ~= "table" then return end
    local etype = tostring((ev :: Map).type or "")
    local payload: Map = type((ev :: Map).body) == "table" and ((ev :: Map).body :: Map) or {}
    if etype == STATUS_CHANGED then
        local status = payload.status
        if status == "paused" or status == "active" then body.status = status end
        return
    end
    if etype == SESSION_ACTIVATED then
        body.session = {
            state = "active",
            session_id = payload.session_id,
            thread_id = payload.thread_id,
            route_key = payload.route_key,
            activated_at = payload.at,
        }
        body.response_gate = { mode = "pass_through", reason = "session_active" }
        return
    end
    if etype == SESSION_COMPLETED then
        local current = type(body.session) == "table" and (body.session :: Map) or {}
        local current_session_id = tostring(current.session_id or "")
        local completed_session_id = tostring(payload.session_id or "")
        if current_session_id ~= "" and completed_session_id ~= "" and current_session_id ~= completed_session_id then
            return
        end
        body.session = {
            state = "idle",
            session_id = completed_session_id ~= "" and completed_session_id or current_session_id,
            thread_id = payload.thread_id or current.thread_id,
            route_key = payload.route_key or current.route_key,
            activated_at = current.activated_at,
            completed_at = payload.at,
            completed_reason = payload.reason,
        }
        body.response_gate = { mode = "configured", reason = "session_completed" }
    end
end

local function sync_public_meta(input: any, body: Map): (boolean, string?)
    local component_id = type(input.thread_id) == "string" and input.thread_id or ""
    if component_id == "" then return true, nil end
    local component_api = (type(input.component) == "table" and input.component) or component
    local ok, err = component_api.set_meta(component_id, { status = body.status or "active" })
    if ok == true then return true, nil end
    return false, tostring(err or "component.set_meta failed")
end

function M.run(input: any): any
    input = type(input) == "table" and input or {}
    local projection = type(input.projection) == "table" and input.projection or {}
    local body: Map = type(projection.body) == "table" and (projection.body :: Map) or {}

    local events = type(input.events) == "table" and input.events or {}
    for _, ev in ipairs(events :: { any }) do apply(body, ev) end

    local meta_ok, meta_err = sync_public_meta(input, body)
    if not meta_ok then return nil, meta_err end

    local range = type(input.range) == "table" and input.range or {}
    return { body = body, last_seq = tonumber(range.to_seq) or nil }
end

return M
