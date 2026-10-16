local registry = require("registry")

local M = {}
local ENTRY = "kickside.channel:policy"
local UNITS = { h = 3600000, d = 86400000 }

type Settings = { settled_turns_ms: number, batch_turns: integer,
    archived_sessions_ms: number, batch_archives: integer,
    idle_sessions_ms: number, batch_idle: integer,
    max_row_bytes: integer }

local function invalid(message: string): error
    return (errors.new({ message = ENTRY .. ": " .. message, kind = errors.INVALID }) :: error)
end

function M.resolve(meta: any): (Settings?, error?)
    local retention = type(meta) == "table" and meta.retention or nil
    if type(retention) ~= "table" then return nil, invalid("retention section is required") end
    local raw = retention.settled_turns
    if type(raw) ~= "string" then return nil, invalid("retention.settled_turns must be a duration") end
    local amount, unit = string.match(raw, "^(%d+)(%a+)$")
    local scale = unit and UNITS[unit] or nil
    local age = amount and scale and tonumber(amount) * scale or nil
    if not age or age <= 24 * UNITS.h or age > 365 * UNITS.d then
        return nil, invalid("retention.settled_turns must exceed the 24h reply proof lifetime and be at most 365d")
    end
    local batch = retention.batch_turns
    if type(batch) ~= "number" or batch ~= math.floor(batch) or batch < 1 or batch > 500 then
        return nil, invalid("retention.batch_turns must be an integer in [1,500]")
    end
    local archive_raw = retention.archived_sessions
    if type(archive_raw) ~= "string" then return nil, invalid("retention.archived_sessions must be a duration") end
    local archive_amount, archive_unit = string.match(archive_raw, "^(%d+)(%a+)$")
    local archive_scale = archive_unit and UNITS[archive_unit] or nil
    local archive_age = archive_amount and archive_scale and tonumber(archive_amount) * archive_scale or nil
    if not archive_age or archive_age <= age or archive_age > 365 * UNITS.d then
        return nil, invalid("retention.archived_sessions must exceed settled_turns and be at most 365d")
    end
    local archive_batch = retention.batch_archives
    if type(archive_batch) ~= "number" or archive_batch ~= math.floor(archive_batch)
        or archive_batch < 1 or archive_batch > 50 then
        return nil, invalid("retention.batch_archives must be an integer in [1,50]")
    end
    local idle_raw = retention.idle_sessions
    if type(idle_raw) ~= "string" then return nil, invalid("retention.idle_sessions must be a duration") end
    local idle_amount, idle_unit = string.match(idle_raw, "^(%d+)(%a+)$")
    local idle_scale = idle_unit and UNITS[idle_unit] or nil
    local idle_age = idle_amount and idle_scale and tonumber(idle_amount) * idle_scale or nil
    if not idle_age or idle_age <= age or idle_age > 365 * UNITS.d then
        return nil, invalid("retention.idle_sessions must exceed settled_turns and be at most 365d")
    end
    local idle_batch = retention.batch_idle
    if type(idle_batch) ~= "number" or idle_batch ~= math.floor(idle_batch)
        or idle_batch < 1 or idle_batch > 50 then
        return nil, invalid("retention.batch_idle must be an integer in [1,50]")
    end
    local limits = type(meta) == "table" and meta.limits or nil
    if type(limits) ~= "table" then return nil, invalid("limits section is required") end
    local max_row_bytes = limits.max_row_bytes
    if type(max_row_bytes) ~= "number" or max_row_bytes ~= math.floor(max_row_bytes)
        or max_row_bytes < 1 or max_row_bytes > 2147483647 then
        return nil, invalid("limits.max_row_bytes must be a positive finite integer")
    end
    return { settled_turns_ms = age :: number, batch_turns = batch :: integer,
        archived_sessions_ms = archive_age :: number, batch_archives = archive_batch :: integer,
        idle_sessions_ms = idle_age :: number, batch_idle = idle_batch :: integer,
        max_row_bytes = max_row_bytes :: integer }, nil
end

function M.policy(): (Settings?, error?)
    local entry, get_err = registry.get(ENTRY)
    if get_err or type(entry) ~= "table" then
        return nil, (errors.new({ message = ENTRY .. " unavailable: " .. tostring(get_err),
            kind = errors.UNAVAILABLE, retryable = true }) :: error)
    end
    return M.resolve(entry.meta)
end

return M
