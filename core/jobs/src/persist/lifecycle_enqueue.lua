-- Canonical job enqueue, identity, payload and scoped listing.

local sql = require("sql")
local json = require("json")
local uuid = require("uuid")
local clock = require("clock")
local job_types = require("job_types")
local cfg = require("config")
local trace_context = require("trace_context")
local thread_fence = require("thread_fence")
local row_bytes = require("row_bytes")
local listing = require("listing")
local sql_boundary = require("sql_boundary")

local enqueue = {}
type Executor = sql.DB | sql.Transaction
local now_string = clock.now
local function response_error(field: string): error
    return errors.new({message = "job enqueue response is invalid", kind = errors.INTERNAL,
        retryable = false, details = {code = "job_enqueue_response", field = field}})
end

local function normalize_payload(value: any): table
    if type(value) == "table" then
        return value :: table
    end
    if value == nil then
        return {}
    end
    return { value = tostring(value), value_type = type(value) }
end
enqueue.normalize_payload = normalize_payload

local function encode_part(value: string): string
    return tostring(#value) .. ":" .. value
end

local function payload_with_trace(payload: any, raw_trace: any): (table?, error?)
    local base = normalize_payload(payload)
    local out: { [string]: any } = {}
    for key, value in pairs(base) do
        if key ~= "trace_context" then out[key] = value end
    end
    local source_trace = raw_trace
    if source_trace == nil and base.trace_context ~= nil then
        source_trace = base.trace_context
    end
    local ctx, trace_err = trace_context.normalize(source_trace)
    if trace_err then
        return nil, trace_err
    end
    if ctx then out.trace_context = ctx end
    return out, nil
end

local function encode_object(value: any): (string, error?)
    local encoded, err = json.encode(normalize_payload(value))
    if err then
        return "{}", errors.wrap(err, "failed to encode payload")
    end
    if type(encoded) ~= "string" then return "{}", response_error("payload.encoded") end
    return encoded, nil
end

-- Decode a payload column (string JSON or already-decoded table) into a table.
local function decode_payload(raw: any): (table?, error?)
    if type(raw) == "table" then
        return raw :: table, nil
    end
    if type(raw) ~= "string" or raw == "" then
        return nil, (errors.new({ message = "job payload is not valid JSON", kind = errors.INVALID, retryable = false }) :: error)
    end
    local decoded, err = json.decode(raw)
    if err then return nil, errors.wrap(err, "job payload is not a JSON object") end
    if type(decoded) ~= "table" then
        return nil, errors.new({message = "job payload is not a JSON object", kind = errors.INVALID,
            retryable = false, details = {code = "job_payload_shape"}})
    end
    return decoded :: table, nil
end
enqueue.decode_payload = decode_payload

enqueue.encode_part = encode_part
enqueue.encode_object = encode_object

-- Enqueue a new pending job. An active canonical identity conflict returns the
-- verified existing id; an active slot takes the requested wake key and its row
-- is otherwise unchanged.
type EnqueueParams = {
    thread_id: string?,
    -- Unvalidated input may omit this; owner_locator_error rejects it before writes.
    owner_locator: { kind: string, id: string }?,
    job_type: string,
    worker_ref: string?,
    concurrency_key: string?,
    payload: any?,
    queue_tier: string?,
    priority: integer?,
    max_attempts: integer?,
    idempotency_key: string?,
    scheduled_at: string?,
    trace_context: table?,
    job_identity: table?,
    slot: boolean?,
    wake_key: string?,
    parked: boolean?,
    demand: boolean?,
}
enqueue.EnqueueParams = EnqueueParams

type IdentityParams = {
    thread_id: string?,
    idempotency_key: string?,
    job_identity: table?,
}
enqueue.IdentityParams = IdentityParams

local function identity_parts(params: IdentityParams, id: string): (string?, error?)
    local explicit = params.job_identity
    if type(explicit) == "table" then
        local namespace = explicit.namespace
        local scope = explicit.scope
        local key = explicit.key
        if type(namespace) ~= "string" or namespace == "" or type(scope) ~= "string" or scope == ""
            or type(key) ~= "string" or key == "" then
            return nil, (errors.new({ message = "job_identity requires namespace, scope and key", kind = errors.INVALID }) :: error)
        end
        return encode_part(namespace) .. encode_part(scope) .. encode_part(key), nil
    end
    if type(params.thread_id) == "string" and params.thread_id ~= "" then
        if type(params.idempotency_key) == "string" and params.idempotency_key ~= "" then
            return encode_part("thread") .. encode_part(params.thread_id) .. encode_part(params.idempotency_key), nil
        end
        return encode_part("oneshot") .. encode_part(id) .. encode_part(id), nil
    end
    return nil, (errors.new({ message = "threadless jobs require job_identity", kind = errors.INVALID }) :: error)
end
enqueue.identity_parts = identity_parts

local function same_value(a: any, b: any): boolean
    if type(a) ~= type(b) then return false end
    if type(a) ~= "table" then return a == b end
    for k, v in pairs(a) do
        if not same_value(v, b[k]) then return false end
    end
    for k, _ in pairs(b) do
        if a[k] == nil then return false end
    end
    return true
end

local function immutable_payload(value: table): table
    local result = {}
    for key, item in pairs(value) do
        if key ~= "trace_context" then result[key] = item end
    end
    return result
end

-- A job carries no execution identity: the job's owner record holds it and
-- the worker_ref target resolves it (IDENTITY-1 §4 J row). A request that
-- supplies one is refused.
local function carried_identity_error(params: any): error?
    if type(params) == "table" and ((params :: any).actor_id ~= nil or (params :: any).actor_context ~= nil) then
        return (errors.new({
            message = "jobs carry no execution identity; the job's owner record holds it",
            kind = errors.INVALID,
            retryable = false,
        }) :: error)
    end
    return nil
end
enqueue.carried_identity_error = carried_identity_error

local function owner_locator_error(params: any): error?
    local owner = type(params) == "table" and params.owner_locator or nil
    if type(owner) ~= "table" or type(owner.kind) ~= "string" or owner.kind == ""
        or type(owner.id) ~= "string" or owner.id == "" then
        return (errors.new({ message = "job owner_locator requires kind and id",
            kind = errors.INVALID, retryable = false }) :: error)
    end
    return nil
end
enqueue.owner_locator_error = owner_locator_error

local function matching_existing(existing: table, params: EnqueueParams, payload: table): error?
    if params.demand == true and existing.slot ~= true and existing.slot ~= 1 then
        return (errors.new({ message = "reusable demand conflicts with a one-shot job identity",
            kind = errors.CONFLICT, retryable = false }) :: error)
    end
    local existing_payload, decode_err = decode_payload(existing.payload)
    if decode_err then return decode_err end
    if existing.owner_kind ~= params.owner_locator.kind or existing.owner_id ~= params.owner_locator.id
        or existing.job_type ~= params.job_type
        or (existing.worker_ref or nil) ~= (params.worker_ref or nil)
        or not same_value(immutable_payload(existing_payload :: table), immutable_payload(payload)) then
        return (errors.new({ message = "active job identity has different owner or immutable inputs",
            kind = errors.CONFLICT, retryable = false }) :: error)
    end
    return nil
end

-- An active slot identity converges on the requested wake key in place, so its
-- owner moves the key without replacing the job.
local function converge_wake_key(exec: Executor, existing: table, params: EnqueueParams, max_row_bytes: integer): error?
    if params.slot ~= true or (existing.wake_key or nil) == (params.wake_key or nil) then return nil end
    local size_err = row_bytes.check_update(exec, "kickside_job", existing.id,
        { wake_key = params.wake_key or row_bytes.NULL }, max_row_bytes, "enqueue_job")
    if size_err then return size_err end
    local _, err = sql.builder.update("kickside_job"):set("wake_key", params.wake_key)
        :where(sql.builder.eq({ id = existing.id })):where("status IN ('pending','running')"):run_with(exec):exec()
    if err then return errors.wrap(err, "slot wake key update failed") end
    return nil
end

local function enqueue_job_tx(db_or_tx: Executor, dbtype: string, params: EnqueueParams): (string?, error?, boolean?)
    local carried_err = carried_identity_error(params)
    if carried_err then return nil, carried_err end
    local owner_err = owner_locator_error(params)
    if owner_err then return nil, owner_err end
    local policy, policy_err = cfg.policy()
    if policy_err then return nil, policy_err end
    if type(policy) ~= "table" then return nil, response_error("policy") end
    if type(params.job_type) ~= "string" or params.job_type == "" then
        return nil, (errors.new({ message = "job_type is required", kind = errors.INVALID }) :: error)
    end
    local payload, trace_payload_err = payload_with_trace(params.payload, params.trace_context)
    if trace_payload_err then
        return nil, trace_payload_err
    end
    local payload_json, payload_err = encode_object(payload)
    if payload_err then
        return nil, payload_err
    end
    local now = now_string(dbtype)
    local id = uuid.v7()
    local job_identity, identity_err = identity_parts(params, id)
    if identity_err then return nil, identity_err end
    local owner = params.owner_locator
    local existing_rows, existing_err = sql.builder.select("id", "job_type", "worker_ref", "payload", "owner_kind", "owner_id", "slot", "wake_key")
        :from("kickside_job")
        :where(sql.builder.eq({ job_identity = job_identity }))
        :where("status IN ('pending','running')")
        :limit(1)
        :run_with(db_or_tx):query()
    if existing_err then
        return nil, errors.wrap(existing_err, "enqueue identity lookup failed")
    end
    if type(existing_rows) ~= "table" then return nil, response_error("identity.rows") end
    local already = existing_rows[1]
    if already then
        local mismatch = matching_existing(already, params, payload :: table)
        if mismatch then return nil, mismatch end
        local key_err = converge_wake_key(db_or_tx, already, params, (policy :: any).max_row_bytes)
        if key_err then return nil, key_err end
        return tostring(already.id), nil, false
    end
    -- An empty concurrency key normalizes to NULL at the boundary so later
    -- claims never meet a value the dedupe logic treats differently.
    local concurrency_key: string? = nil
    if type(params.concurrency_key) == "string" and params.concurrency_key ~= "" then
        concurrency_key = params.concurrency_key
    end
    local scheduled_at = params.scheduled_at or now
    if params.scheduled_at ~= nil then
        local instant, parse_err = clock.parse(params.scheduled_at)
        if parse_err then return nil, errors.wrap(parse_err, "scheduled_at must be a timestamp") end
        if type(instant) ~= "table" and type(instant) ~= "userdata" then return nil, response_error("scheduled_at.parsed") end
        scheduled_at = clock.format(instant, dbtype)
    end
    if params.parked then scheduled_at = nil end
    local row: { [string]: any } = {
        id = id,
        owner_kind = owner.kind,
        owner_id = owner.id,
        thread_id = params.thread_id,
        job_identity = job_identity,
        slot = params.slot == true,
        wake_key = params.wake_key,
        job_type = params.job_type,
        worker_ref = params.worker_ref,
        concurrency_key = concurrency_key,
        payload = payload_json,
        status = job_types.JOB_STATE.PENDING,
        priority = math.floor(tonumber(params.priority) or 0),
        attempts = 0,
        max_attempts = math.max(1, math.floor(tonumber(params.max_attempts) or (policy :: any).retry_max_attempts)),
        queue_tier = params.queue_tier or job_types.QUEUE_TIER.LIVE,
        generation = 1,
        scheduled_at = scheduled_at,
    }
    if params.idempotency_key ~= nil and params.idempotency_key ~= "" then
        row.idempotency_key = params.idempotency_key
    end
    local size_err = row_bytes.check_job_insert(db_or_tx, dbtype, row, (policy :: any).max_row_bytes,
        owner.kind .. ":" .. owner.id, "enqueue_job")
    if size_err then return nil, size_err end
    local fence_err = thread_fence.admit(db_or_tx :: sql.Transaction, owner, "enqueue_job")
    if fence_err then return nil, fence_err end

    -- ON CONFLICT DO NOTHING keeps a duplicate idempotency_key from raising:
    -- inside a transaction a failed INSERT aborts the whole tx on postgres.
    local insert_result, insert_err = sql.builder.insert("kickside_job")
        :set_map(row)
        :suffix("ON CONFLICT DO NOTHING")
        :run_with(db_or_tx)
        :exec()
    if insert_err then
        return nil, errors.wrap(insert_err, "failed to enqueue job")
    end
    local inserted_count, proof_err = sql_boundary.single_row_count(insert_result, nil,
        "failed to enqueue job", "insert.count", response_error)
    if proof_err then return nil, proof_err end
    if inserted_count == nil then return nil, response_error("insert.count") end
    if inserted_count < 1 then
        local rows, lookup_err = sql.builder.select("id", "job_type", "worker_ref", "payload", "owner_kind", "owner_id", "slot", "wake_key")
            :from("kickside_job")
            :where(sql.builder.eq({ job_identity = job_identity }))
            :where("status IN ('pending','running')")
            :limit(1)
            :run_with(db_or_tx):query()
        if lookup_err then
            return nil, errors.wrap(lookup_err, "enqueue conflict lookup failed")
        end
        if type(rows) ~= "table" then return nil, response_error("conflict.rows") end
        local existing = rows[1]
        if not existing then
            return nil, (errors.new({ message = "enqueue conflict has no active identity", kind = errors.CONFLICT }) :: error)
        end
        local mismatch = matching_existing(existing, params, payload :: table)
        if mismatch then return nil, mismatch end
        local key_err = converge_wake_key(db_or_tx, existing, params, (policy :: any).max_row_bytes)
        if key_err then return nil, key_err end
        return tostring(existing.id), nil, false
    end
    return id, nil, true
end
local function enqueue_job(db_or_tx: Executor, dbtype: string, params: EnqueueParams): (string?, error?, boolean?)
    if type((db_or_tx :: any).db_type) == "function" then
        return enqueue_job_tx(db_or_tx, dbtype, params)
    end
    local tx, begin_err = sql_boundary.begin(db_or_tx :: sql.DB,
        "job enqueue transaction failed", "transaction", response_error)
    if begin_err then return nil, begin_err end
    if not tx then return nil, response_error("transaction") end
    local id, err, inserted = enqueue_job_tx(tx, dbtype, params)
    if err then
        return nil, sql_boundary.rollback(tx, err, "job enqueue rollback failed")
    end
    local _, commit_err = tx:commit()
    if commit_err then
        return nil, errors.wrap(commit_err, "job enqueue commit failed")
    end
    return id, nil, inserted
end
enqueue.enqueue_job = enqueue_job

enqueue.list_jobs = listing.list_jobs
enqueue.list_job_runs = listing.list_job_runs
enqueue.get_job = listing.get_job
enqueue.get_job_statuses = listing.get_job_statuses

return enqueue
