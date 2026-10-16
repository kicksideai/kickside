-- The per-row size refusal shared by every module that stores rows: one row
-- whose encoded size exceeds its owner's row byte limit is refused. It bounds
-- a single record, not retained volume; each owner supplies its own limit.
local M = {}

-- refusal(scope, used, cap, operation) is the INVALID, non-retryable refusal
-- of one row of used bytes above cap.
function M.refusal(scope: string, used: integer, cap: integer, operation: string): error
    return (errors.new({ message = operation .. " row of " .. tostring(used)
        .. " bytes exceeds the " .. tostring(cap) .. "-byte row limit",
        kind = errors.INVALID, retryable = false,
        details = { reason = "row_too_large", scope = scope, cap = cap, used = used,
            operation = operation } }) :: error)
end

-- check(scope, used, cap, operation) refuses one row of used bytes above cap.
function M.check(scope: string, used: integer, cap: integer, operation: string): error?
    if used <= cap then return nil end
    return M.refusal(scope, used, cap, operation)
end

return M
