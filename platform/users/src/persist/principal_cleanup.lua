-- Durable principal-deletion consumer. The system lifecycle reaper invokes every
-- kickside.lifecycle.principal_cleanup entry and retries the lifecycle event until
-- all of them succeed. Account removal is therefore owned by the durable consumer,
-- not by the HTTP request that enqueues the event.
local user_lifecycle_repo = require("user_lifecycle_repo")

local M = {}

---@class PrincipalCleanupRequest
---@field principal_id string?
---@field user_id string?

---@class PrincipalCleanupResult
---@field success boolean
---@field user_id string?
---@field deleted boolean?
---@field error string?

---@param request PrincipalCleanupRequest?
---@return PrincipalCleanupResult
function M.run(request)
    local principal_id = ""
    if type(request) == "table" then
        principal_id = tostring(request.principal_id or request.user_id or "")
    end
    if principal_id == "" then
        return { success = false, error = "principal_id is required" }
    end

    -- delete_if_exists invalidates token-store/index rows before the account is
    -- removed, in one transaction. A post-delete revocation cannot safely recover
    -- the owner and is therefore deliberately avoided.
    local result, err = user_lifecycle_repo.delete_if_exists(principal_id)
    if err or not result then
        return { success = false, user_id = principal_id, error = tostring(err or "account deletion failed") }
    end

    return {
        success = true,
        user_id = principal_id,
        deleted = result.deleted == true,
        sessions_revoked = result.sessions_revoked or 0,
    }
end

return M
