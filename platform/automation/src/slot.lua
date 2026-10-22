-- Drive slots (design v5 §4.1; CONTRACTS §6, §19): each drive owns exactly one
-- reusable kickside_job, identified by (drive, automation_id, drive_key) and
-- carrying both identifiers in its payload. The slot runs the drive's round
-- (A19: the job type is the worker's registry id). It is due now at creation:
-- the round decides whether a timer occurrence is due or an event backlog
-- exists, and rearms or parks the slot itself.
--
-- provision enqueues the slot in the jobs store, then records its id on the
-- drive in the automation store; it also keeps the command dispatcher's one
-- maintenance slot active. Normal provisioning commits each store separately:
-- enqueue is idempotent on the active identity, so a repeated provision after a
-- crash between them (or the dispatcher's missing-slot repair) converges on the
-- same job.

local sql = require("sql")
local jobs = require("jobs")
local slot_purge = require("slot_purge")
local types = require("types")
local drive = require("drive")
local jobs_config = require("jobs_config")

local slot = {}

type Map = { [string]: any }

slot.NAMESPACE = "drive"
slot.JOB_TYPE = "kickside.automation:round"

-- The command dispatcher's one maintenance slot.
slot.DISPATCHER_JOB_TYPE = "kickside.automation:command_dispatcher"
slot.DISPATCHER_IDENTITY = { namespace = "automation", scope = "maintenance", key = "command_dispatcher" }

local function internal(message: string, err: any): error
    return (errors.new({ message = message .. ": " .. tostring(err), kind = errors.INTERNAL, retryable = true }) :: error)
end

local function unavailable(message: string, err: any): error
    return (errors.new({ message = message .. ": " .. tostring(err), kind = errors.UNAVAILABLE, retryable = true }) :: error)
end

-- enqueue(automation_id, drive_key, wake_key?) -> the slot's job id, existing
-- or new. An event drive's slot carries its source thread's wake key.
local function enqueue(params: table, tx: sql.Transaction?): (table?, error?)
    if tx and jobs_config.db_id() == types.db_id() then
        local dialect, err = tx:db_type()
        if err then return nil, err end
        return jobs.enqueue_tx(tx, tostring(dialect), params)
    end
    return jobs.enqueue(params)
end

local function enqueue_drive(automation_id: string, drive_key: string, wake_key: string?, tx: sql.Transaction?): (string?, error?)
    local enqueued, err = enqueue({
        namespace = slot.NAMESPACE, scope = automation_id, key = drive_key,
        owner_locator = { kind = "automation", id = automation_id },
        job_type = slot.JOB_TYPE,
        slot = true,
        wake_key = wake_key,
        immutable_payload = { automation_id = automation_id, drive_key = drive_key },
    }, tx)
    if err then return nil, err end
    local job_id = type(enqueued) == "table" and (enqueued :: Map).id or nil
    if type(job_id) ~= "string" or job_id == "" then
        return nil, internal("slot enqueue returned no job id", automation_id .. "/" .. drive_key)
    end
    return job_id :: string, nil
end

function slot.enqueue(automation_id: string, drive_key: string, wake_key: string?): (string?, error?)
    return enqueue_drive(automation_id, drive_key, wake_key, nil)
end

-- record(automation_id, drive_key, job_id) stores the slot id on the drive.
-- The active identity admits one slot per drive, so the id enqueue returned is
-- the drive's slot and replaces whatever the drive recorded before.
local function record(db: any, automation_id: string, drive_key: string, job_id: string): error?
    -- A source move legitimately provisions while release_pins is pending.
    -- Only owner deletion forbids a new slot; its fence precedes jobs purge.
    local result, err = db:execute("UPDATE " .. drive.TABLE .. " SET job_id = $1"
        .. " WHERE automation_id = $2 AND drive_key = $3"
        .. " AND (pending_command_id IS NULL OR pending_command_id <> $4)",
        { job_id, automation_id, drive_key, "owner-delete:" .. automation_id })
    if err then return internal("failed to record the drive slot", err) end
    local count = result and tonumber(result.rows_affected)
    if count ~= 1 then
        return (errors.new({ message = "drive disappeared or entered owner deletion before slot recording: "
            .. automation_id .. "/" .. drive_key, kind = errors.CONFLICT, retryable = true }) :: error)
    end
    return nil
end

function slot.record(automation_id: string, drive_key: string, job_id: string): error?
    local db, db_err = sql.get(types.db_id())
    if db_err or not db then return unavailable("automation database unavailable", db_err) end
    local err = record(db, automation_id, drive_key, job_id)
    db:release()
    return err
end

-- ensure_dispatcher() -> the id of the command dispatcher's maintenance slot,
-- enqueued when no active one exists. Every drive slot provision ensures it, so
-- the dispatcher is active wherever a drive exists.
local function ensure_dispatcher(tx: sql.Transaction?): (string?, error?)
    local identity = slot.DISPATCHER_IDENTITY
    local enqueued, err = enqueue({
        namespace = identity.namespace, scope = identity.scope, key = identity.key,
        owner_locator = { kind = "installation", id = "kickside.automation" },
        job_type = slot.DISPATCHER_JOB_TYPE,
        slot = true,
        queue_tier = "maintenance",
        immutable_payload = {},
    }, tx)
    if err then return nil, err end
    local job_id = type(enqueued) == "table" and (enqueued :: Map).id or nil
    if type(job_id) ~= "string" or job_id == "" then
        return nil, internal("dispatcher slot enqueue returned no job id", slot.DISPATCHER_JOB_TYPE)
    end
    return job_id :: string, nil
end

function slot.ensure_dispatcher(): (string?, error?)
    return ensure_dispatcher(nil)
end

-- The drive's source: kind and source thread.
local function drive_source(automation_id: string, drive_key: string): (Map?, error?)
    local db, db_err = sql.get(types.db_id())
    if db_err or not db then return nil, unavailable("automation database unavailable", db_err) end
    local row, err = drive.get(db, automation_id, drive_key)
    db:release()
    if err then return nil, err end
    if not row then
        return nil, (errors.new({ message = "drive " .. automation_id .. "/" .. drive_key .. " not found", kind = errors.NOT_FOUND,
            retryable = false }) :: error)
    end
    return row, nil
end

local function attach(automation_id: string, drive_key: string, source: Map, tx: sql.Transaction?): (string?, error?)
    local wake_key: string? = nil
    if source.source_kind == drive.SOURCE_KIND.EVENT then wake_key = drive.wake_key(tostring(source.source_thread_id)) end
    local dispatcher_err
    if tx then
        local _
        _, dispatcher_err = ensure_dispatcher(tx)
    else
        local _
        _, dispatcher_err = slot.ensure_dispatcher()
    end
    if dispatcher_err then return nil, dispatcher_err end
    local job_id, enqueue_err
    if tx then
        job_id, enqueue_err = enqueue_drive(automation_id, drive_key, wake_key, tx)
    else
        job_id, enqueue_err = slot.enqueue(automation_id, drive_key, wake_key)
    end
    if enqueue_err or not job_id then return nil, enqueue_err end
    local record_err = tx and record(tx, automation_id, drive_key, job_id) or nil
    if not tx then record_err = slot.record(automation_id, drive_key, job_id) end
    if tx then
        if record_err then return nil, record_err end
        return job_id, nil
    end
    if record_err then
        local _, purge_err = slot_purge.purge_slot({ namespace = slot.NAMESPACE, scope = automation_id, key = drive_key })
        if purge_err then
            return nil, internal("slot recording failed and its unrecorded job could not be reclaimed",
                tostring(record_err) .. "; " .. tostring(purge_err))
        end
        return nil, record_err
    end
    return job_id, nil
end

-- provision(automation_id, drive_key) -> the slot's job id, enqueued and
-- recorded on the drive, with the dispatcher's maintenance slot ensured. A
-- drive without a source gets no slot (nil, nil) and its recorded slot job is
-- cancelled; an event drive's slot is
-- keyed by its source thread's wake key (design v5 §4.1), and provisioning a
-- drive whose source moved moves the key of its active slot in place.
function slot.provision(automation_id: string, drive_key: string): (string?, error?)
    local source, source_err = drive_source(automation_id, drive_key)
    if source_err or not source then return nil, source_err end
    if source.source_kind == drive.SOURCE_KIND.NONE then
        if type(source.job_id) == "string" and source.job_id ~= "" then
            local _, cancel_err = jobs.cancel(source.job_id)
            if cancel_err then return nil, cancel_err end
        end
        return nil, nil
    end
    return attach(automation_id, drive_key, source, nil)
end

-- Attach a sourced drive under the owning caller's transaction and row lock.
function slot.provision_tx(tx: sql.Transaction, automation_id: string, drive_key: string): (string?, error?)
    local source, err = drive.get(tx, automation_id, drive_key)
    if err then return nil, err end
    if not source or source.source_kind == drive.SOURCE_KIND.NONE then
        return nil, errors.new({kind = errors.INVALID, message = "slot attachment requires a sourced drive"})
    end
    return attach(automation_id, drive_key, source, tx)
end

-- wake(job_id) -> { woken, scheduled_at? }: wakes a drive slot with control
-- priority (jobs.wake_job control): a pending slot becomes due now, a running
-- one records the control wake for its completion.
function slot.wake(job_id: string): (any?, error?)
    return jobs.wake_job(job_id, { control = true })
end

-- wake_dispatcher() -> { woken, scheduled_at? }: wakes the command
-- dispatcher's maintenance slot (A52 no polling). Every producer of dispatcher
-- work (a pending command, control demand on a drive, a drive left without a
-- slot) calls this after its own commit; ensure_dispatcher resolves the
-- slot's durable id (an indexed read on the common path) and wake gives it
-- control priority so its next pass runs at once and recomputes its exact
-- rearm deadline from durable state.
function slot.wake_dispatcher(): (any?, error?)
    local job_id, ensure_err = slot.ensure_dispatcher()
    if ensure_err or not job_id then return nil, ensure_err end
    return slot.wake(job_id)
end

return slot
