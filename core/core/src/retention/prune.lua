-- Batched event prune for one thread (design v4 §4.9).
--
-- One prune transaction locks the thread row, then reads the protected floor
-- (the lowest retention pin cursor and the lowest applied sequence of every live
-- projection cursor) and the age cutoff. It deletes a contiguous prefix of at
-- most batch_size events above max_pruned_seq: no event above the floor, and
-- none at or above the first event still inside the retention window. It then
-- raises max_pruned_seq to the highest deleted sequence in the same
-- transaction. Every sequence at or below max_pruned_seq is therefore gone, and
-- a pin or cursor either protects its position before the prune reads the
-- floor or sees the advanced boundary and is refused (retention.pin).
--
local sql = require("sql")

local prune = {}

prune.BATCH_SIZE = 5000
-- Deleting thousands of events while holding the thread row makes concurrent
-- appends wait behind that delete. A request may allow 5,000 rows overall,
-- but one transaction releases the thread after at most this many rows.
prune.MAX_LOCK_BATCH = 250

type Result = {
    deleted: integer,
    max_pruned_seq: integer,
}

local function invalid_response(message: string, field: string): error
    return errors.new({message = message, kind = errors.INTERNAL, retryable = false,
        details = {code = "retention_prune_response", field = field}})
end

local function first_row(rows: any, field: string, required: boolean): (table?, error?)
    if type(rows) ~= "table" then
        return nil, invalid_response("prune query returned no row collection", field)
    end
    local row = rows[1]
    if row == nil and not required then return nil, nil end
    if type(row) ~= "table" then
        return nil, invalid_response("prune query returned no valid row", field)
    end
    return row, nil
end

local function int_of(value: any): integer?
    local n = tonumber(value)
    if n == nil then return nil end
    return math.floor(n) :: integer
end

local function scalar(tx: sql.Transaction, statement: string, params: { any }, what: string): (integer?, error?)
    local rows, err = tx:query(statement, params)
    if err then return nil, errors.wrap(err, "failed to read " .. what) end
    local row, response_err = first_row(rows, "prefix.query", false)
    if response_err then return nil, response_err end
    return row and int_of(row.value) or nil, nil
end

local PREFIX_SQL = [[WITH floors AS (
    SELECT MIN(value) AS bound FROM (
        SELECT MIN(cursor_seq) AS value FROM kickside_retention_pin WHERE thread_id = $1
        UNION ALL
        SELECT MIN(last_seq) AS value FROM kickside_projection_cursor
            WHERE thread_id = $1 AND status <> 'invalid'
        UNION ALL
        SELECT MIN(seq) - 1 AS value FROM kickside_event
            WHERE thread_id = $1 AND seq > $2 AND created_at >= $3
    ) limits
), top AS (
    SELECT MAX(seq) AS value FROM (
        SELECT seq FROM kickside_event WHERE thread_id = $1 AND seq > $2
            AND seq <= COALESCE((SELECT bound FROM floors), 2147483647)
        ORDER BY seq LIMIT $4
    ) batch
)]]

-- prune_tx prunes one batch of the thread on the caller's transaction.
-- opts.cutoff is the age cutoff in the dialect's timestamp shape: only events
-- created before it are eligible. opts.batch_size bounds the deleted rows.
function prune.prune_tx(tx: sql.Transaction, thread_id: string, opts: {
        cutoff: string, batch_size: integer? }): (Result?, error?)
    if type(thread_id) ~= "string" or thread_id == "" then
        return nil, (errors.new({ message = "thread_id is required", kind = errors.INVALID }) :: error)
    end
    if type(opts) ~= "table" or type(opts.cutoff) ~= "string" or opts.cutoff == "" then
        return nil, (errors.new({ message = "a prune cutoff is required", kind = errors.INVALID }) :: error)
    end
    local requested = opts.batch_size or prune.BATCH_SIZE
    if type(requested) ~= "number" or requested < 1 or requested ~= math.floor(requested) then
        return nil, (errors.new({ message = "batch_size must be a positive integer", kind = errors.INVALID }) :: error)
    end
    local batch = math.min(requested, prune.MAX_LOCK_BATCH)

    local dbtype, dt_err = tx:db_type()
    if dt_err then return nil, errors.wrap(dt_err, "failed to resolve the transaction dialect") end
    local lock = tostring(dbtype) == sql.type.SQLITE and "" or " FOR UPDATE"

    local thread_rows, thread_err = tx:query("SELECT max_pruned_seq FROM kickside_thread WHERE id = $1" .. lock, { thread_id })
    if thread_err then return nil, errors.wrap(thread_err, "failed to lock thread") end
    local thread, thread_response_err = first_row(thread_rows, "thread.query", false)
    if thread_response_err then return nil, thread_response_err end
    if not thread then
        return nil, (errors.new({ message = "thread not found", kind = errors.NOT_FOUND }) :: error)
    end
    local max_pruned = int_of(thread.max_pruned_seq) or 0

    -- Read every protection floor and the bounded event prefix in one
    -- statement while the thread lock is held. Separate round trips for each
    -- floor made small batches hold the append lock longer than the deletes.
    -- Keep first-occurrence placeholder order numeric: SQLite assigns bind
    -- slots by first appearance, while PostgreSQL uses the explicit numbers.
    local params: { any } = { thread_id, max_pruned, opts.cutoff, batch }
    if tostring(dbtype) == sql.type.POSTGRES then
        -- Keep eligibility, physical deletion and boundary advancement in one
        -- server statement while the thread lock is held.
        local rows, err = tx:query(PREFIX_SQL .. [[,
            deleted AS (DELETE FROM kickside_event WHERE thread_id = $1 AND seq > $2
                AND seq <= COALESCE((SELECT value FROM top), $2)
                RETURNING seq),
            advanced AS (UPDATE kickside_thread
                SET max_pruned_seq = (SELECT MAX(seq) FROM deleted)
                WHERE id = $1 AND EXISTS (SELECT 1 FROM deleted)
                RETURNING max_pruned_seq)
            SELECT (SELECT COUNT(*) FROM deleted) AS deleted,
                COALESCE((SELECT max_pruned_seq FROM advanced),$2) AS max_pruned_seq,
                (SELECT COUNT(*) FROM advanced) AS boundary_updates]], params)
        if err then return nil, errors.wrap(err, "failed to prune events and advance boundary") end
        local row, response_err = first_row(rows, "prefix.query", true)
        if response_err then return nil, response_err end
        local deleted = int_of(row.deleted)
        local top = int_of(row.max_pruned_seq)
        if deleted == nil then return nil, invalid_response("prune count missing", "prefix.deleted") end
        local boundary_updates = int_of(row.boundary_updates)
        if boundary_updates == nil or (deleted > 0 and boundary_updates ~= 1) then
            return nil, invalid_response("prune boundary update returned no proof", "prefix.boundary_updates")
        end
        return { deleted = deleted, max_pruned_seq = top or max_pruned }, nil
    end
    local top, top_err = scalar(tx, PREFIX_SQL .. " SELECT value FROM top", params, "prune batch")
    if top_err then return nil, top_err end
    if top == nil then
        return { deleted = 0, max_pruned_seq = max_pruned }, nil
    end

    local deleted, delete_err = tx:execute("DELETE FROM kickside_event WHERE thread_id = $1 AND seq > $2 AND seq <= $3",
        { thread_id, max_pruned, top })
    if delete_err then return nil, errors.wrap(delete_err, "failed to prune events") end
    local count = type(deleted) == "table" and int_of(deleted.rows_affected) or nil
    if count == nil or count == 0 then return nil, invalid_response("event prune returned no deletion proof", "delete.rows_affected") end
    local updated, boundary_err = tx:execute("UPDATE kickside_thread SET max_pruned_seq = $1 WHERE id = $2",
        { top, thread_id })
    if boundary_err then return nil, errors.wrap(boundary_err, "failed to advance the prune boundary") end
    if type(updated) ~= "table" or int_of(updated.rows_affected) ~= 1 then
        return nil, invalid_response("prune boundary update returned no proof", "boundary.rows_affected")
    end

    return {
        deleted = count :: integer,
        max_pruned_seq = top :: integer,
    }, nil
end

-- prune_thread runs bounded transactions until eligibility ends or the
-- sweep's remaining event budget is exhausted.
function prune.prune_thread(db: sql.DB, thread_id: string, opts: { cutoff: string, batch_size: integer?, max_total: integer? }): (Result?, error?)
    local total = 0
    local boundary = 0
    local requested = (type(opts) == "table" and opts.batch_size) or prune.BATCH_SIZE
    local maximum = (type(opts) == "table" and opts.max_total) or prune.BATCH_SIZE
    if type(maximum) ~= "number" or maximum < 0 or maximum ~= math.floor(maximum) or maximum > prune.BATCH_SIZE then
        return nil, (errors.new({ message = "max_total must be an integer from 0 to 5000", kind = errors.INVALID }) :: error)
    end
    if type(requested) ~= "number" or requested < 1 or requested ~= math.floor(requested) then
        return nil, (errors.new({ message = "batch_size must be a positive integer", kind = errors.INVALID }) :: error)
    end
    local batch = math.min(requested, prune.MAX_LOCK_BATCH)
    while total < maximum do
        local tx, begin_err = db:begin()
        if begin_err then return nil, errors.wrap(begin_err, "failed to begin prune transaction") end
        local result, err = prune.prune_tx(tx :: sql.Transaction, thread_id,
            { cutoff = opts.cutoff, batch_size = math.min(batch, maximum - total) })
        if err then
            tx:rollback()
            return nil, err
        end
        local _, commit_err = tx:commit()
        if commit_err then return nil, errors.wrap(commit_err, "failed to commit prune transaction") end
        local r = result :: Result
        total = total + r.deleted
        boundary = r.max_pruned_seq
        if r.deleted < math.min(batch, maximum - (total - r.deleted)) then break end
    end
    return { deleted = total, max_pruned_seq = boundary }, nil
end

return prune
