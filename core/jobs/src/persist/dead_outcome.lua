-- A worker entry names the function that receives its dead jobs in
-- meta.job_dead. The dead transition enqueues one outcome job for that function
-- in its own transaction (lifecycle.fail_tx), so the owner learns the outcome at
-- least once through the ordinary claim, lease and retry machinery.
local registry = require("registry")
local job_types = require("job_types")
local capacity = require("capacity")

local M = {}

M.META = "meta.job_dead"
M.NAMESPACE = "kickside.jobs.dead"
M.KEY = "outcome"

-- The dead handler a worker_ref declares, or nil when it declares none or its
-- entry is absent. An invalid declaration is refused.
function M.handler(worker_ref: any): (string?, error?)
    local reference = job_types.worker_reference(worker_ref)
    if not reference or reference.worker_ref == job_types.WAKE_CONTINUATION_TYPE then return nil, nil end
    local entry, lookup_err = registry.get(reference.target_id)
    if lookup_err then
        if errors.is(lookup_err, errors.NOT_FOUND) then return nil, nil end
        return nil, errors.wrap(lookup_err, "job dead handler lookup failed: " .. reference.target_id)
    end
    local meta = type(entry) == "table" and (entry :: any).meta or nil
    local declared = type(meta) == "table" and meta.job_dead or nil
    if declared == nil then return nil, nil end
    if type(declared) ~= "string" or declared == "" then
        return nil, (errors.new({ message = M.META .. " of " .. reference.target_id .. " must name a function",
            kind = errors.INVALID, retryable = false }) :: error)
    end
    local target, target_err = registry.get(declared)
    local kind = type(target) == "table" and (target.kind or (target.data and target.data.kind)) or nil
    if target_err and not errors.is(target_err, errors.NOT_FOUND) then
        return nil, errors.wrap(target_err, M.META .. " target lookup failed")
    end
    if kind ~= "function.lua" then
        return nil, errors.new({message = M.META .. " must name an existing function: " .. declared,
            kind = errors.INVALID, retryable = false})
    end
    local _, admission_err = capacity.admit(declared, nil)
    if admission_err then
        return nil, errors.new({message = M.META .. " target cannot admit an outcome: " .. tostring(admission_err),
            kind = errors.INVALID, retryable = false})
    end
    return declared :: string, nil
end

function M.is_outcome(row: table): boolean
    local prefix = tostring(#M.NAMESPACE) .. ":" .. M.NAMESPACE
    return type(row.job_identity) == "string" and row.job_identity:sub(1, #prefix) == prefix
end

-- Enqueue parameters of the outcome of dead job `row` for `handler`. The payload
-- carries only the dead job's id: the handler reads the dead row itself.
-- Infrastructure failures of the handler retry up to the largest attempt limit;
-- a deterministic failure ends the outcome job dead.
function M.params(row: table, handler: string): table
    return {
        owner_locator = { kind = tostring(row.owner_kind), id = tostring(row.owner_id) },
        thread_id = row.thread_id,
        job_identity = { namespace = M.NAMESPACE, scope = tostring(row.id), key = M.KEY },
        job_type = handler,
        worker_ref = handler,
        queue_tier = row.queue_tier,
        priority = math.floor(tonumber(row.priority) or 0),
        max_attempts = job_types.MAX_ATTEMPTS,
        payload = { job_id = tostring(row.id) },
    }
end

return M
