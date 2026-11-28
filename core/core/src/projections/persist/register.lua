-- Write side of the projection engine. Registers/removes a projection and its
-- catch-up cursor, advances a cursor as catch-up makes progress, and applies the
-- pause/resume lifecycle transitions. Every entry point takes the caller's db or
-- tx handle and owns only the kickside_projection / kickside_projection_cursor
-- rows — scheduling, access checks, and thread notifications belong to the
-- slices that compose this engine. Timestamps are computed in Lua via
-- time.now() in the dialect's textual shape and bound as params, so the SQL
-- stays portable. Errors are returned as values.

local trim = require("text_trim").trim
local sql = require("sql")
local event_access = require("event_access")
local json = require("json")
local registry = require("registry")
local uuid = require("uuid")
local clock = require("clock")
local types = require("types")
local core_types = require("core_types")
local execution_identity = require("execution_identity")
local job_lifecycle = require("job_lifecycle")
local jobs_wake = require("jobs_wake")
local retention_notifier = require("retention_notifier")
local retention_pin = require("retention_pin")
local persisted_json = require("persisted_json")
local sql_boundary = require("sql_boundary")
local committed_error = require("committed_error")
local core_db = require("core_db")
local jobs_config = require("jobs_config")
local autoinit = require("autoinit")

local writer = {}

-- A pooled connection or open transaction.
type Executor = sql.DB | sql.Transaction

-- The descriptor register_projection returns once the projection + cursor are
-- committed.
type RegisterResult = {
    projection_id: string,
    cursor_id: string,
    kind: string,
    projection_key: string,
    cursor_key: string,
    worker_ref: string,
    worker_input_mode: string,
    generation: number,
    job_id: string,
    created: boolean,
    transitioned: boolean?,
    deferred: boolean?,
}

local function response_error(field: string, message: string?, code: string?): error
    return errors.new({kind = errors.INTERNAL, retryable = false,
        message = message or ("projection registration returns no valid " .. field .. " proof"),
        details = {code = code or "projection_registration_response", field = field}})
end

function writer.enqueue_slot(tx: sql.Transaction, dbtype: string, thread_id: string,
    cursor_id: string, parked: boolean, max_attempts: integer?): (string?, error?)
    local job_id, job_err = job_lifecycle.enqueue_job(tx, dbtype, {
        owner_locator = { kind = "thread", id = thread_id },
        job_type = "kickside.core.projections:advance",
        worker_ref = "kickside.core.projections:advance",
        payload = { cursor_id = cursor_id },
        job_identity = { namespace = "projection", scope = cursor_id, key = "slot" },
        slot = true, wake_key = "thread:" .. thread_id, parked = parked, max_attempts = max_attempts,
    })
    if job_err then return nil, job_err end
    if type(job_id) ~= "string" or job_id == "" then
        return nil, response_error("job_id", "projection slot enqueue returns no job id")
    end
    return job_id, nil
end

local function projection_insert_response(field: string): error
    return response_error(field, "projection insert returns no affected-row proof", "projection_insert_result_invalid")
end

local function declaration_key(value: any): string
    local key = trim(value)
    return key ~= "" and key or types.KEY_DEFAULT
end

writer.declaration_key = declaration_key

local now_string = clock.now

-- The projection body contains two different kinds of state: the declaration
-- that says how to run the projection, and the fold state produced by that
-- worker. Keep the declaration vocabulary in one place so normal
-- re-registration and destructive-storage rebuilds cannot drift apart.
local DECLARATION_BODY_KEYS = {"meta", "worker_config", "events", "drop_notify"}

-- Select only the declaration JSON from each addressed row. Keep nested nulls
-- and the shapes of JSON arrays and objects in the selected fields.
function writer.declaration_fields_sql(dialect: string, body_column: string): string
    local postgres = dialect == sql.type.POSTGRES
    local fields = {}
    for _, key in ipairs(DECLARATION_BODY_KEYS) do
        fields[#fields + 1] = "'" .. key .. "'," .. body_column .. " -> '" .. key .. "'"
    end
    local build = (postgres and "jsonb_build_object(" or "json_object(") .. table.concat(fields, ",") .. ")"
    if postgres then
        return "CASE jsonb_typeof(" .. body_column .. ") WHEN 'object' THEN " .. build
            .. " WHEN 'array' THEN '{}'::jsonb END"
    end
    return "CASE WHEN json_valid(" .. body_column .. ") THEN CASE json_type(" .. body_column
        .. ") WHEN 'object' THEN " .. build .. " WHEN 'array' THEN '{}' END END"
end

local function apply_declaration_fields(target: table, declaration: table): table
    for _, key in ipairs(DECLARATION_BODY_KEYS) do
        target[key] = declaration[key]
    end
    return target
end

function writer.declaration_fields(body: table): table
    return apply_declaration_fields({}, body)
end

-- Structural equality over the declaration fields. Used to detect that a module
-- upgrade changed what a stored projection declares, which is the one condition
-- that retires a recorded config fault.
local function same_declaration(a: any, b: any): boolean
    if type(a) ~= type(b) then return false end
    if type(a) ~= "table" then return a == b end
    for key, value in pairs(a) do
        if not same_declaration(value, b[key]) then return false end
    end
    for key in pairs(b) do
        if a[key] == nil then return false end
    end
    return true
end

function writer.declaration_body(params: table): (table?, error?)
    local worker_ref = trim(params.worker_ref)
    if worker_ref == "" then
        return nil, (errors.new({ message = "worker_ref is required", kind = errors.INVALID }) :: error)
    end
    -- Runtime is part of worker_ref's canonical wire format, never a second
    -- caller-controlled routing decision.
    local worker_runtime
    if string.sub(worker_ref, 1, #types.WORKER_SCHEME.PROC) == types.WORKER_SCHEME.PROC then
        worker_runtime = types.WORKER_RUNTIME.PROC
    elseif string.sub(worker_ref, 1, #types.WORKER_SCHEME.FUNC) == types.WORKER_SCHEME.FUNC then
        worker_runtime = types.WORKER_RUNTIME.FUNC
    else
        return nil, (errors.new({ message = "worker_ref must use func:// or proc:// scheme", kind = errors.INVALID }) :: error)
    end
    local declared_runtime = trim(params.worker_runtime)
    if declared_runtime ~= "" and declared_runtime ~= worker_runtime then
        return nil, (errors.new({
            message = "worker_runtime conflicts with worker_ref scheme: " .. declared_runtime .. " vs " .. worker_runtime,
            kind = errors.INVALID,
        }) :: error)
    end
    local worker_input_mode = trim(params.worker_input_mode)
    if worker_input_mode == "" then
        worker_input_mode = types.WORKER_INPUT_MODE_DEFAULT
    end
    if worker_input_mode ~= types.WORKER_INPUT_MODE.PREFETCH_EVENTS and worker_input_mode ~= types.WORKER_INPUT_MODE.CURSOR_ONLY then
        return nil, (errors.new({ message = "worker_input_mode must be one of: prefetch_events, cursor_only", kind = errors.INVALID }) :: error)
    end

    local body = {
        meta = {
            worker_ref = worker_ref,
            worker_runtime = worker_runtime,
            worker_input_mode = worker_input_mode,
        },
    }
    if type(params.worker_config) == "table" then
        body.worker_config = params.worker_config
    end
    if type(params.events) == "table" then
        body.events = params.events
    end
    -- drop_notify is a subscriber-declared teardown hook: { thread_id, type, body }.
    -- When the thread this projection lives on is torn down, the threads slice appends
    -- the declared typed event to thread_id so the subscriber surfaces the loss of its
    -- source through its own read model. A declaration field, like worker_config.
    if type(params.drop_notify) == "table" then
        body.drop_notify = params.drop_notify
    end
    return body, nil
end

function writer.declaration_matches(stored: table, declared: table): boolean
    return same_declaration(writer.declaration_fields(stored), writer.declaration_fields(declared))
end

local REGISTERED_CHECKPOINT_PRINCIPAL = "registered_checkpoint_principal"

-- Only registration can record that it captured this caller. A worker's
-- returned fold does not alter the stored execution identity.
function writer.is_registered_checkpoint_principal(raw: any): boolean
    local identity = type(raw) == "string" and json.decode(raw) or raw
    return type(identity) == "table" and identity[REGISTERED_CHECKPOINT_PRINCIPAL] == true
end

local function mark_registered_checkpoint_principal(raw: string): (string?, error?)
    local identity, err = json.decode(raw)
    if err then return nil, err end
    identity[REGISTERED_CHECKPOINT_PRINCIPAL] = true
    return json.encode(identity)
end

-- The installed destination worker can declare compatibility with one predecessor.
-- Only the worker reference and its derived runtime differ in the predecessor
-- declaration. Cursor keys, input, filters, config and debounce must all match.
function writer.transition_predecessor(body: table): (table?, string?, error?, boolean?)
    local meta = body.meta
    if meta.worker_runtime ~= types.WORKER_RUNTIME.PROC
        or meta.worker_input_mode ~= types.WORKER_INPUT_MODE.PREFETCH_EVENTS then
        return nil, nil, nil
    end
    local entry, read_err = registry.get(string.sub(meta.worker_ref, #types.WORKER_SCHEME.PROC + 1))
    if read_err and not errors.is(read_err, errors.NOT_FOUND) then return nil, nil, read_err end
    local destination = entry and entry.meta
    if type(destination) ~= "table" or destination.transition_from == nil then return nil, nil, nil end
    local transition = destination.transition_from
    local filtered = destination.filtered_checkpoint == true
    local db_config = type(transition) == "table" and transition[filtered and "target_db_config" or "shared_db_config"]
    if entry.kind ~= "process.lua" or destination.type ~= "projection.worker"
        or destination.private ~= true or destination.checkpointed_apply ~= true
        or type(transition) ~= "table" or type(transition.worker_ref) ~= "string"
        or type(db_config) ~= "string" or trim(db_config) == ""
        or (filtered and transition.shared_db_config ~= nil) or (not filtered and transition.target_db_config ~= nil)
        or trim(transition.worker_ref) == meta.worker_ref then
        return nil, nil, errors.new({kind = errors.INVALID, retryable = false,
            message = "installed projection worker has an invalid transition_from declaration"})
    end
    local previous, previous_err = writer.declaration_body({worker_ref = transition.worker_ref,
        worker_input_mode = meta.worker_input_mode, worker_config = body.worker_config,
        events = body.events, drop_notify = body.drop_notify})
    return previous, db_config, previous_err, filtered
end

local function bounded(value: any, name: string, min_value: integer,
    max_value: integer, fallback: integer): (integer?, error?)
    if value == nil then return fallback, nil end
    if type(value) ~= "number" or value ~= math.floor(value)
        or value < min_value or value > max_value then
        return nil, (errors.new({ message = name .. " is outside its integer range", kind = errors.INVALID }) :: error)
    end
    return value :: integer, nil
end

function writer.debounce(params: table): (number?, number?, error?)
    local idle, idle_err = bounded(params.debounce_idle_ms, "debounce_idle_ms", 0, types.DEBOUNCE_MAX_MS, 0)
    if idle_err then return nil, nil, idle_err end
    local maximum, max_err = bounded(params.debounce_max_ms, "debounce_max_ms", 0, types.DEBOUNCE_MAX_MS, 0)
    if max_err then return nil, nil, max_err end
    if idle > 0 and maximum == 0 then
        return nil, nil, errors.new({ message = "debounce_idle_ms requires debounce_max_ms", kind = errors.INVALID })
    end
    return idle, maximum, nil
end

function writer.declaration_refusal(thread_id: string, projection_id: string,
    kind: string, projection_key: string, cursor_key: string): error
    return errors.new({kind = errors.CONFLICT, retryable = false,
        message = "projection " .. kind .. "/" .. projection_key .. " cursor " .. cursor_key
            .. " has a different stored declaration; explicitly re-register or reset the projection",
        details = {code = "projection_declaration_requires_registration", thread_id = thread_id,
            projection_id = projection_id, projection_kind = kind, projection_key = projection_key,
            cursor_key = cursor_key, action = "explicit_reregistration_or_reset"}})
end

-- The execution identity a projection registration carries (IDENTITY-1 §4 T
-- row): an explicit v2 row from admission/SET, an explicit v2 identity, or the
-- framework system identity passed explicitly. Nothing is captured from the
-- ambient caller; any other identity version or a missing identity refuses.
local function identity_row_from_params(params: table): (any?, error?)
    if type(params.execution_identity_row) == "table" then
        local row = params.execution_identity_row :: table
        local identity, row_err = execution_identity.from_row(row.actor_id, row.actor_context)
        if row_err then return nil, row_err end
        if not identity then
            return nil, (errors.new({ message = "projection execution identity row is missing", kind = errors.INVALID }) :: error)
        end
        return execution_identity.to_row(identity)
    end
    if type(params.execution_identity) == "table" then
        return execution_identity.to_row(params.execution_identity)
    end
    if params.system_identity == true then
        return nil, nil
    end
    return nil, (errors.new({
        message = "projection registration requires an explicit execution identity or the system identity",
        kind = errors.INVALID,
        details = { error_kind = "declaration" },
    }) :: error)
end

local function transition_error(code: string, message: string): error
    return errors.new({kind = errors.CONFLICT, retryable = false, message = message, details = {code = code}})
end

local function identity_matches(expected: any, actor_id: any, context: any): boolean
    local stored = execution_identity.from_row(actor_id, context)
    return stored ~= nil and same_declaration(expected, stored)
end

-- The component lock precedes the primary thread lock, as on component
-- lifecycle writes. The stored identity remains stable while the declaration
-- transaction checks both projection and cursor identity.
local function transition_owner(tx: sql.Transaction, lock: string, thread_id: string): (table?, error?)
    local rows, err = tx:query("SELECT impl_id,private_context,deleting_at FROM kickside_components WHERE component_id=$1 "
        .. lock, {thread_id})
    rows, err = sql_boundary.bounded_rows(rows, err, "failed to lock projection owner", "transition.owner", 0, 1, response_error)
    return rows and rows[1] or nil, err
end

local function describes_primary(impl_id: string, meta: table, thread: table, owner: table?): boolean
    local owner_impl = meta.impl_id or impl_id
    local class = type(meta.thread) == "table" and meta.thread.class or nil
    return owner ~= nil and owner.deleting_at == nil and owner.impl_id == owner_impl
        and thread.deleting_at == nil and thread.id == thread.component_id
        and ((class and class == thread.thread_class) or (not class and impl_id == owner_impl))
end

-- The descriptor ID locates an installed declaration for the worker callback.
-- A missing descriptor has no declaration to compare with the replacement.
local function equivalent_locator(impl_id: string, thread: table, owner: table,
    current_meta: table, request: table): (boolean?, error?)
    local entry, err = registry.get(impl_id)
    if err and not errors.is(err, errors.NOT_FOUND) then return nil, err end
    if not entry then return nil, nil end
    local meta = entry.meta or {}
    if not describes_primary(impl_id, meta, thread, owner) then return false, nil end
    local old_events = type(meta.events) == "table" and meta.events or {}
    local current_events = type(current_meta.events) == "table" and current_meta.events or {}
    if old_events.read ~= current_events.read or (old_events.read ~= nil and entry.kind ~= "contract.binding") then
        return false, nil
    end
    for _, decl in ipairs(autoinit.parse_projections(meta.projections)) do
        if (decl.on == nil or decl.on == "" or decl.on == autoinit.PROJECTION_ON.THREAD)
            and decl.kind == request.kind and decl.worker_ref == request.body.meta.worker_ref
            and declaration_key(decl.projection_key) == request.projection_key
            and declaration_key(decl.cursor_key) == request.cursor_key then
            local body = writer.declaration_body({worker_ref = decl.worker_ref, worker_input_mode = decl.input_mode,
                worker_config = decl.worker_config, events = decl.events})
            local idle, maximum, debounce_err = writer.debounce(decl)
            if body and not debounce_err and idle == request.idle and maximum == request.maximum
                and writer.declaration_matches(body, request.body) then return true, nil end
        end
    end
    return false, nil
end

local function transition_cursor(tx: sql.Transaction, lock: string, thread: table, owner: table?,
    projection: table, request: table): (table?, error?)
    local impl_id, filtered, observe_only, marker = request.impl_id, request.filtered, request.observe_only, request.marker
    local declaration, decl_err = registry.get(impl_id)
    if decl_err then return nil, decl_err end
    local meta = declaration and declaration.meta or {}
    if not owner or not describes_primary(impl_id, meta, thread, owner) then
        return nil, transition_error("projection_transition_owner", "projection transition requires its owning primary thread")
    end
    local context, context_err = persisted_json.decode_table(owner.private_context, "kickside_components.private_context")
    if context_err then return nil, context_err end
    local expected = context and context[execution_identity.CONTEXT_KEY]
    if not expected or not identity_matches(expected, projection.actor_id, projection.actor_context) then
        return nil, transition_error("projection_transition_identity", "projection transition requires the stored component identity")
    end

    local marker_columns = observe_only and "" or ",pending_transition,pending_transition_seq"
    local rows, err = tx:query([[SELECT id,thread_id,cursor_key,job_id,status,generation,last_seq,continuation,
        debounce_idle_ms,debounce_max_ms,actor_id,execution_identity_json]] .. marker_columns .. [[
        FROM kickside_projection_cursor WHERE projection_id=$1 LIMIT 2 ]] .. lock, {projection.id})
    rows, err = sql_boundary.bounded_rows(rows, err, "failed to lock projection cursor", "transition.cursor", 0, 2, response_error)
    if err then return nil, err end
    local cursor = rows[1]
    if #rows ~= 1 or cursor.thread_id ~= thread.id or cursor.cursor_key ~= request.cursor_key
        or tonumber(cursor.debounce_idle_ms) ~= request.idle or tonumber(cursor.debounce_max_ms) ~= request.maximum
        or (cursor.continuation or "") ~= "" then
        return nil, transition_error("projection_transition_cursor", "projection transition requires one matching cursor without a continuation")
    end
    if not identity_matches(expected, cursor.actor_id, cursor.execution_identity_json) then
        return nil, transition_error("projection_transition_identity", "projection transition requires the stored component identity")
    end
    local last_seq = tonumber(cursor.last_seq)
    if not last_seq or last_seq < (assert(tonumber(thread.max_pruned_seq))) then
        return nil, transition_error("projection_transition_position", "projection transition requires a retained cursor position")
    end
    if cursor.status ~= "paused" and not (filtered and cursor.status == "active") then
        return nil, transition_error("projection_transition_requires_pause", "pause the projection cursor before transitioning workers")
    end

    -- The ordinary member call leaves the existing declaration and slot
    -- untouched. The target database and lease belong to lifecycle authority.
    -- This path is also valid between registry publication and migration.
    if observe_only then
        cursor.deferred = true
        return cursor, nil
    end
    local config, config_err = registry.get(request.db_config_id)
    if config_err then return nil, config_err end
    local db_id = core_db.id()
    local target_id = config and config.meta and config.meta.db_id
    if filtered then
        if type(target_id) ~= "string" or trim(target_id) == "" or jobs_config.db_id() ~= db_id then
            return nil, transition_error("projection_transition_database",
                "filtered projection transition requires a bound target and a shared Core and Jobs database")
        end
        local target, target_err = registry.get(target_id)
        if target_err then return nil, target_err end
        if not target or (target.kind ~= "db.sql.sqlite" and target.kind ~= "db.sql.postgres") then
            return nil, transition_error("projection_transition_database", "filtered projection target must be a SQL database")
        end
    elseif target_id ~= db_id or jobs_config.db_id() ~= db_id then
        return nil, transition_error("projection_transition_database",
            "projection transition requires the same Core, Jobs, and target database resource")
    end

    -- Lock the existing slot before deciding whether its predecessor can be
    -- fenced. An active worker with outstanding work keeps its lease and
    -- consumes its own backlog before lifecycle takes the declaration.
    local jobs, job_err = tx:query([[SELECT id,status,lease_token,slot,worker_ref,owner_kind,owner_id,payload
        FROM kickside_job WHERE id=$1 ]] .. lock, {cursor.job_id})
    jobs, job_err = sql_boundary.bounded_rows(jobs, job_err, "failed to lock projection slot", "transition.job", 0, 1, response_error)
    if job_err then return nil, job_err end
    local job = jobs[1]
    if not job then
        return nil, transition_error("projection_transition_slot_unsettled", "wait for the paused projection's existing Jobs slot to settle")
    end
    local payload, payload_err = persisted_json.decode_table(job.payload, "kickside_job.payload")
    if payload_err then return nil, payload_err end
    if (job.slot ~= true and tonumber(job.slot) ~= 1) or job.worker_ref ~= "kickside.core.projections:advance"
        or job.owner_kind ~= "thread" or job.owner_id ~= thread.id or not payload or payload.cursor_id ~= cursor.id then
        return nil, transition_error("projection_transition_slot", "projection transition requires the cursor's existing Jobs slot")
    end
    -- Capture the lifecycle pass's head once. Later appends keep the same Jobs
    -- slot runnable and can be consumed by the successor after this boundary.
    local cutoff = tonumber(thread.event_count)
    if marker and cursor.pending_transition then
        if cursor.pending_transition == marker then
            cutoff = tonumber(cursor.pending_transition_seq)
        else
            local pending = json.decode(cursor.pending_transition)
            if type(pending) == "table" and type(pending[1]) == "string" and pending[2] == request.body.meta.worker_ref then
                local equivalent, equivalent_err = equivalent_locator(pending[1], thread, owner :: table, meta, request)
                if equivalent_err then return nil, equivalent_err end
                -- Keep the boundary for equivalent locators and retired
                -- locators whose replacement passed the handoff checks.
                if equivalent ~= false then cutoff = tonumber(cursor.pending_transition_seq) end
                if equivalent then marker = cursor.pending_transition end
            end
        end
    end
    if not cutoff then return nil, response_error("transition.position") end
    local backlog = filtered and last_seq < cutoff
    if job.status ~= "running" and job.status ~= "pending" then
        return nil, transition_error("projection_transition_slot_unsettled", "the predecessor Jobs slot is inactive")
    end
    local busy = job.status ~= "pending" or job.lease_token ~= nil
    if filtered and (busy or backlog) then
        cursor.deferred = true
        cursor.running = job.status == "running"
        cursor.transition_marker = marker
        cursor.transition_cutoff = cutoff
        return cursor, nil
    end
    if busy then return nil, transition_error("projection_transition_slot_unsettled",
        "wait for the predecessor's existing Jobs slot to settle") end
    return cursor, nil
end

-- register_projection_tx upserts a projection and its cursor within a caller-
-- owned transaction. Validates params, derives runtime/defaults, reads the
-- thread row, upserts the projection (merging the body's read-model on
-- re-register unless reset=true), and upserts the cursor. No tx management:
-- the caller begins and commits; on error the caller rolls back. Declaration
-- convergence accepts only a declared compatible worker transition on an
-- existing cursor. Lifecycle attachments start new cursors at the retained boundary.
-- Component-backed registration supplies authorization for the locked thread read.
function writer.register_projection_tx(tx: sql.Transaction, dbtype: string, thread_id: string, params: table,
    mode: string?, declaration_impl_id: string?, source: table?,
    system_worker_err: error?): (RegisterResult?, error?)
    if type(params) ~= "table" then
        return nil, (errors.new({ message = "projection registration params must be an object", kind = errors.INVALID }) :: error)
    end
    for _, key in ipairs({ "trigger_policy", "coalesce_key", "batch_size",
        "window_max_events", "window_idle_timeout_ms", "window_max_duration_ms", "worker_runtime" }) do
        if params[key] ~= nil then
            return nil, (errors.new({ message = key .. " is not part of the projection cursor contract", kind = errors.INVALID }) :: error)
        end
    end

    local kind = trim(params.kind)
    if kind == "" then
        return nil, (errors.new({ message = "kind is required", kind = errors.INVALID }) :: error)
    end
    if #kind > types.KIND_MAX_LEN then
        return nil, (errors.new({ message = "kind is too long (max " .. tostring(types.KIND_MAX_LEN) .. ")", kind = errors.INVALID }) :: error)
    end

    local body, declaration_err = writer.declaration_body(params)
    if declaration_err then return nil, declaration_err end
    local worker_ref = body.meta.worker_ref
    local worker_input_mode = body.meta.worker_input_mode

    local projection_key = declaration_key(params.projection_key)
    local cursor_key = declaration_key(params.cursor_key)
    for _, key in ipairs({ projection_key, cursor_key }) do
        if #key > types.KEY_MAX_LEN then
            return nil, (errors.new({ message = "projection/cursor key is too long (max " .. tostring(types.KEY_MAX_LEN) .. ")", kind = errors.INVALID }) :: error)
        end
    end
    local start_seq, start_err = bounded(params.start_seq, "start_seq",
        types.START_SEQ.MIN, types.START_SEQ.MAX, types.START_SEQ.MIN)
    if start_err then return nil, start_err end
    local debounce_idle_ms, debounce_max_ms, debounce_err = writer.debounce(params)
    if debounce_err then return nil, debounce_err end
    local lifecycle = mode == "lifecycle"
    local observing = mode == "ensure_declared"
    local convergence = lifecycle or mode == "convergence" or observing
    local reset = params.reset == true

    local now = now_string(dbtype)
    local lock = dbtype == sql.type.SQLITE and "" or "FOR UPDATE"

    local function fail(message: string, kind: string): (nil, error)
        return nil, (errors.new({ message = message, kind = kind }) :: error)
    end

    local previous, transition_db, filtered_transition, owner
    if (mode == "convergence" or observing) and declaration_impl_id and params.ensure == true and not reset then
        local transition_err
        previous, transition_db, transition_err, filtered_transition = writer.transition_predecessor(body)
        if transition_err then return nil, transition_err end
        if previous then
            owner, transition_err = transition_owner(tx, lock, thread_id)
            if transition_err then return nil, transition_err end
        end
    end

    local thread_query = sql.builder.select("t.id", "t.event_count", "t.max_pruned_seq", "t.thread_class", "t.deleting_at")
    local build_err: error?
    if source then
        thread_query, build_err = event_access.authorized_query(tx, thread_id, nil, thread_query, source)
        if build_err then return nil, build_err end
    else
        thread_query = thread_query:columns("t.component_id"):from("kickside_thread t"):where("t.id = ?", thread_id)
    end
    if lock ~= "" then
        thread_query = thread_query:suffix(lock .. " OF t")
    end
    local thread_rows, thread_err
    if source then thread_rows, thread_err = event_access.execute(tx, thread_id, thread_query, source)
    else thread_rows, thread_err = thread_query:run_with(tx):query() end
    thread_rows, thread_err = sql_boundary.bounded_rows(thread_rows, thread_err,
        "failed to load thread", "thread.rows", 0, 1, response_error)
    if thread_err then return nil, thread_err end
    if not thread_rows then return nil, response_error("thread.rows") end
    if source then
        local access_err = event_access.verify(source, thread_rows[1])
        if access_err then return nil, access_err end
    end
    if #thread_rows == 0 then
        return fail("thread not found", errors.NOT_FOUND)
    end
    local thread = thread_rows[1]
    local event_count = tonumber(thread.event_count)
    if event_count == nil then return fail("thread event count is missing", errors.INTERNAL) end
    local pruned_seq = tonumber(thread.max_pruned_seq)
    if pruned_seq == nil then return fail("thread retention boundary missing", errors.INTERNAL) end
    -- start_at_head positions a new cursor at the thread's current head so the
    -- projection processes only events appended after registration, with no
    -- history replay. It resolves in-tx against the freshly read event_count, so
    -- "head" is race-free; an explicit start_seq still wins.
    if params.start_at_head == true and params.start_seq == nil then
        start_seq = event_count
    elseif lifecycle and params.start_seq == nil then
        start_seq = math.max(start_seq, pruned_seq)
    end
    if start_seq > event_count then
        return fail("start_seq cannot exceed thread event_count", errors.INVALID)
    end

    -- Freeze the registering actor's bounded identity onto the projection definition
    -- (canonical actor_id + actor_context columns). Deferred worker runs reconstruct
    -- it so they act as the owner who registered the projection. Identity is
    -- supplied explicitly; the writer never captures an ambient caller.
    local actor_id_col: string? = nil
    local actor_context_col: string? = nil
    local id_row, id_row_err = identity_row_from_params(params)
    if id_row_err then
        return nil, errors.wrap(id_row_err, "invalid execution identity")
    end
    if not id_row and params.system_identity ~= true then
        return fail("projection execution identity is missing", errors.INVALID)
    end
    if id_row then
        actor_id_col = (id_row :: any).actor_id :: string?
        actor_context_col = (id_row :: any).actor_context :: string?
        if params.registered_checkpoint_principal == true then
            local marker_err
            actor_context_col, marker_err = mark_registered_checkpoint_principal(actor_context_col :: string)
            if marker_err then return nil, marker_err end
        end
    end

    local body_json, body_encode_err = json.encode(body)
    if body_encode_err then return nil, errors.wrap(body_encode_err, "failed to encode projection body") end
    if not body_json then
        return nil, response_error("body", "projection body encoder returns no result")
    end

    local projection_id: string
    local created_projection = false
    local declaration_changed = false
    local worker_changed = false
    local transitioning: table? = nil
    local checkpoint = start_seq
    local cursor: table? = nil
    local function load_cursor(): (table?, error?)
        local rows, err = sql.builder.select("id", "last_seq", "generation", "job_id", "debounce_idle_ms",
            "debounce_max_ms", "actor_id", "execution_identity_json")
            :from("kickside_projection_cursor")
            :where(sql.builder.eq({ projection_id = projection_id, cursor_key = cursor_key }))
            :limit(1):run_with(tx):query()
        rows, err = sql_boundary.bounded_rows(rows, err, "failed to load cursor", "cursor.rows", 0, 1, response_error)
        if err then return nil, err end
        if not rows then return nil, response_error("cursor.rows") end
        local row = rows[1]
        if row and convergence and (tonumber(row.debounce_idle_ms) ~= debounce_idle_ms
            or tonumber(row.debounce_max_ms) ~= debounce_max_ms) then
            return nil, writer.declaration_refusal(thread_id, projection_id, kind, projection_key, cursor_key)
        end
        return row, nil
    end

    local projection_rows, projection_query_err = sql.builder.select("id", "body", "last_event_seq", "actor_id", "actor_context")
        :from("kickside_projection")
        :where(sql.builder.eq({ thread_id = thread_id, kind = kind, projection_key = projection_key }))
        :limit(1)
        :run_with(tx):query()
    projection_rows, projection_query_err = sql_boundary.bounded_rows(projection_rows, projection_query_err,
        "failed to load projection", "projection.rows", 0, 1, response_error)
    if projection_query_err then return nil, projection_query_err end
    if not projection_rows then return nil, response_error("projection.rows") end
    if not projection_rows[1] and system_worker_err then return nil, system_worker_err end

    -- An array encodes the descriptor and exact installed destination identically
    -- on both SQL engines, including IDs containing punctuation.
    local marker: string? = nil
    if filtered_transition and declaration_impl_id then
        local encoded, encode_err = json.encode({declaration_impl_id, worker_ref})
        if encode_err then return nil, encode_err end
        if not encoded then return nil, response_error("transition.marker") end
        marker = encoded
    end
    if params.pending_cursor_id and declaration_impl_id and mode == "convergence" then
        if not projection_rows[1] or not marker or not previous then
            return nil, transition_error("projection_transition_obsolete", "deferred projection transition was retired")
        end
        local marked, read_err = tx:query([[SELECT id FROM kickside_projection_cursor
            WHERE id=$1 AND thread_id=$2 AND projection_id=$3 AND pending_transition=$4]],
            {params.pending_cursor_id, thread_id, projection_rows[1].id, marker})
        if read_err then return nil, read_err end
        if not marked[1] then return nil, transition_error("projection_transition_obsolete", "deferred projection transition was retired") end
    end

    if #projection_rows > 0 then
        projection_id = tostring(projection_rows[1].id)
        if lifecycle and not reset and params.start_seq == nil and params.start_at_head ~= true then
            local saved = tonumber(projection_rows[1].last_event_seq)
            if saved == nil then return nil, response_error("projection.last_event_seq") end
            checkpoint = math.max(start_seq, saved)
        end
        -- Preserve the fold read-model that lives alongside the declaration in the
        -- body. The worker folds its accumulated public state (counters, status)
        -- into top-level body keys; only meta / worker_config / events are declaration fields. A re-register (binding hot-reload,
        -- ensure_thread convergence) refreshes just those declaration fields and
        -- keeps every other key, so a re-registration never drops the read-model.
        -- reset is the explicit rebuild: it replaces the whole body and rewinds the
        -- cursor so the fold reconstructs the read-model from start_seq.
        local body_to_write = body_json
        local stored, decode_err = persisted_json.decode_table(projection_rows[1].body, "kickside_projection.body")
        local stored_meta = stored and stored.meta
        worker_changed = type(stored_meta) ~= "table" or stored_meta.worker_ref ~= worker_ref
        if not reset then
            if decode_err then return nil, errors.wrap(decode_err, "failed to decode existing projection body") end
            declaration_changed = not writer.declaration_matches(stored :: table, body)
            if convergence and declaration_changed then
                -- One body is shared by every cursor at this projection address.
                local existing, existing_err = sql.builder.select("id"):from("kickside_projection_cursor")
                    :where(sql.builder.eq({projection_id = projection_id})):limit(1):run_with(tx):query()
                existing, existing_err = sql_boundary.bounded_rows(existing, existing_err,
                    "failed to check existing projection cursors", "cursor.existing", 0, 1, response_error)
                if existing_err then return nil, existing_err end
                if #existing > 0 then
                    if not previous or (observing and not filtered_transition) or not writer.declaration_matches(stored :: table, previous) then
                        return nil, writer.declaration_refusal(thread_id, projection_id, kind, projection_key, cursor_key)
                    end
                    local transition_err
                    transitioning, transition_err = transition_cursor(tx, lock, thread, owner, projection_rows[1], {
                        impl_id = declaration_impl_id, db_config_id = transition_db, filtered = filtered_transition,
                        kind = kind, projection_key = projection_key, cursor_key = cursor_key, body = body,
                        idle = debounce_idle_ms, maximum = debounce_max_ms, observe_only = observing, marker = marker,
                    })
                    if transition_err then return nil, transition_err end
                    if transitioning and transitioning.deferred then
                        local cursor = transitioning :: table
                        local generation = tonumber(cursor.generation)
                        if not generation then return nil, response_error("cursor.generation") end
                        if not observing and cursor.pending_transition ~= cursor.transition_marker then
                            local marked, mark_err = tx:execute([[UPDATE kickside_projection_cursor SET pending_transition=$1,pending_transition_seq=$2
                                WHERE id=$3 AND generation=$4]], {cursor.transition_marker, cursor.transition_cutoff, cursor.id, cursor.generation})
                            local _, proof_err = sql_boundary.exact_row_count(marked, mark_err, "failed to defer projection transition",
                                "transition.defer", 1, response_error)
                            if proof_err then return nil, proof_err end
                            -- An invocation already running the old Core may settle
                            -- the final input without observing the new marker.
                            -- Control demand survives even a head-satisfied fold.
                            if cursor.status == "active" and cursor.running then
                                local _, wake_err = jobs_wake.wake_job(tx, cursor.job_id, {control = true}, dbtype)
                                if wake_err then return nil, wake_err end
                            end
                        end
                        return {projection_id = projection_id, cursor_id = cursor.id, kind = kind, projection_key = projection_key,
                            cursor_key = cursor_key, worker_ref = previous.meta.worker_ref, worker_input_mode = worker_input_mode,
                            generation = generation, job_id = cursor.job_id, created = false, deferred = true}, nil
                    end
                end
            end
            apply_declaration_fields(stored :: table, body)
            local merged_json, merged_err = json.encode(stored)
            if merged_err then return nil, errors.wrap(merged_err, "failed to encode merged projection body") end
            if not merged_json then
                return nil, response_error("merged_body", "merged projection body encoder returns no result")
            end
            body_to_write = merged_json :: string
        else
            declaration_changed = worker_changed
        end
        if system_worker_err and not transitioning then
            -- Drift and transitions were checked above. Only ensure on an
            -- existing cursor with a valid identity can retain this worker.
            local cursor_err: error?
            cursor, cursor_err = load_cursor()
            if cursor_err then return nil, cursor_err end
            if params.ensure ~= true or not cursor or (cursor.actor_id == nil and cursor.execution_identity_json == nil) then
                return nil, system_worker_err
            end
            local identity, identity_err = execution_identity.from_row(cursor.actor_id, cursor.execution_identity_json)
            if identity_err or not identity then return nil, identity_err or system_worker_err end
        end
        if params.ensure ~= true or declaration_changed then
            local projection_update = sql.builder.update("kickside_projection")
                :set("body", body_to_write)
                :set("updated_at", now)
            if params.ensure ~= true then
                projection_update = projection_update:set("actor_id", actor_id_col):set("actor_context", actor_context_col)
            end
            if reset then
                -- reset rewinds the projection to start_seq and marks it pending so
                -- catch-up rebuilds it from scratch.
                projection_update = projection_update:set("state", core_types.PROJECTION_STATE.PENDING)
                    :set("last_event_seq", start_seq)
                    :set("reset_generation", sql.builder.expr("reset_generation + 1"))
            elseif declaration_changed and not transitioning then
                -- INVALID records a fault in the PREVIOUS declaration (an unresolvable
                -- worker_ref, an unsupported runtime). A new declaration retires that
                -- verdict: the projection returns to pending and resumes from the seq it
                -- already reached, so a corrected module upgrade heals without a replay.
                projection_update = projection_update:set("state", core_types.PROJECTION_STATE.PENDING)
            end
            local updated, update_err = projection_update
                :where(sql.builder.eq({ id = projection_id }))
                :run_with(tx):exec()
            local _, proof_err = sql_boundary.exact_row_count(updated, update_err,
                "failed to update projection", "projection.update", 1, response_error)
            if proof_err then return nil, proof_err end
        end
    else
        projection_id = uuid.v7()
        created_projection = true
        local inserted, insert_err = sql.builder.insert("kickside_projection")
            :set_map({
                id = projection_id,
                thread_id = thread_id,
                kind = kind,
                projection_key = projection_key,
                body = body_json,
                state = core_types.PROJECTION_STATE.PENDING,
                last_event_seq = start_seq,
                actor_id = actor_id_col,
                actor_context = actor_context_col,
                created_at = now,
                updated_at = now,
            })
            :suffix("ON CONFLICT DO NOTHING")
            :run_with(tx):exec()
        local count, count_err = sql_boundary.single_row_count(inserted, insert_err,
            "failed to insert projection", "projection.insert", projection_insert_response)
        if count_err then return nil, count_err end
        if count == 0 then
            return nil, errors.new({kind = errors.CONFLICT, message = "projection already exists",
                retryable = false, details = {code = "projection_already_exists"}})
        end

    end

    if transitioning then
        local cursor = transitioning :: table
        local prior = tonumber(cursor.generation)
        if not prior then return nil, response_error("transition.generation") end
        local updated, update_err = tx:execute([[UPDATE kickside_projection_cursor SET pending_transition=NULL,pending_transition_seq=NULL,generation=generation+1,updated_at=$1
            WHERE id=$2 AND generation=$3]], {now, cursor.id, prior})
        local _, proof_err = sql_boundary.exact_row_count(updated, update_err,
            "failed to fence previous projection worker", "transition.fence", 1, response_error)
        if proof_err then return nil, proof_err end
        return {projection_id = projection_id, cursor_id = cursor.id, kind = kind, projection_key = projection_key,
            cursor_key = cursor_key, worker_ref = worker_ref, worker_input_mode = worker_input_mode,
            generation = prior + 1, job_id = cursor.job_id, created = false, transitioned = true,
            debounce_idle_ms = debounce_idle_ms, debounce_max_ms = debounce_max_ms}, nil
    end

    if declaration_changed and not convergence then
        local fence = sql.builder.update("kickside_projection_cursor")
            :set("generation", sql.builder.expr("generation + 1")):set("updated_at", now)
        if worker_changed then
            fence = fence:set("continuation", "")
        else
            fence = fence:set("continuation", sql.builder.expr(
                "CASE WHEN substr(continuation,1,2)='f:' THEN '' ELSE continuation END"))
        end
        fence = fence:set("pending_transition", nil):set("pending_transition_seq", nil)
        local fenced, fence_err = fence
            :where(sql.builder.eq({ projection_id = projection_id })):run_with(tx):exec()
        if fence_err then return nil, errors.wrap(fence_err, "failed to fence refreshed projection") end
        local _, proof_err = sql_boundary.number_value(type(fenced) == "table" and fenced.rows_affected or nil,
            "cursor.fence", 0, true, false, response_error)
        if proof_err then return nil, proof_err end
    end

    local cursor_id: string
    local generation = 1
    if not cursor then
        local cursor_err: error?
        cursor, cursor_err = load_cursor()
        if cursor_err then return nil, cursor_err end
    end
    local cursor_head = checkpoint
    if cursor then
        cursor_id = tostring(cursor.id)
        cursor_head = reset and start_seq or tonumber(cursor.last_seq)
        if cursor_head == nil then return fail("projection cursor position is missing", errors.INTERNAL) end
        if cursor_head < pruned_seq then return fail("projection cursor is behind pruned history", errors.CONFLICT) end
        local prior_generation = tonumber(cursor.generation)
        if prior_generation == nil then return fail("projection cursor generation is missing", errors.INTERNAL) end
        generation = prior_generation
        if params.ensure ~= true then
            local held, pin_err = retention_pin.read(tx, thread_id, "projection:" .. cursor_id)
            if pin_err then return nil, pin_err end
            if held then
                local _, release_err = retention_pin.release_tx(tx, { thread_id = thread_id,
                    consumer_key = "projection:" .. cursor_id, expected_pin_generation = held.generation,
                    terminal_op_id = cursor_id .. ":correct:" .. tostring(prior_generation) })
                if release_err then return nil, release_err end
            end
            generation = prior_generation + (declaration_changed and 0 or 1)
            local update = sql.builder.update("kickside_projection_cursor")
                :set("last_seq", cursor_head):set("status", "active")
                :set("generation", generation):set("pending_transition", nil):set("pending_transition_seq", nil):set("last_error", nil)
                :set("actor_id", actor_id_col)
                :set("execution_identity_json", actor_context_col)
                :set("debounce_idle_ms", debounce_idle_ms):set("debounce_max_ms", debounce_max_ms)
                :set("updated_at", now)
            if reset then update = update:set("continuation", "") end
            local updated, update_err = update
                :where(sql.builder.eq({ id = cursor_id })):run_with(tx):exec()
            local _, proof_err = sql_boundary.exact_row_count(updated, update_err,
                "failed to update cursor", "cursor.update", 1, response_error)
            if proof_err then return nil, proof_err end
        end
    else
        if cursor_head < pruned_seq then return fail("projection registration would replay pruned history", errors.CONFLICT) end
        cursor_id = uuid.v7()
        local inserted, insert_err = sql.builder.insert("kickside_projection_cursor")
            :set_map({ id = cursor_id, projection_id = projection_id, thread_id = thread_id,
                cursor_key = cursor_key, generation = 1, last_seq = cursor_head,
                status = "active", debounce_idle_ms = debounce_idle_ms,
                debounce_max_ms = debounce_max_ms, actor_id = actor_id_col,
                execution_identity_json = actor_context_col,
                created_at = now, updated_at = now })
            :run_with(tx):exec()
        local _, proof_err = sql_boundary.exact_row_count(inserted, insert_err,
            "failed to insert cursor", "cursor.insert", 1, response_error)
        if proof_err then return nil, proof_err end
    end
    local job_id, job_err = writer.enqueue_slot(tx, dbtype, thread_id, cursor_id, cursor_head >= event_count)
    if not job_id then return nil, job_err end
    local linked, link_err = sql.builder.update("kickside_projection_cursor")
        :set("job_id", job_id):where(sql.builder.eq({ id = cursor_id }))
        :run_with(tx):exec()
    local _, link_proof_err = sql_boundary.exact_row_count(linked, link_err,
        "failed to link projection slot", "cursor.link", 1, response_error)
    if link_proof_err then return nil, link_proof_err end
    if params.ensure ~= true and cursor and (cursor_head < event_count or reset) then
        local _, wake_err = jobs_wake.wake_job(tx, job_id, { control = true }, dbtype)
        if wake_err then return nil, wake_err end
    end
    -- A cursor at the thread head has no event left to fold, so its slot parks
    -- and no advance runs: the projection is current at that head.
    if cursor_head >= event_count then
        local marked, valid_err = sql.builder.update("kickside_projection")
            :set("state", core_types.PROJECTION_STATE.VALID)
            :set("last_event_seq", cursor_head)
            :set("updated_at", now)
            :where(sql.builder.eq({ id = projection_id, state = core_types.PROJECTION_STATE.PENDING }))
            :run_with(tx):exec()
        local _, valid_proof_err = sql_boundary.single_row_count(marked, valid_err,
            "failed to mark caught-up projection valid", "projection.valid", response_error)
        if valid_proof_err then return nil, valid_proof_err end
    end

    return {
        projection_id = projection_id,
        cursor_id = cursor_id,
        kind = kind,
        projection_key = projection_key,
        cursor_key = cursor_key,
        worker_ref = worker_ref,
        worker_input_mode = worker_input_mode,
        generation = generation,
        job_id = job_id,
        created = created_projection,
        debounce_idle_ms = debounce_idle_ms,
        debounce_max_ms = debounce_max_ms,
    }, nil
end

-- register_projection upserts a projection and its cursor, opening and
-- committing its own transaction off db. On error it rolls back and returns
-- the error. Delegates to register_projection_tx for the core SQL.
function writer.register_projection(db: sql.DB, thread_id: string, params: table, mode: string?,
    declaration_impl_id: string?, source: table?, system_worker_err: error?): (RegisterResult?, error?)
    local dbtype, dbtype_err = sql_boundary.database_type(db, "failed to resolve db type", "database.type", response_error)
    if dbtype_err then return nil, dbtype_err end
    local result, err = sql_boundary.transaction(db, function(tx: sql.Transaction): (any?, error?)
        return writer.register_projection_tx(tx, dbtype :: string, thread_id, params, mode, declaration_impl_id, source,
            system_worker_err)
    end, "projection registration", response_error)
    if err then return nil, err end
    if result and (result.transitioned or result.deferred) then return result, nil end
    local _, notify_err = jobs_wake.nudge_workers(db, dbtype)
    if notify_err then return nil, committed_error.new(notify_err) end
    if params.reset == true then
        local _, retention_notify_err = retention_notifier.notify({ kind = "projection_eligibility_changed",
            thread_id = thread_id })
        if retention_notify_err then return nil, committed_error.new(retention_notify_err) end
    end
    return result :: RegisterResult, nil
end

return writer
