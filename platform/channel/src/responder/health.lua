local component = require("component")
local time = require("time")
local M = {}
function M.reason(err: any, fallback: string): string
    if errors.is(err, errors.PERMISSION_DENIED) or errors.is(err, errors.UNAVAILABLE)
        or errors.is(err, errors.INVALID) or errors.is(err, errors.INTERNAL) then
        local details = err:details()
        if type(details) == "table" and type(details.reason) == "string" then return details.reason end
    end
    return fallback
end
function M.fields(reason: string, message: any, state: string?): { [string]: string }
    return { health_state = state or "error", health_reason = reason,
        health_message = tostring(message or ""), health_at = time.now():utc():format(time.RFC3339) }
end
function M.report(id: string, reason: string, message: any, state: string?): (boolean, any?)
    return component.set_runtime_meta(id, M.fields(reason, message, state))
end
function M.report_bridge(bridge: any, data: any, sender: any): (boolean, any?)
    if type(bridge) ~= "table" or sender == nil or bridge.pid ~= sender then
        return false, errors.new({ message = "health notification is outside its admitted bridge", kind = errors.PERMISSION_DENIED })
    end
    if type(data) ~= "table" or type(data.reason) ~= "string" then
        return false, errors.new({ message = "health notification requires a reason", kind = errors.INVALID })
    end
    if type(bridge.component_id) ~= "string" or bridge.component_id == "" then return true, nil end
    return M.report(bridge.component_id, data.reason, data.message, data.state)
end
return M
