-- The per-automation durable command stream (design v4 §4.7, §5.5).
--
-- kickside_automation_command holds one row per automation: the monotonic
-- generation and at most one pending command. kickside_automation_op records
-- every request by (automation_id, request_id): generation, digest, target
-- receipts and final outcome.
--
-- Rules, all decided under the command row lock before any write:
--   * the same request id with the same digest reads back its recorded op;
--     a changed digest is an idempotency_conflict;
--   * a different request while one is pending is command_pending, carrying
--     the pending id and its retry floor;
--   * reservation increments the generation, records the immutable input,
--     digest, affected drives and step, fences every affected drive (drive
--     lock order: command row, then drives by drive_key) and inserts the op;
--   * finalization requires the pending id, generation and digest, and every
--     required target receipt, then clears pending, releases the drives with
--     wake demand and records the outcome; an older generation cannot finalize;
--   * supersede reserves a higher generation over an authority-blocked
--     pending command, keeping its drives pending, and marks the old op
--     superseded, so the old command's delayed steps fail their fences.
--
-- Every *_tx runs on the caller's automation-DB transaction; nothing here
-- acquires a connection or calls another store.

local sql = require("sql")
local json = require("json")
local drive = require("drive")
local row_limit = require("row_limit")

local command = {}

command.TABLE = "kickside_automation_command"
command.OP_TABLE = "kickside_automation_op"

function command.ids(executor: any): ({ string }?, error?)
    local rows, err = executor:query("SELECT automation_id FROM " .. command.TABLE .. " ORDER BY automation_id")
    if err then return nil, err end
    local ids: { string } = {}
    for _, row in ipairs(rows or {}) do ids[#ids + 1] = tostring(row.automation_id) end
    return ids, nil
end

command.OP_STATE = { PENDING = "pending", SUCCEEDED = "succeeded", FAILED = "failed", SUPERSEDED = "superseded" }
command.OWNER_DELETE_KIND = "owner_delete"

command.REASON = {
    PENDING = "command_pending",
    IDEMPOTENCY = "idempotency_conflict",
    STALE = "stale_generation",
    RECEIPT = "missing_target_receipt",
}

type Map = { [string]: any }

type Reservation = {
    automation_id: string,
    request_id: string,
    digest: string,
    kind: string,
    input: Map,
    drive_keys: { string },
    step: string?,
    next_attempt_at: string?,
    require_authority_failure: boolean?,
}

local function invalid(message: string): error
    return (errors.new({ message = message, kind = errors.INVALID, retryable = false }) :: error)
end

local function internal(message: string, err: any): error
    return (errors.new({ message = message .. ": " .. tostring(err), kind = errors.INTERNAL, retryable = true }) :: error)
end

local function conflict(message: string, reason: string, details: Map?): error
    local d: Map = details or {}
    d.reason = reason
    return (errors.new({ message = message, kind = errors.CONFLICT, retryable = false, details = d }) :: error)
end

local function text(value: any, field: string): (string?, error?)
    if type(value) ~= "string" or value == "" then return nil, invalid(field .. " is required") end
    return value :: string, nil
end

local function int_of(value: any): integer
    return math.floor(tonumber(value) or 0) :: integer
end

local function encode(value: any, field: string): (string?, error?)
    local encoded, err = json.encode(value)
    if err or type(encoded) ~= "string" then return nil, invalid(field .. " must be JSON serializable") end
    return encoded :: string, nil
end

local function decode(raw: any, field: string): (any?, error?)
    if raw == nil then return nil, nil end
    local value, err = json.decode(tostring(raw))
    if err then return nil, internal(field .. " is not JSON", err) end
    return value, nil
end

local function lock_suffix(tx: sql.Transaction): (string?, error?)
    local dbtype, err = tx:db_type()
    if err then return nil, internal("failed to resolve the dialect", err) end
    return tostring(dbtype) == sql.type.SQLITE and "" or " FOR UPDATE", nil
end

-- Lock (creating when absent) the automation's command row.
local function lock_row(tx: sql.Transaction, automation_id: string): (Map?, error?)
    local _, insert_err = tx:execute("INSERT INTO " .. command.TABLE .. " (automation_id, generation) VALUES ($1, 0)"
        .. " ON CONFLICT (automation_id) DO NOTHING", { automation_id })
    if insert_err then return nil, internal("failed to create command row", insert_err) end
    local suffix, suffix_err = lock_suffix(tx)
    if suffix_err then return nil, suffix_err end
    local rows, err = tx:query("SELECT automation_id, generation, pending_request_id, pending_digest, pending_kind,"
        .. " pending_input_json, pending_drives_json, pending_step, next_attempt_at, last_error_json FROM "
        .. command.TABLE .. " WHERE automation_id = $1" .. (suffix :: string), { automation_id })
    if err then return nil, internal("failed to lock command row", err) end
    local row = (rows :: { Map })[1]
    row.generation = int_of(row.generation)
    return row, nil
end

local function read_op(executor: any, automation_id: string, request_id: string): (Map?, error?)
    local rows, err = executor:query("SELECT automation_id, request_id, generation, digest, target_receipts_json, outcome_json,"
        .. " state, created_at, completed_at FROM " .. command.OP_TABLE .. " WHERE automation_id = $1 AND request_id = $2",
        { automation_id, request_id })
    if err then return nil, internal("failed to read command op", err) end
    local row = (rows :: { Map })[1]
    if not row then return nil, nil end
    local receipts, r_err = decode(row.target_receipts_json, "target_receipts_json")
    if r_err then return nil, r_err end
    local outcome, o_err = decode(row.outcome_json, "outcome_json")
    if o_err then return nil, o_err end
    return {
        automation_id = row.automation_id,
        request_id = row.request_id,
        generation = int_of(row.generation),
        digest = row.digest,
        target_receipts = receipts or {},
        outcome = outcome,
        state = row.state,
        created_at = row.created_at,
        completed_at = row.completed_at,
    }, nil
end
command.read_op = read_op

local function check_reservation(req: any): (Reservation?, error?)
    local r = type(req) == "table" and req or {}
    for _, field in ipairs({ "automation_id", "request_id", "digest", "kind" }) do
        local _, err = text((r :: Map)[field], field)
        if err then return nil, err end
    end
    if type(r.input) ~= "table" then return nil, invalid("input is required") end
    if type(r.drive_keys) ~= "table" or (#(r.drive_keys :: { any }) == 0 and r.kind ~= command.OWNER_DELETE_KIND) then
        return nil, invalid("drive_keys are required")
    end
    return r :: Reservation, nil
end

-- Answer a request whose id already has an op: same digest reads it back,
-- a changed digest conflicts.
local function replay_or_conflict(op: Map, digest: string): (Map?, error?)
    if op.digest ~= digest then
        return nil, conflict("request " .. tostring(op.request_id) .. " was recorded with a different input", command.REASON.IDEMPOTENCY,
            { request_id = op.request_id })
    end
    return { request_id = op.request_id, generation = op.generation, state = op.state, outcome = op.outcome, existing = true }, nil
end

-- reserve_tx reserves a command. Returns { request_id, generation, state,
-- existing } where existing marks a replayed request.
function command.reserve_tx(tx: sql.Transaction, request: any, prepare_tx: any?): (Map?, error?)
    local req, req_err = check_reservation(request)
    if req_err or not req then return nil, req_err end
    local row, lock_err = lock_row(tx, req.automation_id)
    if lock_err or not row then return nil, lock_err end

    local existing, op_err = read_op(tx, req.automation_id, req.request_id)
    if op_err then return nil, op_err end
    if existing then return replay_or_conflict(existing, req.digest) end
    if row.pending_request_id ~= nil then
        return nil, conflict("automation " .. req.automation_id .. " has pending command " .. tostring(row.pending_request_id),
            command.REASON.PENDING, { pending_request_id = row.pending_request_id, retry_after = row.next_attempt_at })
    end
    if prepare_tx ~= nil then
        if type(prepare_tx) ~= "function" then return nil, invalid("reservation preparation must be callable") end
        local prepare_err = prepare_tx(tx)
        if prepare_err then return nil, prepare_err end
    end
    return command.install_pending_tx(tx, req, row, nil)
end

-- install_pending_tx writes a reserved command over a locked command row:
-- generation + 1, the pending fields, the drive fences and a pending op.
function command.install_pending_tx(tx: sql.Transaction, req: Reservation, row: Map, superseded_request_id: string?): (Map?, error?)
    local keys = drive.sorted_keys(req.drive_keys)
    local _, drives_err = drive.lock_tx(tx, req.automation_id, keys)
    if drives_err then return nil, drives_err end
    local input_json, in_err = encode(req.input, "input")
    if in_err then return nil, in_err end
    local drives_json, dr_err = encode(keys, "drive_keys")
    if dr_err then return nil, dr_err end
    local generation = (row.generation :: integer) + 1
    local now = drive.utc_now()
    local command_row, command_err = encode({ automation_id = req.automation_id, generation = generation,
        pending_request_id = req.request_id, pending_digest = req.digest, pending_kind = req.kind,
        pending_input_json = input_json, pending_drives_json = drives_json,
        pending_step = req.step or "apply", next_attempt_at = req.next_attempt_at or now }, "command row")
    if command_err then return nil, command_err end
    local command_bound = row_limit.check(command_row, "command_row", req.automation_id)
    if command_bound then return nil, command_bound end
    local op_row, op_err = encode({ automation_id = req.automation_id, request_id = req.request_id,
        generation = generation, digest = req.digest, target_receipts_json = "{}",
        state = command.OP_STATE.PENDING, created_at = now }, "command outcome row")
    if op_err then return nil, op_err end
    local op_bound = row_limit.check(op_row, "command_outcome_row", req.automation_id)
    if op_bound then return nil, op_bound end

    local _, update_err = tx:execute("UPDATE " .. command.TABLE .. " SET generation = $1, pending_request_id = $2, pending_digest = $3,"
        .. " pending_kind = $4, pending_input_json = $5, pending_drives_json = $6, pending_step = $7, next_attempt_at = $8,"
        .. " last_error_json = NULL WHERE automation_id = $9",
        { generation, req.request_id, req.digest, req.kind, input_json, drives_json, req.step or "apply",
            req.next_attempt_at or now, req.automation_id })
    if update_err then return nil, internal("failed to reserve command", update_err) end
    local fence_err = drive.fence_for_command_tx(tx, req.automation_id, keys, req.request_id, generation)
    if fence_err then return nil, fence_err end
    if superseded_request_id then
        local original, original_err = decode(row.pending_input_json, "pending_input_json")
        if original_err then return nil, original_err end
        local outcome, outcome_err = encode({ superseded_by = req.request_id, superseded_generation = generation,
            superseded_kind = row.pending_kind, superseded_input = original }, "superseded outcome")
        if outcome_err then return nil, outcome_err end
        local outcome_bound = row_limit.check(outcome, "command_outcome", req.automation_id)
        if outcome_bound then return nil, outcome_bound end
        local _, sup_err = tx:execute("UPDATE " .. command.OP_TABLE .. " SET state = $1, completed_at = $2, outcome_json = $3"
            .. " WHERE automation_id = $4 AND request_id = $5 AND state = $6",
            { command.OP_STATE.SUPERSEDED, now, outcome, req.automation_id, superseded_request_id, command.OP_STATE.PENDING })
        if sup_err then return nil, internal("failed to supersede command op", sup_err) end
    end
    local _, op_err = tx:execute("INSERT INTO " .. command.OP_TABLE
        .. " (automation_id, request_id, generation, digest, target_receipts_json, state, created_at)"
        .. " VALUES ($1, $2, $3, $4, '{}', $5, $6)",
        { req.automation_id, req.request_id, generation, req.digest, command.OP_STATE.PENDING, now })
    if op_err then return nil, internal("failed to record command op", op_err) end
    return { request_id = req.request_id, generation = generation, state = command.OP_STATE.PENDING, existing = false }, nil
end

-- Lock the command row and require that it still holds this pending command.
function command.lock_pending_tx(tx: sql.Transaction, automation_id: string, request_id: string, generation: integer, digest: string): (Map?, error?)
    local row, lock_err = lock_row(tx, automation_id)
    if lock_err or not row then return nil, lock_err end
    if row.pending_request_id ~= request_id or row.generation ~= generation or row.pending_digest ~= digest then
        return nil, conflict("command " .. request_id .. " generation " .. tostring(generation) .. " is not the pending command",
            command.REASON.STALE, { pending_request_id = row.pending_request_id, generation = row.generation })
    end
    return row, nil
end

-- record_receipt_tx stores a cross-store step's receipt on the pending op
-- under the same id and generation.
function command.record_receipt_tx(tx: sql.Transaction, automation_id: string, request_id: string, generation: integer, digest: string, step: string, receipt: Map): error?
    local _, pending_err = command.lock_pending_tx(tx, automation_id, request_id, generation, digest)
    if pending_err then return pending_err end
    local op, op_err = read_op(tx, automation_id, request_id)
    if op_err or not op then return op_err or internal("pending command has no op", request_id) end
    local receipts = op.target_receipts :: Map
    receipts[step] = receipt
    local encoded, enc_err = encode(receipts, "target_receipts")
    if enc_err then return enc_err end
    local row_bound = row_limit.check(encoded, "command_receipts", automation_id)
    if row_bound then return row_bound end
    local _, err = tx:execute("UPDATE " .. command.OP_TABLE .. " SET target_receipts_json = $1 WHERE automation_id = $2 AND request_id = $3",
        { encoded, automation_id, request_id })
    if err then return internal("failed to record target receipt", err) end
    return nil
end

-- defer_tx records an infrastructure failure of the pending step and its next
-- attempt; the command stays pending without terminal exhaustion.
function command.defer_tx(tx: sql.Transaction, automation_id: string, request_id: string, generation: integer, digest: string, failure: Map, next_attempt_at: string): error?
    local _, pending_err = command.lock_pending_tx(tx, automation_id, request_id, generation, digest)
    if pending_err then return pending_err end
    local encoded, enc_err = encode(failure, "failure")
    if enc_err then return enc_err end
    local row_bound = row_limit.check(encoded, "command_failure", automation_id)
    if row_bound then return row_bound end
    local _, err = tx:execute("UPDATE " .. command.TABLE .. " SET last_error_json = $1, next_attempt_at = $2 WHERE automation_id = $3",
        { encoded, next_attempt_at, automation_id })
    if err then return internal("failed to defer command", err) end
    return nil
end

-- finalize_tx completes the pending command with state succeeded or failed
-- and its outcome, after checking every required target receipt. A succeeded
-- command's `applied` ({ declaration, hash }) becomes every affected drive's
-- applied declaration in the same transaction.
function command.finalize_tx(tx: sql.Transaction, final: any): (Map?, error?)
    local f = type(final) == "table" and final or {}
    for _, field in ipairs({ "automation_id", "request_id", "digest", "state" }) do
        local _, err = text((f :: Map)[field], field)
        if err then return nil, err end
    end
    if f.state ~= command.OP_STATE.SUCCEEDED and f.state ~= command.OP_STATE.FAILED then
        return nil, invalid("state must be succeeded or failed")
    end
    local generation = int_of(f.generation)
    local row, pending_err = command.lock_pending_tx(tx, f.automation_id, f.request_id, generation, f.digest)
    if pending_err or not row then return nil, pending_err end
    local op, op_err = read_op(tx, f.automation_id, f.request_id)
    if op_err or not op then return nil, op_err or internal("pending command has no op", f.request_id) end
    for _, step in ipairs(type(f.required_receipts) == "table" and f.required_receipts or {}) do
        if (op.target_receipts :: Map)[step] == nil then
            return nil, conflict("command " .. f.request_id .. " lacks the " .. tostring(step) .. " receipt", command.REASON.RECEIPT, { step = step })
        end
    end
    local keys, keys_err = decode(row.pending_drives_json, "pending_drives_json")
    if keys_err then return nil, keys_err end
    local release_err = drive.release_command_tx(tx, f.automation_id, keys :: { string }, f.request_id, generation,
        f.state == command.OP_STATE.SUCCEEDED and f.applied or nil)
    if release_err then return nil, release_err end
    local outcome_json, enc_err = encode(f.outcome or {}, "outcome")
    if enc_err then return nil, enc_err end
    local row_bound = row_limit.check(outcome_json, "command_outcome", f.automation_id)
    if row_bound then return nil, row_bound end
    local now = drive.utc_now()
    local _, op_update_err = tx:execute("UPDATE " .. command.OP_TABLE .. " SET state = $1, outcome_json = $2, completed_at = $3"
        .. " WHERE automation_id = $4 AND request_id = $5", { f.state, outcome_json, now, f.automation_id, f.request_id })
    if op_update_err then return nil, internal("failed to record command outcome", op_update_err) end
    local _, clear_err = tx:execute("UPDATE " .. command.TABLE .. " SET pending_request_id = NULL, pending_digest = NULL,"
        .. " pending_kind = NULL, pending_input_json = NULL, pending_drives_json = NULL, pending_step = NULL,"
        .. " next_attempt_at = NULL, last_error_json = NULL WHERE automation_id = $1", { f.automation_id })
    if clear_err then return nil, internal("failed to clear pending command", clear_err) end
    return { request_id = f.request_id, generation = generation, state = f.state, outcome = f.outcome or {} }, nil
end

-- run_tx reserves a command, applies it to its locked drives through
-- apply(tx, drives) -> (outcome?, err?) and finalizes it, all in the caller's
-- one transaction: the path of simple controls (pause, resume, run_now,
-- replay). A replayed request returns its recorded op without applying.
function command.run_tx(tx: sql.Transaction, request: any, apply: (sql.Transaction, { [string]: Map }) -> (Map?, error?)): (Map?, error?)
    local reserved, reserve_err = command.reserve_tx(tx, request)
    if reserve_err or not reserved then return nil, reserve_err end
    if reserved.existing then return reserved, nil end
    local req = request :: Reservation
    local drives, lock_err = drive.lock_tx(tx, req.automation_id, req.drive_keys)
    if lock_err or not drives then return nil, lock_err end
    local outcome, apply_err = apply(tx, drives :: { [string]: Map })
    if apply_err then return nil, apply_err end
    return command.finalize_tx(tx, {
        automation_id = req.automation_id,
        request_id = req.request_id,
        generation = reserved.generation,
        digest = req.digest,
        state = command.OP_STATE.SUCCEEDED,
        outcome = outcome,
    })
end

-- supersede_tx replaces a pending command whose authority was lost with a
-- new request at a higher generation over the same and any added drives.
function command.supersede_tx(tx: sql.Transaction, request: any, pending_request_id: string): (Map?, error?)
    local req, req_err = check_reservation(request)
    if req_err or not req then return nil, req_err end
    local row, lock_err = lock_row(tx, req.automation_id)
    if lock_err or not row then return nil, lock_err end
    local existing, op_err = read_op(tx, req.automation_id, req.request_id)
    if op_err then return nil, op_err end
    if existing then return replay_or_conflict(existing, req.digest) end
    if row.pending_request_id ~= pending_request_id then
        return nil, conflict("command " .. pending_request_id .. " is not pending", command.REASON.STALE,
            { pending_request_id = row.pending_request_id })
    end
    if req.kind == command.OWNER_DELETE_KIND then
        -- The owner-delete command is the durable fence root. The owner
        -- cleanup pages the live drive fences under this command row before
        -- releasing any pin, slot or owner row; do not lock an unbounded drive
        -- set while reserving it.
        req.drive_keys = {}
    else
        if req.require_authority_failure then
            local failure, failure_err = decode(row.last_error_json, "last_error_json")
            if failure_err then return nil, failure_err end
            if type(failure) ~= "table" or failure.kind ~= errors.PERMISSION_DENIED or failure.retriable == true then
                return nil, conflict("pending command has no permanent authority failure", command.REASON.PENDING,
                    { pending_request_id = row.pending_request_id, retry_after = row.next_attempt_at })
            end
        end
        local pending_keys, keys_err = decode(row.pending_drives_json, "pending_drives_json")
        if keys_err then return nil, keys_err end
        local keys: { string } = {}
        for _, key in ipairs(pending_keys :: { string }) do keys[#keys + 1] = key end
        for _, key in ipairs(req.drive_keys) do keys[#keys + 1] = key end
        req.drive_keys = drive.sorted_keys(keys)
    end
    return command.install_pending_tx(tx, req, row, pending_request_id)
end

-- pending(db_or_tx, automation_id) -> the pending command, or nil.
function command.pending(executor: any, automation_id: string): (Map?, error?)
    local rows, err = executor:query("SELECT generation, pending_request_id, pending_digest, pending_kind, pending_input_json,"
        .. " pending_drives_json, pending_step, next_attempt_at, last_error_json FROM " .. command.TABLE
        .. " WHERE automation_id = $1 AND pending_request_id IS NOT NULL", { automation_id })
    if err then return nil, internal("failed to read pending command", err) end
    local row = (rows :: { Map })[1]
    if not row then return nil, nil end
    local input, in_err = decode(row.pending_input_json, "pending_input_json")
    if in_err then return nil, in_err end
    local drives, dr_err = decode(row.pending_drives_json, "pending_drives_json")
    if dr_err then return nil, dr_err end
    local last_error, le_err = decode(row.last_error_json, "last_error_json")
    if le_err then return nil, le_err end
    return {
        automation_id = automation_id,
        generation = int_of(row.generation),
        request_id = row.pending_request_id,
        digest = row.pending_digest,
        kind = row.pending_kind,
        input = input,
        drive_keys = drives,
        step = row.pending_step,
        next_attempt_at = row.next_attempt_at,
        last_error = last_error,
    }, nil
end

function command.identity_pending(executor: any, request: Map): (Map?, error?, string?)
    local pending, pending_err = command.pending(executor, tostring(request.automation_id or ""))
    if pending_err then return nil, pending_err end
    local input = pending and type(pending.input) == "table" and pending.input or {}
    if not pending or (pending.kind ~= "set_execution_identity" and pending.kind ~= "install_selected")
        or pending.request_id ~= request.command_id then
        return nil, nil, "no pending set_execution_identity command " .. tostring(request.command_id)
    end
    local principal = input.principal
    local selected = request.principal
    if input.operator_id ~= request.operator_id or type(principal) ~= "table" or type(selected) ~= "table"
        or principal.kind ~= selected.kind or principal.id ~= selected.id
        or input.expected_identity_generation ~= request.expected_identity_generation
        or (request.component_id ~= nil and request.component_id ~= pending.automation_id)
        or (request.command_generation ~= nil and request.command_generation ~= pending.generation) then
        return nil, nil, "set_execution_identity command " .. tostring(request.command_id) .. " was reserved for another request"
    end
    return pending, nil
end

-- state(db_or_tx, automation_id) -> { generation, pending? }: the command
-- row's generation (0 before the first command) and its pending command.
function command.state(executor: any, automation_id: string): (Map?, error?)
    local rows, err = executor:query("SELECT generation FROM " .. command.TABLE .. " WHERE automation_id = $1", { automation_id })
    if err then return nil, internal("failed to read command state", err) end
    local row = (rows :: { Map })[1]
    local current, pending_err = command.pending(executor, automation_id)
    if pending_err then return nil, pending_err end
    return { generation = row and int_of(row.generation) or 0, pending = current }, nil
end

-- due(db_or_tx, now, limit) -> pending commands whose next attempt is due,
-- through the (pending_step, next_attempt_at, automation_id) index.
function command.due(executor: any, now: string, limit: integer): ({ Map }?, error?)
    local rows, err = executor:query("SELECT automation_id FROM " .. command.TABLE
        .. " WHERE pending_request_id IS NOT NULL AND next_attempt_at <= $1"
        .. " ORDER BY pending_step, next_attempt_at, automation_id LIMIT $2", { now, limit })
    if err then return nil, internal("failed to scan due commands", err) end
    local out: { Map } = {}
    for _, row in ipairs(rows :: { Map }) do
        local pending, p_err = command.pending(executor, tostring(row.automation_id))
        if p_err then return nil, p_err end
        if pending then out[#out + 1] = pending :: Map end
    end
    return out, nil
end

-- next_deadline(executor) -> the earliest next_attempt_at among the pending
-- commands the dispatcher drives, through the (pending_step,next_attempt_at,
-- automation_id) index; nil when none is due. The owner-delete command is
-- excluded: it is reserved with a floor next_attempt_at far enough in the
-- future that it never becomes dispatcher work (owner_gc drives it directly),
-- so it must not hold the dispatcher's slot pending on a deadline that will
-- never arrive.
function command.next_deadline(executor: any): (string?, error?)
    local rows, err = executor:query("SELECT MIN(next_attempt_at) AS next_at FROM " .. command.TABLE
        .. " WHERE pending_request_id IS NOT NULL AND pending_kind <> $1", { command.OWNER_DELETE_KIND })
    if err then return nil, internal("failed to scan the next command deadline", err) end
    local row = (rows :: { Map })[1]
    local value = row and row.next_at
    if value == nil then return nil, nil end
    return tostring(value), nil
end

-- Terminal request outcomes are replayable for the configured retention window.
-- A pending op is the only source of a recoverable command step and is never
-- eligible, regardless of its age.
function command.prune_ops_tx(tx: sql.Transaction, cutoff: string, limit: integer): (integer?, error?)
    local rows, read_err = tx:query([[SELECT automation_id,request_id FROM kickside_automation_op
        WHERE state IN ('succeeded','failed','superseded')
          AND created_at <= $1 AND completed_at <= $1
        ORDER BY automation_id,created_at,request_id LIMIT $2]], { cutoff, limit })
    if read_err or type(rows) ~= "table" then
        return nil, internal("failed to read terminal command outcomes", read_err or "missing result")
    end
    local count = 0
    for _, row in ipairs(rows) do
        local deleted, delete_err = tx:execute([[DELETE FROM kickside_automation_op
            WHERE automation_id=$1 AND request_id=$2 AND state IN ('succeeded','failed','superseded')
              AND created_at<=$3 AND completed_at<=$3]],
            { row.automation_id, row.request_id, cutoff })
        if delete_err or not deleted or tonumber(deleted.rows_affected) == nil then
            return nil, internal("failed to prune command outcome", delete_err or "missing affected-row count")
        end
        if tonumber(deleted.rows_affected) == 1 then count = count + 1 end
    end
    return count, nil
end

return command
