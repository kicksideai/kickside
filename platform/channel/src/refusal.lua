-- The typed durable refusals of a conversation write: an owner under deletion
-- and one row above the row byte limit. Any other error stays untyped.
local M = {}

-- status(err, session_id) -> the typed refusal status, or nil for any other error.
function M.status(err: any, session_id: string?): any?
    local deleting = errors.is(err, errors.CONFLICT)
    if not deleting and not errors.is(err, errors.INVALID) then return nil end
    local details = err:details()
    if type(details) ~= "table" then return nil end
    if deleting and details.reason == "owner_deleting" then
        return { accepted = false, status = "blocked_source_deleted", session_id = session_id,
            error = err, scope = details.scope, operation = details.operation }
    end
    if not deleting and details.reason == "row_too_large" then
        return { accepted = false, status = "row_too_large", session_id = session_id,
            error = err, scope = details.scope, operation = details.operation,
            cap = details.cap, used = details.used }
    end
    return nil
end

return M
