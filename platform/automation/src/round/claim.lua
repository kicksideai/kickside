-- Round stamp (design v5 §4.2). One short automation-DB transaction locks the
-- drive and decides whether this slot attempt may run a round:
--
--   * occupied  -- another attempt holds an unexpired round token; the slot
--                  rearms after that token's deadline plus the round retry;
--   * parked    -- the drive is paused, disabled, blocked or pending on a
--                  command; the slot parks until a control wake. A schedule
--                  that cannot be resolved blocks the drive here, with its
--                  phase and last error recorded as a settled round records
--                  them;
--   * idle      -- nothing is due: neither the drive's next acquisition (a
--                  first claim arms a scheduled drive's schedule) nor a ledger
--                  redelivery; the slot rearms at the earlier of the two;
--   * stamped   -- the round records its token, deadline and attempt count and
--                  captures the revision, rewind and command generations its
--                  commit must still find. acquire says whether its
--                  acquisition is due: a round stamped only for due ledger
--                  redelivery (drain-only) pulls nothing and keeps the
--                  drive's schedule, cursor and occurrence. A due timer drive
--                  persists its logical occurrence before any provider call; a
--                  retried attempt reuses the occurrence already persisted.
--
-- Delivery eligibility is one calculation (A28.3): due acquisition OR due
-- redelivery, whatever the source cadence says about the next pull.
--
-- The transaction runs on the caller's executor and calls no provider.

local sql = require("sql")
local json = require("json")
local drive = require("drive")
local cadence = require("cadence")
local failure_classification = require("failure_classification")
local ledger = require("round_ledger")

local M = {}

type Map = { [string]: any }

M.STATE = { STAMPED = "stamped", OCCUPIED = "occupied", PARKED = "parked", IDLE = "idle", MISSING = "missing" }

local PARKED_PHASES: { [string]: boolean } = {
    [drive.PHASE.PAUSED] = true,
    [drive.PHASE.BLOCKED_DECLARATION] = true,
    [drive.PHASE.BLOCKED_ACCESS] = true,
    [drive.PHASE.BLOCKED_IDENTITY] = true,
    [drive.PHASE.BLOCKED_SOURCE_DELETED] = true,
}

local function internal(message: string, err: any): error
    return (errors.new({ message = message .. ": " .. tostring(err), kind = errors.INTERNAL, retryable = true }) :: error)
end

local function invalid(message: string): error
    return (errors.new({ message = message, kind = errors.INVALID, retryable = false,
        details = { error_kind = "declaration" } }) :: error)
end

-- schedule_of(d) -> the drive's cadence { type, expression, timezone = "UTC" },
-- or nil for a drive acquiring without one (event).
function M.schedule_of(d: Map): Map?
    local action = type(d.action) == "table" and d.action or {}
    local schedule = action.schedule
    if type(schedule) ~= "table" then return nil end
    return { type = schedule.type, expression = schedule.expression, timezone = "UTC" }
end

-- next_due(d, from) -> the drive's next due time after `from`, or nil when its
-- schedule is exhausted (a past once).
function M.next_due(d: Map, from: string): (string?, error?)
    local schedule = M.schedule_of(d)
    if not schedule then return nil, invalid("drive " .. tostring(d.drive_key) .. " declares no schedule") end
    local due, err = cadence.next_after(schedule, from)
    if err then return nil, invalid("drive " .. tostring(d.drive_key) .. " schedule: " .. tostring(err)) end
    return due, nil
end

local function update(tx: any, automation_id: string, drive_key: string, fields: Map): error?
    local ok, err = drive.update_cas_tx(tx, automation_id, drive_key, {}, fields)
    if err then return err end
    if not ok then return internal("drive vanished under its lock", automation_id .. "/" .. drive_key) end
    return nil
end

-- block_tx records a deterministic declaration failure found at stamp on the
-- drive (phase, last error, no due time) and parks it.
local function block_tx(tx: any, automation_id: string, drive_key: string, d: Map, err: any, now: string): (Map?, error?)
    local failure = failure_classification.classify(err)
    local encoded, enc_err = json.encode({ kind = failure.kind, message = failure.message, attempts = 1, at = now })
    if enc_err then return nil, internal("failed to encode the stamp failure", enc_err) end
    local block_err = update(tx, automation_id, drive_key, {
        phase = drive.PHASE.BLOCKED_DECLARATION, last_error_json = encoded, next_run_at = sql.NULL,
    })
    if block_err then return nil, block_err end
    d.phase = drive.PHASE.BLOCKED_DECLARATION
    return { state = M.STATE.PARKED, drive = d, reason = tostring(failure.message) }, nil
end

local function occurrence_fields(d: Map, due_at: string): (Map?, error?)
    local payload, enc_err = json.encode({fired_at = due_at})
    if enc_err then return nil, internal("failed to encode the persisted occurrence", enc_err) end
    local seq = (d.last_committed_occurrence_seq :: integer) + 1
    return {occurrence_seq = seq, occurrence_due_at = due_at,
        occurrence_key = d.drive_key .. ":" .. tostring(seq), occurrence_payload_json = payload}, nil
end

-- stamp_tx(tx, automation_id, drive_key, lease, now) -> { state, drive?,
-- rearm?, captured?, acquire?, reason? }. lease = { token }; the stamp holds
-- the drive until its applied policy's round timeout. A drive without a
-- resolved policy is blocked on its declaration.
function M.stamp_tx(tx: any, automation_id: string, drive_key: string, lease: Map, now: string): (Map?, error?)
    local locked, lock_err = drive.lock_tx(tx, automation_id, { drive_key })
    if lock_err then
        if errors.is(lock_err, errors.NOT_FOUND) then return { state = M.STATE.MISSING }, nil end
        return nil, lock_err
    end
    local d = (locked :: { [string]: Map })[drive_key]

    if type(d.round_token) == "string" and d.round_token ~= lease.token and type(d.round_until) == "string"
        and drive.after(d.round_until, now) then
        return { state = M.STATE.OCCUPIED, drive = d, rearm_after = d.round_until }, nil
    end
    if d.pending_command_id ~= nil or not d.enabled or PARKED_PHASES[tostring(d.phase)] then
        return { state = M.STATE.PARKED, drive = d }, nil
    end

    local applied = type(d.applied) == "table" and (d.applied :: Map) or {}
    local policy = type(applied.policy) == "table" and (applied.policy :: Map) or nil
    if not policy or type(policy.round) ~= "table" or type(policy.delivery) ~= "table"
        or (d.source_kind == drive.SOURCE_KIND.RECONCILE and type(policy.reconcile) ~= "table") then
        return block_tx(tx, automation_id, drive_key, d, invalid("drive " .. drive_key
            .. " holds no resolved drive policy; reconfigure the automation"), now)
    end

    local fields: Map = {}
    local acquire = true
    local next_acquisition: string? = nil
    local scheduled = d.source_kind == drive.SOURCE_KIND.TIMER or d.source_kind == drive.SOURCE_KIND.COLLECTION
    if scheduled and d.occurrence_seq == nil then
        local due_at: string? = d.next_run_at
        if due_at == nil then
            local first, due_err = M.next_due(d, now)
            if due_err then return block_tx(tx, automation_id, drive_key, d, due_err, now) end
            if first ~= nil then fields.next_run_at = first end
            due_at = first
        end
        if due_at == nil or drive.after(due_at, now) then
            acquire = false
            next_acquisition = due_at
        elseif d.source_kind == drive.SOURCE_KIND.TIMER then
            local occurrence, occurrence_err = occurrence_fields(d, due_at)
            if occurrence_err or not occurrence then return nil, occurrence_err end
            for field, value in pairs(occurrence) do fields[field] = value end
        end
    end
    if d.source_kind == drive.SOURCE_KIND.MANUAL and d.occurrence_seq == nil then
        if (d.last_committed_occurrence_seq :: integer) < (d.event_seq :: integer) then
            local occurrence, occurrence_err = occurrence_fields(d, now)
            if occurrence_err or not occurrence then return nil, occurrence_err end
            for field, value in pairs(occurrence) do fields[field] = value end
        else
            acquire = false
        end
    end
    if d.source_kind == drive.SOURCE_KIND.EVENT and d.next_run_at ~= nil and drive.after(d.next_run_at, now) then
        acquire = false
        next_acquisition = d.next_run_at
    end
    if d.source_kind == drive.SOURCE_KIND.RECONCILE then
        -- A reconcile drive's pass is due at reconcile_next_at; a drive without
        -- one arms it a reconcile interval out.
        local due_at: string? = d.reconcile_next_at
        if due_at == nil then
            due_at = drive.utc_after((((policy :: Map).reconcile :: Map).interval_ms) :: integer)
            fields.reconcile_next_at = due_at
        end
        if drive.after(due_at, now) then
            acquire = false
            next_acquisition = due_at
        end
    end
    if not acquire then
        local redelivery_at, ledger_err = ledger.next_attempt(tx, automation_id, ledger.source_port(d), now)
        if ledger_err then return nil, ledger_err end
        if redelivery_at == nil or drive.after(redelivery_at, now) then
            local rearm = next_acquisition
            if redelivery_at ~= nil and (rearm == nil or drive.after(rearm, redelivery_at)) then rearm = redelivery_at end
            if rearm ~= nil and d.phase == drive.PHASE.PENDING then fields.phase = drive.PHASE.ACTIVE end
            if next(fields) ~= nil then
                local arm_err = update(tx, automation_id, drive_key, fields)
                if arm_err then return nil, arm_err end
                for k, v in pairs(fields) do d[k] = v end
            end
            if rearm == nil then return { state = M.STATE.PARKED, drive = d, reason = "the drive's schedule is exhausted" }, nil end
            return { state = M.STATE.IDLE, drive = d, rearm = rearm }, nil
        end
    end

    fields.round_token = lease.token
    -- The fence ends at round.timeout or at the job's execution ceiling,
    -- whichever is nearer, so the round always commits before the ceiling.
    fields.round_until = drive.utc_after(((policy :: Map).round :: Map).timeout_ms :: integer)
    if type(lease.deadline) == "string" and drive.after(fields.round_until, lease.deadline) then fields.round_until = lease.deadline end
    fields.round_seq = (d.round_seq :: integer) + 1
    local stamp_err = update(tx, automation_id, drive_key, fields)
    if stamp_err then return nil, stamp_err end
    for k, v in pairs(fields) do d[k] = v end
    return {
        state = M.STATE.STAMPED,
        drive = d,
        acquire = acquire,
        captured = {
            round_token = lease.token,
            round_until = fields.round_until,
            revision = d.revision,
            rewind_generation = d.rewind_generation,
            command_generation = d.command_generation,
            wake_generation = d.wake_generation,
        },
    }, nil
end


return M
