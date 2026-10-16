-- The single Core policy reader for event/receipt retention windows and the
-- per-row size limit.
local registry = require("registry")
local time = require("time")
local row_size = require("row_size")

local M = {}
M.ENTRY = "kickside.core:policy"

local function invalid(message: string): error
    return (errors.new({ message = M.ENTRY .. " " .. message, kind = errors.INVALID,
        retryable = false }) :: error)
end

local function duration_ms(value: any, field: string, max_days: integer): (integer?, error?)
    if type(value) ~= "string" or value == "" then return nil, invalid(field .. " must be a duration") end
    local days = value:match("^(%d+)d$")
    if days then
        local count = tonumber(days)
        if not count or count < 1 or count > max_days then
            return nil, invalid(field .. " must be positive and finite")
        end
        return (count * 86400000) :: integer, nil
    end
    local parsed, parse_err = time.parse_duration(value)
    if parse_err then return nil, errors.wrap(parse_err, M.ENTRY .. " " .. field .. " duration parsing failed") end
    if not parsed then
        return nil, errors.new({message = M.ENTRY .. " duration parser returned no duration", kind = errors.INTERNAL,
            retryable = false, details = {code = "retention_policy_response", field = field}})
    end
    local millis = parsed:milliseconds()
    if millis < 1 or millis > max_days * 86400000 then
        return nil, invalid(field .. " must be positive and finite")
    end
    return millis :: integer, nil
end

local function positive_integer(value: any, field: string, maximum: integer): (integer?, error?)
    if type(value) ~= "number" or value < 1 or value > maximum or value ~= math.floor(value) then
        return nil, invalid(field .. " must be an integer in [1," .. tostring(maximum) .. "]")
    end
    return value :: integer, nil
end

local function max_row_bytes(meta: any): (integer?, error?)
    local limits = type(meta) == "table" and meta.limits or nil
    if type(limits) ~= "table" then return nil, invalid("limits must be an object") end
    return positive_integer(limits.max_row_bytes, "limits.max_row_bytes", 2147483647)
end

function M.resolve(meta: any): (table?, error?)
    local retention = type(meta) == "table" and meta.retention or nil
    local sweep = type(meta) == "table" and meta.sweep or nil
    if type(retention) ~= "table" then return nil, invalid("retention must be an object") end
    if type(sweep) ~= "table" then return nil, invalid("sweep must be an object") end
    local events_ms, events_err = duration_ms(retention.events, "retention.events", 36500)
    if events_err then return nil, events_err end
    local receipts_ms, receipts_err = duration_ms(retention.receipts_orphan,
        "retention.receipts_orphan", 36500)
    if receipts_err then return nil, receipts_err end
    local batch_events, events_batch_err = positive_integer(sweep.batch_events, "sweep.batch_events", 5000)
    if events_batch_err then return nil, events_batch_err end
    local batch_receipts, receipts_batch_err = positive_integer(sweep.batch_receipts,
        "sweep.batch_receipts", 500)
    if receipts_batch_err then return nil, receipts_batch_err end
    local row_bytes, row_bytes_err = max_row_bytes(meta)
    if row_bytes_err then return nil, row_bytes_err end
    return {
        events_ms = events_ms :: integer,
        receipts_orphan_ms = receipts_ms :: integer,
        batch_events = batch_events :: integer,
        batch_receipts = batch_receipts :: integer,
        max_row_bytes = row_bytes :: integer,
    }, nil
end

local cached_version: string? = nil
local cached_policy: table? = nil

local function policy_copy(value: table): table
    local out: table = {}
    for key, item in pairs(value) do out[key] = item end
    return out
end

function M.policy(): (table?, error?)
    local version, version_err = registry.current_version()
    if version_err then return nil, errors.wrap(version_err, M.ENTRY .. " registry version unavailable") end
    if not version then
        return nil, errors.new({message = M.ENTRY .. " registry returned no version", kind = errors.INTERNAL,
            retryable = false, details = {code = "retention_policy_response", field = "registry.version"}})
    end
    local id = tostring(version:id())
    if cached_version == id and cached_policy then return policy_copy(cached_policy), nil end
    local entry, get_err = registry.get(M.ENTRY)
    if get_err then return nil, errors.wrap(get_err, M.ENTRY .. " lookup failed") end
    if type(entry) ~= "table" then
        return nil, errors.new({message = M.ENTRY .. " registry returned no policy entry", kind = errors.INTERNAL,
            retryable = false, details = {code = "retention_policy_response", field = M.ENTRY .. ".entry"}})
    end
    local resolved, resolve_err = M.resolve(entry.meta)
    if resolve_err or not resolved then return nil, resolve_err end
    cached_version, cached_policy = id, resolved
    return policy_copy(resolved), nil
end

-- check_row(scope, bytes, operation) applies limits.max_row_bytes to one row.
function M.check_row(scope: string, bytes: integer, operation: string): error?
    local values, policy_err = M.policy()
    if policy_err then return policy_err end
    local cap = (values :: table).max_row_bytes
    return row_size.check(scope, bytes, cap, operation)
end

return M
