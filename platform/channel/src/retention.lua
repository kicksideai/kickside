local time = require("time")
local consts = require("channel_consts")
local retention = require("channel_retention")
local archives = require("channel_archive_retention")
local idle = require("channel_idle_retention")
local policy = require("channel_retention_policy")
local conversation = require("channel_conversation")

local M = {}
local function missing(what: string): error
    return (errors.new({ message = "channel retention " .. what .. " returned no result",
        kind = errors.INTERNAL, retryable = true }) :: error)
end
function M.run(): any
    local db_id, db_err = consts.db_id()
    if db_err or type(db_id) ~= "string" or db_id == "" then
        return { success = false, error = errors.new({
            message = "channel retention database unavailable: " .. tostring(db_err),
            kind = errors.UNAVAILABLE, retryable = true }) }
    end
    local settings, policy_err = policy.policy()
    if policy_err or not settings then return { success = false, error = policy_err or missing("policy") } end
    local cutoff = time.now():utc():add(-settings.settled_turns_ms * time.MILLISECOND):format_rfc3339()
    local count, prune_err = retention.prune_settled(db_id, cutoff, settings.batch_turns)
    if prune_err or count == nil then return { success = false, error = prune_err or missing("turn prune") } end
    local archive_cutoff = time.now():utc():add(-settings.archived_sessions_ms * time.MILLISECOND):format_rfc3339()
    local archive_count, archive_err = archives.prune_archives(db_id, archive_cutoff, cutoff, settings.batch_archives)
    if archive_err or archive_count == nil then return { success = false, error = archive_err or missing("archive prune") } end
    local idle_cutoff = time.now():utc():add(-settings.idle_sessions_ms * time.MILLISECOND):format_rfc3339()
    local idle_count, idle_err = idle.retire_idle(db_id, idle_cutoff, settings.batch_idle)
    if idle_err or idle_count == nil then return { success = false, error = idle_err or missing("idle retire") } end
    local deleting, deleting_err = conversation.deleting_status(db_id, 50)
    if deleting_err or not deleting then return { success = false, error = deleting_err or missing("delete status") } end
    return { success = true, deleted = count + archive_count + idle_count,
        status = #deleting > 0 and "blocked_source_deleted" or "ready", blocked = deleting }
end

return M
