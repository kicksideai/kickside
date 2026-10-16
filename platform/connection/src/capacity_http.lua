local time = require("time")
local capacity = require("capacity")

local M = {}

function M.retry_after(response: any, default_ms: integer?): integer
    local headers = type(response) == "table" and response.headers or {}
    local value = headers and (headers["Retry-After"] or headers["retry-after"])
    if value == nil then return default_ms or 1000 end
    local seconds = tonumber(value)
    if seconds ~= nil and seconds >= 0 and seconds < math.huge then return math.ceil(seconds * 1000) :: integer end
    local target, parse_err = time.parse(time.RFC1123, tostring(value))
    if parse_err then error(errors.new({kind = errors.INVALID, retryable = false,
        message = "provider Retry-After is invalid", details = {code = "provider_retry_after_invalid"}})) end
    return math.max(0, math.ceil(target:sub(time.now()):milliseconds())) :: integer
end

function M.rate_limit(message: string, delay: number, retry_at_ms: number?): error
    if delay < 0 or delay ~= math.floor(delay) or delay == math.huge then
        return errors.new({kind = errors.INVALID, retryable = false,
            message = "provider Retry-After requires a nonnegative integer", details = {code = "provider_retry_after_invalid"}})
    end
    return errors.new({kind = errors.RATE_LIMITED, retryable = true, message = message,
        details = {code = "provider_capacity", scope = "capacity", retry_after_ms = delay,
            retry_at_ms = retry_at_ms or (time.now():unix_nano() // 1000000 + delay)}})
end

function M.new(dependencies: any?): any
    local deps = dependencies or {}
    local owner = deps.owner or capacity.new()
    local now_ms = deps.now_ms or function(): integer return time.now():unix_nano() // 1000000 end
    local http = {}
    function http.invoke(component_id: string?, operation: any): (any?, error?)
        return owner.invoke(component_id, function(): (any?, error?)
            local response, operation_err = operation()
            if operation_err then return nil, operation_err end
            if component_id ~= nil and type(response) == "table" and response.success == false
                and (response.status_code == 429 or response.error_kind == "rate_limited") then
                local delay = tonumber(response.retry_after_ms) or 1000
                local failure = M.rate_limit(tostring(response.error or "provider capacity is unavailable"), delay,
                    now_ms() + delay)
                if not errors.is(failure, errors.RATE_LIMITED) then return nil, failure end
                local _, record_err = owner.record(component_id, failure)
                if record_err then return nil, record_err end
            end
            return response, nil
        end)
    end
    return http
end

function M.wrap(operation: any, identity: any?): any
    return function(connection: any, ...: any): (any?, error?)
        local args = {...}
        local count = select("#", ...)
        local component_id, identity_err
        if identity then component_id, identity_err = identity(connection) else component_id = connection.component_id end
        if identity_err then return nil, identity_err end
        return M.new().invoke(component_id, function()
            return operation(connection, table.unpack(args, 1, count))
        end)
    end
end

function M.carry(envelope: any, result: any): any
    if type(result) == "table" and type(result.kind) == "string" and type(result.details) == "table" then
        envelope.error.kind = result.kind
        envelope.error.retryable = result.retryable
        envelope.error.details = result.details
    end
    return envelope
end
return M
