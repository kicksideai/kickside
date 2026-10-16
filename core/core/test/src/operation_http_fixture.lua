local access = require("access")
local M = {ADMIN = 8, WRITE = 2, READ = 1, id = "018fa746-bd62-7000-a000-000000000001"}
function M.reset(stage: string, source: error?, cleanup: error?): ()
    M.stage, M.source, M.cleanup = stage, source, cleanup
    M.releases, M.effects, M.opens = 0, 0, 0
    M.captured = {status = 200}
    M.gate = access.new({reader = {get_component_id = function() return "component", nil end},
        component = {has_access = function() return true, nil end}})
end
function M.gate_thread_access(...: any): (boolean, integer, string?, string?, error?)
    local allowed, status, message, component_id, err = M.gate.gate_thread_access(...)
    if type(allowed) ~= "boolean" or type(status) ~= "number" or status % 1 ~= 0
        or (message ~= nil and type(message) ~= "string") or (component_id ~= nil and type(component_id) ~= "string")
        or (err ~= nil and type(err) ~= "userdata") then
        error(errors.new({kind = errors.INTERNAL, retryable = false, message = "HTTP guard requires an access decision"}))
    end
    return allowed, status :: integer, message :: string?, component_id :: string?, err :: error?
end
function M.release_error(db: any, primary: error?, committed: boolean?): error? return M.gate.release_error(db, primary, committed) end
function M.error_response(err: error | string, display: string?): (integer, table)
    local status, payload = M.gate.error_response(err, display)
    if type(status) ~= "number" or status % 1 ~= 0 or type(payload) ~= "table" then
        error(errors.new({kind = errors.INTERNAL, retryable = false, message = "HTTP guard requires a native response"}))
    end
    return status :: integer, payload
end
function M.failure_response(...: any): (integer, table)
    local status, payload = M.gate.failure_response(...)
    if type(status) ~= "number" or status % 1 ~= 0 or type(payload) ~= "table" then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "HTTP guard requires a native response"})) end
    return status :: integer, payload
end
function M.request(): any
    return {param = function() return M.id end, body = function() return "{}" end, query = function() return nil end}
end
function M.response(): any
    return {set_content_type = function() end, set_status = function(_, status) M.captured.status = status end,
        write_json = function(_, body) M.captured.body = body end}
end
function M.get(...: any): (any, error?)
    M.opens = M.opens + 1
    if M.stage == "get" or M.stage == "missing_get" then return nil, M.source end
    return {release = function(): (any, error?)
        M.releases = M.releases + 1
        if M.stage == "missing_release" then return nil, nil end
        if M.stage == "false_release" then return false, nil end
        return M.cleanup == nil, M.cleanup
    end}, nil
end
local function refusal(stage: string): error? if M.stage == stage then return M.source end return nil end
function M.parse(...: any): (any, error?) if M.stage == "missing_parse" then return nil, nil end; return {worker_ref = "func://app:guard_worker"}, refusal("parse") end
function M.validate(...: any): (any, error?) if M.stage == "missing_validate" then return nil, nil end; return {worker_ref = "func://app:guard_worker"}, refusal("validate") end
function M.capture(...: any): (any, error?) if M.stage == "missing_capture" then return nil, nil end; return {}, refusal("capture") end
local function write(): (any, error?)
    if M.stage == "work" or M.stage == "missing_work" then return nil, M.source end
    M.effects = M.effects + 1
    return {cursor_id = "cursor", projection_id = "projection", kind = "guard", generation = 1, created = true, status = "active"}, nil
end
M.pause, M.resume, M.remove_projection, M.register_projection, M.upsert = write, write, write, write, write
function M.find_by_thread(...: any): (any, error?)
    if M.stage == "work" or M.stage == "missing_work" then return nil, M.source end
    return {thread_id = M.id}, nil
end
function M.list_projections(...: any): (any, error?, any) return {{id = "projection"}}, refusal("work"), {} end
function M.list_cursors(...: any): (any, error?, any) return {{id = "cursor"}}, refusal("cursors"), {} end
function M.decode(...: any): (any, error?) return nil, refusal("cursor") end
function M.response_page(...: any): (any, error?) if M.stage == "missing_page" then return nil, nil end; return {projections = {}, cursors = {}, count = 0}, refusal("page") end
return M
