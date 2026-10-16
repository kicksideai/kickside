local M = {}

function M.encode(err: error): { [string]: any }
    return {
        kind = err:kind(),
        message = err:message(),
        retryable = err:retryable(),
        details = err:details(),
    }
end

local function annotate(err: error, annotations: { [string]: any }, cause: any): error
    local details: { [string]: any } = {}
    for key, value in pairs(err:details() or {}) do details[key] = value end
    for key, value in pairs(annotations) do details[key] = value end
    details.cause = cause
    return errors.new({kind = err:kind(), message = err:message(),
        retryable = err:retryable(), details = details :: { [string]: any }})
end

function M.with_cause(err: error): error
    local details = err:details()
    if details and details.cause ~= nil then return err end
    return annotate(err, {}, M.encode(err))
end

function M.wrap(err: error, message: string, annotations: { [string]: any }): error
    return errors.wrap(annotate(err, annotations, M.encode(err)), message)
end

function M.binding(value: any, err: error?, method: string?, operation: string, code: string): (any?, error?)
    if err then return nil, errors.wrap(err, operation) end
    if (type(value) ~= "table" and type(value) ~= "userdata") or (method ~= nil and type(value[method]) ~= "function") then
        return nil, errors.new({kind = errors.INTERNAL, retryable = false,
            message = operation .. ": " .. (method or "instance"), details = {code = code}})
    end
    return value, nil
end

function M.cleanup(operation: () -> (any, error?), primary: error?, message: string): error?
    local _, err = operation()
    if not err then return primary end
    if primary then return M.wrap_secondary(err, primary, message) end
    return errors.wrap(err, message)
end

function M.wrap_secondary(err: error, operation_error: error, message: string): error
    return M.wrap(err, message, {operation_error = M.encode(operation_error)})
end

return M
