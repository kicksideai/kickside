-- Fenced projection apply and jobs-slot completion. The source thread row is
-- locked before its cursor, and any worker-requested event writes are applied
-- in this same transaction. A stale generation or head cannot publish a fold.
local sql = require("sql")
local json = require("json")
local clock = require("clock")
local registry = require("registry")
local threads_writer = require("threads_writer")
local jobs = require("jobs")
local cursor_waiters = require("cursor_waiters")
local retention_notifier = require("retention_notifier")
local retention_pin = require("retention_pin")
local execution_identity = require("execution_identity")
local error_envelope = require("error_envelope")

local M = {}

local function invalid(message: string): error
    return (errors.new({ message = message, kind = errors.INVALID, retryable = false }) :: error)
end
local function response_error(field: string): error
    return errors.new({message = "projection apply response is invalid", kind = errors.INTERNAL,
        retryable = false, details = {code = "projection_apply_response", field = field}})
end

local function release(db: sql.DB, operation_error: error?): error?
    local _, err = db:release()
    if not err then return operation_error end
    if operation_error then
        return error_envelope.wrap_secondary(err, operation_error, "projection apply DB release failed")
    end
    return errors.wrap(err, "projection apply DB release failed")
end

local function rollback(tx: sql.Transaction, operation_error: error): error
    local _, err = tx:rollback()
    if err then return error_envelope.wrap_secondary(err, operation_error, "projection apply rollback failed") end
    return operation_error
end

local function write_error(result: any, err: error?, message: string, field: string): error?
    if err then return errors.wrap(err, message) end
    if type(result) ~= "table" or type(result.rows_affected) ~= "number" then return response_error(field) end
    return nil
end

function M.process_host(): (string?, error?)
    local entry, err = registry.get("kickside.core.jobs:process_config")
    if err then return nil, errors.wrap(err, "jobs process host unavailable") end
    if type(entry) ~= "table" then return nil, response_error("process_config") end
    local host = entry.meta and entry.meta.host_id
    if type(host) ~= "string" or host == "" then return nil, invalid("jobs process host is not configured") end
    return host, nil
end

local function input_type_set(body: table): table?
    local events = type(body.events) == "table" and body.events or nil
    local input = events and type(events.input) == "table" and events.input or nil
    if not input or #input == 0 then return nil end
    local set: table = {}
    for _, shape in ipairs(input) do
        if type(shape) == "table" and type(shape.type) == "string" then set[shape.type] = true end
    end
    return set
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

local function append_writes(output: table, source_id: string, body: table): (table[]?, error?)
    if output.append_events == nil then return {}, nil end
    if not dense_array(output.append_events) then return nil, invalid("append_events must be a dense array") end
    local writes: table[] = {}
    local types = input_type_set(body)
    for i, write in ipairs(output.append_events) do
        if type(write) ~= "table" or type(write.thread_id) ~= "string" or write.thread_id == "" then
            return nil, invalid("append_events[" .. tostring(i) .. "] needs thread_id")
        end
        local raw = type(write.events) == "table" and write.events or (type(write.event) == "table" and { write.event } or nil)
        if not dense_array(raw) or #raw == 0 then return nil, invalid("append_events[" .. tostring(i) .. "] needs a dense events array") end
        local events: table[] = {}
        for j, event in ipairs(raw) do
            if type(event) ~= "table" or type(event.type) ~= "string" or event.type == "" then
                return nil, invalid("append_events[" .. tostring(i) .. "].events[" .. tostring(j) .. "] needs type")
            end
            if write.thread_id == source_id and (not types or types[event.type]) then
                return nil, invalid("projection append would retrigger its source cursor")
            end
            local copy: table = {}
            for key, value in pairs(event) do copy[key] = value end
            if copy.body_json ~= nil and type(copy.body_json) ~= "string" then
                return nil, invalid("append event body_json must be JSON")
            end
            if copy.body_json == nil then
                local encoded, err = json.encode(copy.body or {})
                if err then return nil, errors.wrap(err, "append event body is not JSON") end
                if type(encoded) ~= "string" then return nil, response_error("append.body_json") end
                copy.body_json = encoded
            end
            copy.body = nil
            events[#events + 1] = copy
        end
        writes[#writes + 1] = { thread_id = write.thread_id, events = events }
    end
    return writes, nil
end

local function next_body(before: table, output: table): (table?, error?)
    local result: table = before
    if output.body ~= nil then
        if type(output.body) ~= "table" then return nil, invalid("projection worker body must be an object") end
        result = output.body
    elseif output.patch ~= nil then
        if type(output.patch) ~= "table" then return nil, invalid("projection worker patch must be an object") end
        for key, value in pairs(output.patch) do result[key] = value end
    end
    for _, key in ipairs({ "meta", "worker_config", "events", "drop_notify" }) do
        if result[key] == nil then result[key] = before[key] end
    end
    return result, nil
end

local function completion(tx: sql.Transaction, job: table, opts: table): (table?, error?)
    local done, err = jobs.complete_tx(tx, tostring(job.id), {
        token = tostring(job.lease_token), execution_seq = tonumber(job.execution_seq),
    }, opts)
    if err then return nil, err end
    if type(done) ~= "table" then return nil, response_error("completion") end
    return done, nil
end

local function advance_tx(db: sql.DB, job: table, snapshot: table, prefetched_last: number, output: table, writes: table[]): (table?, error?)
    local raw_type, type_err = db:type()
    if type_err then return nil, errors.wrap(type_err, "projection dialect unavailable") end
    if type(raw_type) ~= "string" or raw_type == "" then return nil, response_error("database.type") end
    local dbtype = raw_type :: string
    local body = snapshot.body :: table
    local ids: string[] = { tostring(snapshot.thread_id) }
    for _, write in ipairs(writes :: table[]) do ids[#ids + 1] = tostring(write.thread_id) end
    local tx, begin_err = db:begin()
    if begin_err then return nil, errors.wrap(begin_err, "projection apply begin failed") end
    if type(tx) ~= "table" and type(tx) ~= "userdata" then return nil, response_error("transaction") end
    local function abort(err: error): (nil, error)
        return nil, rollback(tx, err)
    end
    local locked_threads, lock_err = threads_writer.lock_thread_rows_tx(tx, dbtype, ids)
    if lock_err then return abort(lock_err) end
    if type(locked_threads) ~= "table" then return abort(response_error("locked_threads")) end
    local source_thread = locked_threads[tostring(snapshot.thread_id)]
    local current_head = tonumber(source_thread and source_thread.event_count)
    if current_head == nil then return abort(response_error("thread.head")) end
    local suffix = dbtype == sql.type.POSTGRES and " FOR UPDATE" or ""
    local rows, cursor_err = tx:query([[SELECT generation,last_seq,status,job_id FROM kickside_projection_cursor
        WHERE id=$1]] .. suffix, { snapshot.id })
    if cursor_err then return abort(errors.wrap(cursor_err, "projection fence read failed")) end
    if type(rows) ~= "table" then return abort(response_error("cursor.rows")) end
    local cursor = rows[1]
    if not cursor then return abort(errors.new({message = "projection cursor removed", kind = errors.NOT_FOUND, retryable = false})) end
    if tostring(cursor.job_id or "") ~= tostring(job.id) then
        return abort(errors.new({message = "projection slot changed", kind = errors.CONFLICT, retryable = false}))
    end
    if cursor.status ~= "active" or tonumber(cursor.generation) ~= tonumber(snapshot.generation)
        or tonumber(cursor.last_seq) ~= tonumber(snapshot.last_seq) then
        local options: table = { rearm = clock.now(dbtype) }
        if cursor.status ~= "active" then options = { record = { status = "parked" } } end
        local done, done_err = completion(tx, job, options)
        if done_err then return abort(done_err) end
        local _, commit_err = tx:commit()
        if commit_err then return nil, errors.wrap(commit_err, "stale projection completion failed") end
        local _, notify_err = cursor_waiters.notify_cursor(snapshot.id, tonumber(cursor.last_seq), tostring(cursor.status))
        if notify_err then return nil, notify_err end
        return { self_completed = true, completion = done, stale = true }, nil
    end

    local prior = tonumber(snapshot.last_seq)
    if prior == nil then return abort(response_error("cursor.last_seq")) end
    local last = prefetched_last
    if output.last_seq ~= nil then
        local reported = tonumber(output.last_seq)
        if not reported or reported < prior or reported > prefetched_last then
            return abort(invalid("projection worker last_seq is outside the loaded range"))
        end
        last = reported
    end
    local folded, fold_err = next_body(body, output)
    if fold_err then return abort(fold_err) end
    local encoded, encode_err = json.encode(folded)
    if encode_err then return abort(errors.wrap(encode_err, "projection worker body is not JSON")) end
    if type(encoded) ~= "string" then return abort(response_error("body_json")) end
    local now = clock.now(dbtype)
    local updated, update_err = tx:execute([[UPDATE kickside_projection SET body=$1,state='valid',last_event_seq=$2,
        updated_at=$3 WHERE id=$4]], { encoded, last, now, snapshot.projection_id })
    local fold_write_err = write_error(updated, update_err, "projection fold write failed", "projection.update")
    if fold_write_err then return abort(fold_write_err) end
    local headed, head_err = tx:execute([[UPDATE kickside_projection_cursor SET last_seq=$1,
        last_error=$2,updated_at=$3 WHERE id=$4 AND generation=$5 AND last_seq=$6 AND status='active']],
        { last, output.last_error, now, snapshot.id, snapshot.generation, snapshot.last_seq })
    local head_write_err = write_error(headed, head_err, "projection cursor advance failed", "cursor.update")
    if head_write_err then return abort(head_write_err) end
    for _, write in ipairs(writes :: table[]) do
        local appended, append_err = threads_writer.append_system_tx(tx, dbtype, tostring(write.thread_id), write.events)
        if append_err then return abort(append_err) end
        if type(appended) ~= "table" or type(appended.max_seq) ~= "number" then return abort(response_error("append")) end
        if write.thread_id == snapshot.thread_id then current_head = appended.max_seq end
    end
    local options: table = {}
    if last < current_head then options.rearm = now else options.demand_satisfied = true end
    if last > prior then options.record = { status = "completed" } end
    local done, done_err = completion(tx, job, options)
    if done_err then return abort(done_err) end
    local _, commit_err = tx:commit()
    if commit_err then return nil, errors.wrap(commit_err, "projection apply commit failed") end
    local _, notify_err = cursor_waiters.notify_cursor(snapshot.id, last, "active")
    if notify_err then return nil, notify_err end
    if last > prior or #(writes :: table[]) > 0 then
        local _, retention_notify_err = retention_notifier.notify({ kind = "projection_eligibility_changed",
            thread_id = snapshot.thread_id })
        if retention_notify_err then return nil, retention_notify_err end
    end
    return { self_completed = true, completion = done, last_seq = last }, nil
end

-- Record a worker failure on the cursor that ran it, fenced on the snapshot's
-- generation and head. A deterministic failure is the projection's verdict: the
-- cursor and projection turn invalid with the error, and the slot completes
-- with failed history and parks, so new events cannot re-run it until a
-- corrected declaration re-registers it. An infrastructure failure keeps the
-- cursor active with its last_error and returns to Jobs, which retries the
-- slot. Returns the self-completion of a deterministic failure, else nil.
function M.fail(db_id: string, job: table, snapshot: table, failure: error, deterministic: boolean): (table?, error?)
    local db, db_err = sql.get(db_id)
    if db_err then return nil, errors.wrap(db_err, "projection failure DB unavailable") end
    if type(db) ~= "table" and type(db) ~= "userdata" then return nil, response_error("database") end
    local raw_type, type_err = db:type()
    if type_err then return nil, release(db, errors.wrap(type_err, "projection failure dialect unavailable")) end
    if type(raw_type) ~= "string" or raw_type == "" then return nil, release(db, response_error("database.type")) end
    local dbtype = raw_type :: string
    local message = tostring(failure)
    local tx, begin_err = db:begin()
    if begin_err then return nil, release(db, errors.wrap(begin_err, "projection failure begin failed")) end
    if type(tx) ~= "table" and type(tx) ~= "userdata" then return nil, release(db, response_error("transaction")) end
    local function abort(err: error): (nil, error)
        return nil, release(db, rollback(tx, err)) :: error
    end
    if deterministic then
        local locked, lock_err = threads_writer.lock_thread_rows_tx(tx, dbtype, { tostring(snapshot.thread_id) })
        if lock_err then return abort(lock_err) end
        if type(locked) ~= "table" then return abort(response_error("locked_threads")) end
        local rows, read_err = tx:query([[SELECT generation,last_seq,status,job_id FROM kickside_projection_cursor
            WHERE id=$1]], { snapshot.id })
        if read_err then return abort(errors.wrap(read_err, "projection failure fence read failed")) end
        if type(rows) ~= "table" then return abort(response_error("cursor.rows")) end
        local current = rows[1]
        if current and current.status == "active" and tostring(current.job_id) == tostring(job.id)
            and tonumber(current.generation) == tonumber(snapshot.generation)
            and tonumber(current.last_seq) == tonumber(snapshot.last_seq) then
            local held, pin_err = retention_pin.lower_tx(tx, { thread_id = snapshot.thread_id,
                consumer_key = "projection:" .. tostring(snapshot.id),
                command_id = tostring(snapshot.id) .. ":" .. tostring(snapshot.generation),
                command_generation = tonumber(snapshot.generation), target_cursor = tonumber(snapshot.last_seq) })
            if pin_err then return abort(pin_err) end
            if type(held) ~= "table" then return abort(response_error("retention.pin")) end
        end
    end
    local now = clock.now(dbtype)
    local fenced, fence_err = tx:execute([[UPDATE kickside_projection_cursor SET status=$1,last_error=$2,updated_at=$3
        WHERE id=$4 AND job_id=$5 AND generation=$6 AND last_seq=$7 AND status='active']],
        { deterministic and "invalid" or "active", message, now, snapshot.id, tostring(job.id),
            snapshot.generation, snapshot.last_seq })
    local fence_write_err = write_error(fenced, fence_err, "projection failure record failed", "failure.fence")
    if fence_write_err then return abort(fence_write_err) end
    local recorded = fenced.rows_affected == 1
    local result: table? = nil
    if recorded and deterministic then
        local state, state_err = tx:execute("UPDATE kickside_projection SET state='invalid',updated_at=$1 WHERE id=$2",
            { now, snapshot.projection_id })
        local state_write_err = write_error(state, state_err, "projection invalidation failed", "projection.invalidate")
        if state_write_err then return abort(state_write_err) end
        local done, done_err = completion(tx, job, { park = true, record = { status = "failed", error = message }, demand_satisfied = true })
        if done_err then return abort(done_err) end
        result = { self_completed = true, completion = done, invalid = true }
    end
    local _, commit_err = tx:commit()
    local finish_err = release(db, commit_err and errors.wrap(commit_err, "projection failure commit failed") or nil)
    if finish_err then return nil, finish_err end
    if result then
        local _, notify_err = cursor_waiters.notify_cursor(tostring(snapshot.id), tonumber(snapshot.last_seq), "invalid")
        if notify_err then return nil, notify_err end
    end
    return result, nil
end

-- Resolve returned writes live before taking an apply connection. Actor-bound
-- authorization re-enters Component and Threads, including SQLite's single pool.
function M.advance(db_id: string, job: table, snapshot: table, prefetched_last: number, output: table): (table?, error?)
    local writes, write_err = append_writes(output, tostring(snapshot.thread_id), snapshot.body)
    if write_err then return nil, write_err end
    if #writes > 0 and (snapshot.actor_id ~= nil or snapshot.execution_identity_json ~= nil) then
        local identity, identity_err = execution_identity.from_row(snapshot.actor_id, snapshot.execution_identity_json)
        if identity_err then return nil, identity_err end
        if type(identity) ~= "table" then return nil, response_error("execution_identity") end
        local admitted, admission_err = execution_identity.run_as(identity,
            "kickside.core.threads:authorize_projection_writes", { writes = writes }, {
                deferred_owner = "kickside.core.projections:tick", execution_root = identity.component_id,
            })
        if admission_err then return nil, admission_err end
        if type(admitted) ~= "table" or type(admitted.writes) ~= "table" then
            return nil, response_error("admitted.writes")
        end
        writes = admitted.writes
    end
    local db, db_err = sql.get(db_id)
    if db_err then return nil, errors.wrap(db_err, "projection apply DB unavailable") end
    if type(db) ~= "table" and type(db) ~= "userdata" then return nil, response_error("database") end
    local result, apply_err = advance_tx(db, job, snapshot, prefetched_last, output, writes)
    local finish_err = release(db, apply_err)
    if finish_err then return nil, finish_err end
    return result, nil
end

return M
