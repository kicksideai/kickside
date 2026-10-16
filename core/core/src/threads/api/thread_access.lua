-- Per-thread IDOR gate for the mutating/reading sub-endpoints under
-- /threads/{id}/... (projections, retention). Those handlers bind straight
-- to persist code that does no access control, so each must resolve the thread's
-- component and check the current actor's access through the component contract
-- before touching state. A thread is a component: kickside_thread.component_id is
-- its component id, and the threads component lib owns the access decision.

local component = require("threads_component")
local http_errors = require("http_errors")
local error_envelope = require("error_envelope")
local committed_error = require("committed_error")
local masks = require("core_types")
local reader = require("threads_reader")
local uuid = require("uuid")

local function new(dependencies: any?): any
local deps = dependencies or {}
local component = deps.component or component
local reader = deps.reader or reader
local access = {}

-- A pooled connection or open transaction.
type Executor = sql.DB | sql.Transaction

local function not_found(): error
    return errors.new({kind = errors.NOT_FOUND, retryable = false, message = "thread not found",
        details = {code = "thread_access_not_found"}})
end

-- gate_thread_access resolves a thread's component and checks the current actor's
-- access at required_mask. The first four results retain the status/display
-- tuple; the optional fifth result carries the native failure for transport.
-- Allowed requests return (true, 200, nil, component_id, nil).
function access.gate_thread_access(db: Executor, thread_id: string, required_mask: integer): (boolean, integer, string?, string?, error?)
    local failure: error? = nil
    local display: string? = nil
    local component_id: string? = nil
    if type(thread_id) ~= "string" or thread_id == "" or not uuid.validate(thread_id) then
        failure = not_found()
        display = "thread not found"
    else
        local loaded, load_err = reader.get_component_id(db, thread_id)
        component_id = loaded
        if load_err then
            failure = errors.wrap(load_err, "failed to load thread")
            display = "failed to load thread: " .. tostring(load_err)
        elseif not component_id then
            failure = not_found()
            display = "thread not found"
        else
            local allowed, access_err = component.has_access(component_id, required_mask)
            if access_err then
                failure = access_err
                display = tostring(access_err)
            elseif not allowed then
                failure = errors.new({kind = errors.PERMISSION_DENIED, retryable = false,
                    message = "permission denied", details = {code = "thread_access_denied"}})
                display = "permission denied"
            end
        end
    end
    if failure then
        return false, (http_errors.classify(failure)), display or failure:message(), nil, failure
    end
    return true, 200, nil, component_id
end

function access.release_error(db: sql.DB, primary: error | string?, committed: boolean?): error?
    local native = type(primary) == "string" and errors.new({kind = errors.UNKNOWN, message = primary}) or primary
    local err = error_envelope.cleanup(function(): (any, error?)
        local released, release_err = db:release()
        if not release_err and released ~= true then
            release_err = errors.new({kind = errors.INTERNAL, retryable = false,
                message = "thread access database returns no successful release proof",
                details = {code = "thread_access_release_response"}})
        end
        return released, release_err
    end, native :: error?, "release thread access database")
    if committed and err then return committed_error.new(err) end
    return err
end

function access.error_response(err: error | string, display: string?): (integer, table)
    local payload = http_errors.response(err)
    if display ~= nil then payload.error = display end
    return (http_errors.classify(err)), payload
end

function access.failure_response(db: sql.DB, primary: error, display: string?): (integer, table)
    local err = access.release_error(db, primary) :: error
    local status, payload = access.error_response(err, err == primary and display or nil)
    return status, payload
end

-- The masks re-exported so callers gate without importing core_types too.
access.READ = (masks.ACCESS.READ :: integer)
access.WRITE = (masks.ACCESS.WRITE :: integer)
access.ADMIN = (masks.ACCESS.ADMIN :: integer)

return access
end

local default = new()
default.new = new
return default
