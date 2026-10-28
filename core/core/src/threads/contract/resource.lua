-- kickside.core:threads resource methods: create, converge, ensure, emit,
-- purge, find, upsert, update, delete and list. Thread writes go through the
-- threads writer/reader, which gate access through the component contract; a
-- teardown fires the drop notifications its subscribers declared. Methods return
-- (result, error?) with a typed error.

local natural_upsert = require("natural_upsert")
local thread_crud = require("threads_thread_crud")
local teardown = require("threads_teardown")
local reader = require("threads_reader")
local events = require("contract_events")
local event_authorization = require("contract_event_authorization")
local resource_crud = require("contract_resource_crud")
local common = require("contract_common")
local error_envelope = require("error_envelope")
local sql_boundary = require("sql_boundary")
local committed_error = require("committed_error")
local is_str = common.is_str
local trim = common.trim
local actor_id = common.actor_id
local actor_principal = common.actor_principal
local declared_identity = common.declared_identity
local keyed_principal = common.keyed_principal
local is_maintenance_actor = common.is_maintenance_actor
local open_db = common.open_db
local emit_update = common.emit_update

local M = {}

-- abandon_component removes a component registered for a thread create that
-- failed with cause, and returns cause, or the cleanup failure with it.
local function abandon_component(component_id: string, cause: error?): error?
    return error_envelope.cleanup(function()
        local remove_err = thread_crud.remove_thread_component(component_id)
        if remove_err then remove_err = committed_error.new(remove_err) end
        return nil, remove_err
    end, cause, "remove registered thread component")
end

local function complete_declaration(db: sql.DB, component_id: string, args: table,
    identity: { [string]: any }, maintenance: boolean): error?
    local primary = thread_crud.complete(db, component_id, args, actor_id(), identity, maintenance)
    local failed = sql_boundary.release(db, primary, "release thread declaration connection")
    if failed and not primary then return committed_error.new(failed) end
    return failed
end

-- lookup_thread is the internal probe used by ensure_thread. In addition to the
-- readable thread it reports whether a row exists even when component access
-- hides it. Keep that persistence detail private; find exposes only (thread, err).
local function lookup_thread(thread_id: string, require_read: boolean?, subject: any?): (any?, error?, boolean)
    local db, db_err = open_db()
    if db_err then return nil, db_err, false end
    local _db = db :: sql.DB

    local thread, read_err, thread_was_present = reader.get(_db, thread_id, subject)
    local release_err: error? = nil
    local lookup_err = error_envelope.cleanup(function()
        local result, err = _db:release()
        release_err = err
        return result, err
    end, read_err, "release thread lookup connection")
    if release_err then return nil, lookup_err, thread_was_present end
    if read_err then
        -- A not-found / access-denied lookup resolves to nil rather than an error
        -- so find is a soft probe; other failures surface.
        if (read_err :: error):kind() == errors.NOT_FOUND
            or ((read_err :: error):kind() == errors.PERMISSION_DENIED and require_read ~= true) then
            return nil, nil, thread_was_present
        end
        return nil, read_err, thread_was_present
    end
    return thread, nil, thread_was_present
end

-- create registers a new thread component together with its thread row (one
-- transaction, one id), completes the thread, then emits a thread-created event.
-- Returns { thread_id, thread, component_id, rollback }.
function M.create(args: any): (any?, error?)
    args = type(args) == "table" and args or {}

    local principal, principal_err = actor_principal()
    if principal_err then return nil, principal_err end
    local component_id, register_err = thread_crud.register_thread_component(args, actor_id(), principal)
    if register_err or not component_id then
        return nil, register_err
    end
    local create_args: { [string]: any } = {}
    for key, value in pairs(args) do create_args[key] = value end
    create_args.id = component_id
    create_args.component_id = component_id

    local db, db_err = open_db()
    if db_err then
        return nil, abandon_component(component_id, db_err)
    end
    local _db = db :: sql.DB

    local identity, identity_load_err = declared_identity(component_id)
    if identity_load_err or not identity then
        local failed = sql_boundary.release(_db, identity_load_err, "release thread creation connection")
        return nil, abandon_component(component_id, failed)
    end
    local result, write_err = thread_crud.attach(_db, component_id, create_args, actor_id(), identity)
    local failed = sql_boundary.release(_db, write_err, "release thread creation connection")
    if write_err or not result then
        -- The thread failed after the component was registered; tear the component back down.
        return nil, abandon_component(component_id, failed)
    end
    if failed then return nil, committed_error.new(failed) end

    local thread = result.thread
    local thread_id = tostring(thread.id)
    local emit_err = emit_update(thread_id, "kickside.threads:thread.created", { thread = thread })
    if emit_err then return nil, committed_error.new(emit_err) end

    return {
        thread_id = thread_id,
        thread = thread,
        component_id = result.component_id,
        rollback = { method = "delete", args = { thread_id = thread_id } },
    }, nil
end

-- ensure_thread attaches a thread to an ALREADY-EXISTING component (component-first:
-- the component was created by the component service, e.g. an installed automation).
-- It is M.create without the component registration. Idempotent: if the component
-- already has its thread it converges its declaration; otherwise it writes the
-- thread row under the component id and applies the declared projections/retention.
-- converge_thread makes a component's real thread state match its kind's
-- declaration: absent thread → full create (declaration applied by the writer);
-- present thread → register missing projections, cursors and
-- Jobs slots without changing surviving cursor progress or generations. Called
-- by explicit ensure on first touch and by provision.converge at boot/install.
function M.converge_thread(args: any): (any?, error?)
    args = type(args) == "table" and args or {}
    local component_id = trim(args.component_id) ~= "" and trim(args.component_id) or trim(args.thread_id)
    if component_id == "" then
        return nil, (errors.new({ message = "component_id is required to converge a thread", kind = errors.INVALID }) :: error)
    end
    if not is_str(args.impl_id) then
        return nil, (errors.new({ message = "impl_id is required to converge a thread", kind = errors.INVALID }) :: error)
    end

    local found, find_err = M.find({ thread_id = component_id })
    if find_err then return nil, find_err end
    if not found then
        return M.ensure_thread(args)
    end

    local declared_class = trim(args.thread_class)
    if declared_class ~= "" and tostring(found.thread_class) ~= declared_class then
        local updated, update_err = resource_crud.update({
            thread_id = component_id,
            thread_class = declared_class,
        })
        if update_err or not updated then return nil, update_err end
        found = (updated :: { [string]: any }).thread
    end

    local db, db_err = open_db()
    if db_err then return nil, db_err end
    local _db = db :: sql.DB
    local identity, identity_load_err = declared_identity(component_id)
    if identity_load_err or not identity then
        return nil, sql_boundary.release(_db, identity_load_err, "release thread declaration identity connection")
    end
    local decl_err = complete_declaration(_db, component_id, args, identity, is_maintenance_actor())
    if decl_err then return nil, decl_err end
    return { thread = found, thread_id = component_id, created = false, rollback = nil }, nil
end

local function ensure_thread(args: any, output_target: any?): (any?, error?)
    args = type(args) == "table" and args or {}
    local component_id = trim(args.component_id) ~= "" and trim(args.component_id) or trim(args.thread_id)
    if component_id == "" then
        return nil, (errors.new({ message = "component_id is required to attach a thread", kind = errors.INVALID }) :: error)
    end

    local found, find_err, thread_was_present = lookup_thread(component_id)
    if find_err then return nil, find_err end
    local output_authorized = type(output_target) == "table" and output_target.output == true
    if output_authorized and thread_was_present then
        local db, db_err = open_db()
        if db_err then return nil, db_err end
        local identity, identity_err = declared_identity(component_id)
        if identity_err or not identity then
            return nil, sql_boundary.release(db, identity_err, "release thread declaration identity connection")
        end
        local complete_err = complete_declaration(db, component_id,
            { impl_id = output_target.impl_id }, identity, true)
        if complete_err then return nil, complete_err end
        return { thread = found, thread_id = component_id, created = false, rollback = nil }, nil
    end

    if found then
        -- Explicit ensure is a first-touch convergence boundary. Emit passes an
        -- output target and uses the existing thread without re-registration.
        if output_target == nil and is_str(args.impl_id) then
            return M.converge_thread(args)
        end
        return { thread = found, thread_id = component_id, created = false, rollback = nil }, nil
    end

    local create_args: { [string]: any } = {}
    for key, value in pairs(args) do create_args[key] = value end
    create_args.id = component_id
    create_args.component_id = component_id

    -- A component this call registers commits with its thread row, owned as the
    -- thread would be on attach: an output emit records the stored component owner
    -- (the creator's keyed principal), any other caller its own principal.
    local use_creator_key = output_target ~= nil and not is_maintenance_actor()
    local acting_principal, principal_err
    if not use_creator_key or not output_authorized then
        acting_principal, principal_err = actor_principal()
        if principal_err then return nil, principal_err end
    end
    local creation_principal = acting_principal
    if use_creator_key then
        creation_principal, principal_err = keyed_principal(actor_id())
        if principal_err then return nil, principal_err end
    end
    local ensured_component_id, component_created, component_err = thread_crud.ensure_thread_component(
        create_args, actor_id(), is_maintenance_actor(), creation_principal)
    if component_err or not ensured_component_id then
        return nil, component_err
    end
    create_args.id = ensured_component_id
    create_args.component_id = ensured_component_id

    -- Registration may lose to another creator. Re-read that component's kind
    -- and WRITE under this frame before attaching any row or declaration.
    if output_target ~= nil then
        local actual, actual_err = event_authorization.authorize_primary_emit({
            component_id = ensured_component_id, event = output_target.event,
        })
        if actual_err then
            if component_created then return nil, abandon_component(ensured_component_id, actual_err) end
            return nil, actual_err
        end
        create_args.impl_id = actual.impl_id
        output_authorized = component_created ~= true or not is_maintenance_actor()
    end
    local output_owner: any = nil
    if output_authorized then
        local owner, owner_err = event_authorization.output_owner(ensured_component_id)
        if owner_err or not owner then
            if component_created then return nil, abandon_component(ensured_component_id, owner_err) end
            return nil, owner_err
        end
        output_owner = owner
    end

    local db, db_err = open_db()
    if db_err then
        if component_created == true then
            return nil, abandon_component(ensured_component_id, db_err)
        end
        return nil, db_err
    end
    local _db = db :: sql.DB
    local identity, identity_load_err = declared_identity(ensured_component_id :: string)
    if identity_load_err or not identity then
        local failed = sql_boundary.release(_db, identity_load_err, "release thread attachment connection")
        if component_created == true then
            return nil, abandon_component(ensured_component_id :: string, failed)
        end
        return nil, failed
    end
    local thread_owner_id = actor_id()
    local thread_owner_principal = acting_principal
    if output_authorized then
        thread_owner_id = output_owner.owner_id
        thread_owner_principal = output_owner.owner_principal
    end
    local result, write_err
    if component_created == true then
        result, write_err = thread_crud.attach(_db, ensured_component_id :: string, create_args, thread_owner_id,
            identity, is_maintenance_actor())
    else
        result, write_err = thread_crud.create(_db, create_args, thread_owner_id, identity,
            thread_owner_principal, is_maintenance_actor())
    end
    if write_err or not result then
        local diagnostic: {cleanup_error: error?} = {}
        local failed = sql_boundary.release(_db, write_err, "release thread attachment connection", diagnostic)
        if diagnostic.cleanup_error then
            if component_created == true then return nil, abandon_component(ensured_component_id :: string, failed) end
            return nil, failed
        end
        -- A CONFLICT can mean a peer created the thread after this call registered
        -- its component. Resolve that winner before cleanup: deleting a component
        -- created by this caller would also delete the peer's committed thread.
        if write_err and errors.is(write_err, errors.CONFLICT)
            and not ((write_err :: error):details() or {}).operation_error
            and not (component_created == true and thread_was_present)
        then
            if output_authorized then
                -- Recheck the actual winner under the current actor before using its primary thread.
                local _, probe_err, winner_present = lookup_thread(ensured_component_id)
                if probe_err then return nil, probe_err end
                if winner_present then
                    local _, winner_err = event_authorization.authorize_primary_emit({
                        component_id = ensured_component_id, event = output_target.event,
                    })
                    if winner_err then return nil, winner_err end
                    return { thread = nil, thread_id = ensured_component_id, created = false, rollback = nil }, nil
                end
            end
            local found, find_err = lookup_thread(ensured_component_id, true)
            if find_err then return nil, find_err end
            if found then
                return { thread = found, thread_id = ensured_component_id, created = false, rollback = nil }, nil
            end
        end
        if component_created == true then
            return nil, abandon_component(ensured_component_id :: string, write_err)
        end
        return nil, write_err
    end
    local mark_err: error? = nil
    if output_authorized then
        mark_err = events.stamp_thread_markers(_db, tostring(result.thread.id),
            tostring(result.thread.thread_class), thread_owner_id :: string)
    end
    local release_err = sql_boundary.release(_db, mark_err, "release thread attachment connection")
    if release_err then return nil, committed_error.new(release_err) end

    local thread = result.thread
    local thread_id = tostring(thread.id)
    local emit_err = emit_update(thread_id, "kickside.threads:thread.created", { thread = thread })
    if emit_err then return nil, committed_error.new(emit_err) end
    return {
        thread = thread,
        thread_id = thread_id,
        created = true,
        rollback = { method = "delete", args = { thread_id = thread_id } },
    }, nil
end

function M.ensure_thread(args: any): (any?, error?)
    return ensure_thread(args, nil)
end

-- emit is the canonical "append an event to a component's primary thread". By law a
-- component's thread IS addressed by its id (thread_id == component_id), so callers pass
-- only the component id -- never a discovered thread id. It ensures the primary thread
-- exists (idempotent; on first touch it applies the component's declared projections +
-- retention via impl_id), then appends the event.
function M.emit(args: any): (any?, error?)
    args = type(args) == "table" and args or {}
    local component_id = trim(args.component_id) ~= "" and trim(args.component_id) or trim(args.thread_id)
    if component_id == "" then
        return nil, (errors.new({ message = "component_id is required to emit", kind = errors.INVALID }) :: error)
    end
    if not is_str(args.type) then
        return nil, (errors.new({ message = "event type is required to emit", kind = errors.INVALID }) :: error)
    end

    local event = {
        type = args.type,
        role = is_str(args.role) and args.role or (is_maintenance_actor() and "system" or "user"),
        body = args.body,
        content = args.content,
        trace_context = args.trace_context,
        external = args.external,
        created_at = args.created_at,
    }
    local output_target, authorize_err = event_authorization.authorize_primary_emit({
        component_id = component_id,
        impl_id = args.impl_id,
        event = event,
    })
    if authorize_err then return nil, authorize_err end
    component_id = output_target.component_id
    output_target.event = event

    local _, ensure_err = ensure_thread({
        component_id = component_id,
        impl_id = output_target.impl_id,
        thread_class = args.thread_class,
    }, output_target)
    if ensure_err then return nil, ensure_err end

    -- created_at is validated at authorization and remains server-generated by
    -- the append writer; callers cannot set it through emit.
    event.created_at = nil
    return events.append_event({ thread_id = component_id, event = event })
end

-- purge reaps a component's primary thread + its cascade (events/projections/cursors/
-- retention/edges) WITHOUT touching the component row. The component teardown calls this
-- so deleting a component reaps its thread instead of orphaning it (the inverse of
-- delete, which is thread-driven). Idempotent: a never-emitted component has no thread.
function M.purge(args: any): (any?, error?)
    args = type(args) == "table" and args or {}
    local component_id = trim(args.component_id) ~= "" and trim(args.component_id) or trim(args.thread_id)
    if component_id == "" then
        return nil, (errors.new({ message = "component_id is required to purge", kind = errors.INVALID }) :: error)
    end
    local db, db_err = open_db()
    if db_err then return nil, db_err end
    local _db = db :: sql.DB
    local purged, purge_err = teardown.purge_thread(_db, component_id, actor_id())
    purged, purge_err = resource_crud.finish_mutation(_db, purged, purge_err, "purge thread", "thread_purge_result_missing")
    if purge_err then return nil, purge_err end
    return { purged = purged.purged, thread_id = component_id, discarded = purged.discarded }, nil
end

-- find looks up a thread by id, returning nil (not an error) when absent or the
-- actor cannot read it. Returns the thread row.
function M.find(args: any): (any?, error?)
    args = type(args) == "table" and args or {}
    if not is_str(args.thread_id) then
        return nil, (errors.new({ message = "thread_id is required", kind = errors.INVALID }) :: error)
    end
    local thread, find_err = lookup_thread(args.thread_id :: string, nil, args.subject)
    return thread, find_err
end

-- upsert is the idempotent get-or-create. The natural key is an explicit
-- thread_id, else an immutable mapping for (thread_class, external_ref); a repeat
-- call by the same key returns the same thread. Returns
-- { thread, thread_id, created, rollback }.
function M.upsert(args: any): (any?, error?)
    args = type(args) == "table" and args or {}

    local lookup_id: string? = is_str(args.thread_id) and (args.thread_id :: string) or nil
    if not lookup_id and is_str(args.thread_class) and is_str(args.external_ref) then
        return natural_upsert.upsert(args)
    end

    if lookup_id then
        local found, find_err = lookup_thread(lookup_id, true)
        if find_err then return nil, find_err end
        if found then
            return { thread = found, thread_id = lookup_id, created = false, rollback = nil }, nil
        end
    end

    local create_args: { [string]: any } = {}
    for key, value in pairs(args) do create_args[key] = value end
    create_args.external_ref = nil
    if lookup_id then
        create_args.id = lookup_id
    end

    local created, create_err
    if lookup_id then
        create_args.component_id = lookup_id
        created, create_err = M.ensure_thread(create_args)
    else
        created, create_err = M.create(create_args)
    end
    if create_err then
        -- A concurrent create of the same id loses the race; re-resolve the winner.
        if lookup_id and errors.is(create_err, errors.CONFLICT)
            and not ((create_err :: error):details() or {}).operation_error then
            local found, find_err = lookup_thread(lookup_id, true)
            if find_err then return nil, find_err end
            if found then
                return { thread = found, thread_id = lookup_id, created = false, rollback = nil }, nil
            end
        end
        return nil, create_err
    end
    local c = created :: any
    local was_created = true
    if lookup_id then
        was_created = c.created == true
    end
    return { thread = c.thread, thread_id = c.thread_id, created = was_created, rollback = c.rollback }, nil
end

-- update, delete and list operate on an already-existing thread and share no
-- state with the create/ensure/emit path above; their bodies live in
-- resource_crud.lua and are re-exported here so kickside.core.threads:contract_resource
-- stays one whole-module handle for its HTTP API callers.
for _, method_name in ipairs({ "update", "delete", "list" }) do
    M[method_name] = resource_crud[method_name]
end

return M
