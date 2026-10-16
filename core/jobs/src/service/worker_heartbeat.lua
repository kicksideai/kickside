local sql = require("sql")
local time = require("time")
local channel = require("channel")
local process = require("process")
local clock = require("clock")
local cfg = require("config")
local sql_boundary = require("sql_boundary")

local heartbeat = {}
local PROCESS_ID = "kickside.core.jobs.service:worker_heartbeat"

local function response_error(field: string): error
    return errors.new({message = "worker heartbeat response is invalid", kind = errors.INTERNAL,
        retryable = false, details = {code = "job_heartbeat_response", field = field}})
end

function heartbeat.mark(db, dbtype, worker_id, registry_version): error?
    local now = clock.now(dbtype)
    local tx, begin_err = sql_boundary.begin(db, "worker registration begin failed", "transaction", response_error)
    if begin_err or not tx then return begin_err or response_error("transaction") end
    local result, err = sql.builder.insert("kickside_job_worker")
        :set_map({ id = worker_id, registry_version = registry_version, last_seen_at = now })
        :suffix("ON CONFLICT (id) DO UPDATE SET registry_version = excluded.registry_version, last_seen_at = excluded.last_seen_at")
        :run_with(tx):exec()
    local count, write_err = sql_boundary.single_row_count(result, err, "worker heartbeat failed", "worker.rows_affected", response_error)
    if write_err then return sql_boundary.rollback(tx, write_err, "worker registration rollback failed") end
    if count ~= 1 then return sql_boundary.rollback(tx, response_error("worker.rows_affected"), "worker registration rollback failed") end
    local pulse_result, pulse_err = sql.builder.insert("kickside_job_worker_pulse")
        :set_map({ worker_id = worker_id, registry_version = registry_version, last_seen_at = now })
        :suffix("ON CONFLICT (worker_id) DO UPDATE SET registry_version = excluded.registry_version, last_seen_at = excluded.last_seen_at")
        :run_with(tx):exec()
    local pulse_count, registration_err = sql_boundary.single_row_count(pulse_result, pulse_err,
        "worker heartbeat registration failed", "pulse.rows_affected", response_error)
    if registration_err then return sql_boundary.rollback(tx, registration_err, "worker registration rollback failed") end
    if pulse_count ~= 1 then return sql_boundary.rollback(tx, response_error("pulse.rows_affected"), "worker registration rollback failed") end
    local _, commit_err = tx:commit()
    if commit_err then return errors.wrap(commit_err, "worker registration commit failed") end
    return nil
end

-- The ongoing heartbeat touches only the pulse row. Claims and marker clears
-- may hold the worker row without delaying liveness supervision.
function heartbeat.pulse(db, dbtype, worker_id, registry_version): error?
    local result, err = sql.builder.update("kickside_job_worker_pulse")
        :set("last_seen_at", clock.now(dbtype))
        :set("registry_version", registry_version)
        :where(sql.builder.eq({ worker_id = worker_id }))
        :where("EXISTS (SELECT 1 FROM kickside_job_worker w WHERE w.id = kickside_job_worker_pulse.worker_id)")
        :run_with(db):exec()
    local count, pulse_err = sql_boundary.single_row_count(result, err, "worker heartbeat failed", "pulse.rows_affected", response_error)
    if pulse_err then return pulse_err end
    if count == 0 then
        return (errors.new({ message = "worker heartbeat row missing", kind = errors.NOT_FOUND, retryable = false }) :: error)
    end
    return nil
end

function heartbeat.start(worker_id, registry_version, interval): (string?, error?)
    local pid, err = process.spawn_linked_monitored(PROCESS_ID, cfg.process_host(), {
        worker_id = worker_id,
        registry_version = registry_version,
        interval = interval or "1s",
    })
    if err then return nil, errors.wrap(err, "worker heartbeat spawn failed") end
    if not pid then return nil, response_error("process.id") end
    return tostring(pid), nil
end

function heartbeat.stop(pid: string?): error?
    if not pid then return nil end
    local accepted, err = process.cancel(pid, "1s")
    if err then return errors.wrap(err, "worker heartbeat cancellation failed") end
    if accepted ~= true then return response_error("process.cancel") end
    return nil
end

function heartbeat.main(args: table): ()
    args = type(args) == "table" and args or {}
    local worker_id = tostring(args.worker_id or "")
    local registry_version = tostring(args.registry_version or "")
    if worker_id == "" or registry_version == "" then
        error(errors.new({message = "worker heartbeat missing worker id or registry version", kind = errors.INVALID,
            retryable = false, details = {code = "job_heartbeat_identity"}}))
    end
    local db, db_err = sql.get(cfg.db_id())
    if db_err then error(errors.wrap(db_err, "worker heartbeat db unavailable")) end
    if not db then error(response_error("database")) end
    local raw_type, type_err = db:type()
    if type_err then error(sql_boundary.release(db, errors.wrap(type_err, "worker heartbeat db type failed"), "worker heartbeat db release failed")) end
    if raw_type ~= sql.type.SQLITE and raw_type ~= sql.type.POSTGRES then
        error(sql_boundary.release(db, response_error("database.type"), "worker heartbeat db release failed"))
    end
    local dbtype = raw_type :: string
    local interval = type(args.interval) == "string" and args.interval or "1s"
    local events_ch = process.events()
    while true do
        local err = heartbeat.pulse(db, dbtype, worker_id, registry_version)
        if err then error(sql_boundary.release(db, err, "worker heartbeat db release failed")) end
        local tick = time.after(interval)
        local result = channel.select({ events_ch:case_receive(), tick:case_receive() })
        if result.channel == events_ch then
            local event = result.value
            if type(event) == "table" and event.kind == process.event.CANCEL then
                local release_err = sql_boundary.release(db, nil, "worker heartbeat db release failed")
                if release_err then error(release_err) end
                return
            end
        end
    end
end

return heartbeat
