-- Shared argument checks, actor and identity lookups, the pooled connection
-- and the thread update notification for the kickside.core:threads contract
-- parts (contract/resource, events, graph, projections).

local sql = require("sql")
local security = require("security")
local env = require("threads_env")
local component_identity = require("component_identity")
local notify = require("threads_notify")
local execution_identity = require("execution_identity")
local error_envelope = require("error_envelope")

local M = {}

function M.is_str(value: any): boolean
    return type(value) == "string" and (value :: string) ~= ""
end

function M.trim(value: any): string
    if type(value) ~= "string" then
        return ""
    end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

function M.normalize_int_arg(value: any, name: string, min_value: integer?, max_value: integer?): (integer?, error?)
    if value == nil or value == "" then
        return nil, nil
    end
    if type(value) ~= "number" or value ~= math.floor(value) then
        return nil, (errors.new({ message = name .. " must be an integer", kind = errors.INVALID }) :: error)
    end
    local n = value :: integer
    if min_value ~= nil and n < min_value then
        return nil, (errors.new({ message = name .. " must be >= " .. tostring(min_value), kind = errors.INVALID }) :: error)
    end
    if max_value ~= nil and n > max_value then
        return nil, (errors.new({ message = name .. " must be <= " .. tostring(max_value), kind = errors.INVALID }) :: error)
    end
    return n, nil
end

function M.normalize_bool_arg(value: any, name: string, default_value: boolean): (boolean?, error?)
    if value == nil or value == "" then
        return default_value, nil
    end
    if type(value) ~= "boolean" then
        return nil, (errors.new({ message = name .. " must be a boolean", kind = errors.INVALID }) :: error)
    end
    return value :: boolean, nil
end

-- actor_id reads the acting user's id from the security context, or nil.
function M.actor_id(): string?
    local actor = security.actor()
    if actor then
        local id = M.trim(actor:id())
        if id ~= "" then
            return id
        end
    end
    return nil
end

function M.is_maintenance_actor(): boolean
    return execution_identity.is_maintenance_key(M.actor_id())
end

-- keyed_principal answers the principal a component service records for an owner
-- key (the stored component owner), or nil for a key that is no principal.
function M.keyed_principal(owner_id: string?): (any?, error?)
    local key = M.trim(owner_id)
    if key == "" or execution_identity.is_maintenance_key(key) then return nil, nil end
    local keyed, key_err = execution_identity.principal_of_key(key)
    if key_err then return nil, errors.wrap(key_err, "Resolve keyed principal") end
    return keyed, nil
end

function M.actor_principal(): (any?, error?)
    local actor = security.actor()
    if not actor then return nil, nil end
    local meta = actor.meta and actor:meta() or nil
    local principal = type(meta) == "table" and meta.principal or nil
    if principal ~= nil then
        local checked, check_err = execution_identity.check_principal(principal, "actor principal")
        if check_err then return nil, errors.wrap(check_err, "Resolve actor principal") end
        return checked, nil
    end
    return M.keyed_principal(actor:id())
end

-- declared_identity answers the execution identity a thread's declared
-- projections run under, as { row?, system?, error? } (IDENTITY-1 §4 T row).
-- It is owner-loaded, never captured: the component's own stored v2 identity
-- (set at creation or by SET), or the framework system identity for a
-- framework-created component that carries none. A stored identity that is not
-- valid v2 (a parked legacy row) refuses; a failed component read is returned
-- as the error.
function M.declared_identity(component_id: string): ({ [string]: any }?, error?)
    local stored, load_err = component_identity.execution_identity_of(component_id)
    if load_err then return nil, load_err end
    if stored == nil then return { system = true }, nil end
    local row, row_err = execution_identity.to_row(stored)
    row, row_err = error_envelope.binding(row, row_err, nil, "materialize declared execution identity", "declared_identity_row_missing")
    if row_err then return nil, row_err end
    return { row = row }, nil
end

-- open_db opens the slice's pooled connection.
function M.open_db(): (sql.DB?, error?)
    local db, db_err = sql.get(env.db_id() :: string)
    if db_err then return nil, errors.wrap(db_err, "db unavailable") end
    if type(db) ~= "userdata" then
        return nil, errors.new({message = "database acquisition returned no pooled connection", kind = errors.INTERNAL,
            retryable = false, details = {code = "thread_database_response", field = "sql.get"}})
    end
    return db, nil
end

-- emit_update delivers a committed thread update to the stored thread audience.
-- Users without a connected hub are skipped; a refused delivery is returned.
function M.emit_update(thread_id: string, event_type: string, extra: table?): error?
    local payload: { [string]: any } = {
        thread_id = thread_id,
        event_type = event_type,
    }
    if type(extra) == "table" then
        for key, value in pairs(extra) do payload[key] = value end
    end
    local _, emit_err = notify.emit(payload)
    return emit_err
end

return M
