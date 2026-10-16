type Map = { [string]: any }

local function error_cause(err: any): Map?
    if type(err) ~= "userdata" then return nil end
    local native = err :: error
    return {
        kind = native:kind(),
        message = native:message(),
        retryable = native:retryable(),
        details = native:details(),
    }
end

local function failure(message: string, kind: string, error_kind: string?, retryable: boolean?, cause: any?): error
    local details: Map? = nil
    local source = error_cause(cause)
    if error_kind or source then
        details = error_kind and { code = error_kind, error_kind = error_kind } or {}
        if source then (details :: Map).cause = source end
    end
    return (errors.new({
        message = message,
        kind = kind,
        retryable = retryable,
        details = details,
    }) :: error)
end

return failure
