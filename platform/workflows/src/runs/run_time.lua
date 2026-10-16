-- Canonical parsing and elapsed-time rules for workflow run timestamps.
local time = require("time")

local M = {}

local function parse(value: any): (any?, string?)
    if type(value) ~= "string" or value == "" then return nil, "timestamp is missing" end
    local parsed, parse_err = time.parse(time.RFC3339, value)
    if parse_err or not parsed then return nil, "timestamp is invalid" end
    return parsed, nil
end

function M.delta_ms(started_at: any, ended_at: any): (number?, string?)
    local started, start_err = parse(started_at)
    if start_err or not started then return nil, start_err end
    local ended, end_err = parse(ended_at)
    if end_err or not ended then return nil, end_err end
    local delta = (ended :: any):sub(started)
    return math.floor(((delta :: any):milliseconds() or 0)), nil
end

function M.duration_ms(started_at: any, ended_at: any): number?
    local delta = M.delta_ms(started_at, ended_at)
    if delta == nil then return nil end
    return math.max(0, delta :: number)
end

function M.until_ms(deadline: any): (number?, string?)
    local target, target_err = parse(deadline)
    if target_err or not target then return nil, target_err end
    return math.floor(((target :: any):sub(time.now():utc()):milliseconds() or 0)), nil
end

function M.after_ms(timestamp: any, duration_ms: number): (string?, string?)
    local parsed, parse_err = parse(timestamp)
    if parse_err or not parsed then return nil, parse_err end
    return (parsed :: any):utc():add(duration_ms * time.MILLISECOND):format(time.RFC3339), nil
end

return M
