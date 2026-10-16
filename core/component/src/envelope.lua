-- envelope: the component_service result envelope, shared by the service bindings
-- that build it and the client that reads it. A failed call answers
-- { success = false, error, kind } where kind is one of the shared error kinds:
-- INVALID for a malformed request, PERMISSION_DENIED for an access refusal
-- (including a "not found or access denied" answer that conceals existence),
-- NOT_FOUND / CONFLICT where the service knows them, INTERNAL for a storage,
-- transaction or lifecycle failure.

local component_types = require("component_types")
local error_envelope = require("error_envelope")

local M = {}

function M.kind_of(err: any): string
    if type(err) == "userdata" then return (err :: error):kind() end
    return errors.INTERNAL
end

function M.retryable_of(err: any): boolean?
    if type(err) == "userdata" then return (err :: error):retryable() end
    return false
end

-- A failed envelope with an explicit kind.
function M.fail(message: string, kind: string): component_types.ServiceEnvelope
    return { success = false, error = message, kind = kind }
end

-- A failed envelope for a storage, transaction or lifecycle failure.
function M.internal(message: string): component_types.ServiceEnvelope
    return { success = false, error = message, kind = errors.INTERNAL }
end

local function native_failure(err: any, context: string?): error
    local kind = M.kind_of(err)
    if type(err) == "userdata" then
        local source = error_envelope.with_cause(err :: error)
        if not context then return source end
        local wrapped = error_envelope.encode(errors.wrap(source, context))
        wrapped.message = context .. ": " .. source:message()
        return errors.new(wrapped)
    end
    return errors.new({ kind = kind,
        message = context and (context .. ": " .. tostring(err)) or tostring(err) })
end

-- A failed envelope for an error returned by a lower layer: the message is prefixed
-- with context when given, and the kind is the one the error carries.
function M.from_error(err: any, context: string?): component_types.ServiceEnvelope
    local failure = native_failure(err, context)
    return { success = false, error = failure:message(), kind = failure:kind(),
        retryable = failure:retryable(), details = failure:details() }
end

-- The structured error for a service call that failed before answering (a refused
-- dispatch, an unavailable runtime): it keeps the kind the call error carries.
function M.call_error(err: any, operation_name: string): error
    return native_failure(err, operation_name)
end

-- Map a service result into a structured error for the client, or nil on success.
-- The envelope's kind is the service's own classification; a failure without one
-- is INTERNAL, since only a classified refusal is evidence of denied access.
function M.error_of(result: component_types.ServiceEnvelope?, operation_name: string, context: string?): error?
    if not result then
        return (errors.new({ message = operation_name .. " returned nil result", kind = errors.INTERNAL }) :: error)
    end
    if not result.success then
        local kind = type(result.kind) == "string" and result.kind or errors.INTERNAL
        local message = result.error or (operation_name .. " failed")
        if context then message = context .. ": " .. message end
        return (errors.new({ message = message, kind = kind,
            retryable = result.retryable, details = result.details }) :: error)
    end
    return nil
end

return M
