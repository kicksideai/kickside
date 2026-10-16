-- Jobs owns one exact-deadline refresh attempt per connection.
local jobs = require("jobs")
local refresh_schedule = require("refresh_schedule")
local execution_identity = require("execution_identity")
local component = require("component")
local token_refresh_core = require("token_refresh_core")
local time = require("time")
local M = {}
type Map = { [string]: any }
local OWNER = "kickside.oauth:refresh_connection"
local function failure(message: string, retriable: boolean): error
    return errors.new({ kind = retriable and errors.UNAVAILABLE or errors.INVALID, retryable = retriable, message = message })
end
local function lease(job: Map): Map return { token = job.lease_token, execution_seq = job.execution_seq } end
local function complete(job: Map, deadline: string?, parked: boolean?, message: string?): (Map?, any)
    local result, err = jobs.complete(job.id, lease(job), { rearm = deadline,
        record = parked and { status = "parked", error = message } or nil })
    if err then return nil, err end
    return { self_completed = true, completion = result }, nil
end

-- Invoked only through the stored connection identity. Recheck the durable
-- generation and the Jobs lease immediately before the provider operation.
function M.apply(request: Map): Map
    local current, read_err = refresh_schedule.read(request.component_id)
    if read_err then return { success = false, error = tostring(read_err), retriable = true } end
    if not current or current.refresh_wake_generation ~= request.generation then return { success = true, stale = true } end
    local due, due_err = refresh_schedule.connection_deadline(current)
    if due_err then return { success = false, error = tostring(due_err), retriable = true } end
    if due == nil or due > time.now():utc():format(time.RFC3339) then return { success = true, stale = true } end
    local valid, lease_err = jobs.lease_valid(request.job.id, lease(request.job))
    if lease_err then return { success = false, error = tostring(lease_err), retriable = true } end
    if not valid then return { success = true, stale = true } end
    local instance, access_err = component.open(request.component_id, component.ACCESS.WRITE, "kickside.oauth:oauth_connection_contract")
    if access_err or not instance then
        return { success = false, error = access_err or "OAuth connection unavailable",
            retriable = type(access_err) == "userdata" and access_err:retryable() or false }
    end
    return token_refresh_core.handle({ args = { component_id = request.component_id }, refresh_generation = request.generation })
end

function M.run(input: Map): (Map?, any)
    local job, id = input.job, input.payload and input.payload.component_id
    if type(job) ~= "table" or type(id) ~= "string" then return nil, failure("OAuth refresh job is malformed", false) end
    local valid, lease_err = jobs.lease_valid(job.id, lease(job))
    if lease_err then return nil, lease_err end
    if not valid then return { self_completed = true }, nil end
    local row, read_err = refresh_schedule.read(id)
    if read_err then return nil, read_err end
    if not row then
        local _, cancel_err = jobs.cancel(job.id, job.lease_token)
        if cancel_err then return nil, cancel_err end
        return { self_completed = true }, nil
    end
    local deadline, deadline_err = refresh_schedule.connection_deadline(row)
    if deadline_err then return nil, deadline_err end
    if deadline == nil then return complete(job, nil, true, "OAuth refresh disabled") end
    if deadline > time.now():utc():format(time.RFC3339) then return complete(job, deadline) end
    local context, context_err = component.get_private_context(id)
    if context_err then return nil, context_err end
    local identity = context and context[execution_identity.CONTEXT_KEY]
    if type(identity) ~= "table" then return complete(job, nil, true, "OAuth connection has no execution identity") end
    local answer, apply_err = execution_identity.run_as(identity, "kickside.oauth:refresh_apply",
        { component_id = id, generation = row.refresh_wake_generation, job = job }, { deferred_owner = OWNER })
    if apply_err then
        if type(apply_err) == "userdata" and not apply_err:retryable() then return complete(job, nil, true, tostring(apply_err)) end
        return nil, apply_err
    end
    if type(answer) ~= "table" then return nil, failure("OAuth refresh returned no outcome", true) end
    if answer.success ~= true then
        -- A rejected old token must not park the newer authorization. Read
        -- the owner generation after the effect just as the success path does.
        local current, read_err = refresh_schedule.read(id)
        if read_err then return nil, read_err end
        if current and current.refresh_wake_generation ~= row.refresh_wake_generation then
            local due, due_err = refresh_schedule.connection_deadline(current)
            if due_err then return nil, due_err end
            return complete(job, due, due == nil, due == nil and "OAuth refresh disabled" or nil)
        end
        if answer.retriable ~= false then
            if type(answer.error) == "userdata" then return nil, answer.error end
            return nil, failure(tostring(answer.error), true)
        end
        return complete(job, nil, true, tostring(answer.error))
    end
    local current, current_err = refresh_schedule.read(id)
    if current_err then return nil, current_err end
    if not current then
        local _, cancel_err = jobs.cancel(job.id, job.lease_token)
        if cancel_err then return nil, cancel_err end
        return { self_completed = true }, nil
    end
    local next_at, next_err = refresh_schedule.connection_deadline(current)
    if next_err then return nil, next_err end
    return complete(job, next_at, next_at == nil, next_at == nil and "OAuth refresh disabled" or nil)
end

function M.dispatch(input: Map): (Map?, any)
    local result, err = refresh_schedule.dispatch()
    if err then return nil, err end
    return complete(input.job, result.rearm)
end
return M
