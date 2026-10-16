-- Jobs-owned bounded thread cleanup. Each page commits with a durable receipt
-- so Core can record A48 counts in its own transaction and acknowledge after.
local sql = require("sql")
local json = require("json")
local clock = require("clock")
local thread_fence = require("thread_fence")
local cfg = require("config")
local sql_boundary = require("sql_boundary")

local M = {}
local RECEIPT = "kickside_job_thread_cleanup_receipt"
local SLICES = {
    { table = "kickside_job_run", retain = true },
    { table = "kickside_job", retain = true },
    { table = "kickside_job_run", owned = true, runs = true },
    { table = "kickside_job", owned = true },
}

local function response_error(field: string): error
    return errors.new({message = "thread cleanup response is invalid", kind = errors.INTERNAL,
        retryable = false, details = {code = "job_thread_cleanup_response", field = field}})
end

local function affected(result: any, label: string, expected: integer): (integer?, error?)
    return sql_boundary.exact_row_count(result, nil, label, label .. ".count", expected, response_error)
end

local function decoded(raw: any, label: string): (table?, error?)
    local value, err = json.decode(tostring(raw or ""))
    if err then return nil, errors.wrap(err, label .. " receipt is corrupt") end
    if type(value) ~= "table" then return nil, response_error(label .. ".decoded") end
    return value :: table, nil
end

local function read_receipt(row: table): (table?, error?)
    local discarded, discarded_err = decoded(row.discarded_json, "discarded")
    if discarded_err then return nil, discarded_err end
    local unresolved, unresolved_err = decoded(row.unresolved_json, "unresolved")
    if unresolved_err then return nil, unresolved_err end
    return {
        thread_id = tostring(row.thread_id), page_seq = tonumber(row.page_seq),
        processed = tonumber(row.processed), done = row.done == true or row.done == 1,
        discarded = discarded, unresolved = unresolved,
    }, nil
end

local function candidates(tx: sql.Transaction, slice: table, thread_id: string,
        limit: integer): ({ any }?, error?)
    local scope = slice.owned and "owner_kind='thread' AND owner_id=$1"
        or "thread_id=$1 AND NOT (owner_kind='thread' AND owner_id=$2)"
    local params: any[] = slice.owned and { thread_id, limit } or { thread_id, thread_id, limit }
    local bound = slice.owned and "$2" or "$3"
    if slice.table == "kickside_job" and slice.owned then
        scope = scope .. " AND NOT EXISTS (SELECT 1 FROM kickside_job_run r WHERE r.job_id=kickside_job.id)"
    end
    local rows, err = tx:query("SELECT id,status,owner_kind,owner_id"
        .. (slice.runs and ",job_id" or "") .. " FROM " .. slice.table
        .. " WHERE " .. scope .. " ORDER BY id LIMIT " .. bound, params)
    if err then return nil, errors.wrap(err, "thread cleanup candidate read failed for " .. slice.table) end
    if type(rows) ~= "table" then return nil, response_error("candidates.rows") end
    return rows, nil
end

local function lock_ids(tx: sql.Transaction, dbtype: string, name: string, ids: { string }): error?
    if dbtype ~= sql.type.POSTGRES then return nil end
    table.sort(ids)
    local previous = ""
    for _, id in ipairs(ids) do
        if id ~= previous then
            local rows, err = tx:query("SELECT id FROM " .. name .. " WHERE id=$1 FOR UPDATE", { id })
            if err then return errors.wrap(err, name .. " prelock failed") end
            if type(rows) ~= "table" or not rows[1] then return response_error("prelock.rows") end
            previous = id
        end
    end
    return nil
end

local function count_discarded(slice: table, rows: { any }, count: integer, result: table): error?
    if slice.retain then return nil end
    local name = slice.table
    result.discarded[name] = (result.discarded[name] or 0) + count
    local unresolved = 0
    for i = 1, count do
        local status = rows[i].status
        if type(status) ~= "string" then return response_error("cleanup.status") end
        if (slice.runs and status == "running")
            or (not slice.runs and (status == "pending" or status == "running")) then
            unresolved = unresolved + 1
        end
    end
    if unresolved > 0 then result.unresolved[name] = (result.unresolved[name] or 0) + unresolved end
    return nil
end

local function erase(tx: sql.Transaction, slice: table, thread_id: string, rows: { any },
        count: integer, dbtype: string, result: table): error?
    local ids: { string } = {}
    local parents: { string } = {}
    for i = 1, count do
        local row = rows[i]
        ids[#ids + 1] = tostring(row.id)
        if slice.runs then parents[#parents + 1] = tostring(row.job_id or "") end
        if slice.owned and (row.owner_kind ~= "thread" or row.owner_id ~= thread_id) then
            return response_error("cleanup.owner")
        end
    end
    if slice.runs then
        local parent_err = lock_ids(tx, dbtype, "kickside_job", parents)
        if parent_err then return parent_err end
        local run_err = lock_ids(tx, dbtype, "kickside_job_run", ids)
        if run_err then return run_err end
    elseif slice.owned then
        local job_err = lock_ids(tx, dbtype, "kickside_job", ids)
        if job_err then return job_err end
    end
    local params: { any } = { thread_id }
    local marks: { string } = {}
    for i, id in ipairs(ids) do
        params[#params + 1] = id
        marks[i] = "$" .. tostring(i + 1)
    end
    local action = slice.retain and "UPDATE " .. slice.table .. " SET thread_id=NULL"
        or "DELETE FROM " .. slice.table
    local scope = slice.owned and "owner_kind='thread' AND owner_id=$1" or "thread_id=$1"
    local changed, change_err = tx:execute(action .. " WHERE " .. scope .. " AND id IN ("
        .. table.concat(marks, ",") .. ")", params)
    if change_err then return errors.wrap(change_err, "thread cleanup mutation failed for " .. slice.table) end
    local _, proof_err = affected(changed, "thread cleanup " .. slice.table, count)
    if proof_err then return proof_err end
    return count_discarded(slice, rows, count, result)
end

local function has_rows(tx: sql.Transaction, thread_id: string): (boolean?, error?)
    local checks = {
        "SELECT id FROM kickside_job_run WHERE thread_id=$1 OR (owner_kind='thread' AND owner_id=$2) LIMIT 1",
        "SELECT id FROM kickside_job WHERE thread_id=$1 OR (owner_kind='thread' AND owner_id=$2) LIMIT 1",
    }
    for _, statement in ipairs(checks) do
        local rows, err = tx:query(statement, { thread_id, thread_id })
        if err then return nil, errors.wrap(err, "thread cleanup continuation read failed") end
        if type(rows) ~= "table" then return nil, response_error("continuation.rows") end
        if rows[1] then return true, nil end
    end
    return false, nil
end

local function run_page(tx: sql.Transaction, dbtype: string, thread_id: string,
        limit: integer): (table?, error?)
    local result = { processed = 0, discarded = {}, unresolved = {} }
    local remaining = limit
    for _, slice in ipairs(SLICES) do
        local rows, read_err = candidates(tx, slice, thread_id, remaining + 1)
        if read_err then return nil, read_err end
        local selected = rows :: { any }
        local count = math.min(#selected, remaining)
        if count > 0 then
            local erase_err = erase(tx, slice, thread_id, selected, count, dbtype, result)
            if erase_err then return nil, erase_err end
            result.processed = result.processed + count
            remaining = remaining - count
        end
        if #selected > count or remaining == 0 then
            local lingering, linger_err = has_rows(tx, thread_id)
            if linger_err then return nil, linger_err end
            return { processed = result.processed, done = not lingering,
                discarded = result.discarded, unresolved = result.unresolved }, nil
        end
    end
    local lingering, linger_err = has_rows(tx, thread_id)
    if linger_err then return nil, linger_err end
    return { processed = result.processed, done = not lingering,
        discarded = result.discarded, unresolved = result.unresolved }, nil
end

local function sequence_error(expected: integer, actual: integer): error
    return (errors.new({ message = "thread cleanup page sequence changed: expected "
        .. tostring(expected) .. ", received " .. tostring(actual),
        kind = errors.CONFLICT, retryable = true }) :: error)
end

function M.page(db: sql.DB, dbtype: string, thread_id: string, page_seq: integer): (table?, error?)
    if type(thread_id) ~= "string" or thread_id == "" or type(page_seq) ~= "number"
        or page_seq < 0 or page_seq ~= math.floor(page_seq) then
        return nil, (errors.new({ message = "invalid thread cleanup page identity", kind = errors.INVALID }) :: error)
    end
    local policy, policy_err = cfg.policy()
    if policy_err or not policy then return nil, policy_err end
    local tx, begin_err = sql_boundary.begin(db, "thread cleanup transaction failed", "transaction", response_error)
    if begin_err then return nil, begin_err end
    if not tx then return nil, response_error("transaction") end
    local fence, lock_err = thread_fence.lock(tx, thread_id)
    if lock_err then return nil, sql_boundary.rollback(tx, lock_err, "thread cleanup rollback failed") end
    if type(fence) ~= "table" then return nil, sql_boundary.rollback(tx, response_error("fence"), "thread cleanup rollback failed") end
    local next_seq_value = tonumber(fence.next_page_seq)
    local next_seq = next_seq_value and math.tointeger(next_seq_value)
    if next_seq == nil or next_seq < 0 then return nil, sql_boundary.rollback(tx, response_error("fence.next_page_seq"), "thread cleanup rollback failed") end
    if page_seq < next_seq then
        local rows, receipt_err = tx:query("SELECT thread_id,page_seq,processed,done,discarded_json,unresolved_json"
            .. " FROM " .. RECEIPT .. " WHERE thread_id=$1 AND page_seq=$2", { thread_id, page_seq })
        if receipt_err then return nil, sql_boundary.rollback(tx,
            errors.wrap(receipt_err, "thread cleanup retry receipt read failed"), "thread cleanup rollback failed") end
        if type(rows) ~= "table" or not rows[1] then return nil, sql_boundary.rollback(tx,
            response_error("receipt.rows"), "thread cleanup rollback failed") end
        local value, value_err = read_receipt(rows[1])
        if value_err then return nil, sql_boundary.rollback(tx, value_err, "thread cleanup rollback failed") end
        local _, commit_err = tx:commit()
        if commit_err then return nil, errors.wrap(commit_err, "thread cleanup receipt read commit failed") end
        return value, nil
    end
    if page_seq ~= next_seq then
        return nil, sql_boundary.rollback(tx, sequence_error(next_seq, page_seq), "thread cleanup rollback failed")
    end
    if page_seq > 0 then
        -- Core advances its durable page sequence in the same transaction that
        -- applies the prior receipt. Recover the acknowledgment if Core stopped
        -- between that commit and its post-commit acknowledgment call.
        local previous, previous_err = tx:query("SELECT acknowledged_at FROM " .. RECEIPT
            .. " WHERE thread_id=$1 AND page_seq=$2", { thread_id, page_seq - 1 })
        if previous_err then return nil, sql_boundary.rollback(tx,
            errors.wrap(previous_err, "prior thread cleanup receipt read failed"), "thread cleanup rollback failed") end
        if type(previous) ~= "table" then return nil, sql_boundary.rollback(tx,
            response_error("previous.rows"), "thread cleanup rollback failed") end
        if previous[1] and previous[1].acknowledged_at == nil then
            local acknowledged, acknowledge_err = tx:execute("UPDATE " .. RECEIPT
                .. " SET acknowledged_at=$1 WHERE thread_id=$2 AND page_seq=$3 AND acknowledged_at IS NULL",
                { clock.now(dbtype), thread_id, page_seq - 1 })
            if acknowledge_err then return nil, sql_boundary.rollback(tx,
                errors.wrap(acknowledge_err, "prior thread cleanup acknowledgment failed"), "thread cleanup rollback failed") end
            local _, acknowledge_proof = affected(acknowledged, "prior thread cleanup acknowledgment", 1)
            if acknowledge_proof then return nil, sql_boundary.rollback(tx, acknowledge_proof, "thread cleanup rollback failed") end
        end
    end
    local limit = (policy :: any).thread_cleanup_batch :: integer
    local result, run_err = run_page(tx, dbtype, thread_id, limit)
    if run_err then return nil, sql_boundary.rollback(tx, run_err, "thread cleanup rollback failed") end
    local discarded_json, discarded_err = json.encode((result :: table).discarded)
    local unresolved_json, unresolved_err = json.encode((result :: table).unresolved)
    if discarded_err then return nil, sql_boundary.rollback(tx,
        errors.wrap(discarded_err, "thread cleanup count encoding failed"), "thread cleanup rollback failed") end
    if type(discarded_json) ~= "string" then return nil, sql_boundary.rollback(tx,
        response_error("discarded.encoded"), "thread cleanup rollback failed") end
    if unresolved_err then return nil, sql_boundary.rollback(tx,
        errors.wrap(unresolved_err, "thread cleanup unresolved encoding failed"), "thread cleanup rollback failed") end
    if type(unresolved_json) ~= "string" then return nil, sql_boundary.rollback(tx,
        response_error("unresolved.encoded"), "thread cleanup rollback failed") end
    local now = clock.now(dbtype)
    local insert, insert_err = tx:execute("INSERT INTO " .. RECEIPT
        .. "(thread_id,page_seq,processed,done,discarded_json,unresolved_json,created_at)"
        .. " VALUES($1,$2,$3,$4,$5,$6,$7)", { thread_id, page_seq, (result :: table).processed,
            (result :: table).done, discarded_json, unresolved_json, now })
    if insert_err then return nil, sql_boundary.rollback(tx, errors.wrap(insert_err, "thread cleanup receipt insert failed"), "thread cleanup rollback failed") end
    local _, insert_proof = affected(insert, "thread cleanup receipt insert", 1)
    if insert_proof then return nil, sql_boundary.rollback(tx, insert_proof, "thread cleanup rollback failed") end
    local started = dbtype == sql.type.POSTGRES and true or 1
    local update, update_err = tx:execute("UPDATE kickside_job_thread_cleanup SET started=$1,"
        .. "next_page_seq=$2 WHERE thread_id=$3",
        { started, page_seq + 1, thread_id })
    if update_err then return nil, sql_boundary.rollback(tx, errors.wrap(update_err, "thread cleanup state update failed"), "thread cleanup rollback failed") end
    local _, state_proof = affected(update, "thread cleanup state update", 1)
    if state_proof then return nil, sql_boundary.rollback(tx, state_proof, "thread cleanup rollback failed") end
    local _, commit_err = tx:commit()
    if commit_err then return nil, errors.wrap(commit_err, "thread cleanup page commit failed") end
    local page_result = result :: table
    page_result.thread_id = thread_id
    page_result.page_seq = page_seq
    return page_result, nil
end

-- Remove the jobs and runs a thread still owns after its cleanup completed.
-- Thread teardown removes every owned row before it completes, so such rows
-- were left by a teardown that missed them; each owner's rows go in one bounded
-- transaction under its cleanup fence. Returns the number of rows removed.
function M.reclaim_completed(db: sql.DB, dbtype: string, limit: integer): (integer?, error?)
    local rows, read_err = db:query([[SELECT f.thread_id FROM kickside_job_thread_cleanup f
        WHERE f.completed_at IS NOT NULL
          AND (EXISTS (SELECT 1 FROM kickside_job j WHERE j.owner_kind='thread' AND j.owner_id=f.thread_id)
            OR EXISTS (SELECT 1 FROM kickside_job_run r WHERE r.owner_kind='thread' AND r.owner_id=f.thread_id))
        ORDER BY f.thread_id LIMIT $1]], { limit })
    if read_err then return nil, errors.wrap(read_err, "completed cleanup leftover read failed") end
    if type(rows) ~= "table" then return nil, response_error("owners.rows") end
    local total = 0
    for _, row in ipairs(rows) do
        local thread_id = tostring(row.thread_id)
        local tx, begin_err = sql_boundary.begin(db, "completed cleanup leftover transaction failed", "transaction", response_error)
        if begin_err then return nil, begin_err end
        if not tx then return nil, response_error("transaction") end
        local _, lock_err = thread_fence.lock(tx, thread_id)
        if lock_err then return nil, sql_boundary.rollback(tx, lock_err, "thread cleanup rollback failed") end
        local result, run_err = run_page(tx, dbtype, thread_id, limit)
        if run_err then return nil, sql_boundary.rollback(tx, run_err, "thread cleanup rollback failed") end
        local _, commit_err = tx:commit()
        if commit_err then return nil, errors.wrap(commit_err, "completed cleanup leftover commit failed") end
        total = total + (result :: table).processed
    end
    return total, nil
end

function M.ack(db: sql.DB, dbtype: string, thread_id: string, page_seq: integer,
        thread_done: boolean): (boolean?, error?)
    local tx, begin_err = sql_boundary.begin(db, "thread cleanup acknowledgment transaction failed", "transaction", response_error)
    if begin_err then return nil, begin_err end
    if not tx then return nil, response_error("transaction") end
    local _, fence_err = thread_fence.lock(tx, thread_id)
    if fence_err then return nil, sql_boundary.rollback(tx, fence_err, "thread cleanup rollback failed") end
    local rows, read_err = tx:query("SELECT acknowledged_at,done FROM " .. RECEIPT
        .. " WHERE thread_id=$1 AND page_seq=$2", { thread_id, page_seq })
    if read_err then return nil, sql_boundary.rollback(tx,
        errors.wrap(read_err, "thread cleanup acknowledgment receipt read failed"), "thread cleanup rollback failed") end
    if type(rows) ~= "table" or not rows[1] then return nil, sql_boundary.rollback(tx,
        response_error("receipt.rows"), "thread cleanup rollback failed") end
    if thread_done and not (rows[1].done == true or rows[1].done == 1) then
        local unfinished = errors.new({ message = "unfinished thread cleanup page cannot complete its owner",
            kind = errors.CONFLICT, retryable = true })
        return nil, sql_boundary.rollback(tx, unfinished, "thread cleanup rollback failed")
    end
    if rows[1].acknowledged_at == nil then
        local result, update_err = tx:execute("UPDATE " .. RECEIPT
            .. " SET acknowledged_at=$1 WHERE thread_id=$2 AND page_seq=$3 AND acknowledged_at IS NULL",
            { clock.now(dbtype), thread_id, page_seq })
        if update_err then return nil, sql_boundary.rollback(tx, errors.wrap(update_err, "thread cleanup receipt acknowledgment failed"), "thread cleanup rollback failed") end
        local _, proof_err = affected(result, "thread cleanup receipt acknowledgment", 1)
        if proof_err then return nil, sql_boundary.rollback(tx, proof_err, "thread cleanup rollback failed") end
    end
    if thread_done then
        local done = dbtype == sql.type.POSTGRES and true or 1
        local result, update_err = tx:execute("UPDATE kickside_job_thread_cleanup"
            .. " SET completed_at=$1 WHERE thread_id=$2"
            .. " AND started=$3", { clock.now(dbtype), thread_id, done })
        if update_err then return nil, sql_boundary.rollback(tx, errors.wrap(update_err, "thread cleanup completion stamp failed"), "thread cleanup rollback failed") end
        local _, proof_err = affected(result, "thread cleanup completion stamp", 1)
        if proof_err then return nil, sql_boundary.rollback(tx, proof_err, "thread cleanup rollback failed") end
    end
    local _, commit_err = tx:commit()
    if commit_err then return nil, errors.wrap(commit_err, "thread cleanup acknowledgment commit failed") end
    return true, nil
end

return M
