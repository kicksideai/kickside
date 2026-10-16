-- Automation drives (design v4 §5.1): one row per (automation_id, drive_key)
-- in the automation DB. A drive carries its applied declaration, the round and
-- control fences (revision, rewind_generation, command_generation,
-- pending_command_id), its acquisition position, its slot job and the durable
-- control-wake demand (wake_generation vs wake_applied_generation).
--
-- Every *_tx runs on the caller's transaction and takes the dialect from it;
-- nothing here acquires a connection. Drives of one automation are locked in
-- ascending drive_key order (§14 lock order: command row, then drives by PK).
-- Updates are guarded: a fenced write changes a row only when every captured
-- fence still holds, and reports whether it did.

local sql = require("sql")
local json = require("json")
local time = require("time")

local drive = {}

drive.TABLE = "kickside_automation_drive"

drive.PHASE = {
    PENDING = "pending",
    ACTIVE = "active",
    PAUSED = "paused",
    DEGRADED = "degraded",
    BACKPRESSURE = "backpressure",
    BLOCKED_DECLARATION = "blocked_declaration",
    BLOCKED_ACCESS = "blocked_access",
    BLOCKED_IDENTITY = "blocked_identity",
    BLOCKED_SOURCE_DELETED = "blocked_source_deleted",
}

-- What a drive acquires from (A22): a source thread's events, a pulled
-- collection, timer occurrences, its source's keys for reconciliation
-- (A33), or nothing (such a drive has no slot).
drive.SOURCE_KIND = { EVENT = "event", COLLECTION = "collection", TIMER = "timer", RECONCILE = "reconcile", MANUAL = "manual", NONE = "none" }
local SOURCE_KINDS: { [string]: boolean } = { event = true, collection = true, timer = true, reconcile = true, manual = true, none = true }

type Map = { [string]: any }

-- wake_key(thread_id) -> the wake key of an event drive's source thread, which
-- its slot carries (design v5 §4.1).
function drive.wake_key(thread_id: string): string
    return "thread:" .. thread_id
end

-- The drive fields a caller supplies at creation.
type NewDrive = {
    automation_id: string,
    drive_key: string,
    source_kind: string,
    applied: Map?,
    applied_hash: string?,
    source_thread_id: string?,
    sink_port: string?,
    sink_resource_id: string?,
    action: Map?,
    cursor: string?,
    event_seq: integer?,
    next_run_at: string?,
    reconcile_next_at: string?,
    backfill_since: string?,
    delivery_revision: integer?,
    unresolved_count: integer?,
    enabled: boolean?,
    phase: string?,
    job_id: string?,
}

local COLUMNS = {
    "automation_id", "drive_key", "applied_json", "applied_hash", "revision", "rewind_generation",
    "command_generation", "pending_command_id", "source_kind", "source_thread_id", "sink_port",
    "sink_resource_id", "action_json", "cursor", "event_seq", "backfill_since", "delivery_revision",
    "pin_generation", "pin_advance_cursor", "pin_next_at", "pin_error_json", "repair_next_at", "last_committed_occurrence_seq", "occurrence_seq", "occurrence_due_at",
    "occurrence_payload_json", "occurrence_key", "phase", "enabled", "round_seq", "round_token",
    "round_until", "admission_json", "job_id", "wake_generation", "wake_applied_generation", "next_run_at",
    "last_round_at", "unresolved_count", "uncertain_count", "last_error_json", "reconcile_next_at",
    "reconcile_pass_id", "sweep_pending", "pass_pages", "pass_items",
}

local INTEGER_COLUMNS = {
    revision = true, rewind_generation = true, command_generation = true, event_seq = true,
    delivery_revision = true, pin_generation = true, pin_advance_cursor = true, last_committed_occurrence_seq = true,
    occurrence_seq = true, round_seq = true, wake_generation = true, wake_applied_generation = true,
    unresolved_count = true, uncertain_count = true, pass_pages = true, pass_items = true,
}

local function invalid(message: string): error
    return (errors.new({ message = message, kind = errors.INVALID, retryable = false }) :: error)
end

local function internal(message: string, err: any): error
    return (errors.new({ message = message .. ": " .. tostring(err), kind = errors.INTERNAL, retryable = true }) :: error)
end

local function text(value: any, field: string): (string?, error?)
    if type(value) ~= "string" or value == "" then return nil, invalid(field .. " is required") end
    return value :: string, nil
end

local function dialect(executor: any): (string?, error?)
    local raw, err
    if type(executor.db_type) == "function" then
        raw, err = executor:db_type()
    else
        raw, err = executor:type()
    end
    if err then return nil, internal("failed to resolve the dialect", err) end
    return tostring(raw), nil
end

local function encode(value: any, field: string): (string?, error?)
    local encoded, err = json.encode(value or {})
    if err or type(encoded) ~= "string" then return nil, invalid(field .. " must be JSON serializable") end
    if encoded == "[]" then encoded = "{}" end
    return encoded :: string, nil
end

local FENCE_COLUMNS = {
    "automation_id", "drive_key", "revision", "rewind_generation", "command_generation",
    "pending_command_id", "round_token", "round_until",
}

local function normalize_fields(row: Map, columns: { string }): Map
    local out: Map = {}
    for _, column in ipairs(columns) do
        local value = row[column]
        if INTEGER_COLUMNS[column] and value ~= nil then value = math.floor(tonumber(value) :: number) end
        out[column] = value
    end
    return out
end

local function normalize(row: Map): (Map?, error?)
    local out = normalize_fields(row, COLUMNS)
    out.enabled = row.enabled == true or row.enabled == 1
    out.sweep_pending = row.sweep_pending == true or row.sweep_pending == 1
    for _, pair in ipairs({ { "applied_json", "applied" }, { "action_json", "action" } }) do
        local raw = row[pair[1]]
        local decoded, err = json.decode(tostring(raw or "{}"))
        if err then return nil, internal("drive " .. tostring(row.drive_key) .. " " .. pair[1] .. " is not JSON", err) end
        out[pair[2]] = decoded
    end
    if row.admission_json ~= nil then
        local admitted,err=json.decode(tostring(row.admission_json))
        if err or type(admitted) ~= "table" then return nil,internal("drive admission is invalid",err) end
        out.admission=admitted
    end
    return out, nil
end

local function key_filter(automation_id: string, drive_key: string): any
    return sql.builder.expr("automation_id = ? AND drive_key = ?", automation_id, drive_key)
end

-- sorted_keys(keys) -> the distinct keys in ascending order, the drive lock order.
function drive.sorted_keys(keys: { string }): { string }
    local seen: { [string]: boolean } = {}
    local out: { string } = {}
    for _, key in ipairs(keys) do
        if type(key) == "string" and key ~= "" and not seen[key] then
            seen[key] = true
            out[#out + 1] = key
        end
    end
    table.sort(out)
    return out
end

-- insert_tx creates one drive. A drive that already exists is a CONFLICT.
function drive.insert_tx(tx: sql.Transaction, spec: NewDrive): (Map?, error?)
    local automation_id, e1 = text(spec.automation_id, "automation_id")
    if e1 then return nil, e1 end
    local drive_key, e2 = text(spec.drive_key, "drive_key")
    if e2 then return nil, e2 end
    local source_kind, e3 = text(spec.source_kind, "source_kind")
    if e3 then return nil, e3 end
    if not SOURCE_KINDS[source_kind :: string] then
        return nil, invalid("source_kind must be event, collection, timer, reconcile, manual or none: " .. tostring(source_kind))
    end
    if source_kind == drive.SOURCE_KIND.EVENT and (type(spec.source_thread_id) ~= "string" or spec.source_thread_id == "") then
        return nil, invalid("an event drive requires source_thread_id")
    end
    local applied_json, e4 = encode(spec.applied, "applied")
    if e4 then return nil, e4 end
    local action_json, e5 = encode(spec.action, "action")
    if e5 then return nil, e5 end
    local row: Map = {
        automation_id = automation_id,
        drive_key = drive_key,
        source_kind = source_kind,
        applied_json = applied_json,
        applied_hash = spec.applied_hash or "",
        action_json = action_json,
        phase = spec.phase or drive.PHASE.PENDING,
        enabled = spec.enabled ~= false,
    }
    for _, field in ipairs({ "source_thread_id", "sink_port", "sink_resource_id", "cursor", "event_seq", "next_run_at", "job_id",
        "reconcile_next_at", "backfill_since", "delivery_revision", "unresolved_count", "uncertain_count" }) do
        if (spec :: Map)[field] ~= nil then row[field] = (spec :: Map)[field] end
    end
    local _, err = sql.builder.insert(drive.TABLE):set_map(row):run_with(tx):exec()
    if err then
        if string.find(string.lower(tostring(err)), "unique", 1, true) or string.find(string.lower(tostring(err)), "duplicate", 1, true) then
            return nil, (errors.new({ message = "drive " .. tostring(automation_id) .. "/" .. tostring(drive_key) .. " already exists",
                kind = errors.CONFLICT, retryable = false }) :: error)
        end
        return nil, internal("failed to insert drive", err)
    end
    return drive.get(tx, automation_id :: string, drive_key :: string)
end

-- get(db_or_tx, automation_id, drive_key) -> (drive?, err?); nil, nil when absent.
function drive.get(executor: any, automation_id: string, drive_key: string): (Map?, error?)
    local rows, err = sql.builder.select(table.unpack(COLUMNS)):from(drive.TABLE)
        :where(key_filter(automation_id, drive_key)):run_with(executor):query()
    if err then return nil, internal("failed to read drive", err) end
    local row = (rows :: { Map })[1]
    if not row then return nil, nil end
    return normalize(row)
end

function drive.get_fence(executor: any, automation_id: string, drive_key: string): (Map?, error?)
    local rows, err = sql.builder.select(table.unpack(FENCE_COLUMNS)):from(drive.TABLE)
        :where(key_filter(automation_id, drive_key)):run_with(executor):query()
    if err then return nil, internal("failed to read drive fence", err) end
    local row = (rows :: { Map })[1]
    if not row then return nil, nil end
    return normalize_fields(row, FENCE_COLUMNS), nil
end

function drive.get_admission(executor: any, automation_id: string, drive_key: string, delivery_key: string): (Map?, error?)
    local dbtype, dialect_err = dialect(executor)
    if dialect_err then return nil, dialect_err end
    local projection = dbtype == sql.type.POSTGRES and "(admission_json::json -> $3)::text"
        or "(SELECT value FROM json_each(admission_json) WHERE key=$3)"
    local rows, read_err = executor:query("WITH held AS (SELECT " .. table.concat(FENCE_COLUMNS, ",")
        .. ",admission_json FROM " .. drive.TABLE .. " WHERE automation_id=$1 AND drive_key=$2) SELECT "
        .. table.concat(FENCE_COLUMNS, ",") .. "," .. projection .. " AS evidence_json FROM held",
        {automation_id, drive_key, delivery_key})
    if read_err then return nil, internal("failed to read delivery admission", read_err) end
    local row = (rows :: { Map })[1]
    if not row then return nil, nil end
    local held = normalize_fields(row, FENCE_COLUMNS)
    if row.evidence_json ~= nil then
        local evidence, decode_err = json.decode(tostring(row.evidence_json))
        if decode_err or type(evidence) ~= "table" then return nil, internal("delivery admission is invalid", decode_err) end
        held.admission = {[delivery_key] = evidence}
    end
    return held, nil
end

-- list(db_or_tx, automation_id, {after_key?, limit?}) -> one page of drives in
-- drive_key order and the key to continue after, when more remain.
function drive.list(executor: any, automation_id: string, page: Map?): ({ Map }?, string?, error?)
    local opts = type(page) == "table" and page or {}
    local limit = math.floor(tonumber(opts.limit) or 100)
    if limit < 1 or limit > 1000 then return nil, nil, invalid("limit must be in [1, 1000]") end
    local query = sql.builder.select(table.unpack(COLUMNS)):from(drive.TABLE)
        :where(sql.builder.eq({ automation_id = automation_id }))
    if type(opts.after_key) == "string" and opts.after_key ~= "" then
        query = query:where("drive_key > ?", opts.after_key)
    end
    local rows, err = query:order_by("drive_key ASC"):limit(limit + 1):run_with(executor):query()
    if err then return nil, nil, internal("failed to list drives", err) end
    local out: { Map } = {}
    for index, row in ipairs(rows :: { Map }) do
        if index > limit then break end
        local normalized, norm_err = normalize(row)
        if norm_err then return nil, nil, norm_err end
        out[#out + 1] = normalized :: Map
    end
    local next_key: string? = nil
    if #(rows :: { Map }) > limit then next_key = out[#out].drive_key end
    return out, next_key, nil
end

-- marks(n) -> "?, ?, ..." with n placeholders.
local function marks(n: integer): string
    local out: { string } = {}
    for i = 1, n do out[i] = "?" end
    return table.concat(out, ", ")
end

-- list_for(executor, automation_ids) -> the drives of several automations in
-- one statement, ordered by automation and drive key. The caller bounds the id
-- list.
function drive.list_for(executor: any, automation_ids: { string }): ({ Map }?, error?)
    if #automation_ids == 0 then return {}, nil end
    local rows, err = sql.builder.select(table.unpack(COLUMNS)):from(drive.TABLE)
        :where("automation_id IN (" .. marks(#automation_ids) .. ")", table.unpack(automation_ids))
        :order_by("automation_id ASC", "drive_key ASC"):run_with(executor):query()
    if err then return nil, internal("failed to list drives", err) end
    local out: { Map } = {}
    for _, row in ipairs(rows :: { Map }) do
        local normalized, norm_err = normalize(row)
        if norm_err then return nil, norm_err end
        out[#out + 1] = normalized :: Map
    end
    return out, nil
end

-- keys(db_or_tx, automation_id) -> every drive key of the automation, ascending.
function drive.keys(executor: any, automation_id: string): ({ string }?, error?)
    local rows, err = sql.builder.select("drive_key"):from(drive.TABLE)
        :where(sql.builder.eq({ automation_id = automation_id })):order_by("drive_key ASC")
        :run_with(executor):query()
    if err then return nil, internal("failed to list drive keys", err) end
    local out: { string } = {}
    for _, row in ipairs(rows :: { Map }) do out[#out + 1] = tostring(row.drive_key) end
    return out, nil
end

-- lock_tx locks the named drives in drive_key order and returns them keyed by
-- drive_key. A named drive that does not exist is NOT_FOUND.
function drive.lock_tx(tx: sql.Transaction, automation_id: string, drive_keys: { string }): ({ [string]: Map }?, error?)
    local dbtype, dt_err = dialect(tx)
    if dt_err then return nil, dt_err end
    local out: { [string]: Map } = {}
    for _, key in ipairs(drive.sorted_keys(drive_keys)) do
        local query = sql.builder.select(table.unpack(COLUMNS)):from(drive.TABLE):where(key_filter(automation_id, key))
        if dbtype ~= sql.type.SQLITE then query = query:suffix("FOR UPDATE") end
        local rows, err = query:run_with(tx):query()
        if err then return nil, internal("failed to lock drive", err) end
        local row = (rows :: { Map })[1]
        if not row then
            return nil, (errors.new({ message = "drive " .. automation_id .. "/" .. key .. " not found",
                kind = errors.NOT_FOUND, retryable = false }) :: error)
        end
        local normalized, norm_err = normalize(row)
        if norm_err then return nil, norm_err end
        out[key] = normalized :: Map
    end
    return out, nil
end

-- The fences a guarded write captured; each present field must still match.
type Fence = {
    revision: integer?,
    rewind_generation: integer?,
    command_generation: integer?,
    round_token: string?,
    no_pending_command: boolean?,
}

-- update_cas_tx applies fields to one drive only while every captured fence
-- still holds. Returns whether the drive was written.
function drive.update_cas_tx(tx: sql.Transaction, automation_id: string, drive_key: string, fence: Fence, fields: Map): (boolean?, error?)
    if type(fields) ~= "table" or next(fields) == nil then return nil, invalid("fields are required") end
    local update = sql.builder.update(drive.TABLE)
    for column, value in pairs(fields) do
        if column == "applied" or column == "action" then
            local encoded, enc_err = encode(value, column)
            if enc_err then return nil, enc_err end
            update = update:set(column .. "_json", encoded)
        elseif value == sql.NULL then
            update = update:set(column, sql.NULL)
        else
            update = update:set(column, value)
        end
    end
    update = update:where(key_filter(automation_id, drive_key))
    for _, column in ipairs({ "revision", "rewind_generation", "command_generation", "round_token" }) do
        local expected = (fence :: Map)[column]
        if expected ~= nil then update = update:where(sql.builder.eq({ [column] = expected })) end
    end
    if fence.no_pending_command then update = update:where("pending_command_id IS NULL") end
    local result, err = update:run_with(tx):exec()
    if err then return nil, internal("failed to update drive", err) end
    return (tonumber(result and (result :: any).rows_affected) or 0) == 1, nil
end

-- unblock_identity_tx returns every drive of the automation that an unproven
-- or refused execution identity blocked to its enabled phase (active, or
-- paused when disabled): a newly selected identity runs them.
function drive.unblock_identity_tx(tx: sql.Transaction, automation_id: string): error?
    local _, err = tx:execute("UPDATE " .. drive.TABLE .. " SET phase = CASE WHEN enabled THEN $1 ELSE $2 END,"
        .. " last_error_json = NULL WHERE automation_id = $3 AND phase = $4",
        { drive.PHASE.ACTIVE, drive.PHASE.PAUSED, automation_id, drive.PHASE.BLOCKED_IDENTITY })
    if err then return internal("failed to unblock identity-blocked drives", err) end
    return nil
end

-- fence_for_command_tx moves every named, already locked drive under a
-- reserved command: the command's generation and id, a new revision, a
-- cleared round token (so no running round can commit) and new wake demand.
function drive.fence_for_command_tx(tx: sql.Transaction, automation_id: string, drive_keys: { string }, command_id: string, generation: integer): error?
    for _, key in ipairs(drive.sorted_keys(drive_keys)) do
        local _, err = tx:execute("UPDATE " .. drive.TABLE .. " SET command_generation = $1, pending_command_id = $2,"
            .. " revision = revision + 1, round_token = NULL, round_until = NULL, repair_next_at = NULL, wake_generation = wake_generation + 1"
            .. " WHERE automation_id = $3 AND drive_key = $4", { generation, command_id, automation_id, key })
        if err then return internal("failed to fence drive for command", err) end
    end
    return nil
end

-- release_command_tx clears a finalized command from its drives and publishes
-- wake demand so each slot runs under the outcome. Only drives still pending
-- on exactly this command id and generation are released. `applied` ({
-- declaration, policy, hash }) is what a succeeded command applied: each
-- released drive records its declaration and resolved drive policy, and the
-- hash, in the same statement.
function drive.release_command_tx(tx: sql.Transaction, automation_id: string, drive_keys: { string }, command_id: string, generation: integer, applied: Map?): error?
    local applied_json: string? = nil
    if applied ~= nil then
        if type(applied.policy) ~= "table" then return invalid("applied policy is required") end
        local encoded, enc_err = encode({ declaration = applied.declaration, policy = applied.policy }, "applied")
        if enc_err then return enc_err end
        if type(applied.hash) ~= "string" or applied.hash == "" then return invalid("applied hash is required") end
        applied_json = encoded
    end
    -- Placeholders are numbered in order of appearance: SQLite binds them
    -- positionally.
    for _, key in ipairs(drive.sorted_keys(drive_keys)) do
        local result, err
        if applied_json ~= nil then
            result, err = tx:execute("UPDATE " .. drive.TABLE .. " SET pending_command_id = NULL, repair_next_at = NULL, wake_generation = wake_generation + 1,"
                .. " applied_json = $1, applied_hash = $2"
                .. " WHERE automation_id = $3 AND drive_key = $4 AND pending_command_id = $5 AND command_generation = $6",
                { applied_json, (applied :: Map).hash, automation_id, key, command_id, generation })
        else
            result, err = tx:execute("UPDATE " .. drive.TABLE .. " SET pending_command_id = NULL, repair_next_at = NULL, wake_generation = wake_generation + 1"
                .. " WHERE automation_id = $1 AND drive_key = $2 AND pending_command_id = $3 AND command_generation = $4",
                { automation_id, key, command_id, generation })
        end
        if err then return internal("failed to release drive from command", err) end
        if (tonumber(result and (result :: any).rows_affected) or 0) ~= 1 then
            return (errors.new({ message = "drive " .. automation_id .. "/" .. key .. " is no longer pending on command " .. command_id,
                kind = errors.CONFLICT, retryable = false, details = { reason = "stale_generation" } }) :: error)
        end
    end
    return nil
end

-- wake_due(db_or_tx, limit) -> drives whose control wake demand has not been
-- acknowledged, through the partial wake index.
function drive.wake_due(executor: any, limit: integer): ({ Map }?, error?)
    local rows, err = executor:query("SELECT automation_id, drive_key, job_id, wake_generation, wake_applied_generation FROM "
        .. drive.TABLE .. " WHERE wake_generation > wake_applied_generation AND (repair_next_at IS NULL OR repair_next_at <= $1) ORDER BY CASE WHEN job_id IS NULL THEN 1 ELSE 0 END, automation_id, drive_key LIMIT $2", { drive.utc_now(), limit })
    if err then return nil, internal("failed to scan drive wake demand", err) end
    local out: { Map } = {}
    for _, row in ipairs(rows :: { Map }) do
        out[#out + 1] = {
            automation_id = row.automation_id,
            drive_key = row.drive_key,
            job_id = row.job_id,
            wake_generation = math.floor(tonumber(row.wake_generation) :: number),
            wake_applied_generation = math.floor(tonumber(row.wake_applied_generation) :: number),
        }
    end
    return out, nil
end

-- missing_slots(db_or_tx, limit) -> drives that acquire from a source but have
-- no slot and no pending command, through the partial missing-slot index: the
-- dispatcher provisions them. A drive still pending on its install gets its
-- slot when the install succeeds; a drive without a source has none.
function drive.missing_slots(executor: any, limit: integer): ({ Map }?, error?)
    local rows, err = executor:query("SELECT automation_id, drive_key FROM " .. drive.TABLE
        .. " WHERE job_id IS NULL AND pending_command_id IS NULL AND source_kind <> 'none' AND (repair_next_at IS NULL OR repair_next_at <= $1)"
        .. " ORDER BY automation_id, drive_key LIMIT $2", { drive.utc_now(), limit })
    if err then return nil, internal("failed to scan drives without a slot", err) end
    local out: { Map } = {}
    for _, row in ipairs(rows :: { Map }) do
        out[#out + 1] = { automation_id = row.automation_id, drive_key = row.drive_key }
    end
    return out, nil
end

-- ack_wake_tx advances wake_applied_generation from the observed value to the
-- observed demand generation. A newer demand keeps the drive due; returns
-- whether this acknowledgment applied.
function drive.ack_wake_tx(tx: sql.Transaction, automation_id: string, drive_key: string, observed_applied: integer, observed_generation: integer): (boolean?, error?)
    local result, err = tx:execute("UPDATE " .. drive.TABLE .. " SET wake_applied_generation = $1"
        .. " WHERE automation_id = $2 AND drive_key = $3 AND wake_applied_generation = $4 AND wake_generation >= $1",
        { observed_generation, automation_id, drive_key, observed_applied })
    if err then return nil, internal("failed to acknowledge drive wake", err) end
    return (tonumber(result and (result :: any).rows_affected) or 0) == 1, nil
end

-- delete_tx removes one drive; returns whether it existed.
function drive.delete_tx(tx: sql.Transaction, automation_id: string, drive_key: string): (boolean?, error?)
    local result, err = sql.builder.delete(drive.TABLE):where(key_filter(automation_id, drive_key)):run_with(tx):exec()
    if err then return nil, internal("failed to delete drive", err) end
    return (tonumber(result and (result :: any).rows_affected) or 0) == 1, nil
end

-- utc_now() -> the canonical RFC3339 UTC timestamp the automation tables store.
function drive.utc_now(): string
    return time.now():utc():format(time.RFC3339) :: string
end

-- utc_after(ms) -> the canonical timestamp ms milliseconds from now.
function drive.utc_after(ms: integer): string
    return time.now():utc():add(ms * time.MILLISECOND):format(time.RFC3339) :: string
end

function drive.utc_at_ms(ms: integer): string
    return time.unix(ms // 1000, (ms % 1000) * 1000000):utc():format("2006-01-02T15:04:05.000Z07:00") :: string
end

function drive.after(left: string, right: string): boolean
    local a, aerr = time.parse(time.RFC3339, left)
    if aerr then error(errors.new({ kind = errors.INVALID, retryable = false,
        message = "invalid scheduling timestamp", details = { code = "automation_timestamp_invalid", value = left } })) end
    local b, berr = time.parse(time.RFC3339, right)
    if berr then error(errors.new({ kind = errors.INVALID, retryable = false,
        message = "invalid scheduling timestamp", details = { code = "automation_timestamp_invalid", value = right } })) end
    return a:after(b)
end

function drive.time_sql(executor: any, expression: string): (string?, error?)
    local dbtype, type_err = dialect(executor)
    if type_err then return nil, type_err end
    if dbtype == sql.type.SQLITE then return "julianday(" .. expression .. ")", nil end
    if dbtype == sql.type.POSTGRES then return "EXTRACT(EPOCH FROM (" .. expression .. ")::timestamptz)", nil end
    return nil, errors.new({ kind = errors.INVALID, retryable = false,
        message = "unsupported scheduling dialect", details = { code = "automation_timestamp_dialect_invalid" } })
end

drive.NewDrive = NewDrive

return drive
