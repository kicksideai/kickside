local error_envelope = require("error_envelope")

local M = {}

local function response_failure(message: string, field: string): error
    return errors.new({message = message, kind = errors.INTERNAL, retryable = false,
        details = {code = "receipt_purge_response", field = field}})
end

local function receipt_rows(value: any): ({ table }?, error?)
    if type(value) ~= "table" then
        return nil, response_failure("receipt purge returns no row collection", "query")
    end
    local length = #value
    for key, row in pairs(value) do
        if type(key) ~= "number" or key < 1 or key > length or key ~= math.floor(key)
            or type(row) ~= "table" then
            return nil, response_failure("receipt purge returns malformed rows", "query")
        end
    end
    for index = 1, length do
        local row = value[index]
        if type(row) ~= "table" then
            return nil, response_failure("receipt purge returns a missing row", "query")
        end
        if type(row.sink_id) ~= "string" or row.sink_id == ""
            or type(row.idempotency_key) ~= "string" or row.idempotency_key == "" then
            return nil, response_failure("receipt purge returns no receipt identity", "query.identity")
        end
    end
    return value, nil
end

function M.run(db: any, cutoff: string, limit: integer): (table?, error?)
    if type(cutoff) ~= "string" or cutoff == "" then
        return nil, (errors.new({ message = "write receipt purge cutoff is required",
            kind = errors.INVALID }) :: error)
    end
    if type(limit) ~= "number" or limit ~= math.floor(limit) or limit < 1 or limit > 500 then
        return nil, (errors.new({ message = "write receipt purge limit must be an integer in [1,500]",
            kind = errors.INVALID }) :: error)
    end
    if type(db) ~= "table" and type(db) ~= "userdata" then
        return nil, response_failure("write receipt purge requires a transactional executor", "executor")
    end
    local owns_tx = type(db.begin) == "function"
    if type(db.query) ~= "function" or (not owns_tx and
        (type(db.db_type) ~= "function" or type(db.execute) ~= "function")) then
        return nil, response_failure("write receipt purge requires a transactional executor", "executor")
    end
    local rows, query_err = db:query([[SELECT sink_id,idempotency_key
        FROM kickside_write_receipt WHERE status='committed' AND completed_at < $1
        ORDER BY completed_at,sink_id,idempotency_key LIMIT $2]], { cutoff, limit })
    if query_err then return nil, errors.wrap(query_err, "failed to list settled receipts") end
    local settled, rows_err = receipt_rows(rows)
    if rows_err then return nil, rows_err end
    local tx, begin_err = db, nil
    if owns_tx then tx, begin_err = db:begin() end
    if begin_err then return nil, errors.wrap(begin_err, "failed to begin receipt purge") end
    if (type(tx) ~= "table" and type(tx) ~= "userdata") or type(tx.execute) ~= "function"
        or (owns_tx and (type(tx.rollback) ~= "function" or type(tx.commit) ~= "function")) then
        return nil, response_failure("failed to begin receipt purge", "begin")
    end
    local function fail(err: error): (table?, error?)
        if owns_tx then
            local _, rollback_err = tx:rollback()
            if rollback_err then
                return nil, error_envelope.wrap_secondary(rollback_err, err, "receipt purge rollback failed")
            end
        end
        return nil, err
    end
    local deleted = 0
    for _, row in ipairs(settled :: { table }) do
        local result, delete_err = tx:execute([[DELETE FROM kickside_write_receipt
            WHERE sink_id=$1 AND idempotency_key=$2 AND status='committed' AND completed_at < $3]],
            { row.sink_id, row.idempotency_key, cutoff })
        if delete_err then return fail(errors.wrap(delete_err, "write receipt purge deletion failed")) end
        local count = type(result) == "table" and tonumber(result.rows_affected) or nil
        if count == nil or (count ~= 0 and count ~= 1) then
            return fail(response_failure("write receipt purge returns no valid deletion proof", "delete.rows_affected"))
        end
        deleted = deleted + (count :: integer)
    end
    if owns_tx then
        local _, commit_err = tx:commit()
        if commit_err then return nil, errors.wrap(commit_err, "failed to commit receipt purge") end
    end
    return { deleted = deleted }, nil
end

return M
