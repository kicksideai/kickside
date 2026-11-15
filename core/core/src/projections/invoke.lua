-- One jobs-slot attempt over a projection cursor. Jobs owns claim, lease,
-- heartbeat, retry and completion; this module only reads an event range and
-- invokes the registered fold under its stored execution identity.
local sql = require("sql")
local json = require("json")
local time = require("time")
local clock = require("clock")
local core_db = require("core_db")
local worker = require("worker")
local projection_policy = require("projection_policy")
local apply = require("apply")
local trace_context = require("trace_context")
local jobs = require("jobs")
local execution_identity = require("execution_identity")
local job_types = require("job_types")
local error_envelope = require("error_envelope")
local owner_identity = require("owner_identity")
local access_subjects = require("access_subjects")

local M = {}

local function response_error(field: string): error
    return errors.new({message = "projection invocation response is invalid", kind = errors.INTERNAL,
        retryable = false, details = {code = "projection_invoke_response", field = field}})
end

local function release(db: sql.DB, operation_error: error?): error?
    local _, err = db:release()
    if not err then return operation_error end
    if operation_error then
        return error_envelope.wrap_secondary(err, operation_error, "projection DB release failed")
    end
    return errors.wrap(err, "projection DB release failed")
end

local function body_from(raw: any): (table?, error?)
    if type(raw) == "table" then return raw :: table, nil end
    if type(raw) ~= "string" or raw == "" then
        return nil, response_error("body")
    end
    local body, err = json.decode(raw)
    if err then return nil, errors.wrap(err, "projection body invalid") end
    if type(body) ~= "table" then return nil, response_error("body") end
    return body :: table, nil
end

local function event_types(body: table): { string }?
    local events = type(body.events) == "table" and body.events or nil
    local declared = events and type(events.input) == "table" and events.input or nil
    if not declared or #declared == 0 then return nil end
    local out: { string } = {}
    for _, shape in ipairs(declared) do
        if type(shape) == "table" and type(shape.type) == "string" and shape.type ~= "" then
            out[#out + 1] = shape.type
        end
    end
    return #out > 0 and out or nil
end

-- Compose the canonical effective-access query into the existing owner read.
-- Maintenance frames carry only their user-typed actor subject, without groups
-- or path restrictions. Values remain fresh for every invocation.
local maintenance_access, maintenance_args = access_subjects.effective_mask_query(
    {{subject_type = "user", subject_id = "owner"}}, "component")
local references = {component = "o.component_id", owner = "m.value", user = "'user'"}
maintenance_access = maintenance_access:gsub("%$(%d+)", function(index: string): string
    return references[maintenance_args[tonumber(index) :: number]] :: string
end)
local MAINTENANCE_ACCESS = "COALESCE((" .. maintenance_access .. "),0)"

local function snapshot_statement(dialect: string): string
    local component_key = "COALESCE(NULLIF(t.component_id,''),t.attrs ->> 'component_id')"
    local stored_identity = "CASE WHEN json_valid(o.private_context) THEN o.private_context -> '$._execution_identity' END"
    local readable = "CASE WHEN json_valid(o.private_context) THEN json_type(o.private_context) IN ('object','array') ELSE 0 END"
    if dialect == sql.type.POSTGRES then
        component_key = "CAST(" .. component_key .. " AS UUID)"
        stored_identity = "(o.private_context -> '_execution_identity')::text"
        readable = "jsonb_typeof(o.private_context) IN ('object','array')"
    end
    return [[SELECT c.id,c.projection_id,c.thread_id,c.cursor_key,c.last_seq,
        c.generation,c.status,c.job_id,c.debounce_idle_ms,c.debounce_max_ms,
        c.actor_id,c.execution_identity_json,p.kind,p.body,p.projection_key,t.event_count,
        p.actor_id AS projection_actor_id,p.actor_context AS projection_actor_context,
        t.component_id AS thread_component_id,t.attrs AS thread_attrs,
        o.component_id AS owner_component_id,o.impl_id AS owner_impl_id,
        o.identity_generation AS owner_identity_generation,m.value AS owner_key,]] .. stored_identity .. [[ AS owner_execution_identity,
        ]] .. readable .. [[ AS owner_context_readable,CASE WHEN ]] .. stored_identity
        .. [[ IS NULL THEN ]] .. MAINTENANCE_ACCESS .. [[ END AS maintenance_access_mask
        FROM kickside_projection_cursor c
        JOIN kickside_projection p ON p.id=c.projection_id
        JOIN kickside_thread t ON t.id=c.thread_id
        LEFT JOIN kickside_components o ON o.component_id=]] .. component_key .. [[
        LEFT JOIN kickside_component_meta m ON m.component_id=o.component_id AND m.key='owner'
        WHERE c.id=$1 ]]
end
local POSTGRES_SNAPSHOT = snapshot_statement(sql.type.POSTGRES)
local SQLITE_SNAPSHOT = snapshot_statement(sql.type.SQLITE)

local function snapshot(db: sql.DB, cursor_id: string, job_id: string): (table?, error?)
    local dialect, dialect_err = db:type()
    if dialect_err then return nil, dialect_err end
    local rows, err = db:query(dialect == sql.type.POSTGRES and POSTGRES_SNAPSHOT or SQLITE_SNAPSHOT, {cursor_id})
    if err then return nil, errors.wrap(err, "projection snapshot failed") end
    if type(rows) ~= "table" then return nil, response_error("snapshot.rows") end
    local row = rows[1]
    if not row then return nil, (errors.new({ message = "projection cursor not found", kind = errors.NOT_FOUND }) :: error) end
    if tostring(row.job_id or "") ~= job_id then
        return nil, (errors.new({ message = "projection cursor slot mismatch", kind = errors.CONFLICT }) :: error)
    end
    local body, body_err = body_from(row.body)
    if body_err then return nil, body_err end
    row.body = body
    local authority, authority_err = owner_identity.from_snapshot(row)
    if authority_err then
        row.authority_error = authority_err
    else
        row.component_authority = authority
        if not authority then
            if row.execution_identity_json ~= nil then
                local identity, identity_err = execution_identity.from_row(row.actor_id, row.execution_identity_json)
                if identity_err then return nil, identity_err end
                if type(identity) ~= "table" then return nil, response_error("execution_identity") end
                row.identity = identity
            elseif row.actor_id ~= nil then
                return nil, errors.new({message = "projection cursor has no trusted execution identity", kind = errors.INVALID})
            end
        end
    end
    return row, nil
end
M.snapshot = snapshot

local TIMESTAMP_LAYOUTS = {
    "2006-01-02T15:04:05.999999999Z07:00",
    "2006-01-02 15:04:05.999999999Z07:00",
    "2006-01-02 15:04:05.999999999-07",
    "2006-01-02 15:04:05.999999999",
}

local function parsed_time(raw: any): (any?, error?)
    if type(raw) ~= "string" or raw == "" then return nil, response_error("event.created_at") end
    local parse_error: error? = nil
    for _, layout in ipairs(TIMESTAMP_LAYOUTS) do
        local value, err = time.parse(layout, raw)
        if value and not err then
            if type(value) ~= "userdata" then return nil, response_error("event.created_at") end
            return value, nil
        end
        if err then parse_error = err end
    end
    if parse_error then return nil, errors.wrap(parse_error, "projection event timestamp invalid") end
    return nil, response_error("event.created_at")
end

local function debounce_due(db: sql.DB, row: table): (string?, error?)
    local idle = tonumber(row.debounce_idle_ms)
    local maximum = tonumber(row.debounce_max_ms)
    if not idle or not maximum or idle < 0 or maximum < 0 then
        return nil, response_error("debounce")
    end
    if idle == 0 then return nil, nil end
    if maximum == 0 then return nil, (errors.new({
        message = "projection idle debounce requires a maximum duration", kind = errors.INVALID,
    }) :: error) end
    local first, first_err = db:query([[SELECT created_at FROM kickside_event
        WHERE thread_id=$1 AND seq>$2 ORDER BY seq ASC LIMIT 1]], { row.thread_id, row.last_seq })
    if first_err then return nil, errors.wrap(first_err, "projection debounce first event read failed") end
    local latest, latest_err = db:query([[SELECT created_at FROM kickside_event
        WHERE thread_id=$1 AND seq>$2 ORDER BY seq DESC LIMIT 1]], { row.thread_id, row.last_seq })
    if latest_err then return nil, errors.wrap(latest_err, "projection debounce latest event read failed") end
    if type(first) ~= "table" or type(first[1]) ~= "table" then return nil, response_error("debounce.first") end
    if type(latest) ~= "table" or type(latest[1]) ~= "table" then return nil, response_error("debounce.latest") end
    local opened, open_err = parsed_time(first[1].created_at)
    if open_err then return nil, open_err end
    local last, last_err = parsed_time(latest[1].created_at)
    if last_err then return nil, last_err end
    local idle_due = (last :: any):add(idle * time.MILLISECOND)
    local max_due = (opened :: any):add(maximum * time.MILLISECOND)
    local due = idle_due:before(max_due) and idle_due or max_due
    if not due:after(time.now()) then return nil, nil end
    local raw_type, type_err = db:type()
    if type_err then return nil, errors.wrap(type_err, "projection debounce dialect unavailable") end
    if type(raw_type) ~= "string" or raw_type == "" then return nil, response_error("database.type") end
    return clock.format(due, raw_type), nil
end

local function defer(db: sql.DB, job: table, due: string): (table?, error?)
    local tx, begin_err = db:begin()
    if begin_err then return nil, errors.wrap(begin_err, "projection debounce begin failed") end
    if type(tx) ~= "table" and type(tx) ~= "userdata" then return nil, response_error("transaction") end
    local done, done_err = jobs.complete_tx(tx, tostring(job.id), {
        token = tostring(job.lease_token), execution_seq = tonumber(job.execution_seq),
    }, { rearm = due, defer_demand = true })
    if not done_err and type(done) ~= "table" then done_err = response_error("completion") end
    if done_err then
        local _, rollback_err = tx:rollback()
        if rollback_err then return nil, error_envelope.wrap_secondary(rollback_err, done_err, "projection debounce rollback failed") end
        return nil, done_err
    end
    local _, commit_err = tx:commit()
    if commit_err then return nil, errors.wrap(commit_err, "projection debounce commit failed") end
    return { self_completed = true, completion = done, deferred_until = due }, nil
end

function M.run(input: any): (table?, error?)
    local job = type(input) == "table" and input.job or nil
    local payload = type(input) == "table" and input.payload or nil
    local cursor_id = type(payload) == "table" and payload.cursor_id or nil
    if type(job) ~= "table" or type(job.id) ~= "string" or type(cursor_id) ~= "string" then
        return nil, (errors.new({ message = "projection slot input requires job and cursor_id", kind = errors.INVALID }) :: error)
    end
    local pol, pol_err = projection_policy.policy()
    if pol_err then return nil, pol_err end
    if type(pol) ~= "table" then return nil, response_error("policy") end
    local page_size = pol.apply_batch_size
    local db_id = core_db.id()
    local db, db_err = sql.get(db_id)
    if db_err then return nil, errors.wrap(db_err, "projection DB unavailable") end
    if type(db) ~= "table" and type(db) ~= "userdata" then return nil, response_error("database") end
    local row, row_err = snapshot(db, cursor_id, job.id)
    if row_err then return nil, release(db, row_err) end
    local current = row :: table
    if current.authority_error and current.status == "active" then
        local release_err = release(db, nil)
        if release_err then return nil, release_err end
        local deterministic = job_types.is_deterministic_kind(current.authority_error:kind())
        local result, fail_err = apply.fail(db_id, job, current, current.authority_error, deterministic)
        if result or fail_err then return result, fail_err end
        return nil, current.authority_error
    end
    local head = tonumber(current.event_count)
    local last = tonumber(current.last_seq)
    if head == nil or last == nil then
        return nil, release(db, response_error("cursor.position"))
    end
    local target = math.min(head, last + page_size)
    if current.status == "active" and head > last then
        local due, due_err = debounce_due(db, current)
        if due_err then return nil, release(db, due_err) end
        if due then
            local result, defer_err = defer(db, job, due)
            local final_err = release(db, defer_err)
            if final_err then return nil, final_err end
            return result, nil
        end
    end
    local post_commit: table? = nil
    local committed_input: table? = nil
    local output: table? = {}
    local seen_last = last
    if current.status == "active" and head > last then
        local body = current.body :: table
        local meta = type(body.meta) == "table" and body.meta or {}
        local ref = meta.worker_ref
        local parsed, parse_err = worker.parse(ref, true)
        if parse_err then return nil, release(db, parse_err) end
        if type(parsed) ~= "table" then return nil, release(db, response_error("worker.reference")) end
        local system_identity = current.execution_identity_json == nil
        local binding, binding_err = worker.validate(parsed, system_identity)
        if binding_err then return nil, release(db, binding_err) end
        if type(binding) ~= "table" then return nil, release(db, response_error("worker.binding")) end
        binding.actor_id = current.actor_id
        binding.actor_context = current.execution_identity_json
        binding.system_identity = system_identity
        binding.component_authority = current.component_authority
        binding.maintenance_access_mask = current.maintenance_access_mask
        local post_err: error? = nil
        post_commit, post_err = worker.post_commit_binding(binding)
        if post_err then return nil, release(db, post_err) end
        local types = event_types(body)
        local events, events_err = worker.query_event_rows(db, tostring(current.thread_id), last + 1, target, page_size, types)
        if events_err then return nil, release(db, events_err) end
        if type(events) ~= "table" then return nil, release(db, response_error("events")) end
        local batch = events :: table[]
        seen_last = target
        if not types and #batch > 0 then seen_last = tonumber(batch[#batch].seq) or last end
        local mode = meta.worker_input_mode == "prefetch_events" and "prefetch_events" or "cursor_only"
        local work_input = {
            thread_id = current.thread_id,
            trace_context = trace_context.common(batch),
            worker_input_mode = mode,
            cursor = { id = cursor_id, cursor_key = current.cursor_key, last_seq = last,
                target_seq = target, batch_size = page_size, generation = tonumber(current.generation) },
            projection = { id = current.projection_id, kind = current.kind, body = body },
            range = { from_seq = last + 1, to_seq = seen_last, target_seq = target, processed_count = #batch },
            events = mode == "prefetch_events" and batch or nil,
        }
        if #batch > 0 then
            committed_input = work_input
            -- Workers may read or write the shared core database. SQLite has a
            -- single pooled connection, so the snapshot handle must be returned
            -- before invoking either a function or a monitored process.
            local release_err = release(db, nil)
            if release_err then return nil, release_err end
            local execution_frame: table? = nil
            if binding.worker_runtime == "proc" then
                local host, host_err = apply.process_host()
                if host_err then return nil, host_err end
                if type(host) ~= "string" or host == "" then return nil, response_error("process_host") end
                output, row_err, execution_frame = worker.run_proc_supervised(binding, work_input, {
                    proc_host = host,
                })
            else
                output, row_err, execution_frame = worker.run(binding, work_input)
            end
            if row_err then
                -- Only the worker's own failure is the projection's outcome;
                -- binding and identity failures stay with Jobs.
                local details = (row_err :: error):details()
                if type(details) ~= "table" or details.reason ~= worker.WORKER_FAILED then
                    if current.component_authority and job_types.is_deterministic_kind(row_err:kind()) then
                        return apply.fail(db_id, job, current, row_err, true)
                    end
                    return nil, row_err
                end
                local deterministic = job_types.is_deterministic_kind((row_err :: error):kind())
                local failed, fail_err = apply.fail(db_id, job, current, row_err :: error, deterministic)
                if fail_err then return nil, fail_err end
                if failed then return failed, nil end
                return nil, row_err
            end
            current.execution_frame = execution_frame
            db = nil
        end
    end
    if db then
        local release_err = release(db, nil)
        if release_err then return nil, release_err end
    end
    if type(output) ~= "table" then return nil, response_error("worker.output") end
    local result, apply_err = apply.advance(db_id, job, current, seen_last, output)
    if apply_err then
        if current.component_authority and job_types.is_deterministic_kind(apply_err:kind()) then
            return apply.fail(db_id, job, current, apply_err, true)
        end
        return nil, apply_err
    end
    if type(result) ~= "table" then return nil, response_error("advance") end
    -- Match apply's cursor/retention notifications: successful durable commit
    -- first. Release the pool handle before a callback may use the same DB,
    -- especially SQLite's single connection. Stale and empty folds never notify.
    if not result.stale and post_commit and committed_input
        and tonumber(result.last_seq) and tonumber(result.last_seq) > last then
        if current.component_authority then
            local callback_db, callback_open_err = sql.get(db_id)
            if callback_open_err then return nil, callback_open_err end
            if not callback_db then return nil, response_error("callback.database") end
            local rows, fresh_err = callback_db:query([[SELECT c.generation,c.status,c.last_seq,c.job_id,
                o.identity_generation AS owner_identity_generation
                FROM kickside_projection_cursor c
                LEFT JOIN kickside_components o ON o.component_id=$1
                WHERE c.id=$2]],
                {current.component_authority.component_id, cursor_id})
            fresh_err = release(callback_db, fresh_err)
            if fresh_err then return nil, fresh_err end
            if type(rows) ~= "table" then return nil, response_error("callback.rows") end
            local fresh = rows[1]
            if not fresh or tonumber(fresh.owner_identity_generation) ~= current.component_authority.generation
                or tonumber(fresh.generation) ~= tonumber(current.generation) or fresh.status ~= "active"
                or fresh.job_id ~= job.id or tonumber(fresh.last_seq) ~= tonumber(result.last_seq) then
                result.stale = true
                return result, nil
            end
            local declared, declaration_err = owner_identity.check_declaration(current.component_authority.declaration)
            if declaration_err or not declared then
                local failed_snapshot: table = {}
                for key, value in pairs(current) do failed_snapshot[key] = value end
                failed_snapshot.last_seq = result.last_seq
                return apply.fail(db_id, job, failed_snapshot, declaration_err or errors.new({
                    kind = errors.PERMISSION_DENIED, retryable = false,
                    message = "component projection declaration is removed before its callback",
                    details = {code = "projection_owner_declaration_changed"}}), true, result.completion)
            end
        end
        committed_input.projection.body = output.body or current.body
        committed_input.range.to_seq = result.last_seq
        local _, post_err = worker.run(post_commit, committed_input, current.execution_frame)
        if post_err then
            if current.component_authority and job_types.is_deterministic_kind(post_err:kind()) then
                local failed_snapshot: table = {}
                for key, value in pairs(current) do failed_snapshot[key] = value end
                failed_snapshot.last_seq = result.last_seq
                return apply.fail(db_id, job, failed_snapshot, post_err, true, result.completion)
            end
            return nil, post_err
        end
    end
    return result, nil
end

return M
