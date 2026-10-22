-- Write side of the projection engine. Registers/removes a projection and its
-- catch-up cursor, advances a cursor as catch-up makes progress, and applies the
-- pause/resume lifecycle transitions. Every entry point takes the caller's db or
-- tx handle and owns only the kickside_projection / kickside_projection_cursor
-- rows — scheduling, access checks, and thread notifications belong to the
-- slices that compose this engine. Timestamps are computed in Lua via
-- time.now() in the dialect's textual shape and bound as params, so the SQL
-- stays portable. Errors are returned as values.

local sql = require("sql")
local json = require("json")
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
}

local function response_error(field: string, message: string?, code: string?): error
    return errors.new({kind = errors.INTERNAL, retryable = false,
        message = message or ("projection registration returns no valid " .. field .. " proof"),
        details = {code = code or "projection_registration_response", field = field}})
end

local function projection_insert_response(field: string): error
    return response_error(field, "projection insert returns no affected-row proof", "projection_insert_result_invalid")
end

local function trim(value: any): string
    if type(value) ~= "string" then
        return ""
    end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local now_string = clock.now

-- The projection body contains two different kinds of state: the declaration
-- that says how to run the projection, and the fold state produced by that
-- worker. Keep the declaration vocabulary in one place so normal
-- re-registration and destructive-storage rebuilds cannot drift apart.
local DECLARATION_BODY_KEYS = {
    "meta",
    "worker_config",
    "events",
    "drop_notify",
}

local function apply_declaration_fields(target: table, declaration: table): table
    for _, key in ipairs(DECLARATION_BODY_KEYS) do
        target[key] = declaration[key]
    end
    return target
end

-- Structural equality over the declaration fields. Used to detect that a module
-- upgrade changed what a stored projection declares, which is the one condition
-- that retires a recorded config fault.
local function same_declaration(a: any, b: any): boolean
    if type(a) ~= type(b) then return false end
    if type(a) ~= "table" then return a == b end
    for key, value in pairs(a :: table) do
        if not same_declaration(value, (b :: table)[key]) then return false end
    end
    for key in pairs(b :: table) do
        if (a :: table)[key] == nil then return false end
    end
    return true
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

-- register_projection_tx upserts a projection and its cursor within a caller-
-- owned transaction. Validates params, derives runtime/defaults, reads the
-- thread row, upserts the projection (merging the body's read-model on
-- re-register unless reset=true), and upserts the cursor. No tx management:
-- the caller begins and commits; on error the caller rolls back. Declaration
-- convergence passes ensure=true to refresh declarations while preserving the
-- fold and cursor state. A changed declaration fences previously loaded workers.
function writer.register_projection_tx(tx: sql.Transaction, dbtype: string, thread_id: string, params: table): (RegisterResult?, error?)
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

    local projection_key = trim(params.projection_key)
    if projection_key == "" then
        projection_key = types.KEY_DEFAULT
    end
    local cursor_key = trim(params.cursor_key)
    if cursor_key == "" then
        cursor_key = types.KEY_DEFAULT
    end
    for _, key in ipairs({ projection_key, cursor_key }) do
        if #key > types.KEY_MAX_LEN then
            return nil, (errors.new({ message = "projection/cursor key is too long (max " .. tostring(types.KEY_MAX_LEN) .. ")", kind = errors.INVALID }) :: error)
        end
    end
    local start_seq, start_err = bounded(params.start_seq, "start_seq",
        types.START_SEQ.MIN, types.START_SEQ.MAX, types.START_SEQ.MIN)
    if start_err then return nil, start_err end
    local debounce_idle_ms, idle_err = bounded(params.debounce_idle_ms, "debounce_idle_ms",
        0, types.DEBOUNCE_MAX_MS, 0)
    if idle_err then return nil, idle_err end
    local debounce_max_ms, max_err = bounded(params.debounce_max_ms, "debounce_max_ms",
        0, types.DEBOUNCE_MAX_MS, 0)
    if max_err then return nil, max_err end
    if (debounce_idle_ms :: integer) > 0 and (debounce_max_ms :: integer) == 0 then
        return nil, (errors.new({ message = "debounce_idle_ms requires debounce_max_ms", kind = errors.INVALID }) :: error)
    end
    local reset = params.reset == true

    local now = now_string(dbtype)
    local lock = dbtype == sql.type.SQLITE and "" or "FOR UPDATE"

    local function fail(message: string, kind: string): (nil, error)
        return nil, (errors.new({ message = message, kind = kind }) :: error)
    end

    local thread_query = sql.builder.select("id", "event_count", "max_pruned_seq")
        :from("kickside_thread")
        :where(sql.builder.eq({ id = thread_id }))
    if lock ~= "" then
        thread_query = thread_query:suffix(lock)
    end
    local thread_rows, thread_err = thread_query:run_with(tx):query()
    thread_rows, thread_err = sql_boundary.bounded_rows(thread_rows, thread_err,
        "failed to load thread", "thread.rows", 0, 1, response_error)
    if thread_err then return nil, thread_err end
    if not thread_rows then return nil, response_error("thread.rows") end
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
    local body_json, body_encode_err = json.encode(body)
    if body_encode_err then return nil, errors.wrap(body_encode_err, "failed to encode projection body") end
    if not body_json then
        return nil, response_error("body", "projection body encoder returns no result")
    end

    local projection_id: string
    local created_projection = false
    local declaration_changed = false
    local projection_rows, projection_query_err = sql.builder.select("id", "body")
        :from("kickside_projection")
        :where(sql.builder.eq({ thread_id = thread_id, kind = kind, projection_key = projection_key }))
        :limit(1)
        :run_with(tx):query()
    projection_rows, projection_query_err = sql_boundary.bounded_rows(projection_rows, projection_query_err,
        "failed to load projection", "projection.rows", 0, 1, response_error)
    if projection_query_err then return nil, projection_query_err end
    if not projection_rows then return nil, response_error("projection.rows") end

    if #projection_rows > 0 then
        projection_id = tostring(projection_rows[1].id)
        -- Preserve the fold read-model that lives alongside the declaration in the
        -- body. The worker folds its accumulated public state (counters, status)
        -- into top-level body keys; only meta / worker_config / events are declaration fields. A re-register (binding hot-reload,
        -- ensure_thread convergence) refreshes just those declaration fields and
        -- keeps every other key, so a re-registration never drops the read-model.
        -- reset is the explicit rebuild: it replaces the whole body and rewinds the
        -- cursor so the fold reconstructs the read-model from start_seq.
        local body_to_write = body_json
        if not reset then
            local merged, decode_err = persisted_json.decode_table(projection_rows[1].body, "kickside_projection.body")
            if decode_err then return nil, errors.wrap(decode_err, "failed to decode existing projection body") end
            local stored_declaration = apply_declaration_fields({}, merged :: table)
            declaration_changed = not same_declaration(stored_declaration, apply_declaration_fields({}, body))
            apply_declaration_fields(merged :: table, body)
            local merged_json, merged_err = json.encode(merged)
            if merged_err then return nil, errors.wrap(merged_err, "failed to encode merged projection body") end
            if not merged_json then
                return nil, response_error("merged_body", "merged projection body encoder returns no result")
            end
            body_to_write = merged_json :: string
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
                projection_update = projection_update:set("state", core_types.PROJECTION_STATE.PENDING):set("last_event_seq", start_seq)
            elseif declaration_changed then
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

    if declaration_changed then
        local fenced, fence_err = sql.builder.update("kickside_projection_cursor")
            :set("generation", sql.builder.expr("generation + 1")):set("updated_at", now)
            :where(sql.builder.eq({ projection_id = projection_id })):run_with(tx):exec()
        if fence_err then return nil, errors.wrap(fence_err, "failed to fence refreshed projection") end
        local _, proof_err = sql_boundary.number_value(type(fenced) == "table" and fenced.rows_affected or nil,
            "cursor.fence", 0, true, false, response_error)
        if proof_err then return nil, proof_err end
    end

    local cursor_id: string
    local generation = 1
    local cursor_rows, cursor_query_err = sql.builder.select("id", "last_seq", "generation", "job_id")
        :from("kickside_projection_cursor")
        :where(sql.builder.eq({ projection_id = projection_id, cursor_key = cursor_key }))
        :limit(1):run_with(tx):query()
    cursor_rows, cursor_query_err = sql_boundary.bounded_rows(cursor_rows, cursor_query_err,
        "failed to load cursor", "cursor.rows", 0, 1, response_error)
    if cursor_query_err then return nil, cursor_query_err end
    if not cursor_rows then return nil, response_error("cursor.rows") end
    local cursor_head = start_seq
    if #cursor_rows > 0 then
        cursor_id = tostring(cursor_rows[1].id)
        cursor_head = reset and start_seq or tonumber(cursor_rows[1].last_seq)
        if cursor_head == nil then return fail("projection cursor position is missing", errors.INTERNAL) end
        if cursor_head < pruned_seq then return fail("projection cursor is behind pruned history", errors.CONFLICT) end
        local prior_generation = tonumber(cursor_rows[1].generation)
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
            local updated, update_err = sql.builder.update("kickside_projection_cursor")
                :set("last_seq", cursor_head):set("status", "active")
                :set("generation", generation):set("last_error", nil)
                :set("actor_id", actor_id_col)
                :set("execution_identity_json", actor_context_col)
                :set("debounce_idle_ms", debounce_idle_ms):set("debounce_max_ms", debounce_max_ms)
                :set("updated_at", now)
                :where(sql.builder.eq({ id = cursor_id })):run_with(tx):exec()
            local _, proof_err = sql_boundary.exact_row_count(updated, update_err,
                "failed to update cursor", "cursor.update", 1, response_error)
            if proof_err then return nil, proof_err end
        end
    else
        if start_seq < pruned_seq then return fail("projection registration would replay pruned history", errors.CONFLICT) end
        cursor_id = uuid.v7()
        local inserted, insert_err = sql.builder.insert("kickside_projection_cursor")
            :set_map({ id = cursor_id, projection_id = projection_id, thread_id = thread_id,
                cursor_key = cursor_key, generation = 1, last_seq = start_seq,
                status = "active", debounce_idle_ms = debounce_idle_ms,
                debounce_max_ms = debounce_max_ms, actor_id = actor_id_col,
                execution_identity_json = actor_context_col,
                created_at = now, updated_at = now })
            :run_with(tx):exec()
        local _, proof_err = sql_boundary.exact_row_count(inserted, insert_err,
            "failed to insert cursor", "cursor.insert", 1, response_error)
        if proof_err then return nil, proof_err end
    end
    local job_id, job_err = job_lifecycle.enqueue_job(tx, dbtype, {
        owner_locator = { kind = "thread", id = thread_id },
        job_type = "kickside.core.projections:advance",
        worker_ref = "kickside.core.projections:advance",
        payload = { cursor_id = cursor_id },
        job_identity = { namespace = "projection", scope = cursor_id, key = "slot" },
        slot = true, wake_key = "thread:" .. thread_id,
        parked = cursor_head >= event_count,
    })
    if job_err then return nil, job_err end
    if type(job_id) ~= "string" or job_id == "" then
        return nil, response_error("job_id", "projection slot enqueue returns no job id")
    end
    local linked, link_err = sql.builder.update("kickside_projection_cursor")
        :set("job_id", job_id):where(sql.builder.eq({ id = cursor_id }))
        :run_with(tx):exec()
    local _, link_proof_err = sql_boundary.exact_row_count(linked, link_err,
        "failed to link projection slot", "cursor.link", 1, response_error)
    if link_proof_err then return nil, link_proof_err end
    if params.ensure ~= true and cursor_rows and cursor_rows[1] and (cursor_head < event_count or reset) then
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
function writer.register_projection(db: sql.DB, thread_id: string, params: table): (RegisterResult?, error?)
    local dbtype, dbtype_err = sql_boundary.database_type(db, "failed to resolve db type", "database.type", response_error)
    if dbtype_err then return nil, dbtype_err end
    local result, err = sql_boundary.transaction(db, function(tx: sql.Transaction): (any?, error?)
        return writer.register_projection_tx(tx, dbtype :: string, thread_id, params)
    end, "projection registration", response_error)
    if err then return nil, err end
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
