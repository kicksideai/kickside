-- The component identity-audit policy: the age window after which published
-- audits are pruned and the encoded size limit of one audit row.
local registry = require("registry")

local M = {}
local ENTRY = "kickside.component:policy"

local function internal(message: string, field: string): error
    return (errors.new({ message = message .. ": " .. ENTRY, kind = errors.INTERNAL,
        retryable = false, details = { code = "component_policy", field = ENTRY .. "." .. field } }) :: error)
end

function M.policy(): (any?, error?)
    local entry, read_err = registry.get(ENTRY)
    if read_err then return nil, (errors.wrap(read_err, "component retention policy unavailable") :: error) end
    if type(entry) ~= "table" then return nil, internal("component retention policy unavailable", "entry") end
    local meta = (entry :: any).meta
    local limits = type(meta) == "table" and meta.limits or nil
    if type(limits) ~= "table" then return nil, internal("component retention limits missing", "meta.limits") end
    local bytes = limits.max_row_bytes
    if type(bytes) ~= "number" or bytes ~= math.floor(bytes) or bytes < 1 or bytes > 2147483647 then
        return nil, (errors.new({ message = ENTRY .. " limits.max_row_bytes must be a positive finite integer",
            kind = errors.INVALID, retryable = false }) :: error)
    end
    local retention = meta.retention
    if type(retention) ~= "table" then return nil, internal("component retention settings missing", "meta.retention") end
    local count = type(retention.identity_audits) == "string"
        and string.match(retention.identity_audits, "^(%d+)d$") or nil
    local days = count and tonumber(count) or nil
    if not days or days < 1 or days > 3650 then
        return nil, (errors.new({ message = ENTRY .. " retention.identity_audits must be 1..3650d",
            kind = errors.INVALID, retryable = false }) :: error)
    end
    return { max_row_bytes = bytes :: integer, history_days = days :: integer }, nil
end

-- check_row(id, encoded, operation) refuses one audit row above the row byte
-- limit. It bounds a single record, not retained volume.
function M.check_row(id: string, encoded: string, operation: string): error?
    local policy, policy_err = M.policy()
    if policy_err or not policy then return policy_err end
    local cap = (policy :: any).max_row_bytes
    if #encoded <= cap then return nil end
    return (errors.new({ message = operation .. " row of " .. tostring(#encoded)
        .. " bytes exceeds the " .. tostring(cap) .. "-byte row limit",
        kind = errors.INVALID, retryable = false,
        details = { reason = "row_too_large", scope = id, cap = cap, used = #encoded,
            operation = operation } }) :: error)
end

return M
