-- Thread event reads and the canonical append contract seam.

local sql = require("sql")
local json = require("json")
local security = require("security")
local registry = require("registry")
local writer = require("threads_writer")
local reader = require("threads_reader")
local thread_crud = require("threads_thread_crud")
local teardown = require("threads_teardown")
local component_client = require("component_client")
local event_authorization = require("contract_event_authorization")
local common = require("contract_common")
local error_envelope = require("error_envelope")
local committed_error = require("committed_error")
local sql_boundary = require("sql_boundary")
local is_str = common.is_str
local trim = common.trim
local normalize_int_arg = common.normalize_int_arg
local normalize_bool_arg = common.normalize_bool_arg
local actor_id = common.actor_id
local open_db = common.open_db
local emit_update = common.emit_update
local declared_identity = common.declared_identity
local keyed_principal = common.keyed_principal

local M = {}

local SYSTEM_LIFECYCLE_IMPL = "kickside.core.lifecycle:system_lifecycle"
local LIFECYCLE_EVENT_TYPES = {
    ["kickside.lifecycle.events:principal.deleted"] = true,
    ["kickside.lifecycle.events:component.deleted"] = true,
}

-- stamp_thread_markers advertises a framework-created thread through the trusted
-- component tier (the publisher holds no READ on the component). A failed stamp
-- purges the thread so a committed thread always carries its markers.
function M.stamp_thread_markers(db: any, thread_id: string, thread_class: string, owner: string): error?
    local marked, mark_err = component_client.set_runtime_meta(thread_id,
        { type = "thread", thread_class = thread_class })
    if mark_err or not marked then
        local primary = mark_err or errors.new({message = "thread marker write returned no result", kind = errors.INTERNAL,
            retryable = false, details = {code = "thread_marker_response"}})
        local _, purge_err = teardown.purge_thread(db, thread_id, owner)
        if purge_err then
            return error_envelope.wrap_secondary(purge_err, primary, "thread marker write failed and thread cleanup failed")
        end
        return primary
    end
    return nil
end

local function audit_lookup_response(field: string): error
    return errors.new({kind = errors.INTERNAL, retryable = false,
        message = "audit thread lookup returns no valid " .. field .. " proof",
        details = {code = "audit_thread_lookup_response", field = field}})
end

local function ensure_audit_thread(db: any, thread_id: string, spec: any): error?
    local found, find_err = db:query("SELECT id, thread_class FROM kickside_thread WHERE id=$1", { thread_id })
    found, find_err = sql_boundary.bounded_rows(found, find_err, "audit thread lookup failed", "thread rows", 0, 1, audit_lookup_response)
    if find_err then return find_err end
    local components, list_err = component_client.list_system({component_ids = {thread_id}, limit = 1})
    components, list_err = sql_boundary.bounded_rows(components, list_err, "audit component lookup failed", "component rows", 0, 1, audit_lookup_response)
    if list_err then return list_err end
    if found and found[1] then
        local bindings = {}
        if components and components[1] then
            local binding_err
            bindings, binding_err = registry.find({[".id"] = components[1].impl_id, [".kind"] = "contract.binding"})
            bindings, binding_err = sql_boundary.bounded_rows(bindings, binding_err,
                "audit kind lookup failed", "kind bindings", 0, 1, audit_lookup_response)
            if binding_err then return binding_err end
        end
        if not components or not components[1] or not bindings[1]
            or found[1].thread_class ~= spec.thread_class then
            return errors.new({message = "audit publication requires the canonical lifecycle thread",
                kind = errors.PERMISSION_DENIED, retryable = false,
                details = {code = "audit_thread_canonical_required"}})
        end
        return nil
    end
    -- The component owner is loaded through Component's trusted owner API; the
    -- framework publisher cannot become the thread owner or its audience.
    local principal: { [string]: any } = spec.audience_principal
    local registered_framework_component = false
    if not components or not components[1] then
        -- The framework actor becomes the owner; its keyed principal is the one the
        -- component service records, so the registered thread row carries it.
        local publisher = actor_id()
        local owner_principal, principal_err = keyed_principal(publisher)
        if principal_err then return principal_err end
        local _, register_err = thread_crud.register_thread_component({ id = thread_id,
            impl_id = spec.impl_id, thread_class = spec.thread_class,
            attrs = { audience_principals = { principal } } }, publisher, owner_principal)
        if register_err and (register_err :: error):kind() ~= errors.CONFLICT then return register_err end
        registered_framework_component = register_err == nil
        components = { { impl_id = spec.impl_id } }
    end
    local owner_record, owner_err = component_client.component_owner_record(thread_id)
    if owner_err then return owner_err end
    local owner = owner_record and owner_record.actor_id or nil
    local owner_principal = owner_record and owner_record.principal or nil
    if type(owner) ~= "string" or owner == "" then
        return (errors.new({ message = "audit component has no owner", kind = errors.INVALID }) :: error)
    end
    if not registered_framework_component and type(owner_principal) ~= "table" then
        return (errors.new({ message = "audit component owner is not a principal", kind = errors.INVALID }) :: error)
    end
    local identity, identity_err = declared_identity(thread_id)
    if identity_err or not identity then return identity_err end
    local audit_args = {
        component_id = thread_id, impl_id = components[1].impl_id, trusted_audit = true,
        thread_class = spec.thread_class, attrs = { audience_principals = { principal } },
    }
    if registered_framework_component then
        local _, attach_err = thread_crud.attach(db, thread_id, audit_args, owner, identity)
        if attach_err then return attach_err end
    else
        local _, create_err = thread_crud.create(db, audit_args, owner, identity, owner_principal)
        if create_err and (create_err :: error):kind() == errors.CONFLICT then return nil end
        if create_err then return create_err end
    end
    return M.stamp_thread_markers(db, thread_id, spec.thread_class, owner)
end

-- list_events returns one page of a thread's events, newest-first by default,
-- with the prune boundary, the next sequence and any source gap. Window keys:
-- before / from_seq / to_seq (seq bounds), limit, ascending, event_type.
function M.list_events(args: any): (any?, error?)
    args = type(args) == "table" and args or {}
    if not is_str(args.thread_id) then
        return nil, (errors.new({ message = "thread_id is required", kind = errors.INVALID }) :: error)
    end
    local before, before_err = normalize_int_arg(args.before, "before", 0, nil)
    if before_err then return nil, before_err end
    local from_seq, from_err = normalize_int_arg(args.from_seq, "from_seq", 0, nil)
    if from_err then return nil, from_err end
    local to_seq, to_err = normalize_int_arg(args.to_seq, "to_seq", 0, nil)
    if to_err then return nil, to_err end
    local limit, limit_err = normalize_int_arg(args.limit, "limit", 1, 1000)
    if limit_err then return nil, limit_err end
    local ascending, ascending_err = normalize_bool_arg(args.ascending, "ascending", false)
    if ascending_err then return nil, ascending_err end
    local db, db_err = open_db()
    if db_err then return nil, db_err end
    local _db = db :: sql.DB


    local page, read_err = reader.list_events(_db, args.thread_id :: string, {
        before = before,
        from_seq = from_seq,
        to_seq = to_seq,
        limit = limit,
        ascending = ascending,
        event_type = args.event_type,
    })
    read_err = error_envelope.cleanup(function() return _db:release() end, read_err, "Release event read database")
    if read_err then return nil, read_err end
    return error_envelope.binding(page, nil, nil, "Read thread events", "thread_event_read_response")
end

-- prune_boundary reports a thread's highest pruned sequence, never its events.
-- The caller's security scope must hold the read action on the thread's class:
-- a retention owner proves its own tombstones are below the boundary without
-- holding READ on the users' threads that carry them.
local PRUNE_BOUNDARY_READ_ACTION = "threads.prune_boundary.read"

function M.prune_boundary(args: any): (any?, error?)
    args = type(args) == "table" and args or {}
    if not is_str(args.thread_id) then
        return nil, (errors.new({ message = "thread_id is required", kind = errors.INVALID }) :: error)
    end
    local db, db_err = open_db()
    if db_err then return nil, db_err end
    local _db = db :: sql.DB
    local boundary, read_err = reader.prune_boundary(_db, args.thread_id :: string)
    read_err = error_envelope.cleanup(function() return _db:release() end, read_err, "Release prune boundary database")
    if read_err then return nil, read_err end
    local verified, proof_err = error_envelope.binding(boundary, nil, nil, "Read thread prune boundary", "thread_event_read_response")
    if proof_err then return nil, proof_err end
    boundary = verified
    if security.can(PRUNE_BOUNDARY_READ_ACTION, boundary.thread_class) ~= true then
        return nil, (errors.new({ message = "prune boundary read denied for thread class "
            .. boundary.thread_class, kind = errors.PERMISSION_DENIED }) :: error)
    end
    return { thread_id = boundary.thread_id, max_pruned_seq = boundary.max_pruned_seq }, nil
end

function M.find_event_by_external(args: any): (any?, error?)
    args = type(args) == "table" and args or {}
    for _, key in ipairs({ "thread_id", "event_type", "external_source", "external_id" }) do
        if not is_str(args[key]) then
            return nil, (errors.new({ message = key .. " is required", kind = errors.INVALID }) :: error)
        end
    end
    if args.external_version ~= nil and type(args.external_version) ~= "string" then
        return nil, (errors.new({ message = "external_version must be a string", kind = errors.INVALID }) :: error)
    end
    local db, db_err = open_db()
    if db_err then return nil, db_err end
    local _db = db :: sql.DB
    local event, read_err = reader.find_event_by_external(
        _db,
        args.thread_id :: string,
        args.event_type :: string,
        args.external_source :: string,
        args.external_id :: string,
        args.external_version
    )
    read_err = error_envelope.cleanup(function() return _db:release() end, read_err, "Release external event database")
    if read_err then return nil, read_err end
    return { event = event }, nil
end

local function normalize_append_event(raw: table, index: integer): (table?, error?)
    local body_json = raw.body_json
    if type(body_json) ~= "string" or body_json == "" then
        local encoded, encode_err = json.encode(raw.body or {})
        if encode_err or not encoded then
            return nil, (errors.new({ message = "events[" .. tostring(index) .. "].body must be JSON serializable", kind = errors.INVALID }) :: error)
        end
        body_json = encoded
    end

    return {
        id = raw.id,
        subject = raw.subject,
        seq = raw.seq,
        type = raw.type,
        role = raw.role,
        body = raw.body,
        body_json = body_json,
        content = raw.content,
        external = raw.external,
        trace_context = raw.trace_context,
        created_at = raw.created_at,
    }, nil
end

-- Normalize one thread batch into the writer shape.
local function normalize_write(raw: any): (table?, error?)
    local w = (type(raw) == "table" and raw or {}) :: { [string]: any }
    if not is_str(w.thread_id) then
        return nil, (errors.new({ message = "thread_id is required", kind = errors.INVALID }) :: error)
    end
    if type(w.events) ~= "table" or #(w.events :: { any }) == 0 then
        return nil, (errors.new({ message = "events array is required", kind = errors.INVALID }) :: error)
    end
    local events: { table } = table.create(#(w.events :: { any }), 0)
    for index, raw_event in ipairs(w.events :: { any }) do
        if type(raw_event) ~= "table" then
            return nil, (errors.new({ message = "events[" .. tostring(index) .. "] must be an object", kind = errors.INVALID }) :: error)
        end
        local event, normalize_err = normalize_append_event(raw_event :: table, index)
        if normalize_err then return nil, normalize_err end
        table.insert(events, event :: table)
    end
    return { thread_id = w.thread_id :: string, events = events, expect = w.expect }, nil
end


local function append_response(field: string): error
    return errors.new({kind = errors.INTERNAL, retryable = false,
        message = "thread append returns no valid " .. field .. " proof",
        details = {code = "thread_append_response", field = field}})
end

local function append_results(value: any, count: integer): (table[]?, error?)
    local rows, err = sql_boundary.bounded_rows(value, nil, "read append outcomes", "writer outcomes", count, count, append_response)
    if err then return nil, err end
    for _, row in ipairs(rows :: table[]) do
        if not is_str(row.thread_id) then return nil, append_response("thread id") end
        for _, field in ipairs({"inserted", "duplicates", "max_seq"}) do
            if type(row[field]) ~= "number" then return nil, append_response(field) end
            local _, count_err = sql_boundary.number_value(row[field], field, 0, true, false, append_response)
            if count_err then return nil, count_err end
        end
        local _, events_err = sql_boundary.rows(row.events, nil, "read appended events", "events", append_response)
        if events_err then return nil, events_err end
    end
    return rows, nil
end

local function release_append_database(db: sql.DB, primary: error?, committed: boolean): error?
    local release_failed = false
    local err = error_envelope.cleanup(function(): (any, error?)
        local released, release_err = db:release()
        if not release_err and released ~= true then
            release_err = errors.new({kind = errors.INTERNAL, retryable = false,
                message = "thread append database returns no successful release proof",
                details = {code = "thread_append_release_response"}})
        end
        release_failed = release_err ~= nil
        return released, release_err
    end, primary, "Release thread append database")
    if err and (committed or release_failed) then return committed_error.new(err) end
    return err
end

-- append_events is the canonical contract seam for one or many atomic thread writes.
function M.append_events(args: any): (any?, error?)
    args = type(args) == "table" and args or {}
    local multi = type(args.writes) == "table"
    local raw_writes = (multi and args.writes or { args }) :: { any }
    if #raw_writes == 0 then
        return nil, (errors.new({ message = "writes array is required", kind = errors.INVALID }) :: error)
    end

    local raw_shape_err = event_authorization.normalize_writes(raw_writes)
    if raw_shape_err then return nil, raw_shape_err end

    -- Framework publishers carry a function-scoped security capability. The
    -- audit path is limited to one externally deduplicated system event.
    local audit = args.audit == true
    if audit then
        local spec = args.audit_thread
        local principal = type(spec) == "table" and spec.audience_principal or nil
        local first = type(raw_writes[1]) == "table" and raw_writes[1] or nil
        local events = first and type(first.events) == "table" and first.events or {}
        local event = events[1]
        if #raw_writes ~= 1 or type(event) ~= "table" or #events ~= 1
            or event.role ~= "system" or type(event.external) ~= "table"
            or event.external.external_source ~= "lifecycle" or not is_str(event.external.external_id)
            or not LIFECYCLE_EVENT_TYPES[event.type]
            or type(spec) ~= "table" or not is_str(spec.impl_id) or not is_str(spec.thread_class)
            or spec.impl_id ~= SYSTEM_LIFECYCLE_IMPL or spec.thread_class ~= "lifecycle"
            or type(principal) ~= "table" or not is_str(principal.id)
            or (principal.kind ~= "user" and principal.kind ~= "group" and principal.kind ~= "service")
            or security.can("threads.audit.publish", "kickside.core:threads") ~= true then
            return nil, (errors.new({ message = "audit publication denied", kind = errors.PERMISSION_DENIED }) :: error)
        end
    end
    local writes: { table } = table.create(#raw_writes, 0)
    for _, raw in ipairs(raw_writes) do
        local w, w_err = normalize_write(raw)
        if w_err then return nil, w_err end
        table.insert(writes, w :: table)
    end

    local shape_err = event_authorization.normalize_writes(writes)
    if shape_err then return nil, shape_err end
    local db, db_err = open_db()
    if db_err then return nil, db_err end
    local _db = db :: sql.DB

    local system_write = audit
    if not audit then
        local maintenance, type_err = event_authorization.validate_event_types(
            _db, writes, not common.is_maintenance_actor())
        if type_err then return nil, release_append_database(_db, type_err, false) end
        system_write = maintenance
    end

    if audit then
        local ensure_err = ensure_audit_thread(_db, writes[1].thread_id, args.audit_thread)
        if ensure_err then
            return nil, release_append_database(_db, ensure_err, false)
        end
    end
    local results, append_err = writer.ingest_multi(_db, writes, actor_id(), system_write)
    if not append_err then results, append_err = append_results(results, #writes) end
    append_err = release_append_database(_db, append_err, append_err == nil and results ~= nil)
    if append_err or not results then return nil, append_err end

    local appended: { table } = table.create(#(results :: { any }), 0)
    local emit_err: error? = nil
    for _, result in ipairs(results :: { any }) do
        local tid = (result :: any).thread_id :: string
        local one = {
            thread_id = tid,
            inserted = (result :: any).inserted,
            duplicates = (result :: any).duplicates,
            max_seq = (result :: any).max_seq,
            events = (result :: any).events,
        }
        table.insert(appended, one)
        if ((result :: any).inserted or 0) > 0 then
            local thread_emit_err = emit_update(tid, "events.appended", { data = one })
            if thread_emit_err and not emit_err then emit_err = thread_emit_err end
        end
    end
    if emit_err then return nil, committed_error.new(emit_err) end

    -- Single-batch callers get the batch result directly; multi callers get the list.
    if multi then return { writes = appended }, nil end
    return appended[1], nil
end

-- append_event is a single-event convenience over append_events. Callers may pass
-- { thread_id, event = {...} } or put the event fields beside thread_id.
function M.append_event(args: any): (any?, error?)
    args = type(args) == "table" and args or {}
    if not is_str(args.thread_id) then
        return nil, (errors.new({ message = "thread_id is required", kind = errors.INVALID }) :: error)
    end

    local raw = type(args.event) == "table" and args.event or args
    local event: { [string]: any } = {}
    for key, value in pairs(raw :: table) do
        if key ~= "thread_id" and key ~= "event" then
            event[key] = value
        end
    end
    return M.append_events({ thread_id = args.thread_id, events = { event }, audit = args.audit,
        audit_thread = args.audit_thread, expect = args.expect })
end

return M
