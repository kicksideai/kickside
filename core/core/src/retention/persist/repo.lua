-- Core stores the per-thread event-retention override. Jobs stores and enforces
-- job and run retention through its owner policy.

local sql = require("sql")
local uuid = require("uuid")
local clock = require("clock")
local consts = require("ret_consts")
local retention_notifier = require("retention_notifier")

local repo = {}

-- A pooled connection or open transaction.
type Executor = sql.DB | sql.Transaction

-- A normalized policy as read back / written.
type Policy = {
    event_hot_retention_days: integer,
    archive_mode: string,
    enabled: boolean,
}

local now_string = clock.now

-- Clamp a requested window to a non-negative integer at least DAYS_MIN, falling
-- back to the enforced default when omitted or non-numeric.
local function clamp_days(value: any, fallback: integer): integer
    local n = tonumber(value)
    if not n then
        return fallback
    end
    local days = math.floor(n)
    if days < consts.DAYS_MIN then
        return consts.DAYS_MIN
    end
    return days
end

-- Validate and normalize a caller's policy input into the enforced shape. Returns
-- the normalized values or a typed invalid error.
function repo.normalize(input: table?): (Policy?, error?)
    local data = type(input) == "table" and input or {}

    -- A field given but explicitly below the floor is a hard error, so a caller
    -- that means "prune immediately" is told no rather than silently clamped.
    local raw = data.event_hot_retention_days
    if raw ~= nil then
        local n = tonumber(raw)
        if not n or math.floor(n) < consts.DAYS_MIN then
            return nil, (errors.new({ message = "event_hot_retention_days must be at least "
                .. tostring(consts.DAYS_MIN), kind = errors.INVALID }) :: error)
        end
    end

    local archive_mode = data.archive_mode
    if archive_mode ~= nil and archive_mode ~= consts.ARCHIVE_MODE.TOMBSTONE_ONLY and archive_mode ~= consts.ARCHIVE_MODE.HARD_DELETE then
        return nil, (errors.new({ message = "archive_mode must be one of: tombstone_only, hard_delete", kind = errors.INVALID }) :: error)
    end

    return {
        event_hot_retention_days = clamp_days(data.event_hot_retention_days, consts.DEFAULTS.event_hot_retention_days),
        archive_mode = type(archive_mode) == "string" and archive_mode or consts.DEFAULTS.archive_mode,
        enabled = data.enabled ~= false,
    }, nil
end

-- find_by_thread loads a thread's policy, or nil when none is set.
function repo.find_by_thread(db_or_tx: Executor, thread_id: string): (Policy?, error?)
    local rows, err = sql.builder.select("event_hot_retention_days", "archive_mode", "enabled")
        :from(consts.POLICY_TABLE)
        :where(sql.builder.eq({ thread_id = thread_id }))
        :limit(1)
        :run_with(db_or_tx)
        :query()
    if err then
        return nil, errors.wrap(err, "failed to load retention policy")
    end
    if not rows or #rows == 0 then
        return nil, nil
    end
    local row = rows[1]
    local enabled = row.enabled
    if type(enabled) == "number" then
        enabled = enabled ~= 0
    end
    return {
        event_hot_retention_days = math.floor(tonumber(row.event_hot_retention_days) or consts.DEFAULTS.event_hot_retention_days),
        archive_mode = tostring(row.archive_mode or consts.DEFAULTS.archive_mode),
        enabled = enabled == true,
    }, nil
end

-- upsert validates the input, then writes the thread's policy in one statement:
-- INSERT .. ON CONFLICT(thread_id) DO UPDATE against the table's unique index
-- (uq_kickside_retention_policy_thread). A separate SELECT-then-insert/update
-- is a check-then-act race -- two concurrent first-touch upserts for the same
-- thread (e.g. provision.materialize's own call racing the create path's) both
-- see "no row" and both insert, and the loser hits the unique constraint. The
-- database resolves the race atomically instead. Returns the normalized policy
-- that was persisted.
function repo.upsert(db: sql.DB, thread_id: string, input: table?): (Policy?, error?)
    if type(thread_id) ~= "string" or thread_id == "" then
        return nil, (errors.new({ message = "thread_id is required", kind = errors.INVALID }) :: error)
    end

    local policy, normalize_err = repo.normalize(input)
    if normalize_err or not policy then
        return nil, normalize_err
    end
    local p = policy :: Policy

    local dbtype_raw, dbtype_err = db:type()
    if dbtype_err then
        return nil, errors.wrap(dbtype_err, "failed to resolve db type")
    end
    local dbtype = tostring(dbtype_raw)
    local now = now_string(dbtype)
    local enabled_value: any = dbtype == sql.type.SQLITE and (p.enabled and 1 or 0) or p.enabled

    local result, upsert_err = db:execute(
        "INSERT INTO " .. consts.POLICY_TABLE
        .. " (id,thread_id,event_hot_retention_days,archive_mode,enabled,created_at,updated_at)"
        .. " VALUES ($1,$2,$3,$4,$5,$6,$7)"
        .. " ON CONFLICT(thread_id) DO UPDATE SET"
        .. " event_hot_retention_days=excluded.event_hot_retention_days,"
        .. " archive_mode=excluded.archive_mode,"
        .. " enabled=excluded.enabled,"
        .. " updated_at=excluded.updated_at",
        {
            uuid.v7(), thread_id, p.event_hot_retention_days, p.archive_mode,
            enabled_value, now, now,
        }
    )
    if upsert_err then return nil, errors.wrap(upsert_err, "failed to upsert retention policy") end
    if not result then
        return nil, errors.new({message = "retention policy write returned no result", kind = errors.INTERNAL,
            retryable = false, details = {code = "retention_policy_response", field = "execute"}})
    end
    local _, notify_err = retention_notifier.notify({ kind = "thread_policy_changed", thread_id = thread_id })
    if notify_err then return nil, notify_err end
    return p, nil
end

return repo
