local offload = require("offload")
local resources = require("uploads_resources")
local upload_query_repo = require("upload_query_repo")
local locations = require("locations")
local jobs = require("jobs")
local job_types = require("job_types")
local upload_types = require("upload_types")
local M = {}

function M.run(input: any): (any?, any?)
    local payload = type(input) == "table" and input.payload or nil
    local upload_id = type(payload) == "table" and payload.upload_id or nil
    if type(upload_id) ~= "string" or upload_id == "" then
        return nil, errors.new({ message = "upload_id required", kind = errors.INVALID, retryable = false })
    end
    local job = type(input.job) == "table" and input.job or {}
    local stored, stored_err = jobs.get_job(tostring(job.id or ""))
    if stored_err or not stored or stored.job_type ~= "kickside.uploads.storage:offload_job" then
        return nil, errors.new({ message = "Storage job ownership is required", kind = errors.PERMISSION_DENIED, retryable = false })
    end
    local upload, get_err = upload_query_repo.get(upload_id)
    if get_err == "Upload not found" then return { skipped = true }, nil end
    if get_err then return nil, get_err end
    if not upload or upload.storage_state ~= "completed" then
        return nil, errors.new({ message = "Upload processing has not completed", kind = errors.UNAVAILABLE, retryable = true })
    end
    if stored.owner_kind ~= "user" or stored.owner_id ~= upload.actor_id
        or stored.thread_id ~= upload_types.component_id_for_owner(upload.actor_id) then
        return nil, errors.new({ message = "Storage job owner does not match upload", kind = errors.PERMISSION_DENIED, retryable = false })
    end
    local function guard(): (boolean?, any?)
        local valid, err = jobs.lease_valid(tostring(job.id), { token = job.lease_token, execution_seq = job.execution_seq })
        if err then return nil, err end
        if not valid then return nil, errors.new({ message = "Storage job cancelled", kind = errors.CANCELED, retryable = false }) end
        return true, nil
    end
    local valid, lease_err = guard()
    if not valid then return nil, lease_err end
    local config = payload.policy
    if type(config) ~= "table" or config.mode ~= "s3" or type(config.resource_id) ~= "string"
        or config.resource_id:sub(1, #"kickside.uploads.storage.runtime:") ~= "kickside.uploads.storage.runtime:"
        or type(config.prefix) ~= "string" or config.prefix == "" then
        return nil, errors.new({ message = "Managed storage destination required", kind = errors.INVALID, retryable = false })
    end
    local objects, objects_err = locations.objects(resources.get_db_id(), upload_id)
    if objects_err then return nil, objects_err end
    local placed = 0
    for _, object in ipairs(objects) do
        local valid, lease_err = guard()
        if not valid then return nil, lease_err end
        local result, place_err = offload.place(object, config, { should_continue = guard })
        if place_err then return nil, place_err end
        if result and result.placed then placed = placed + 1 end
    end
    return { success = true, upload_id = upload_id, placed = placed }, nil
end

function M.main(input: any): any
    local result, err = M.run(input)
    if err then
        local native = type(err) == "userdata" and err
            or errors.new({ message = tostring(err), kind = errors.UNAVAILABLE, retryable = true })
        return { ok = false, error_native = job_types.error_to_data(native) }
    end
    return { ok = true, output = result }
end

return M
