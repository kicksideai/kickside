-- The workflow per-row size limit: one definition event or run row above
-- limits.max_row_bytes is refused. It bounds a single record, not volume.
local registry = require("registry")
local row_size = require("row_size")

local M = {}
local POLICY = "kickside.workflows:policy"

local function failure(message: string, cause: any): error
    return (errors.new({ message = message .. ": " .. tostring(cause),
        kind = errors.INTERNAL, retryable = true }) :: error)
end

function M.max_row_bytes(): (integer?, error?)
    local entry, err = registry.get(POLICY)
    if err or type(entry) ~= "table" or type((entry :: any).meta) ~= "table" then
        return nil, failure("workflow row policy unavailable", err or POLICY)
    end
    local limits = (entry :: any).meta.limits
    if type(limits) ~= "table" then return nil, failure("workflow row limits missing", POLICY) end
    local value = limits.max_row_bytes
    if type(value) ~= "number" or value ~= math.floor(value) or value < 1 or value > 2147483647 then
        return nil, (errors.new({ message = POLICY .. " limits.max_row_bytes must be a positive finite integer",
            kind = errors.INVALID, retryable = false }) :: error)
    end
    return value :: integer, nil
end

-- check(id, encoded, operation) refuses one encoded row above the limit.
function M.check(id: string, encoded: string, operation: string): error?
    local cap, cap_err = M.max_row_bytes()
    if cap_err or not cap then return cap_err end
    return row_size.check(id, #encoded, cap :: integer, operation)
end

return M
