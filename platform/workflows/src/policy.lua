-- Validated runtime settings for the one workflows owner policy entry.
local registry = require("registry")
local time = require("time")

local M = {}
M.ENTRY = "kickside.workflows:policy"

local function invalid(path: string, reason: string): error
    return (errors.new({ kind = errors.INVALID, retryable = false,
        message = M.ENTRY .. " " .. path .. " " .. reason }) :: error)
end

local function positive_integer(value: any, path: string, max: integer): (integer?, error?)
    if type(value) ~= "number" or value ~= math.floor(value) or value < 1 or value > max then
        return nil, invalid(path, "must be a positive integer no greater than " .. tostring(max))
    end
    return value :: integer, nil
end

local function duration_ms(value: any, path: string): (integer?, error?)
    if type(value) ~= "string" or value == "" then
        return nil, invalid(path, "must be a positive duration")
    end
    local parsed, parse_err = time.parse_duration(value)
    if parse_err or not parsed then
        return nil, invalid(path, "must be a positive duration: " .. tostring(value))
    end
    local milliseconds = math.floor((parsed :: any):milliseconds())
    if milliseconds < 1 then return nil, invalid(path, "must be positive") end
    return milliseconds :: integer, nil
end

local function retention_days(value: any): (integer?, error?)
    if type(value) ~= "string" then
        return nil, invalid("retention.runs", "must be a day duration such as 30d")
    end
    local raw_days = value:match("^(%d+)d$")
    local days = tonumber(raw_days)
    if not days or days < 1 or days > 3650 then
        return nil, invalid("retention.runs", "must be a day duration in [1d,3650d]")
    end
    return days :: integer, nil
end

function M.resolve(meta: any): (any?, error?)
    if type(meta) ~= "table" then return nil, invalid("meta", "must be an object") end
    local limits = meta.limits
    if type(limits) ~= "table" then return nil, invalid("limits", "must be an object") end
    local creation_payload_bytes, creation_err = positive_integer(
        limits.creation_payload_bytes, "limits.creation_payload_bytes", 2147483647)
    if creation_err then return nil, creation_err end
    local max_inflight_runs, inflight_err = positive_integer(
        limits.max_inflight_runs, "limits.max_inflight_runs", 10000)
    if inflight_err then return nil, inflight_err end
    local document_bytes, document_err = positive_integer(limits.document_bytes, "limits.document_bytes", 2147483647)
    if document_err then return nil, document_err end
    local command_bytes, command_err = positive_integer(limits.command_bytes, "limits.command_bytes", 2147483647)
    if command_err then return nil, command_err end

    local launch = meta.launch
    if type(launch) ~= "table" then return nil, invalid("launch", "must be an object") end
    local admission_timeout_ms, timeout_err = duration_ms(launch.admission_timeout, "launch.admission_timeout")
    if timeout_err then return nil, timeout_err end
    local check = launch.completion_check
    if type(check) ~= "table" then
        return nil, invalid("launch.completion_check", "must be an object")
    end
    local initial_ms, initial_err = duration_ms(check.initial, "launch.completion_check.initial")
    if initial_err then return nil, initial_err end
    local max_ms, max_err = duration_ms(check.max, "launch.completion_check.max")
    if max_err then return nil, max_err end
    if (max_ms :: integer) < (initial_ms :: integer) then
        return nil, invalid("launch.completion_check.max", "must be at least initial")
    end
    local batch, batch_err = positive_integer(check.batch, "launch.completion_check.batch", 10000)
    if batch_err then return nil, batch_err end

    local retention = meta.retention
    if type(retention) ~= "table" then return nil, invalid("retention", "must be an object") end
    local runs_days, retention_err = retention_days(retention.runs)
    if retention_err then return nil, retention_err end

    return {
        creation_payload_bytes = creation_payload_bytes :: integer,
        max_inflight_runs = max_inflight_runs :: integer,
        document_bytes = document_bytes :: integer,
        command_bytes = command_bytes :: integer,
        admission_timeout_ms = admission_timeout_ms :: integer,
        completion_initial_ms = initial_ms :: integer,
        completion_max_ms = max_ms :: integer,
        completion_batch = batch :: integer,
        retention_runs_days = runs_days :: integer,
    }, nil
end

function M.policy(): (any?, error?)
    local entry, get_err = registry.get(M.ENTRY)
    if get_err or not entry then
        return nil, (errors.new({ kind = errors.UNAVAILABLE, retryable = true,
            message = M.ENTRY .. " is unavailable: " .. tostring(get_err) }) :: error)
    end
    return M.resolve((entry :: any).meta)
end

function M.next_completion_delay(settings: any, elapsed_ms: number): integer
    local initial_ms = (settings :: any).completion_initial_ms :: integer
    local maximum_ms = (settings :: any).completion_max_ms :: integer
    local elapsed = math.max(0, math.floor(elapsed_ms))
    local interval = initial_ms
    local next_boundary = initial_ms
    -- Derive exponential retry bands from persisted run age, so retry timing
    -- remains recoverable without a separate attempt counter.
    while elapsed >= next_boundary and interval < maximum_ms do
        next_boundary = next_boundary + interval
        interval = math.min(maximum_ms, interval * 2)
    end
    return interval
end

return M
