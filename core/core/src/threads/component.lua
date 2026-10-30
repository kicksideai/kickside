-- The single seam between the threads slice and the component contract. A thread
-- IS a component: this module owns every call into kickside.component:
-- component_service so the rest of the slice never touches the component tables
-- (kickside_component*, access, meta) with SQL. It registers plain ad-hoc threads
-- as kickside.core:thread and typed autoinit component threads as their declaring
-- impl_id, resolves access, lists component-backed threads by meta.type=thread,
-- delegates grant/revoke + placement, and removes the component on delete.

local contract = require("contract")
local security = require("security")
local consts = require("threads_consts")
local masks = require("core_types")
local component_envelope = require("component_envelope")
local sql_boundary = require("sql_boundary")

local function new(dependencies: any?): any
    local deps = dependencies or {}
    local contract = deps.contract or contract
    local security = deps.security or security

local component = {}

-- The owner mask granted to a component's creator (READ|WRITE|DELETE|ADMIN).
component.OWNER_MASK = (masks.ACCESS.FULL :: integer)

-- The access context the service returns for a component, as this slice reads it.
type AccessContext = {
    id: string,
    access_level: integer,
    impl_id: string,
    context: { [string]: any }?,
}

-- One component row as list_components returns it.
type ComponentRow = {
    component_id: string,
    impl_id: string,
    meta: { [string]: any }?,
    created_at: string?,
    updated_at: string?,
}

local function service_error(result: any, transport_err: any, operation: string): error
    if transport_err then return component_envelope.call_error(transport_err, operation) end
    local err = component_envelope.error_of(type(result) == "table" and result or nil, operation)
    if err then return err end
    return errors.new({kind = errors.INTERNAL, retryable = false,
        message = operation .. " returned an invalid result",
        details = {code = "component_result_invalid"}})
end

-- open resolves the component service and binds it to the current actor + scope so
-- the binding's own access checks run as the caller. Returned errors are typed.
local function open(): (any?, error?)
    local cdef, get_err = contract.get(consts.COMPONENT_SERVICE)
    if get_err or not cdef then
        return nil, service_error(nil, get_err, "component service unavailable")
    end

    local actor = security.actor()
    if not actor then
        return nil, (errors.new({ message = "thread component access requires an actor", kind = errors.PERMISSION_DENIED }) :: error)
    end

    local scope = security.scope()
    if not scope then
        return nil, (errors.new({ message = "thread component access requires a security scope", kind = errors.PERMISSION_DENIED }) :: error)
    end

    local svc, open_err = cdef:with_actor(actor):with_scope(scope):open()
    if open_err or not svc then
        return nil, service_error(nil, open_err, "failed to open component service")
    end
    return svc, nil
end

-- register registers a thread as a component owned by the current actor and
-- returns its component_id. The service grants the owner mask and writes the meta;
-- this slice never INSERTs into the access or meta tables. parent_id places the new
-- component under a parent in the hierarchy when supplied. additional_access is
-- passed through to the component service so system-managed threads can grant
-- their worker actor explicit access at creation without bypassing parent access.
-- thread is the component's primary thread row: the component lifecycle writes it
-- in the registration transaction, so the component and its thread commit together.
function component.register(
    meta: { [string]: any },
    parent_id: string?,
    additional_access: { any }?,
    component_id: string?,
    impl_id: string?,
    thread: { [string]: any }?
): (string?, error?)
    local svc, svc_err = open()
    if svc_err then
        return nil, svc_err
    end

    local request: { [string]: any } = {
        impl_id = (type(impl_id) == "string" and impl_id ~= "") and impl_id or consts.THREAD_IMPL_ID,
        meta = meta,
    }
    -- A thread IS its component: when the caller supplies the id, the component is
    -- registered under it so thread.id == component.id (one identity, no indirection).
    if type(component_id) == "string" and component_id ~= "" then
        request.component_id = component_id
    end
    if type(additional_access) == "table" then
        request.additional_access = additional_access
    end
    if type(parent_id) == "string" and parent_id ~= "" then
        request.parent_id = parent_id
    end
    if type(thread) == "table" then
        request.thread = thread
    end

    local result, call_err = (svc :: any):register(request)
    if call_err or type(result) ~= "table" or result.success ~= true then
        return nil, service_error(result, call_err, "failed to register thread component")
    end
    local component_id = result.component_id
    if type(component_id) ~= "string" or component_id == "" then
        return nil, (errors.new({ message = "component service returned no component_id", kind = errors.INTERNAL }) :: error)
    end
    if request.thread ~= nil and result.thread_id ~= component_id then
        return nil, (errors.new({ message = "component service registered " .. component_id
            .. " without committing its thread row", kind = errors.INTERNAL }) :: error)
    end
    return component_id, nil
end

-- access_level resolves the current actor's access bitmask for a component. A
-- not-found component or a denied actor surfaces as a typed error; the access
-- decision itself is the service's job, not a SQL join here.
function component.access_level(component_id: string): (integer?, error?)
    if type(component_id) ~= "string" or component_id == "" then
        return nil, (errors.new({ message = "component_id is required", kind = errors.INVALID }) :: error)
    end
    local svc, svc_err = open()
    if svc_err then
        return nil, svc_err
    end
    local result, call_err = (svc :: any):get_access_context({
        component_id = component_id,
        access_mask = masks.ACCESS.READ,
        include_context = false,
    })
    if call_err or type(result) ~= "table" or result.success == false then
        return nil, service_error(result, call_err, "failed to resolve component access")
    end
    local ctx = result :: AccessContext
    local level = tonumber(ctx.access_level) or 0
    return math.floor(level) :: integer, nil
end

-- The component owner supplies the implementation used to resolve its declaration.
function component.impl_id(component_id: string): (string?, error?)
    local svc, svc_err = open()
    if svc_err then return nil, svc_err end
    local result, call_err = (svc :: any):get_access_context({
        component_id = component_id, access_mask = masks.ACCESS.READ, include_context = false,
    })
    if call_err or type(result) ~= "table" or result.success == false then
        return nil, service_error(result, call_err, "failed to resolve component implementation")
    end
    return result.impl_id, nil
end

-- has_access returns true when the actor's access for the component includes every
-- bit of required_mask. A missing component or denied actor returns (false, err).
function component.has_access(component_id: string, required_mask: integer): (boolean, error?)
    local svc, svc_err = open()
    if svc_err then return false, svc_err end
    local result, call_err = svc:get_access_context({
        component_id = component_id, access_mask = required_mask, include_context = false,
    })
    if call_err then return false, call_err end
    local access_err = component_envelope.error_of(result, "thread component access")
    if access_err then return false, access_err end
    return true, nil
end

-- The display fields a thread component carries in its public meta: the human
-- title and icon a picker renders. A thread row stores neither (its title lives on
-- the component, not in the thread attrs), so listing surfaces them alongside ids.
type ComponentDisplay = { title: string, icon: string }

local function listing_response_error(field: string): error
    return errors.new({kind = errors.INTERNAL, retryable = false,
        message = "thread component listing returns no valid " .. field .. " proof",
        details = {code = "thread_component_listing_response", field = field}})
end

-- list_thread_components returns the component_ids of every thread component the
-- current actor can access at access_mask, applying the service's meta filters. The
-- third return maps each id to its display meta (title/icon) so a caller labels a
-- thread by its component's human name rather than a bare id. The access filtering
-- is the contract's job; this slice consumes the ids to scope its kickside_thread
-- query and the meta to label the rows.
function component.list_thread_components(
    meta_filters: { [string]: any }?,
    access_mask: integer,
    limit: integer,
    start_offset: integer?,
    impl_id: string?
): (string[]?, error?, { [string]: ComponentDisplay }?, table?)
    local svc, svc_err = open()
    if svc_err then
        return nil, svc_err
    end

    -- Thread-backed components are identified by public meta.type=thread. Their
    -- impl_id may be the generic thread shell or a real declared component kind
    -- such as uploads/inbox. An optional implementation narrows the kind set.
    local meta: { [string]: any } = { type = "thread" }
    if type(meta_filters) == "table" then
        for key, value in pairs(meta_filters) do
            meta[key] = value
        end
    end
    local filters: { [string]: any } = {
        access_mask = access_mask,
        meta = meta,
    }

    if type(impl_id) == "string" and impl_id ~= "" then
        filters.impl_ids = { impl_id }
    end

    -- The component service caps a single page at PAGE_MAX; the access-id set this
    -- resolves can exceed it, so page through until limit ids are gathered or the
    -- service reports no more rows.
    local PAGE_MAX = 100
    local ids: string[] = {}
    local display: { [string]: ComponentDisplay } = {}
    local offset = start_offset or 0
    if limit < 1 or limit ~= math.floor(limit) or offset < 0 or offset ~= math.floor(offset) then
        return nil, (errors.new({ message = "thread component pagination is invalid", kind = errors.INVALID, retryable = false, details = {code = "thread_component_pagination_invalid"} }) :: error)
    end
    local has_more = false
    while #ids < limit do
        local page = limit - #ids
        if page > PAGE_MAX then page = PAGE_MAX end
        local result, call_err = (svc :: any):list({
            filters = filters,
            pagination = { limit = page, offset = offset },
        })
        if call_err then return nil, service_error(result, call_err, "failed to list thread components") end
        if type(result) ~= "table" then return nil, listing_response_error("page") end
        if result.success == false then return nil, service_error(result, nil, "failed to list thread components") end
        if type(result.has_more) ~= "boolean" then return nil, listing_response_error("page verdict") end
        local rows, rows_err = sql_boundary.bounded_rows(result.components, nil,
            "list thread components", "components", 0, page, listing_response_error)
        if rows_err then return nil, rows_err end
        local batch = rows :: ComponentRow[]
        if #batch == 0 and result.has_more then return nil, listing_response_error("page advance") end
        has_more = result.has_more
        for _, row in ipairs(batch) do
            if type(row) ~= "table" or type(row.component_id) ~= "string" or row.component_id == "" then
                return nil, listing_response_error("component id")
            end
            if type(row.component_id) == "string" and row.component_id ~= "" then
                ids[#ids + 1] = row.component_id
                local meta = row.meta
                local title = type(meta) == "table" and (meta :: { [string]: any }).title or nil
                local icon = type(meta) == "table" and (meta :: { [string]: any }).icon or nil
                display[row.component_id] = {
                    title = type(title) == "string" and title or "",
                    icon = type(icon) == "string" and icon or "",
                }
            end
        end
        offset = offset + #batch
        if #batch == 0 or not result.has_more then break end
    end
    return ids, nil, display, { has_more = has_more, next_offset = offset }
end

-- ensure_thread_type guarantees a component advertises the public thread markers the
-- thread list/picker scopes on: meta.type=thread (the list filter) and meta.thread_class
-- (the class-scoped meta filter reader.list applies). register_thread_component writes
-- both when a thread is created thread-first; a component created by the component service
-- FIRST and given a thread later (contract ensure_thread, e.g. an installed automation or a
-- KB) never passes through it, so it lacks them and stays invisible to the picker. Reads
-- the current meta and merges only the missing/changed keys through set_meta (per-key
-- upsert, so existing class/title/counts are untouched), making it a no-op once set.
function component.ensure_thread_type(component_id: string, thread_class: string?): (boolean, error?)
    if type(component_id) ~= "string" or component_id == "" then
        return false, (errors.new({ message = "component_id is required", kind = errors.INVALID }) :: error)
    end
    local svc, svc_err = open()
    if svc_err then return false, svc_err end
    local fields: { [string]: any } = { type = "thread" }
    if type(thread_class) == "string" and thread_class ~= "" then fields.thread_class = thread_class end

    local result, call_err = (svc :: any):set_meta({ component_id = component_id, fields = fields })
    if call_err or type(result) ~= "table" or result.success ~= true then
        return false, service_error(result, call_err, "failed to mark thread component type")
    end
    return true, nil
end

-- update runs private-context commands against a thread's component. The service
-- gates the commands by the actor's access. Public meta uses component.set_meta;
-- access grants/revokes cascade and go through grant_subtree.
function component.update(component_id: string, commands: { any }): (boolean, error?)
    local svc, svc_err = open()
    if svc_err then
        return false, svc_err
    end
    local result, call_err = (svc :: any):update({
        component_id = component_id,
        commands = commands,
    })
    if call_err or type(result) ~= "table" or result.success == false then
        return false, service_error(result, call_err, "failed to update thread component")
    end
    return result.changes_made == true, nil
end

-- set_placement delegates a re-parent / reorder to the component service.
function component.set_placement(component_id: string, placement: { [string]: any }): (boolean, error?)
    local svc, svc_err = open()
    if svc_err then
        return false, svc_err
    end
    local request: { [string]: any } = { component_id = component_id }
    for key, value in pairs(placement) do
        request[key] = value
    end
    local result, call_err = (svc :: any):set_placement(request)
    if call_err or type(result) ~= "table" or result.success == false then
        return false, service_error(result, call_err, "failed to set component placement")
    end
    return true, nil
end

-- grant_subtree delegates a subtree-wide access grant to the component service.
function component.grant_subtree(component_id: string, grant: { [string]: any }): (boolean, error?)
    local svc, svc_err = open()
    if svc_err then
        return false, svc_err
    end
    local request: { [string]: any } = { component_id = component_id }
    for key, value in pairs(grant) do
        request[key] = value
    end
    local result, call_err = (svc :: any):grant_subtree(request)
    if call_err or type(result) ~= "table" or result.success == false then
        return false, service_error(result, call_err, "failed to grant subtree access")
    end
    return true, nil
end

-- remove deletes a thread's component through the service after the thread rows are
-- gone. The service tears down the component's access + meta rows; this slice never
-- DELETEs from the component tables. A missing component is treated as success so
-- delete stays idempotent.
function component.remove(component_id: string): (boolean, error?, any?)
    if type(component_id) ~= "string" or component_id == "" then
        return true, nil
    end
    local svc, svc_err = open()
    if svc_err then
        return false, svc_err
    end
    local result, call_err = (svc :: any):delete({ component_id = component_id })
    if call_err then
        return false, service_error(nil, call_err, "failed to delete thread component")
    end
    if type(result) == "table" and result.success == false then
        local err = service_error(result, nil, "failed to delete thread component")
        if errors.is(err, errors.NOT_FOUND) then return true, nil end
        return false, err
    end
    if type(result) == "table" and result.cleanup_pending ~= true and type(result.warning) == "string" then
        local details: { [string]: any } = {}
        for key, value in pairs(result.details or {}) do details[key] = value end
        if details.cleanup_pending == nil then details.cleanup_pending = false end
        if details.discarded == nil then details.discarded = result.thread_discarded end
        local failure = {success = false, error = result.warning, kind = result.kind,
            retryable = result.retryable, details = details}
        if failure.retryable == nil then failure.retryable = false end
        return false, service_error(failure, nil, "failed to reap component thread")
    end
    return true, nil, result
end

return component
end
local default = new()
default.new = new
return default
