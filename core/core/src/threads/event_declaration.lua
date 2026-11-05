-- Binding event declarations shared by binding and write authorization.
local registry = require("registry")
local consts = require("threads_consts")
local error_envelope = require("error_envelope")

local M = {}

local function invalid(message: string, cause: error?): error
    return errors.new({message = message, kind = errors.INVALID, retryable = false,
        details = {code = "thread_event_invalid", cause = cause and error_envelope.encode(cause) or nil}})
end

function M.load(impl_id: string, required: boolean?): (table?, error?)
    if impl_id == consts.THREAD_IMPL_ID or (not required and impl_id == "") then return {}, nil end
    local entry, registry_err = registry.get(impl_id)
    if registry_err then
        if errors.is(registry_err, errors.NOT_FOUND) then
            if not required then return {}, nil end
            return nil, invalid("component kind is not registered", registry_err)
        end
        return nil, errors.wrap(registry_err, "thread component declaration lookup failed")
    end
    if not entry then
        if not required then return {}, nil end
        return nil, invalid("component kind is not registered")
    end
    local data = type(entry.data) == "table" and entry.data or {}
    local meta = type(entry.meta) == "table" and entry.meta or data.meta
    local events = type(meta) == "table" and meta.events or nil
    if not required and (type(events) ~= "table" or events.read == nil) then return {}, nil end
    local kind = entry.kind or data.kind
    if kind ~= "contract.binding" or type(events) ~= "table" then
        return nil, invalid("component kind has no valid event declaration")
    end
    if not required and events.read ~= nil and events.read ~= "admin" then
        return nil, invalid("event read declaration must be admin")
    end
    return events, nil
end

return M
