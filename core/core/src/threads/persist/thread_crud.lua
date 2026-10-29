-- Thread create and update of the threads slice. A thread is SECONDARY to its
-- component and shares its id. A new thread registers its component together with
-- its kickside_thread row in one transaction (register_thread_component); a
-- component that already exists gets its row attached afterwards (create). Either
-- way attach completes the thread: retention policy, the kind's declared
-- projections under the declared execution identity, and the public thread
-- markers. Failed fresh attachment purges the new thread; completing an existing
-- primary row preserves the registered source and its consumers on failure.
-- update patches state / class / attrs after a WRITE check.

local sql = require("sql")
local uuid = require("uuid")
local clock = require("clock")
local consts = require("threads_consts")
local normalize = require("threads_normalize")
local component = require("threads_component")
local masks = require("core_types")
local autoinit = require("autoinit")
local proj_writer = require("proj_writer")
local retention_repo = require("retention_repo")
local writer = require("threads_writer")
local teardown = require("threads_teardown")
local thread_row = require("threads_thread_row")
local natural_key = require("natural_key")
local error_envelope = require("error_envelope")
local committed_error = require("committed_error")
local sql_boundary = require("sql_boundary")

local M = {}

-- A pooled connection.
type DB = sql.DB

local now_string = clock.now
local trim = normalize.trim

local VALID_THREAD_STATES = {
    [masks.THREAD_STATE.OPEN] = true,
    [masks.THREAD_STATE.CLOSED] = true,
    [masks.THREAD_STATE.ARCHIVED] = true,
    [masks.THREAD_STATE.ERROR] = true,
}

local declared_class = thread_row.declared_class
local class_error = thread_row.class_error
local prepare_row = thread_row.prepare

local function has_thread_projections(declaration_impl_id: string?): boolean
    if not declaration_impl_id or declaration_impl_id == "" then
        return false
    end
    for _, p in ipairs(autoinit.projections_for_impl(declaration_impl_id)) do
        if p.on == nil or p.on == "" or p.on == autoinit.PROJECTION_ON.THREAD then
            return true
        end
    end
    return false
end

local function declaration_response(field: string): error
    return errors.new({kind = errors.INTERNAL, retryable = false,
        message = "declared projection returns no valid " .. field .. " proof",
        details = {code = "thread_declaration_response", field = field}})
end

-- identity: { row?, system?, error? } from the contract's declared_identity.
local function register_declared_projection(db: DB, thread_id: string, p: table, identity: { [string]: any }): error?
    local params = {
        kind = p.kind,
        worker_ref = p.worker_ref,
        worker_input_mode = p.input_mode,
        cursor_key = p.cursor_key,
        projection_key = p.projection_key,
        debounce_idle_ms = p.debounce_idle_ms,
        debounce_max_ms = p.debounce_max_ms,
        worker_config = p.worker_config,
        events = p.events,
        execution_identity_row = identity.row,
        system_identity = identity.system == true,
        ensure = true,
    }
    -- Validate existing cursor identities, then refresh through the registration
    -- transaction that serializes on the thread row.
    local rows, read_err = db:query([[SELECT c.id FROM kickside_projection p
        JOIN kickside_projection_cursor c ON c.projection_id=p.id AND c.cursor_key=$4
        JOIN kickside_job j ON j.id=c.job_id
        WHERE p.thread_id=$1 AND p.kind=$2 AND p.projection_key=$3]],
        { thread_id, p.kind, trim(p.projection_key) ~= "" and p.projection_key or "default",
            trim(p.cursor_key) ~= "" and p.cursor_key or "default" })
    rows, read_err = sql_boundary.rows(rows, read_err, "read declared projection", "cursor rows", declaration_response)
    if read_err then return read_err end
    for _, row in ipairs(rows :: table[]) do
        if type(row.id) ~= "string" or row.id == "" then return declaration_response("cursor id") end
    end
    local projection, proj_err = proj_writer.register_projection(db, thread_id, params)
    if proj_err then return errors.wrap(proj_err, "register declared projection") end
    if type(projection) ~= "table" then return declaration_response("registration") end
    return nil
end

-- Declared projections run under an explicit identity: the v2 row, or the
-- framework system identity. Anything else refuses before a projection exists.
local function declared_identity_error(identity: { [string]: any }): error?
    if type(identity.row) == "table" or identity.system == true then return nil end
    if identity.error ~= nil then return errors.wrap(identity.error, "declared thread projection execution identity") end
    return errors.new({
        message = "declared thread projections require an execution identity: missing execution identity",
        kind = errors.INVALID, retryable = false,
        details = {error_kind = "declaration", code = "thread_declaration_identity_missing"},
    })
end

function M.apply_thread_declaration(db: DB, thread_id: string, declaration_impl_id: string?, identity: { [string]: any }): error?
    local impl_id = trim(declaration_impl_id)
    if impl_id == "" then return nil end
    if has_thread_projections(impl_id) then
        local identity_err = declared_identity_error(identity)
        if identity_err then return identity_err end
    end
    for _, p in ipairs(autoinit.projections_for_impl(impl_id)) do
        if p.on == nil or p.on == "" or p.on == autoinit.PROJECTION_ON.THREAD then
            local proj_err = register_declared_projection(db, thread_id, p :: table, identity)
            if proj_err then return proj_err end
        end
    end
    return nil
end

-- A check-constraint or FK failure on an update is a caller error (INVALID); any
-- other db failure is INTERNAL.
local function update_error_kind(err: any): string
    local text = string.lower(tostring(err or ""))
    if string.find(text, "check constraint", 1, true) or string.find(text, "foreign key", 1, true) then
        return errors.INVALID
    end
    return errors.INTERNAL
end

-- The descriptor create and attach return.
type CreateResult = {
    thread: table,
    component_id: string,
}

-- register_thread_component creates the COMPONENT of a new thread together with its
-- thread row: the component service registers the component and the component
-- lifecycle writes the row in the same transaction, so no reader observes the
-- component without its thread. component.register owner-grants and writes the
-- thread meta; this slice never touches the access/meta tables. A typed component
-- thread passes impl_id so the component row is the declared kind; plain ad-hoc
-- threads fall back to the thread shell. Returns the component_id (== the thread id).
-- The caller completes the thread with attach.
function M.register_thread_component(params: table, actor_id: string?, owner_principal: any?, key: table?, origin: string?): (string?, error?)
    params = type(params) == "table" and params or {}
    local thread_id = trim(params.id)
    if thread_id == "" then
        thread_id = uuid.v7()
    elseif not uuid.validate(thread_id) then
        -- Thread ids are UUID-typed columns on postgres; enforce the same
        -- contract on sqlite so both engines accept identical input.
        return nil, (errors.new({ message = "thread id must be a UUID, got: " .. thread_id, kind = errors.INVALID }) :: error)
    end
    local impl_id = trim(params.impl_id)
    if impl_id == "" then
        impl_id = consts.THREAD_IMPL_ID
    end
    local row, row_err = prepare_row(params, impl_id, actor_id, owner_principal)
    if row_err or not row then
        return nil, row_err
    end
    row.natural_key, row.key_origin = key, origin
    local meta: { [string]: any } = { type = "thread", thread_class = row.thread_class }
    if type(params.title) == "string" and params.title ~= "" then
        meta.title = params.title
    end
    if type(params.icon) == "string" and params.icon ~= "" then
        meta.icon = params.icon
    end
    local parent_id: string? = normalize.trim(params.parent_id) ~= "" and (params.parent_id :: string) or nil
    local additional_access: any[]? = type(params.additional_access) == "table" and (params.additional_access :: any[]) or nil
    local component_id, register_err = component.register(meta, parent_id, additional_access, thread_id, impl_id, row)
    if register_err or not component_id then
        return nil, register_err
    end
    return component_id, nil
end

-- ensure_thread_component is the idempotent component half for first-touch event
-- writes. A component it registers carries its thread row (component_created =
-- true; the caller completes it with attach). If the component already exists,
-- verify the caller can WRITE it before attaching/repairing its primary thread.
function M.ensure_thread_component(params: table, actor_id: string?, maintenance: boolean?,
    owner_principal: any?): (string?, boolean?, error?)
    params = type(params) == "table" and params or {}
    local component_id = trim(params.component_id) ~= "" and trim(params.component_id) or trim(params.id)
    if component_id == "" then
        return nil, false, (errors.new({ message = "component_id is required", kind = errors.INVALID }) :: error)
    end

    local registered, register_err = M.register_thread_component(params, actor_id, owner_principal)
    if not register_err and registered then
        return registered, true, nil
    end
    if not register_err or (register_err :: error):kind() ~= errors.CONFLICT then
        return nil, false, register_err
    end
    -- A thread row already under this id without its component is a partial
    -- thread: surface the conflict, never treat it as an existing component.
    local details = (register_err :: any):details()
    if type(details) == "table" and details.conflict == thread_row.THREAD_CONFLICT then
        return nil, false, register_err
    end

    -- An existing framework component retains its trusted attachment path.
    if maintenance == true then return component_id, false, nil end

    local allowed, access_err = component.has_access(component_id, (masks.ACCESS.WRITE :: integer))
    if access_err then
        return nil, false, access_err
    end
    if not allowed then
        return nil, false, (errors.new({ message = "component write access required", kind = errors.PERMISSION_DENIED }) :: error)
    end
    return component_id, false, nil
end

-- ensure_thread_type patches an already-existing component-first component with the
-- public thread markers (meta.type=thread + meta.thread_class), the same markers
-- register_thread_component sets for a thread-first component, so it surfaces in the
-- thread list/picker. Idempotent: a no-op once the component already advertises them.
function M.ensure_thread_type(component_id: string, thread_class: string?): (boolean, error?)
    return component.ensure_thread_type(component_id, thread_class)
end

local function mark_thread_type(thread_id: string, thread_class: string, params: table, maintenance: boolean?): error?
    if params.trusted_audit == true or maintenance == true then return nil end
    local _, mark_err = M.ensure_thread_type(thread_id, thread_class)
    return mark_err
end

-- remove_thread_component tears the registered component (and with it its thread)
-- back down when the orchestrator's subsequent thread step fails.
function M.remove_thread_component(component_id: string?): error?
    local id = trim(component_id)
    if id == "" then return nil end
    local _, err = component.remove(id)
    return err
end

local function transaction_response(operation: string, code: string, field: string): error
    return errors.new({kind = errors.INTERNAL, retryable = false,
        message = operation .. " transaction returns no successful " .. field .. " proof",
        details = {code = code, field = field}})
end

local function create_transaction_response(field: string): error
    return transaction_response("thread create", "thread_create_transaction_response", field)
end

local function update_transaction_response(field: string): error
    return transaction_response("thread update", "thread_update_transaction_response", field)
end

local function begin_transaction(db: DB, operation: string, code: string): (sql.Transaction?, error?)
    local tx, err = db:begin()
    tx, err = error_envelope.binding(tx, err, "commit", operation, code)
    if not err then _, err = error_envelope.binding(tx, nil, "rollback", operation, code) end
    if err then return nil, err end
    return tx :: sql.Transaction, nil
end

local function rollback_transaction(tx: sql.Transaction, primary: error, operation: string,
    response_error: (string) -> error): error
    return sql_boundary.rollback(tx, primary, operation, response_error, "rollback") :: error
end

-- create attaches a thread row to a component that ALREADY exists (component-first:
-- the component service created it, e.g. an installed automation or a KB, or another
-- creator won its registration) and completes it with attach. The thread is
-- SECONDARY -- it attaches under the component's id (thread.id == component.id) and
-- never registers/owns a component.
function M.create(db: DB, params: table, actor_id: string?, identity: { [string]: any }, owner_principal: any?,
    maintenance: boolean?): (CreateResult?, error?)
    params = type(params) == "table" and params or {}

    local component_id = normalize.trim(params.component_id) ~= "" and (params.component_id :: string)
        or normalize.trim(params.id)
    if component_id == "" then
        return nil, (errors.new({ message = "component_id is required: a thread is created for an existing component", kind = errors.INVALID }) :: error)
    end
    local impl_id = trim(params.impl_id)
    if impl_id == "" and params.trusted_audit ~= true then
        local stored_impl, impl_err = component.impl_id(component_id)
        if impl_err then return nil, impl_err end
        impl_id = trim(stored_impl)
    end
    local row, row_err = prepare_row(params, impl_id, actor_id, owner_principal)
    if row_err or not row then return nil, row_err end

    local thread_id = component_id
    if params.trusted_audit ~= true and maintenance ~= true then
        local allowed, access_err = component.has_access(component_id, (masks.ACCESS.WRITE :: integer))
        if access_err then return nil, access_err end
        if not allowed then
            return nil, (errors.new({ message = "component write access required", kind = errors.PERMISSION_DENIED }) :: error)
        end
    end
    local declaration_impl_id: string? = normalize.trim(params.impl_id) ~= "" and (params.impl_id :: string) or nil
    if has_thread_projections(declaration_impl_id) then
        local identity_err = declared_identity_error(identity)
        if identity_err then return nil, identity_err end
    end

    local dbtype, dbtype_err = writer.dbtype_of(db)
    if dbtype_err then
        return nil, dbtype_err
    end

    local tx, tx_err = begin_transaction(db, "begin thread create", "thread_create_transaction_response")
    if tx_err then return nil, tx_err end
    local transaction = tx :: sql.Transaction
    local insert_err = thread_row.insert(transaction, dbtype :: string, thread_id, row)
    if insert_err then
        return nil, rollback_transaction(transaction, insert_err, "rollback thread create", create_transaction_response)
    end
    local committed, commit_err = transaction:commit()
    if not commit_err and committed ~= true then commit_err = create_transaction_response("commit") end
    if commit_err then
        return nil, errors.wrap(committed_error.new(commit_err), "failed to commit thread create")
    end

    return M.attach(db, thread_id, params, actor_id, identity, maintenance)
end

local function complete_thread(db: DB, thread_id: string, params: table, actor_id: string?, identity: { [string]: any },
    maintenance: boolean?): (CreateResult?, error?)
    params = type(params) == "table" and params or {}
    local declaration_impl_id: string? = normalize.trim(params.impl_id) ~= "" and (params.impl_id :: string) or nil

    local retention_input: { [string]: any } = {}
    if declaration_impl_id then
        local declared = autoinit.retention_for_impl(declaration_impl_id :: string)
        if declared and type(declared.event_days) == "number" then
            retention_input.event_hot_retention_days = declared.event_days
        end
    end
    local _, retention_err = retention_repo.upsert(db, thread_id, retention_input)
    if retention_err then
        return nil, retention_err
    end

    local rows, rows_err = db:query("SELECT * FROM kickside_thread WHERE id = $1", { thread_id })
    if rows_err then
        return nil, errors.wrap(rows_err, "read created thread")
    end
    rows, rows_err = error_envelope.binding(rows, nil, nil, "read created thread rows", "created_thread_result_missing")
    if rows_err then return nil, rows_err end
    local thread = rows[1]
    if thread == nil then
        return nil, errors.new({message = "created thread not found", kind = errors.NOT_FOUND,
            retryable = false, details = {code = "created_thread_not_found"}})
    end
    thread, rows_err = error_envelope.binding(thread, nil, nil, "read created thread row", "created_thread_row_invalid")
    if rows_err then return nil, rows_err end

    local decl_err = M.apply_thread_declaration(db, thread_id, declaration_impl_id, identity)
    if decl_err then
        return nil, decl_err
    end

    -- Stamp the public thread markers (meta.type=thread + thread_class): the moment
    -- the thread is complete, its component advertises to the thread list/picker.
    -- Idempotent (a no-op once the marker is set, e.g. a thread-first component
    -- register already set it).
    local mark_err = mark_thread_type(thread_id, tostring(thread.thread_class), params, maintenance)
    if mark_err then return nil, mark_err end

    return { thread = thread, component_id = thread_id }, nil
end

function M.finish(db: DB, thread_id: string, params: table, actor_id: string?, identity: { [string]: any },
    maintenance: boolean?): (CreateResult?, error?)
    return complete_thread(db,thread_id,params,actor_id,identity,maintenance)
end

-- A component-first primary row can already carry consumer pins. Completing
-- that row propagates failures without tearing down the source or its consumers.
function M.complete(db: DB, thread_id: string, params: table, actor_id: string?, identity: { [string]: any },
    maintenance: boolean?): error?
    local policy, policy_err = retention_repo.find_by_thread(db, thread_id)
    if policy_err then return policy_err end
    if not policy then
        local _, complete_err = complete_thread(db, thread_id, params, actor_id, identity, maintenance)
        return complete_err
    end
    local declaration_err = M.apply_thread_declaration(db, thread_id, params.impl_id, identity)
    if declaration_err then return declaration_err end
    -- Output-authorized emits and audit writes intentionally skip public markers.
    -- Keep their retained-thread path free of the marker lookup as well.
    if params.trusted_audit == true or maintenance == true then return nil end

    local rows, read_err = db:query("SELECT thread_class FROM kickside_thread WHERE id = $1", { thread_id })
    if read_err then return errors.wrap(read_err, "read completed thread") end
    rows, read_err = error_envelope.binding(rows, nil, nil, "read completed thread rows", "completed_thread_result_missing")
    if read_err then return read_err end
    local thread = rows[1]
    if thread == nil then
        return errors.new({message = "completed thread not found", kind = errors.NOT_FOUND,
            retryable = false, details = {code = "completed_thread_not_found"}})
    end
    thread, read_err = error_envelope.binding(thread, nil, nil, "read completed thread row", "completed_thread_row_invalid")
    if read_err then return read_err end
    return mark_thread_type(thread_id, tostring(thread.thread_class), params, maintenance)
end

-- attach completes the row of a new thread. Failure purges that row before the
-- caller removes the component it registers for the failed creation.
function M.attach(db: DB, thread_id: string, params: table, actor_id: string?, identity: { [string]: any },
    maintenance: boolean?): (CreateResult?, error?)
    local result, complete_err = complete_thread(db, thread_id, params, actor_id, identity, maintenance)
    if not complete_err then return result, nil end
    local err = error_envelope.cleanup(function()
        local purged, purge_err = teardown.purge_thread(db, thread_id, trim(actor_id))
        purged, purge_err = error_envelope.binding(purged, purge_err, nil, "purge incomplete thread", "attachment_purge_result_missing")
        if purge_err then purge_err = committed_error.new(purge_err) end
        return purged, purge_err
    end, complete_err, "purge incomplete thread")
    return nil, err
end

-- update patches a thread's state / thread_class / attrs after a WRITE access
-- check. attrs is taken as an already-encoded JSON string (attrs_json) so the
-- caller controls serialization. Only supplied fields are touched.
function M.update(db: DB, thread_id: string, params: table, actor_id: string?): (table?, error?)
    params = type(params) == "table" and params or {}
    local id = trim(thread_id)
    if id == "" then
        return nil, (errors.new({ message = "thread_id is required", kind = errors.INVALID }) :: error)
    end

    local has_state = params.has_state == true
    local has_thread_class = params.has_thread_class == true
    local has_attrs = params.has_attrs == true
    if not has_state and not has_thread_class and not has_attrs then
        return nil, (errors.new({ message = "nothing to update", kind = errors.INVALID }) :: error)
    end
    if has_state and not VALID_THREAD_STATES[params.state] then
        return nil, (errors.new({ message = "state must be one of: open, closed, archived, error", kind = errors.INVALID }) :: error)
    end

    local _, gate_err = writer.gate_write(db, id, (masks.ACCESS.WRITE :: integer))
    if gate_err then
        return nil, gate_err
    end

    if has_thread_class then
        local impl_id, impl_err = component.impl_id(id)
        if impl_err then return nil, impl_err end
        local declared, declaration_err = declared_class(trim(impl_id))
        if declaration_err then return nil, declaration_err end
        local mismatch = class_error(trim(params.thread_class), declared)
        if mismatch then return nil, mismatch end
    end

    local dbtype, dbtype_err = writer.dbtype_of(db)
    if dbtype_err then return nil, dbtype_err end
    local now = now_string(dbtype :: string)

    local update = sql.builder.update("kickside_thread"):set("updated_at", now)
    if has_state then update = update:set("state", params.state) end
    if has_thread_class then update = update:set("thread_class", params.thread_class) end
    if has_attrs then update = update:set("attrs", params.attrs_json) end

    local tx, tx_err = begin_transaction(db, "begin thread update", "thread_update_transaction_response")
    if tx_err then return nil, tx_err end
    local transaction = tx :: sql.Transaction

    if has_thread_class or has_attrs then
        local lock_err = natural_key.lock(transaction,dbtype,id)
        local capture_err = lock_err
        if not capture_err then
            local _, err = natural_key.capture(transaction,dbtype,id)
            capture_err = err
        end
        if capture_err then
            return nil, rollback_transaction(transaction, capture_err, "rollback thread update", update_transaction_response)
        end
    end
    local _, update_err = update:where(sql.builder.eq({ id = id })):run_with(transaction):exec()
    if update_err then
        local primary = (errors.new({ message = "failed to update thread: " .. tostring(update_err), kind = update_error_kind(update_err) }) :: error)
        return nil, rollback_transaction(transaction, primary, "rollback thread update", update_transaction_response)
    end

    local committed, commit_err = transaction:commit()
    if not commit_err and committed ~= true then commit_err = update_transaction_response("commit") end
    if commit_err then
        return nil, errors.wrap(committed_error.new(commit_err), "failed to commit thread update")
    end

    local rows, rows_err = db:query("SELECT * FROM kickside_thread WHERE id = $1", { id })
    rows, rows_err = sql_boundary.bounded_rows(rows, rows_err, "failed to read updated thread", "read rows", 0, 1, update_transaction_response)
    if rows_err then return nil, committed_error.new(rows_err) end
    if not rows or #rows == 0 then
        return nil, errors.new({message = "thread not found", kind = errors.NOT_FOUND, retryable = false,
            details = {code = "thread_update_not_found"}})
    end
    return rows[1], nil
end

return M
