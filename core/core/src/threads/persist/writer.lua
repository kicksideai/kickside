-- Gated event ingest of the threads slice and the thread lock order. ingest
-- WRITE-gates each thread through the component contract, then appends through
-- the one event writer (threads.persist.append) in a single transaction;
-- append_system and append_system_tx serve the engine without the actor gate.
-- Thread create/update live in threads.persist.thread_crud and delete/purge in
-- threads.persist.teardown.

local sql = require("sql")
local sql_boundary = require("sql_boundary")
local error_envelope = require("error_envelope")
local committed_error = require("committed_error")
local logger = require("logger"):named("kickside.core.threads.persist.writer")
local jobs_wake = require("jobs_wake")
local append = require("threads_append")
local normalize = require("threads_normalize")
local component = require("threads_component")
local masks = require("core_types")
local retention_notifier = require("retention_notifier")

local writer = {}

-- A pooled connection.
type DB = sql.DB

local trim = normalize.trim

local function response_error(field: string): error
    return errors.new({kind = errors.INTERNAL, retryable = false,
        message = "thread writer returns no valid " .. field .. " proof",
        details = {code = "thread_writer_response", field = field}})
end

local function rollback(tx: sql.Transaction, primary: error): error
    return sql_boundary.rollback(tx, primary, "rollback event ingest", response_error, "rollback") :: error
end

local function lock_suffix(dbtype: string): string
    return dbtype == sql.type.SQLITE and "" or "FOR UPDATE"
end

-- The one lock order for thread and projection cursor rows: a transaction that
-- touches both locks the thread rows first, in id order, then the cursors. An
-- append locks its thread and then stamps the thread's cursors; a projection
-- apply that appends, and a thread purge or delete that drops its cursors, lock
-- their threads through here before any cursor row, so no two of them cross.
local function thread_key(dbtype: string, id: string): string
    return dbtype == sql.type.POSTGRES and string.lower(id) or id
end

function writer.lock_thread_rows_tx(tx: sql.Transaction, dbtype: string, thread_ids: { string }): ({ [string]: table }?, error?)
    local seen: { [string]: boolean } = {}
    local ordered: { string } = {}
    for _, raw in ipairs(thread_ids) do
        local id = thread_key(dbtype, normalize.trim(raw))
        if id ~= "" and not seen[id] then seen[id] = true; ordered[#ordered + 1] = id end
    end
    table.sort(ordered)
    local snapshots: { [string]: table } = {}
    if #ordered == 0 then return snapshots, nil end
    local marks: { string } = {}
    for index in ipairs(ordered) do marks[#marks + 1] = "$" .. tostring(index) end
    local lock = lock_suffix(dbtype)
    local rows, err = tx:query("SELECT id,event_count,max_pruned_seq,deleting_at FROM kickside_thread WHERE id IN ("
        .. table.concat(marks, ",") .. ") ORDER BY id ASC " .. lock, ordered)
    rows, err = sql_boundary.rows(rows, err, "failed to lock thread", "lock.rows", response_error)
    if err then return nil, err end
    for _, row in ipairs(rows :: table[]) do
        if type(row.id) ~= "string" or row.id == "" then return nil, response_error("lock.row.id") end
        snapshots[thread_key(dbtype, row.id)] = row
    end
    return snapshots, nil
end

function writer.lock_threads_tx(tx: sql.Transaction, dbtype: string, thread_ids: { string }): error?
    if lock_suffix(dbtype) == "" then return nil end
    local _, err = writer.lock_thread_rows_tx(tx, dbtype, thread_ids)
    return err
end

function writer.dbtype_of(db: DB): (string?, error?)
    local raw, err = db:type()
    if err then return nil, errors.wrap(err, "failed to resolve db type") end
    if type(raw) ~= "string" or raw == "" then return nil, response_error("dialect") end
    return raw, nil
end

-- gate_write resolves a thread's component_id and checks the actor's access at
-- required_mask via the component contract. Returns the thread row on success.
function writer.gate_write(db: DB, thread_id: string, required_mask: integer): (table?, error?)
    local rows, err = sql.builder.select("id", "component_id", "attrs", "event_count")
        :from("kickside_thread")
        :where(sql.builder.eq({ id = thread_id }))
        :limit(1)
        :run_with(db)
        :query()
    rows, err = sql_boundary.bounded_rows(rows, err, "failed to load thread", "gate.rows", 0, 1, response_error)
    if err then return nil, err end
    if not rows or #rows == 0 then
        return nil, errors.new({message = "thread not found", kind = errors.NOT_FOUND, retryable = false,
            details = {code = "thread_writer_not_found"}})
    end
    local thread = rows[1]
    local component_id = trim(thread.component_id)
    if component_id == "" then
        return nil, errors.new({message = "thread has no component", kind = errors.NOT_FOUND, retryable = false,
            details = {code = "thread_writer_component_not_found"}})
    end
    local allowed, access_err = component.has_access(component_id, required_mask)
    if access_err then
        return nil, access_err
    end
    if type(allowed) ~= "boolean" then return nil, response_error("gate.authority") end
    if not allowed then
        return nil, errors.new({message = "access denied", kind = errors.PERMISSION_DENIED, retryable = false,
            details = {code = "thread_writer_access_denied"}})
    end
    return thread, nil
end

-- The result of one thread's batch: thread_id, inserted, duplicates, max_seq,
-- the per-event answers and the published wake generation (threads.persist.append).
type BatchResult = { [string]: any }

-- ingest_multi appends one or more per-thread event batches { thread_id, events } in a
-- SINGLE transaction, so a write spanning several threads commits atomically. Each
-- thread is validated + WRITE-gated (skipped for the system engine) and then locked +
-- appended in thread-id order, so concurrent multi-writes cannot deadlock. Wake
-- demand for all appended threads goes through one wake_multi call: wake rows in
-- ascending key order, then every target job row in ascending id order across the
-- whole transaction. Waking each thread inline would interleave wake and job locks
-- per thread and break that global order. Returns the per-thread BatchResults
-- (each carries its thread_id).
function writer.ingest_multi(db: DB, writes: { table }, actor_id: string?, system: boolean?): ({ BatchResult }?, error?)
    if type(writes) ~= "table" or #writes == 0 then
        return nil, (errors.new({ message = "writes array is required", kind = errors.INVALID, retryable = false, details = {code = "thread_ingest_writes_required"} }) :: error)
    end

    local ordered: { table } = table.create(#writes, 0)
    for i, w in ipairs(writes) do ordered[i] = w end
    table.sort(ordered, function(a, b) return trim(a.thread_id) < trim(b.thread_id) end)

    for _, w in ipairs(ordered) do
        if trim(w.thread_id) == "" then
            return nil, (errors.new({ message = "thread_id is required", kind = errors.INVALID, retryable = false, details = {code = "thread_ingest_thread_required"} }) :: error)
        end
        if type(w.events) ~= "table" or #(w.events :: { table }) == 0 then
            return nil, (errors.new({ message = "events array is required", kind = errors.INVALID, retryable = false, details = {code = "thread_ingest_events_required"} }) :: error)
        end
        if not system then
            local _, gate_err = writer.gate_write(db, trim(w.thread_id), (masks.ACCESS.WRITE :: integer))
            if gate_err then return nil, gate_err end
        end
    end

    local dbtype, dbtype_err = writer.dbtype_of(db)
    if dbtype_err then return nil, dbtype_err end
    local dt = dbtype :: string

    local tx, tx_err = db:begin()
    tx, tx_err = error_envelope.binding(tx, tx_err, "commit", "begin event ingest", "thread_writer_response")
    if not tx_err then
        _, tx_err = error_envelope.binding(tx, nil, "rollback", "begin event ingest", "thread_writer_response")
    end
    if not tx_err then
        _, tx_err = error_envelope.binding(tx, nil, "query", "begin event ingest", "thread_writer_response")
    end
    if tx_err then return nil, tx_err end
    local transaction = tx :: sql.Transaction

    local thread_ids: { string } = table.create(#ordered, 0)
    for i, w in ipairs(ordered) do thread_ids[i] = trim(w.thread_id) end
    local snapshots, lock_err = writer.lock_thread_rows_tx(transaction, dt, thread_ids)
    if lock_err then
        return nil, rollback(transaction, lock_err)
    end

    local results: { BatchResult } = table.create(#ordered, 0)
    local wake_keys: { string } = {}
    for _, w in ipairs(ordered) do
        local snapshot = snapshots[thread_key(dt, trim(w.thread_id))]
        local result, append_err = append.append_events_tx(transaction, trim(w.thread_id), (w.events :: { table }), { defer_wake = true, expect = w.expect, locked_thread = snapshot })
        result, append_err = error_envelope.binding(result, append_err, nil, "append event ingest", "thread_writer_response")
        if append_err then return nil, rollback(transaction, append_err) end
        if snapshot then snapshot.event_count = result.max_seq end
        results[#results + 1] = result :: BatchResult
        if (result :: BatchResult).inserted > 0 then
            wake_keys[#wake_keys + 1] = "thread:" .. trim(w.thread_id)
        end
    end

    local runnable = false
    if #wake_keys > 0 then
        local woken, wake_err = jobs_wake.wake_multi(transaction, wake_keys, dt)
        woken, wake_err = error_envelope.binding(woken, wake_err, nil, "wake event ingest", "thread_writer_response")
        if wake_err then return nil, rollback(transaction, wake_err) end
        for _, result in pairs(woken) do
            if result.touched_count > 0 or result.continuation_id ~= nil then runnable = true end
        end
    end

    local committed, commit_err = transaction:commit()
    if not commit_err and committed ~= true then commit_err = response_error("commit") end
    if commit_err then
        return nil, errors.wrap(committed_error.new(commit_err), "failed to commit multi ingest")
    end
    if #wake_keys > 0 then
        local notified, retention_err = retention_notifier.notify({ kind = "events_appended", thread_ids = wake_keys })
        if not retention_err and type(notified) ~= "boolean" then retention_err = response_error("notification") end
        if retention_err then return nil, committed_error.new(retention_err) end
        if runnable then
            local nudged, nudge_err = jobs_wake.nudge_workers(db, dt)
            if not nudge_err then
                _, nudge_err = sql_boundary.number_value(nudged, "nudge", 0, true, false, response_error)
            end
            if nudge_err then return nil, committed_error.new(nudge_err) end
        end
    end
    return results, nil
end

-- ingest_events_batch appends a batch to a single thread -- a thin wrapper over
-- ingest_multi. params.events is the batch; params.system skips the WRITE gate (the
-- lifecycle engine path).
function writer.ingest_events_batch(db: DB, thread_id: string, params: table, actor_id: string?): (BatchResult?, error?)
    params = type(params) == "table" and params or {}
    local results, err = writer.ingest_multi(db, { { thread_id = thread_id, events = params.events, expect = params.expect } }, actor_id, params.system == true)
    if err then return nil, err end
    return (results :: { BatchResult })[1], nil
end

-- append_system appends engine-owned events (component lifecycle, etc.) to a
-- system/lifecycle thread WITHOUT the actor WRITE gate. It shares all sequencing,
-- dedupe (on the external identity triple), head advance, and cursor-stamp logic
-- with ingest_events_batch; only the gate differs. The caller is the lifecycle
-- engine, never a request actor.
function writer.append_system(db: DB, thread_id: string, events: { table }): (BatchResult?, error?)
    return writer.ingest_events_batch(db, thread_id, { events = events, system = true }, nil)
end

-- append_system_tx appends engine-owned events inside an already-open
-- transaction. The caller owns commit/rollback and scheduler wakeups.
function writer.append_system_tx(tx: sql.Transaction, dbtype: string, thread_id: string, events: { table }, completion_job_id: string?): (BatchResult?, error?)
    return append.append_events_tx(tx, thread_id, events, { completion_job_id = completion_job_id })
end

return writer
