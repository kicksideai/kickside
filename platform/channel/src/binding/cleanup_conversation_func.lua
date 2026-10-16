local persist = require("channel_persist")
local consts = require("channel_consts")
local session_service = require("session_service")
local session_delete_proof = require("session_delete_proof")
local conversation = require("channel_conversation")
local conversation_gc = require("conversation_gc")

-- kickside.channel:cleanup_conversation -- tear down the conversation session a responder
-- owns for one conversation: delete the backing wippy.session and drop the
-- (provider, external_id) mapping row, so nothing points at a deleted session.
--
-- A responder registers this as its install rollback step, so it runs on every
-- uninstall -- explicit, or cascaded from a connection/user deletion. provider is
-- captured at install time (in the rollback args), not resolved here, because by
-- cascade time the connection component may already be gone. Idempotent: an
-- already-clean conversation (no row / no session) is a no-op success.
local M = {}

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

function M.cleanup_conversation(args: any): any
    args = type(args) == "table" and args or {}
    local provider = trim(args.provider)
    local external_id = trim(args.external_id)
    if provider == "" or external_id == "" then
        return { success = false, error = errors.new({ message = "conversation key is required", kind = errors.INVALID }) }
    end

    local db_id, derr = consts.db_id()
    if derr or not db_id then
        return { success = false, error = errors.new({ message = "channel database unavailable: " .. tostring(derr),
            kind = errors.UNAVAILABLE, retryable = true }) }
    end
    local db: string = db_id :: string
    local fence_err = conversation.begin_delete(db, provider, external_id)
    if fence_err then return { success = false, error = fence_err } end

    local sessions, list_err = persist.conversation_sessions(db, provider, external_id)
    if list_err or not sessions then
        return { success = false, error = list_err or errors.new({
            message = "conversation session read returned no result", kind = errors.INTERNAL }) }
    end
    for _, session_id in ipairs(sessions) do
        local session_err = session_delete_proof.delete(session_service, session_id, "conversation")
        if session_err then return { success = false, error = session_err } end
    end
    local removed, remove_err = persist.remove_conversation(db, provider, external_id, sessions,
        args.retain_counts == true)
    if remove_err or not removed then
        return { success = false, error = remove_err or errors.new({
            message = "conversation owner delete returned no result", kind = errors.INTERNAL }) }
    end
    return { success = true, discarded = removed.discarded }
end

function M.complete_unlink(args: any): any
    args = type(args) == "table" and args or {}
    local provider = trim(args.provider)
    local external_id = trim(args.external_id)
    if provider == "" or external_id == "" then
        return { success = false, error = errors.new({ message = "conversation key is required", kind = errors.INVALID }) }
    end
    local db_id, db_err = consts.db_id()
    if db_err or not db_id then
        return { success = false, error = errors.new({ message = "channel database unavailable: " .. tostring(db_err),
            kind = errors.UNAVAILABLE, retryable = true }) }
    end
    local completed, complete_err = conversation_gc.complete_unlink(db_id :: string, provider, external_id)
    if complete_err or not completed then
        return { success = false, error = complete_err or errors.new({
            message = "conversation unlink finalization returned no result", kind = errors.INTERNAL, retryable = true }) }
    end
    return { success = true, discarded = completed.discarded }
end

return M
