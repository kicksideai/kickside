-- component_lifecycle: core implementation for canonical component lifecycle.
-- Component CRUD calls this in-process with its active SQL transaction, so the
-- lifecycle event append, parent child.lifecycle projection wiring and a
-- thread-backed component's primary thread row commit with the component mutation.

local uuid = require("uuid")
local autoinit = require("autoinit")
local lifecycle_log = require("component_lifecycle_log")
local writer = require("proj_writer")
local jobs_wake = require("jobs_wake")
local sql_boundary = require("sql_boundary")
local thread_row = require("threads_thread_row")
local component_meta = require("component_meta")
local execution_identity = require("execution_identity")

local M = {}

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function fail(message: string, kind: string?): error
    return (errors.new({ message = message, kind = kind or errors.INTERNAL }) :: error)
end

local function projection_key_for(p: table, parent_id: string): string
    local base = trim(p.projection_key)
    if base == "" then
        return "parent:" .. parent_id
    end
    return base .. ":parent:" .. parent_id
end

local function merged_worker_config(p: table, parent_id: string, parent_impl_id: string, child_id: string, child_impl_id: string): table
    local src = type(p.worker_config) == "table" and p.worker_config or nil
    local cfg: table = table.create(0, 8)
    if src then
        for key, value in pairs(src :: table) do
            cfg[key] = value
        end
    end
    cfg.parent_component_id = parent_id
    cfg.parent_impl_id = parent_impl_id
    cfg.child_component_id = child_id
    cfg.child_impl_id = child_impl_id
    return cfg
end

local function attach_lifecycle_projections(args: table, lifecycle_thread_id: string, attach_parent: boolean): error?
    local parent_id = trim(args.parent_id)
    local parent_impl_id = trim(args.parent_impl_id)
    local child_id = trim(args.component_id)
    local child_impl_id = trim(args.impl_id)
    local tx = args.tx
    local dbtype = trim(args.dbtype)
    if tx == nil or dbtype == "" then
        return fail("component lifecycle requires tx and dbtype", errors.INVALID)
    end

    local function attach(impl_id: string, on: string): error?
        for _, p in ipairs(autoinit.projections_for_impl(impl_id)) do
            if p.on == on then
                local own = on == autoinit.PROJECTION_ON.LIFECYCLE
                local key = p.projection_key
                local config = p.worker_config
                if not own then
                    key = projection_key_for(p, parent_id)
                    config = merged_worker_config(p, parent_id, parent_impl_id, child_id, child_impl_id)
                end
                local params = {
                    kind = p.kind,
                    projection_key = key,
                    cursor_key = p.cursor_key,
                    worker_ref = p.worker_ref,
                    worker_input_mode = p.input_mode,
                    worker_config = config,
                    debounce_idle_ms = p.debounce_idle_ms,
                    debounce_max_ms = p.debounce_max_ms,
                    events = p.events,
                    system_identity = true,
                    ensure = own,
                }
                local _, reg_err = writer.register_projection_tx(tx, dbtype, lifecycle_thread_id, params)
                if reg_err then return reg_err end
            end
        end
        return nil
    end

    local own_err = attach(child_impl_id, autoinit.PROJECTION_ON.LIFECYCLE)
    if own_err then return own_err end
    if attach_parent and parent_id ~= "" and parent_impl_id ~= "" then
        if parent_id == child_id then
            return fail("child.lifecycle projection cannot target the parent component itself", errors.INVALID)
        end
        return attach(parent_impl_id, autoinit.PROJECTION_ON.CHILD_LIFECYCLE)
    end
    return nil
end

local function event_payload(args: table): table
    local payload: table = table.create(0, 12)
    payload.component_id = args.component_id
    payload.impl_id = args.impl_id
    payload.parent_id = args.parent_id
    payload.parent_impl_id = args.parent_impl_id
    payload.previous_parent_id = args.previous_parent_id
    payload.previous_parent_impl_id = args.previous_parent_impl_id
    payload.position = args.position
    payload.previous_position = args.previous_position
    payload.actor_id = args.actor_id
    payload.command_types = args.command_types
    return payload
end

local function handle(kind: string, args: any): (any?, error?)
    if type(args) ~= "table" then
        return nil, fail("component lifecycle payload must be an object", errors.INVALID)
    end
    local req = args :: table
    local tx = req.tx
    local dbtype = trim(req.dbtype)
    local component_id = trim(req.component_id)
    local impl_id = trim(req.impl_id)
    if tx == nil then return nil, fail("component lifecycle tx is required", errors.INVALID) end
    if dbtype == "" then return nil, fail("component lifecycle dbtype is required", errors.INVALID) end
    if component_id == "" then return nil, fail("component_id is required", errors.INVALID) end
    if impl_id == "" then return nil, fail("impl_id is required", errors.INVALID) end
    if lifecycle_log.is_exempt(impl_id) then
        return { success = true, skipped = true }, nil
    end

    local lifecycle_thread_id, ensure_err = lifecycle_log.ensure_tx(tx, component_id, impl_id)
    if ensure_err or not lifecycle_thread_id then return nil, ensure_err end

    local attach_err = attach_lifecycle_projections(req, lifecycle_thread_id :: string, kind ~= lifecycle_log.KIND.DELETED)
    if attach_err then return nil, attach_err end

    local dedup_key: string
    if kind == lifecycle_log.KIND.CREATED then
        dedup_key = "created:" .. component_id
    elseif kind == lifecycle_log.KIND.DELETED then
        dedup_key = "deleted:" .. component_id
    else
        dedup_key = "updated:" .. component_id .. ":" .. uuid.v7()
    end

    local result, append_err = lifecycle_log.append_tx(tx, dbtype, component_id, kind, dedup_key, event_payload(req))
    if append_err then return nil, append_err end
    return { success = true, thread_id = lifecycle_thread_id, result = result }, nil
end

-- A declared primary row commits with its component, including registration
-- through the component service without an explicit thread descriptor.
function M.created(args: any): (any?, error?)
    if type(args) == "table" then
        local req = args :: table
        local row = req.thread
        local declared: any = nil
        if row == nil then
            local declaration_err: error?
            declared, declaration_err = autoinit.thread_for_impl(trim(req.impl_id))
            if declaration_err and not errors.is(declaration_err, errors.NOT_FOUND) then return nil, declaration_err end
        end
        if declared then
            local principal: any = nil
            if not execution_identity.is_maintenance_key(req.actor_id) then
                local owner, owner_err = execution_identity.principal_of_key(req.actor_id)
                if owner_err then return nil, owner_err end
                principal = owner
            end
            local prepared, prepare_err = thread_row.prepare({ parent_id = req.parent_id },
                trim(req.impl_id), req.actor_id, principal)
            if prepare_err then return nil, prepare_err end
            row = prepared
        end
        if row ~= nil then
            local thread_err = thread_row.insert(req.tx, trim(req.dbtype), trim(req.component_id), row)
            if thread_err then return nil, thread_err end
            if declared then
                local _, _, meta_err = component_meta.set_public_meta(req.tx, trim(req.component_id),
                    { type = "thread", thread_class = row.thread_class })
                if meta_err then return nil, meta_err end
            end
        end
    end
    return handle(lifecycle_log.KIND.CREATED, args)
end

function M.updated(args: any): (any?, error?)
    return handle(lifecycle_log.KIND.UPDATED, args)
end

function M.deleted(args: any): (any?, error?)
    return handle(lifecycle_log.KIND.DELETED, args)
end

-- Lifecycle appends and projection attachment publish durable wake demand in
-- the component transaction; the committed caller notifies the job worker pool.
function M.committed(): (any?, error?)
    local _, nudge_err = jobs_wake.nudge_workers()
    if nudge_err then return nil, nudge_err end
    return { success = true }, nil
end

local function audit_response_failure(field: string): error
    return errors.new({kind = errors.INTERNAL, message = "identity audit publication returns no valid proof",
        retryable = false, details = {code = "identity_audit_response", field = field}})
end

local function publication_count(value: any): number?
    if value == nil then return 0 end
    local count = tonumber(value)
    if count == nil or count < 0 or count ~= math.floor(count) then return nil end
    return count
end

local function finish_audit(db: sql.DB, result: any, primary: error?): (any?, error?)
    local failed = sql_boundary.release(db, primary, "release identity audit publication connection")
    if failed then return nil, failed end
    return result, nil
end

-- Audit publication is outside the component transaction. The stable key
-- makes a crash after append but before the component acknowledgment a replay.
function M.publish_audit(args: any): (any?, error?)
    local input = type(args) == "table" and args or {}
    local id, impl = trim(input.component_id), trim(input.impl_id)
    local generation = input.identity_generation
    if id == "" or impl == "" or type(generation) ~= "number"
        or generation < 0 or generation >= 9223372036854775808 or generation ~= math.floor(generation)
        or type(input.record_json) ~= "string" or input.record_json == "" then
        return nil, fail("identity audit publication requires owner, impl, generation and record", errors.INVALID)
    end
    local sql = require("sql")
    local env = require("threads_env")
    local db, open_err = sql.get(env.db_id())
    if open_err then return nil, (errors.wrap(open_err, "identity audit publication database unavailable") :: error) end
    if (type(db) ~= "table" and type(db) ~= "userdata") or type(db.release) ~= "function" then
        return nil, audit_response_failure("sql.get")
    end
    local thread_id, ensure_err = lifecycle_log.ensure(db, id, impl)
    if ensure_err then return finish_audit(db, nil, ensure_err) end
    if trim(thread_id) == "" then return finish_audit(db, nil, audit_response_failure("lifecycle.ensure")) end
    local result, append_err = lifecycle_log.append(db, id, lifecycle_log.KIND.UPDATED,
        "identity_audit:" .. id .. ":" .. tostring(generation), {
            component_id = id, impl_id = impl, identity_generation = generation,
            identity_audit = input.record_json,
        })
    if append_err then return finish_audit(db, nil, append_err) end
    if type(result) ~= "table" then return finish_audit(db, nil, audit_response_failure("lifecycle.append")) end
    local inserted, duplicates = publication_count(result.inserted), publication_count(result.duplicates)
    if inserted == nil or duplicates == nil or inserted + duplicates ~= 1 then
        return finish_audit(db, nil, audit_response_failure("lifecycle.append"))
    end
    return finish_audit(db, result, nil)
end

return M
