-- One gate row serializes reservations for an automation. Engine calls happen only
-- after this transaction commits; an unadmitted row still occupies capacity.
local sql = require("sql")
local uuid = require("uuid")
local errors = require("errors")
local json = require("json")
local store = require("store")
local store_state = require("store_state")
local row_limit = require("row_limit")
local run_insert = require("run_insert")
local policy = require("policy")
local run_time = require("run_time")
local maintenance_wake = require("maintenance_wake")

local M = {}
local RUNS = "workflow_runs"
local GATE = "workflow_admission_gate"


local function validate_creation_payload(args: any): (any?, any?)
    local runtime_policy, policy_err = policy.policy()
    if policy_err or not runtime_policy then return nil, policy_err end
    local limit = (runtime_policy :: any).creation_payload_bytes
    if type(args.creation_payload_json) ~= "string" or args.creation_payload_json == "" then
        return nil, errors.new({ kind = errors.INVALID,
            message = "workflow run creation payload is missing" })
    end
    if #args.creation_payload_json > limit then
        return nil, errors.new({ kind = errors.INVALID,
            message = "workflow run creation payload exceeds " .. tostring(limit) .. " bytes" })
    end
    return runtime_policy, nil
end

local now = store_state.now

local function transaction(fn: any): (any?, any?)
    local db, open_err = store.open_db()
    if not db then return nil, open_err end
    local dbtype, type_err = db:type()
    if type_err then db:release(); return nil, type_err end
    local tx, begin_err = db:begin()
    if begin_err then db:release(); return nil, begin_err end
    local result, err = fn(tx, dbtype)
    if err then tx:rollback(); db:release(); return nil, err end
    local committed, commit_err = tx:commit()
    if not committed or commit_err then
        tx:rollback(); db:release()
        return nil, commit_err or "workflow transaction did not commit"
    end
    db:release()
    return result, nil
end

local function lookup(executor: any, workflow_id: string, trigger_id: string, dedup_key: string): (any?, any?)
    local rows, err = executor:query("SELECT * FROM " .. RUNS ..
        " WHERE workflow_id=$1 AND trigger_id=$2 AND dedup_key=$3 AND superseded_by IS NULL LIMIT 1",
        { workflow_id, trigger_id, dedup_key })
    if err then return nil, err end
    return rows and rows[1] or nil, nil
end

local function idempotency_conflict(): error
    return (errors.new({ kind = errors.CONFLICT, retryable = false,
        message = "workflow delivery idempotency key was reused with different input",
        details = { reason = "idempotency_conflict" } }) :: error)
end

local function check_admission_hash(row: any, admission_hash: string): error?
    if tostring(row.admission_hash or "") ~= admission_hash then return idempotency_conflict() end
    return nil
end

local function active_count(tx: any, trigger_id: string, limit: number): (number?, any?)
    local rows, err = tx:query("SELECT run_id FROM " .. RUNS ..
        " WHERE trigger_id=$1 AND superseded_by IS NULL AND status IN ('pending','running')"
        .. " ORDER BY run_id LIMIT $2", { trigger_id, limit })
    if err then return nil, err end
    if type(rows) ~= "table" then return nil, "workflow active admission query returned no result" end
    return #rows, nil
end

local function make_run(args: any, id: string, dataflow_id: string): (any?, any?)
    if type(args.execution_identity_json) ~= "string" or args.execution_identity_json == "" then
        return nil, errors.new({ kind = errors.INVALID,
            message = "workflow run execution identity is required" })
    end
    local payload, payload_err = M.creation_payload({ run_id = id, dataflow_id = dataflow_id,
        version = args.version, creation_payload_json = args.creation_payload_json })
    if payload_err or not payload then return nil, payload_err end
    local timestamp = now()
    return { run_id = id, workflow_id = args.workflow_id, version = args.version,
        draft_def_seq = args.draft_def_seq, dataflow_id = dataflow_id,
        trigger_kind = args.trigger_kind or "binding", trigger_id = args.trigger_id,
        dedup_key = args.dedup_key, origin = args.origin or "automation", status = "pending",
        admission_hash = args.admission_hash,
        started_at = timestamp, invocation_id = args.invocation_id,
        binding_id = args.automation_revision and (args.binding_id or args.trigger_id) or nil,
        binding_revision = args.automation_revision, admission_state = "unadmitted",
        completion_check_at = timestamp, execution_identity_json = args.execution_identity_json,
        creation_payload_json = args.creation_payload_json }, nil
end

function M.creation_payload(row: any): (any?, any?)
    if type(row.creation_payload_json) ~= "string" or row.creation_payload_json == "" then
        return nil, errors.new({ kind = errors.INVALID,
            message = "workflow run creation payload is missing" })
    end
    local payload, decode_err = json.decode(row.creation_payload_json)
    if decode_err or type(payload) ~= "table" then
        return nil, errors.new({ kind = errors.INVALID,
            message = "workflow run creation payload is invalid" })
    end
    local p = payload :: any
    if type(p.commands) ~= "table" or type(p.options) ~= "table"
        or type(p.input) ~= "table" or type(p.start_options) ~= "table"
        or tonumber(p.version) ~= tonumber(row.version)
        or p.options.dataflow_id ~= row.dataflow_id
        or type(p.options.metadata) ~= "table"
        or p.options.metadata.run_id ~= row.run_id then
        return nil, errors.new({ kind = errors.INVALID,
            message = "workflow run creation payload does not match its reservation" })
    end
    return p, nil
end

local function insert_record(tx: any, record: any): (any?, any?)
    local insert_err = run_insert.insert_tx(tx, record)
    if insert_err then return nil, insert_err end
    return { row = record, existing = false }, nil
end

local function insert_run(tx: any, args: any, id: string, dataflow_id: string, operation: string): (any?, any?)
    local record, record_err = make_run(args, id, dataflow_id)
    if record_err or not record then return nil, record_err end
    local encoded, encode_err = json.encode(record)
    if encode_err or type(encoded) ~= "string" then
        return nil, errors.new({ kind = errors.INTERNAL, retryable = true,
            message = "workflow run encoding failed: " .. tostring(encode_err) })
    end
    local size_err = row_limit.check(tostring(args.workflow_id), encoded, operation)
    if size_err then return nil, size_err end
    return insert_record(tx, record)
end

local function lock_gate(tx: any, dbtype: string, trigger_id: string): any?
    local _, gate_err = tx:execute("INSERT INTO " .. GATE ..
        " (trigger_id) VALUES ($1) ON CONFLICT(trigger_id) DO NOTHING", { trigger_id })
    if gate_err then return gate_err end
    local suffix = dbtype == sql.type.POSTGRES and " FOR UPDATE" or ""
    local _, lock_err = tx:query("SELECT trigger_id FROM " .. GATE .. " WHERE trigger_id=$1" .. suffix,
        { trigger_id })
    return lock_err
end

local function wake_if_pending(row: any): (boolean?, error?)
    if type(row) ~= "table" then return true, nil end
    if row.status == "pending" or row.status == "running" or row.terminal_event_pending == true then
        return maintenance_wake.notify()
    end
    return true, nil
end

function M.find(workflow_id: string, trigger_id: string, dedup_key: string,
    admission_hash: string?): (any?, any?)
    local db, err = store.open_db()
    if not db then return nil, err end
    local row, read_err = lookup(db, workflow_id, trigger_id, dedup_key)
    db:release()
    if read_err then return nil, read_err end
    if not row then return nil, nil end
    if admission_hash ~= nil and (type(admission_hash) ~= "string" or admission_hash == "") then
        return nil, errors.new({ kind = errors.INVALID, message = "canonical admission hash is required" })
    end
    local mismatch = admission_hash and check_admission_hash(row, admission_hash) or nil
    if mismatch then return nil, mismatch end
    local _, wake_err = wake_if_pending(row)
    if wake_err then return nil, wake_err end
    return { row = row, existing = true }, nil
end

function M.reserve(args: any): (any?, any?)
    local runtime_policy, payload_err = validate_creation_payload(args)
    if payload_err then return nil, payload_err end
    if type(args.workflow_id) ~= "string" or args.workflow_id == "" then
        return nil, errors.new({ kind = errors.INVALID, message = "workflow owner is required" })
    end
    local trigger_id = args.trigger_id
    local dedup_key = args.dedup_key
    local admission_hash = args.admission_hash
    if dedup_key ~= nil and trigger_id == nil then
        return nil, errors.new({ kind = errors.INVALID, message = "dedup_key requires trigger_id" })
    end
    if admission_hash ~= nil and (type(dedup_key) ~= "string" or dedup_key == ""
        or type(admission_hash) ~= "string" or admission_hash == "") then
        return nil, errors.new({ kind = errors.INVALID,
            message = "dedup_key and canonical admission hash are required" })
    end
    if trigger_id and dedup_key then
        local fast, fast_err = M.find(tostring(args.workflow_id), tostring(trigger_id), tostring(dedup_key), admission_hash)
        if fast_err then return nil, fast_err end
        if fast then return fast, nil end
    end
    local result, transaction_err = transaction(function(tx: any, dbtype: string): (any?, any?)
        local gate_id = type(trigger_id) == "string" and trigger_id ~= ""
            and trigger_id or "workflow:" .. tostring(args.workflow_id)
        local gate_err = lock_gate(tx, dbtype, gate_id)
        if gate_err then return nil, gate_err end
        if trigger_id and dedup_key then
            local existing, dedup_err = lookup(tx, args.workflow_id, trigger_id, dedup_key)
            if dedup_err then return nil, dedup_err end
            if existing then
                if admission_hash ~= nil then
                    local mismatch = check_admission_hash(existing, admission_hash)
                    if mismatch then return nil, mismatch end
                end
                return { row = existing, existing = true }, nil
            end
        end
        if trigger_id and (args.trigger_kind or "binding") == "binding" then
            local max_inflight = (runtime_policy :: any).max_inflight_runs :: number
            local count, count_err = active_count(tx, trigger_id, max_inflight)
            if count_err then return nil, count_err end
            if count >= max_inflight then return { capacity = true }, nil end
        end
        local id, dataflow_id = args.run_id or uuid.v4(), args.dataflow_id or uuid.v4()
        return insert_run(tx, args, id, dataflow_id, "run_admission")
    end)
    if transaction_err or not result then return nil, transaction_err end
    local _, wake_err = wake_if_pending((result :: any).row)
    if wake_err then return nil, wake_err end
    return result, nil
end

local TERMINAL = { completed = "completed", failed = "failed", cancelled = "cancelled", terminated = "terminated" }

function M.terminal_status(status: any): string?
    return type(status) == "string" and TERMINAL[status] or nil
end

function M.merge(row: any, observation: any, token: string?): (any?, any?)
    local status = type(observation) == "table" and observation.status or nil
    local terminal = M.terminal_status(status)
    if status ~= "running" and not terminal then return { admitted = false, pending = true }, nil end
    local next_check_at: string? = nil
    if not terminal and not token then
        local policy_err: any
        local runtime_policy: any
        runtime_policy, policy_err = policy.policy()
        if policy_err or not runtime_policy then return nil, policy_err end
        local elapsed_ms = run_time.delta_ms(row.started_at, now()) or 0
        local delay_ms = policy.next_completion_delay(runtime_policy, elapsed_ms)
        next_check_at = now(delay_ms / 1000)
    end
    local merged, merge_err = transaction(function(tx: any): (any?, any?)
        if terminal then
            local message = observation.error
            if message == nil or message == "" then
                local engines, engine_err = tx:query("SELECT metadata FROM dataflows WHERE dataflow_id=$1", { row.dataflow_id })
                if engine_err then return nil, engine_err end
                local metadata = engines and engines[1] and engines[1].metadata or nil
                if type(metadata) == "string" then
                    local decoded, decode_err = json.decode(metadata)
                    if decode_err then return nil, decode_err end
                    metadata = decoded
                end
                if type(metadata) == "table" then
                    message = metadata.error
                end
            end
            local outer_id, inner_at, inner_id = tostring(message or ""):match("^Node %[([^%]]+)%] failed:%s*()Node %[([^%]]+)%] failed")
            if outer_id and inner_id == outer_id and inner_at then message = tostring(message):sub(inner_at) end
            local params: { any } = { terminal, now(), tostring(message or ""), row.run_id }
            local terminal_suffix = token and " AND completion_check_token=$5" or ""
            if token then params[5] = token end
            local result, err = tx:execute("UPDATE " .. RUNS ..
                " SET admission_state='admitted',status=$1,finished_at=$2,"
                .. "error=$3,terminal_event_pending=TRUE,terminal_event_check_at=$2,completion_check_at=NULL"
                .. " WHERE run_id=$4 AND status IN ('pending','running')" .. terminal_suffix, params)
            if err then return nil, err end
            local affected = tonumber(result and result.rows_affected) or 0
            -- A callback may have committed first. Admission is still recorded,
            -- without moving its terminal status back to running.
            local _, mark_err = tx:execute("UPDATE " .. RUNS ..
                " SET admission_state='admitted' WHERE run_id=$1 AND admission_state='unadmitted'", { row.run_id })
            if mark_err then return nil, mark_err end
            local rows, read_err = tx:query("SELECT status,admission_state FROM " .. RUNS .. " WHERE run_id=$1", { row.run_id })
            if read_err then return nil, read_err end
            local current = rows and rows[1] or nil
            return { admitted = current and current.admission_state == "admitted" or false,
                terminal = current and TERMINAL[tostring(current.status)] ~= nil or false, changed = affected > 0 }, nil
        end
        local query = "UPDATE " .. RUNS .. " SET admission_state='admitted',status='running'"
        local params: { any }
        if token then
            params = { row.run_id, token }
            query = query .. " WHERE run_id=$1 AND status IN ('pending','running') AND completion_check_token=$2"
        else
            params = { next_check_at, row.run_id }
            query = query .. ",completion_check_at=$1 WHERE run_id=$2 AND status IN ('pending','running')"
        end
        local result, err = tx:execute(query, params)
        if err then return nil, err end
        local rows, read_err = tx:query("SELECT status,admission_state FROM " .. RUNS .. " WHERE run_id=$1", { row.run_id })
        if read_err then return nil, read_err end
        local current = rows and rows[1] or nil
        return { admitted = current and current.admission_state == "admitted" or false,
            changed = (tonumber(result and result.rows_affected) or 0) > 0 }, nil
    end)
    if merge_err or not merged then return nil, merge_err end
    local _, wake_err = maintenance_wake.notify()
    if wake_err then return nil, wake_err end
    return merged, nil
end

M.now = now
M.transaction = transaction
return M
