-- Shared component WRITE and producer-capability authorization for append and emit.

local sql = require("sql")
local sql_boundary = require("sql_boundary")
local error_envelope = require("error_envelope")
local security = require("security")
local registry = require("registry")
local uuid = require("uuid")
local json = require("json")
local writer = require("threads_writer")
local component_client = require("component_client")
local core_types = require("core_types")
local common = require("contract_common")
local is_str = common.is_str
local trim = common.trim
local actor_id = common.actor_id

local M = {}
local GENERIC_THREAD_MESSAGE = "kickside.threads:message.created"
local THREAD_EVENT_META_TYPE = "kickside.core.threads.event"
local GENERIC_THREAD_IMPL = "kickside.core:thread"

local function response_error(field: string): error
    return errors.new({kind = errors.INTERNAL, retryable = false,
        message = "event authorization returns no valid " .. field .. " proof",
        details = {code = "event_authorization_response", field = field}})
end

local function denied_event(event_type: string, reason: string): error
    return (errors.new({ message = reason .. ": " .. event_type, kind = errors.PERMISSION_DENIED }) :: error)
end

local function invalid(message: string, cause: error?): error
    return errors.new({message = message, kind = errors.INVALID, retryable = false,
        details = {code = "thread_event_invalid", cause = cause and error_envelope.encode(cause) or nil}})
end

local function registry_failure(message: string, err: any): error
    return errors.wrap(err, message)
end

local function event_types_for_impl(impl_id: string): (table?, table?, error?)
    if impl_id == GENERIC_THREAD_IMPL then return { [GENERIC_THREAD_MESSAGE] = true }, {}, nil end
    local entry, registry_err = registry.get(impl_id)
    if registry_err then
        if errors.is(registry_err, errors.NOT_FOUND) then return nil, nil, invalid("component kind is not registered", registry_err) end
        return nil, nil, registry_failure("thread component declaration lookup failed", registry_err)
    end
    if not entry then return nil, nil, invalid("component kind is not registered") end
    local data = type(entry.data) == "table" and entry.data or {}
    local meta = type(entry.meta) == "table" and entry.meta or data.meta
    local kind = entry.kind or data.kind
    if kind ~= "contract.binding" or type(meta) ~= "table" or type(meta.events) ~= "table" then
        return nil, nil, invalid("component kind has no valid event declaration")
    end
    local function collect(raw: any, output: boolean): (table?, error?)
        local set: table = {}
        if raw == nil then return set, nil end
        if type(raw) ~= "table" then return nil, invalid("event direction declaration must be an array") end
        local count = 0
        for key in pairs(raw) do
            count = count + 1
            if type(key) ~= "number" or key < 1 or key ~= math.floor(key) then
                return nil, invalid("event direction declaration must be an array")
            end
        end
        if count ~= #raw then return nil, invalid("event direction declaration must be a dense array") end
        for _, shape in ipairs(raw) do
            if type(shape) ~= "table" or not is_str(shape.type) then return nil, invalid("event declaration requires type") end
            if output then
                if shape.system_only ~= nil and type(shape.system_only) ~= "boolean" then
                    return nil, invalid("output system_only must be boolean")
                end
                local system_only = shape.system_only == true
                if set[shape.type] ~= nil and set[shape.type] ~= system_only then
                    return nil, invalid("contradictory output declaration: " .. shape.type)
                end
                set[shape.type] = system_only
            else
                set[shape.type] = true
            end
        end
        return set, nil
    end
    local inputs, input_err = collect(meta.events.input, false)
    if input_err then return nil, nil, input_err end
    local outputs, output_err = collect(meta.events.output, true)
    if output_err then return nil, nil, output_err end
    return inputs, outputs, nil
end

local function is_framework_event_namespace(namespace: string): boolean
    if namespace == "kickside.lifecycle.events" or namespace == "kickside.component.events"
        or namespace == "kickside.core" then
        return true
    end
    for _, prefix in ipairs({ "kickside.lifecycle.events.", "kickside.component.events.", "kickside.core." }) do
        if string.sub(namespace, 1, #prefix) == prefix then return true end
    end
    return false
end

local function registered_event_type(event_type: string): (string?, string?, error?)
    if event_type == GENERIC_THREAD_MESSAGE then return "kickside.threads", nil, nil end
    local entry, registry_err = registry.get(event_type)
    if registry_err then
        if errors.is(registry_err, errors.NOT_FOUND) then
            return nil, nil, invalid("event type is not declared: " .. event_type, registry_err)
        end
        return nil, nil, registry_failure("event type declaration lookup failed", registry_err)
    end
    if not entry then
        return nil, nil, (errors.new({ message = "event type is not declared: " .. event_type,
            kind = errors.INVALID }) :: error)
    end
    local meta = type((entry :: any).meta) == "table" and (entry :: any).meta
        or (type((entry :: any).data) == "table" and type(((entry :: any).data :: any).meta) == "table"
            and ((entry :: any).data :: any).meta or nil)
    if type(meta) ~= "table" or (meta :: any).type ~= THREAD_EVENT_META_TYPE then
        return nil, nil, (errors.new({ message = "registry entry is not a thread event type: " .. event_type,
            kind = errors.INVALID }) :: error)
    end
    return string.match(event_type, "^([^:]+):"), meta.output_kind, nil
end


local function validate_input_authorship(event: any): error?
    local role = (event :: any).role
    if role == nil then
        (event :: any).role = "user"
    elseif role ~= "user" then
        return (errors.new({ message = "user appends may only use the user event role", kind = errors.PERMISSION_DENIED }) :: error)
    end
    local external = (event :: any).external
    if external ~= nil then
        if type(external) ~= "table" then
            return (errors.new({ message = "external event identity must be an object", kind = errors.INVALID }) :: error)
        end
        local source = trim((external :: any).external_source)
        if source == "" or not is_str((external :: any).external_id) then
            return (errors.new({ message = "external event identity requires a source and id", kind = errors.INVALID }) :: error)
        end
        local owner_source = "actor:" .. tostring(actor_id() or "")
        if owner_source == "actor:" or source ~= owner_source then
            return (errors.new({ message = "user appends cannot claim another actor's external identity", kind = errors.PERMISSION_DENIED }) :: error)
        end
    end
    return nil
end

local function validate_user_timestamp(event: any, user_append: boolean): error?
    if user_append and (event :: any).created_at ~= nil then
        return (errors.new({ message = "user appends cannot choose the event timestamp", kind = errors.PERMISSION_DENIED }) :: error)
    end
    return nil
end

local function output_kind_matches(output_kind: string, event_type: string, thread_class: string?): (boolean, error?)
    if not thread_class or thread_class == "" then return false, nil end
    local entry, err = registry.get(output_kind)
    if err then return false, registry_failure("output kind lookup failed", err) end
    if not entry then return false, nil end
    local meta = type(entry.meta) == "table" and entry.meta or {}
    local owns_class = false
    for _, class in ipairs(type(meta.class) == "table" and meta.class or {}) do
        if class == thread_class then owns_class = true; break end
    end
    if not owns_class then return false, nil end
    local _, outputs, declaration_err = event_types_for_impl(output_kind)
    if declaration_err then return false, declaration_err end
    return outputs[event_type] ~= nil, nil
end

local function validate_declared_event(impl_id: string, event_type: string, user_append: boolean,
    thread_class: string?): (string?, error?)
    if type(event_type) ~= "string" or event_type == "" then
        return nil, (errors.new({ message = "event type is required", kind = errors.INVALID }) :: error)
    end
    local event_namespace = event_type == GENERIC_THREAD_MESSAGE and "kickside.threads"
        or string.match(event_type, "^([^:]+):")
    if event_type ~= GENERIC_THREAD_MESSAGE and type(event_namespace) ~= "string" then
        return nil, (errors.new({ message = "event type must name a registry namespace: " .. event_type,
            kind = errors.INVALID }) :: error)
    end

    local input_types, output_types, declaration_err = event_types_for_impl(impl_id)
    if declaration_err then return nil, declaration_err end
    local inputs = input_types :: { [string]: boolean }
    local outputs = output_types :: table
    if impl_id == GENERIC_THREAD_IMPL then inputs[GENERIC_THREAD_MESSAGE] = true end

    local _, output_kind, event_err = registered_event_type(event_type)
    if event_err then return nil, event_err end
    local is_output = outputs[event_type] ~= nil
    local producer = security.can("threads.output.publish", event_type) == true
    if not is_output and producer and type(output_kind) == "string" and output_kind ~= "" then
        local matched, match_err = output_kind_matches(output_kind, event_type, thread_class)
        if match_err then return nil, match_err end
        is_output = matched
    end
    local is_input = inputs[event_type] == true and not is_output
    if not is_input and not is_output then
        return nil, denied_event(event_type, "event type is not declared by the thread component")
    end
    if user_append and is_input and type(event_namespace) == "string"
        and is_framework_event_namespace(event_namespace) then
        return nil, denied_event(event_type, "framework event namespaces require a framework publisher")
    end
    if user_append and is_output and outputs[event_type] == true and not producer then
        return nil, denied_event(event_type, "output event requires framework maintenance authority")
    end
    return is_output and "output" or "input", nil
end

local function authority(): (boolean?, error?)
    if not actor_id() or not security.scope() then
        return nil, (errors.new({ message = "event publication requires an authenticated actor and scope", kind = errors.PERMISSION_DENIED }) :: error)
    end
    return not common.is_maintenance_actor(), nil
end

function M.normalize_id(value: any): (string?, error?)
    local id = trim(value)
    if not uuid.validate(id) then return nil, invalid("thread/component id must be a UUID") end
    return string.lower(id), nil
end

local function dense_array(value: any): boolean
    if type(value) ~= "table" then return false end
    local count = 0
    for key in pairs(value) do
        if type(key) ~= "number" or key < 1 or key ~= math.floor(key) then return false end
        count = count + 1
    end
    return count == #value
end

-- Shape checks precede authority and persistence reads for every target.
function M.normalize_writes(writes: any): error?
    if not dense_array(writes) or #writes == 0 then return invalid("writes must be a non-empty dense array") end
    for _, write in ipairs(writes) do
        if type(write) ~= "table" then return invalid("write must be an object") end
        local id, id_err = M.normalize_id(write.thread_id)
        if id_err then return id_err end
        write.thread_id = id
        if not dense_array(write.events) or #write.events == 0 then return invalid("events must be a non-empty dense array") end
        for _, event in ipairs(write.events) do
            if type(event) ~= "table" or not is_str(event.type) then return invalid("event type is required") end
            if event.id ~= nil then
                local event_id, event_id_err = M.normalize_id(event.id)
                if event_id_err then return event_id_err end
                event.id = event_id
            end
            if event.body_json ~= nil then
                if type(event.body_json) ~= "string" then return invalid("event body_json must be JSON") end
                local _, decode_err = json.decode(event.body_json)
                if decode_err then return invalid("event body_json must be valid JSON") end
            else
                local encoded, encode_err = json.encode(event.body or {})
                if encode_err or not encoded then return invalid("event body must be JSON serializable") end
                event.body_json = encoded
            end
        end
    end
    return nil
end

-- Component owns the access decision; the stored kind owns event declarations.
function M.validate_event_types(db: sql.DB, writes: { table }, _user_append: boolean?): (boolean, error?)
    local shape_err = M.normalize_writes(writes)
    if shape_err then return false, shape_err end
    local user_append, authority_err = authority()
    if authority_err then return false, authority_err end
    local output_only = true
    for _, write in ipairs(writes) do
        local rows, thread_err = db:query("SELECT id,component_id,thread_class FROM kickside_thread WHERE id=$1", { write.thread_id })
        if thread_err then return false, registry_failure("thread lookup failed", thread_err) end
        local thread = rows and rows[1]
        if not thread then return false, (errors.new({ message = "thread not found", kind = errors.NOT_FOUND }) :: error) end
        local component_id = trim(thread.component_id)
        if component_id == "" then return false, (errors.new({ message = "thread component not found", kind = errors.NOT_FOUND }) :: error) end
        if component_id ~= write.thread_id then return false, invalid("primary thread id differs from component id") end
        local components, component_err = component_client.list_system({
            component_ids = { component_id }, include = { meta = false }, limit = 1,
        })
        if component_err then return false, component_err end
        if not components or not components[1] then
            return false, (errors.new({ message = "thread component not found", kind = errors.NOT_FOUND }) :: error)
        end
        local impl_id = tostring(components[1].impl_id or "")
        local producer_write = true
        for _, event in ipairs(write.events) do
            local timestamp_err = validate_user_timestamp(event, user_append == true)
            if timestamp_err then return false, timestamp_err end
            local direction, declaration_err = validate_declared_event(impl_id, event.type, user_append == true, thread.thread_class)
            if declaration_err then return false, declaration_err end
            if direction ~= "output" or security.can("threads.output.publish", event.type) ~= true then producer_write = false end
            if user_append and direction == "input" then
                local authorship_err = validate_input_authorship(event)
                if authorship_err then return false, authorship_err end
            end
        end
        if not producer_write then
            output_only = false
            if user_append then
                local _, access_err = component_client.validate_access(component_id, (core_types.ACCESS.WRITE :: integer))
                if access_err then return false, access_err end
            end
        end
    end
    return user_append == false or output_only, nil
end

-- Internal actor-bound projection admission, using the same contract authorizer.
function M.authorize_writes(args: any): (table?, error?)
    local writes = type(args) == "table" and args.writes or nil
    local shape_err = M.normalize_writes(writes)
    if shape_err then return nil, shape_err end
    local _, authority_err = authority()
    if authority_err then return nil, authority_err end
    local db, db_err = common.open_db()
    if db_err then return nil, db_err end
    local _, authorize_err = M.validate_event_types(db, writes)
    local _, release_err = db:release()
    if authorize_err then return nil, authorize_err end
    if release_err then return nil, registry_failure("authorization database release failed", release_err) end
    return { writes = writes }, nil
end

-- Primary-thread emit must authorize a declared output before it lazily creates
-- or repairs the thread row.
function M.authorize_primary_emit(args: any): (any?, error?)
    args = type(args) == "table" and args or {}
    local component_id, id_err = M.normalize_id(args.component_id)
    if id_err then return nil, id_err end
    if not component_id then return nil, invalid("thread/component id is required") end
    local event = type(args.event) == "table" and args.event or args
    local shape_err = M.normalize_writes({ { thread_id = component_id, events = { event } } })
    if shape_err then return nil, shape_err end
    local user_append, authority_err = authority()
    if authority_err then return nil, authority_err end
    local components, component_err = component_client.list_system({
        component_ids = { component_id }, include = { meta = false }, limit = 1,
    })
    if component_err then return nil, component_err end
    local exists = components ~= nil and components[1] ~= nil
    local impl_id = exists and tostring(components[1].impl_id or "") or trim(args.impl_id)
    if impl_id == "" then return nil, (errors.new({ message = "thread component not found", kind = errors.NOT_FOUND }) :: error) end
    local timestamp_err = validate_user_timestamp(event, user_append == true)
    if timestamp_err then return nil, timestamp_err end
    local thread_class = args.thread_class
    if exists then
        local db, db_err = common.open_db()
        if db_err then return nil, db_err end
        local rows, read_err = db:query("SELECT thread_class FROM kickside_thread WHERE id=$1", { component_id })
        rows, read_err = sql_boundary.bounded_rows(rows, read_err, "read primary thread class", "primary.rows", 0, 1, response_error)
        read_err = error_envelope.cleanup(function(): (any, error?)
            local released, err = db:release()
            if not err and released ~= true then err = response_error("release") end
            return released, err
        end, read_err, "release primary-event authorization")
        if read_err then return nil, read_err end
        thread_class = rows and rows[1] and rows[1].thread_class or nil
    end
    local direction, declaration_err = validate_declared_event(impl_id, event.type, user_append == true, thread_class)
    if declaration_err then return nil, declaration_err end
    local producer = direction == "output" and security.can("threads.output.publish", event.type) == true
    if exists and user_append and not producer then
        local _, access_err = component_client.validate_access(component_id, (core_types.ACCESS.WRITE :: integer))
        if access_err then return nil, access_err end
    end
    if user_append and direction == "input" then
        local authorship_err = validate_input_authorship(event)
        if authorship_err then return nil, authorship_err end
    end
    return { output = exists, impl_id = impl_id, maintenance = user_append == false, component_id = component_id }, nil
end

-- output_owner preserves the stored component owner when a grantee attaches its primary thread.
function M.output_owner(component_id: string): (any?, error?)
    local owner, owner_err = component_client.component_owner_record(component_id)
    if owner_err then return nil, owner_err end
    if type(owner) ~= "table" or not is_str(owner.actor_id) or type(owner.principal) ~= "table"
        or not is_str(owner.principal.id)
        or (owner.principal.kind ~= "user" and owner.principal.kind ~= "group" and owner.principal.kind ~= "service") then
        return nil, (errors.new({ message = "output thread component has no valid owner principal", kind = errors.INVALID }) :: error)
    end
    return { owner_id = owner.actor_id, owner_principal = owner.principal }, nil
end

return M
