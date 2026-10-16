-- Core owns event-prefix pruning and committed write-receipt retention. The
-- service invokes these operations at exact eligibility deadlines and after
-- state-change notifications; foreign-owner retention is dispatched by its owner.

local sql = require("sql")
local time = require("time")
local clock = require("clock")
local prune = require("prune")
local receipt_purge = require("receipt_purge")
local retention_policy = require("retention_policy")

local sweeper = {}

type DB = sql.DB

type RunStats = {
    events: integer,
    write_receipts: integer,
    needs_continue: boolean,
}

local function response_failure(message: string, field: string): error
    return errors.new({message = message, kind = errors.INTERNAL, retryable = false,
        details = {code = "retention_sweeper_response", field = field}})
end

local function rows_result(value: any, field: string): ({ table }?, error?)
    if type(value) ~= "table" then
        return nil, response_failure("retention query returns no row collection", field)
    end
    local length = #value
    for key, row in pairs(value) do
        if type(key) ~= "number" or key < 1 or key > length or key ~= math.floor(key)
            or type(row) ~= "table" then
            return nil, response_failure("retention query returns malformed rows", field)
        end
    end
    for index = 1, length do
        if type(value[index]) ~= "table" then
            return nil, response_failure("retention query returns a missing row", field)
        end
    end
    return value, nil
end

local function load_policy(): (table?, error?)
    local value, err = retention_policy.policy()
    if err then return nil, err end
    if type(value) ~= "table" then
        return nil, response_failure("retention policy returns no policy", "policy")
    end
    for _, field in ipairs({"events_ms", "receipts_orphan_ms", "batch_events", "batch_receipts"}) do
        if type(value[field]) ~= "number" then
            return nil, response_failure("retention policy returns an incomplete policy", "policy")
        end
    end
    return value, nil
end

local function deleted_count(value: any, field: string): (integer?, error?)
    local deleted = type(value) == "table" and value.deleted or nil
    if type(deleted) ~= "number" or deleted < 0 or deleted ~= math.floor(deleted) then
        return nil, response_failure("retention operation returns no deletion count", field)
    end
    return deleted :: integer, nil
end

local function active(value: any): boolean
    if type(value) == "number" then return value ~= 0 end
    return value ~= false
end

local function event_window_ms(row: table, policy: table): (integer?, error?)
    if row.event_hot_retention_days == nil then return policy.events_ms, nil end
    local days = tonumber(row.event_hot_retention_days)
    if not days or days < 1 or days ~= math.floor(days) then
        return nil, response_failure("invalid per-thread event retention window", "event_hot_retention_days")
    end
    return (days * 86400000) :: integer, nil
end

local function event_cutoff(dbtype: string, window_ms: integer, now: any): string
    return clock.format(now:add(-window_ms * time.MILLISECOND), dbtype)
end

local function parse_timestamp(raw: string, dbtype: string): (any?, error?)
    local sqlite_layouts = {
        "2006-01-02 15:04:05.999999999",
        "2006-01-02 15:04:05.000000",
        "2006-01-02 15:04:05",
        "2006-01-02 15:04:05.999999999Z07:00",
        "2006-01-02T15:04:05.999999999Z07:00",
        "2006-01-02T15:04:05Z07:00",
    }
    local postgres_layouts = {
        "2006-01-02T15:04:05.999999999Z07:00",
        "2006-01-02 15:04:05.999999999Z07:00",
        "2006-01-02 15:04:05.999999999-07",
        "2006-01-02 15:04:05.999999999",
        "2006-01-02T15:04:05Z07:00",
    }
    local layouts = dbtype == sql.type.SQLITE and sqlite_layouts or postgres_layouts
    for _, layout in ipairs(layouts) do
        local parsed, parse_err = time.parse(layout, raw)
        if not parse_err and parsed then return parsed, nil end
    end
    return nil, response_failure("retention timestamp has an unknown shape", "timestamp")
end

-- deadline_ms returns the absolute UTC eligibility deadline for a stored row.
function sweeper.deadline_ms(stamp: string, retention_ms: integer, dbtype: string): (integer?, error?)
    if type(stamp) ~= "string" or stamp == "" or type(retention_ms) ~= "number"
        or retention_ms < 1 or retention_ms ~= math.floor(retention_ms) then
        return nil, (errors.new({ message = "timestamp and positive retention_ms are required",
            kind = errors.INVALID }) :: error)
    end
    local parsed, parse_err = parse_timestamp(stamp, dbtype)
    if parse_err then return nil, parse_err end
    -- Prune predicates use a strict timestamp comparison (< cutoff), so a row
    -- becomes eligible at the first millisecond after its exact retention
    -- boundary. For fractional milliseconds, this is ceil(boundary); for an
    -- exact millisecond boundary, add one millisecond.
    return math.floor((parsed :: any):unix_nano() / 1000000) + retention_ms + 1, nil
end

local function prune_thread(db: DB, dbtype: string, row: table, policy: table,
        now: any, maximum: integer): (integer?, error?)
    if maximum <= 0 then return 0, nil end
    local thread_id = tostring(row.id or "")
    if thread_id == "" then return nil, response_failure("retention candidate has no thread id", "candidate.id") end
    if type(row.head_created_at) ~= "string" then return 0, nil end
    local window, window_err = event_window_ms(row, policy)
    if window_err then return nil, window_err end
    local deadline, deadline_err = sweeper.deadline_ms(row.head_created_at,
        window :: integer, dbtype)
    if deadline_err then return nil, deadline_err end
    if (deadline :: integer) > math.floor(now:unix_nano() / 1000000) then return 0, nil end
    local result, prune_err = prune.prune_thread(db, thread_id, {
        cutoff = event_cutoff(dbtype, window :: integer, now),
        batch_size = prune.MAX_LOCK_BATCH,
        max_total = maximum,
    })
    if prune_err then return nil, prune_err end
    return deleted_count(result, "prune.deleted")
end

local function load_event_threads(db: DB, dbtype: string, policy: table, now: any): ({ table }?, error?)
    local enabled_match: any = dbtype == sql.type.SQLITE and 1 or true
    local predicate = ""
    local params: table = { enabled_match }
    if dbtype == sql.type.POSTGRES then
        predicate = [[ AND (p.event_hot_retention_days < 1 OR
            FLOOR(EXTRACT(EPOCH FROM e.created_at)*1000)
                + COALESCE(p.event_hot_retention_days::bigint*86400000,$2::bigint) + 1 <= $3::bigint)]]
        params[2], params[3] = policy.events_ms, math.floor(now:unix_nano() / 1000000)
    end
    local rows, err = db:query([[SELECT t.id,p.event_hot_retention_days,p.enabled,e.created_at AS head_created_at
        FROM kickside_thread t
        JOIN kickside_event e ON e.thread_id=t.id AND e.seq=t.max_pruned_seq+1
        LEFT JOIN kickside_retention_policy p ON p.thread_id=t.id
        WHERE t.deleting_at IS NULL AND (p.thread_id IS NULL OR p.enabled=$1)
        ]] .. predicate .. " ORDER BY t.id", params)
    if err then return nil, errors.wrap(err, "failed to load Core event retention candidates") end
    return rows_result(rows, "candidates.query")
end

local function min_deadline(current: integer?, candidate: integer): integer
    return current == nil and candidate or math.min(current :: integer, candidate)
end

-- Returns the earliest event or committed-receipt eligibility deadline. An
-- event head blocked by a pin or projection cursor has no timer; those owners
-- wake Core when their protection changes.
function sweeper.next_deadline_ms(db: DB): (integer?, error?)
    local policy, policy_err = load_policy()
    if policy_err then return nil, policy_err end
    local raw_dbtype, dbtype_err = db:type()
    if dbtype_err then return nil, errors.wrap(dbtype_err, "failed to resolve DB type") end
    if not raw_dbtype then return nil, response_failure("failed to resolve DB type", "db.type") end
    local dbtype = tostring(raw_dbtype)
    local enabled_match: any = dbtype == sql.type.SQLITE and 1 or true
    local native_deadline, native_filter = "", ""
    local ordering = " ORDER BY t.id"
    local params: table = { enabled_match }
    if dbtype == sql.type.POSTGRES then
        native_deadline = [[(FLOOR(EXTRACT(EPOCH FROM e.created_at)*1000)
            + COALESCE(p.event_hot_retention_days::bigint*86400000,$2::bigint) + 1)::bigint AS eligibility_ms,]]
        native_filter = [[ AND NOT EXISTS (SELECT 1 FROM kickside_retention_pin rp
                WHERE rp.thread_id=t.id AND rp.cursor_seq<e.seq)
            AND NOT EXISTS (SELECT 1 FROM kickside_projection_cursor pc
                WHERE pc.thread_id=t.id AND pc.status<>'invalid' AND pc.last_seq<e.seq)]]
        ordering = " ORDER BY CASE WHEN p.event_hot_retention_days<1 THEN 0 ELSE 1 END,eligibility_ms LIMIT 1"
        params[2] = (policy :: table).events_ms
    end
    local rows, query_err = db:query("SELECT " .. native_deadline .. [[t.id,e.seq,e.created_at,p.event_hot_retention_days,
            COALESCE((SELECT MIN(cursor_seq) FROM kickside_retention_pin rp WHERE rp.thread_id=t.id),e.seq) AS pin_floor,
            COALESCE((SELECT MIN(last_seq) FROM kickside_projection_cursor pc
                WHERE pc.thread_id=t.id AND pc.status<>'invalid'),e.seq) AS projection_floor
        FROM kickside_thread t
        JOIN kickside_event e ON e.thread_id=t.id AND e.seq=t.max_pruned_seq+1
        LEFT JOIN kickside_retention_policy p ON p.thread_id=t.id
        WHERE t.deleting_at IS NULL AND (p.thread_id IS NULL OR p.enabled=$1)
        ]] .. native_filter .. ordering, params)
    if query_err then return nil, errors.wrap(query_err, "failed to read next Core event deadlines") end
    local event_rows, rows_err = rows_result(rows, "event_deadlines.query")
    if rows_err then return nil, rows_err end

    local next_ms: integer? = nil
    for _, row in ipairs(event_rows :: { table }) do
        local seq = tonumber(row.seq)
        if not seq then return nil, response_failure("retention event head has no sequence", "event.seq") end
        if (tonumber(row.pin_floor) or seq) >= seq
            and (tonumber(row.projection_floor) or seq) >= seq then
            local window, window_err = event_window_ms(row, policy :: table)
            if window_err then return nil, window_err end
            local deadline, deadline_err = tonumber(row.eligibility_ms), nil
            if dbtype ~= sql.type.POSTGRES then
                deadline, deadline_err = sweeper.deadline_ms(tostring(row.created_at), window :: integer, dbtype)
            end
            if deadline_err then return nil, deadline_err end
            if deadline == nil then return nil, response_failure("retention event deadline is missing", "event.eligibility_ms") end
            next_ms = min_deadline(next_ms, deadline :: integer)
        end
    end

    local receipts, receipt_err = db:query([[SELECT completed_at FROM kickside_write_receipt
        WHERE status='committed' AND completed_at IS NOT NULL
        ORDER BY completed_at,sink_id,idempotency_key LIMIT 1]])
    if receipt_err then return nil, errors.wrap(receipt_err, "failed to read next committed-receipt deadline") end
    local receipt_rows, receipts_err = rows_result(receipts, "receipt_deadline.query")
    if receipts_err then return nil, receipts_err end
    local receipt = (receipt_rows :: { table })[1]
    if receipt then
        local deadline, deadline_err = sweeper.deadline_ms(tostring(receipt.completed_at),
            (policy :: table).receipts_orphan_ms, dbtype)
        if deadline_err then return nil, deadline_err end
        next_ms = min_deadline(next_ms, deadline :: integer)
    end
    return next_ms, nil
end

function sweeper.run(db: DB): (RunStats?, error?)
    local policy, policy_err = load_policy()
    if policy_err then return nil, policy_err end
    local raw_dbtype, dbtype_err = db:type()
    if dbtype_err then return nil, errors.wrap(dbtype_err, "failed to resolve DB type") end
    if not raw_dbtype then return nil, response_failure("failed to resolve DB type", "db.type") end
    local dbtype = tostring(raw_dbtype)
    local now = time.now()
    local agg: RunStats = { events = 0, write_receipts = 0, needs_continue = false }

    local threads, thread_err = load_event_threads(db, dbtype, policy :: table, now)
    if thread_err then return nil, thread_err end
    for _, row in ipairs(threads :: { table }) do
        local remaining = math.floor((policy :: table).batch_events) - agg.events
        if remaining <= 0 then break end
        local deleted, prune_err = prune_thread(db, dbtype, row, policy :: table, now, remaining)
        if prune_err then return nil, prune_err end
        agg.events = agg.events + (deleted :: integer)
    end

    -- Receipt timestamps are canonical RFC3339 UTC text on both dialects;
    -- event.created_at follows the database timestamp layout instead.
    local cutoff = now:add(-(policy :: table).receipts_orphan_ms * time.MILLISECOND)
        :utc():format(time.RFC3339)
    local purged, purge_err = receipt_purge.run(db, cutoff, (policy :: table).batch_receipts)
    if purge_err then return nil, purge_err end
    local count, count_err = deleted_count(purged, "purge.deleted")
    if count_err then return nil, count_err end
    agg.write_receipts = count :: integer
    agg.needs_continue = agg.events >= (policy :: table).batch_events
        or agg.write_receipts >= (policy :: table).batch_receipts
    return agg, nil
end

function sweeper.run_for_thread(db: DB, thread_id: string): (table?, error?)
    if type(thread_id) ~= "string" or thread_id == "" then
        return nil, (errors.new({ message = "thread_id is required", kind = errors.INVALID }) :: error)
    end
    local raw_dbtype, dbtype_err = db:type()
    if dbtype_err then return nil, errors.wrap(dbtype_err, "failed to resolve DB type") end
    if not raw_dbtype then return nil, response_failure("failed to resolve DB type", "db.type") end
    local dbtype = tostring(raw_dbtype)
    local rows, read_err = db:query([[SELECT t.id,p.event_hot_retention_days,p.enabled,
            e.created_at AS head_created_at
        FROM kickside_thread t LEFT JOIN kickside_retention_policy p ON p.thread_id=t.id
        LEFT JOIN kickside_event e ON e.thread_id=t.id AND e.seq=t.max_pruned_seq+1
        WHERE t.id=$1 AND t.deleting_at IS NULL]], { thread_id })
    if read_err then return nil, errors.wrap(read_err, "failed to load thread policy") end
    local thread_rows, rows_err = rows_result(rows, "thread_policy.query")
    if rows_err then return nil, rows_err end
    if #(thread_rows :: { table }) == 0 then return { events = 0 }, nil end
    local row = (thread_rows :: { table })[1]
    if row.enabled ~= nil and not active(row.enabled) then return { events = 0 }, nil end
    local policy, policy_err = load_policy()
    if policy_err then return nil, policy_err end
    local now = time.now()
    local deleted, prune_err = prune_thread(db, dbtype, row, policy :: table,
        now, (policy :: table).batch_events)
    if prune_err then return nil, prune_err end
    return { events = deleted }, nil
end

return sweeper
