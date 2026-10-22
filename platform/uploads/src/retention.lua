-- The existing core retention tick invokes the uploads owner callback.
local time = require("time")
local contract = require("contract")
local policy = require("uploads_retention_policy")
local read_model_module = require("upload_read_model_retention")
local artifact_cleanup = require("artifact_cleanup_repo")
local processing_hooks = require("processing_hooks")

local M = {}

local function missing(what: string): error
    return (errors.new({ message = "uploads retention " .. what .. " returned no result",
        kind = errors.INTERNAL, retryable = true }) :: error)
end

function M.run(): any
    local settings, policy_err = policy.policy()
    if policy_err or not settings then return { success = false, error = policy_err or missing("policy") } end
    local definition, contract_err = contract.get("kickside.core:threads")
    if contract_err or not definition then
        return { success = false, error = errors.new({ message = "Core threads contract unavailable: "
            .. tostring(contract_err), kind = errors.UNAVAILABLE, retryable = true }) }
    end
    local threads, open_err = (definition :: any):open()
    if open_err or not threads then
        return { success = false, error = errors.new({ message = "Core threads contract open failed: "
            .. tostring(open_err), kind = errors.UNAVAILABLE, retryable = true }) }
    end
    local read_model = read_model_module.new({ core_threads = threads })
    local cutoff = time.now():utc():add(-settings.deleted_read_model_ms * time.MILLISECOND):format_rfc3339()
    local count, prune_err = read_model.prune_deleted(cutoff, settings.batch_deleted_read_model)
    if prune_err or count == nil then return { success = false, error = prune_err or missing("prune") } end
    local blob_cutoff = time.now():utc():add(-settings.orphan_blob_ms * time.MILLISECOND):format_rfc3339()
    local blobs, blob_err = artifact_cleanup.prune_orphan_blobs(blob_cutoff, settings.batch_orphan_blob)
    if blob_err or blobs == nil then return { success = false, error = blob_err or missing("blob prune") } end
    local placements, placement_err = processing_hooks.prune(blob_cutoff, settings.batch_orphan_blob)
    if placement_err or placements == nil then return { success = false, error = placement_err or missing("extension prune") } end
    return { success = true, deleted = count, blobs_deleted = blobs, placements_deleted = placements }
end

return M
