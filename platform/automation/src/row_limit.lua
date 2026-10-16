-- The automation per-row size limit: one stored ledger, receipt, command,
-- outcome or prepared row above its byte limit is refused. It bounds a single
-- record, not retained volume.
local runtime_policy = require("runtime_policy")
local row_size = require("row_size")

local M = {}

local function internal(message: string, cause: any): error
    return (errors.new({ message = message .. ": " .. tostring(cause), kind = errors.INTERNAL,
        retryable = true }) :: error)
end

-- check(raw, operation, scope) applies limits.max_row_bytes to one encoded row.
function M.check(raw: any, operation: string, scope: string): error?
    local p, p_err = runtime_policy.policy()
    if p_err or not p then return p_err end
    if type(raw) ~= "string" then return internal("encoded row is missing", operation) end
    return row_size.check(scope, #raw, p.max_row_bytes, operation)
end

return M
