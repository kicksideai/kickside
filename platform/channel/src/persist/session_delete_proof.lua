-- One backing-session deletion proof for archive retention and conversation
-- owner cleanup. A retry may observe the exact not-found response after a
-- prior successful delete whose SQL pointer transaction never committed.
local M = {}

function M.delete(service: any, session_id: string, context: string): error?
    local result, err = service.delete({ session_id = session_id })
    if err then
        if tostring(err) == "Session not found" then return nil end
        if type(err) == "userdata" then return err end
        return (errors.new({ message = context .. " session delete failed: " .. tostring(err),
            kind = errors.UNAVAILABLE, retryable = true }) :: error)
    end
    if type(result) ~= "table" or result.deleted ~= true then
        return (errors.new({ message = context .. " session delete returned no deletion proof",
            kind = errors.INTERNAL, retryable = true }) :: error)
    end
    if result.primary_context_deleted == false then
        return (errors.new({ message = context .. " session primary context delete failed: "
            .. tostring(result.primary_context_error), kind = errors.UNAVAILABLE, retryable = true }) :: error)
    end
    return nil
end

return M
