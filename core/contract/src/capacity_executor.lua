local time = require("time")

local M = {}

function M.new(dependencies: any): any
    local check, record = dependencies.check, dependencies.record
    local now_ms = dependencies.now_ms or function(): integer return time.now():unix_nano() // 1000000 end
    return { check = check, invoke = function(component_id: string?, operation: any): (any?, error?)
        if component_id == nil then return operation() end
        local _, wait_err = check(component_id)
        if wait_err then return nil, wait_err end
        local result, call_err = operation()
        if call_err == nil then return result, nil end
        local floor, record_err = record(component_id, call_err)
        if record_err then return nil, record_err end
        if floor == nil then return nil, call_err end
        local details: any = {}
        for key, value in pairs(call_err:details() or {}) do details[key] = value end
        details.retry_at_ms = floor
        details.retry_after_ms = math.max(0, floor - now_ms())
        return nil, (errors.new({ kind = call_err:kind(), message = call_err:message(),
            retryable = call_err:retryable(), details = details }) :: error)
    end }
end

return M
