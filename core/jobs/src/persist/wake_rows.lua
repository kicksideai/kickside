-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- The jobs lock order is wake rows by ascending key, then job rows by
-- ascending id. A wake holds its key's wake row before any job row it
-- targets. A write to one existing job outside a wake takes that job's wake
-- rows first, so within a caller transaction it serializes with every wake
-- that can target the job before it holds the job row.
local sql = require("sql")
local boundary = require("sql_boundary")

local M = {}
type ResponseError = (string) -> error

local function wake_key(value: any): string?
    if type(value) == "string" and value ~= "" then return value end
    return nil
end

-- lock(tx, keys, field, response_error) holds the wake rows of keys in
-- ascending order. An absent row is created without demand.
function M.lock(tx: sql.Transaction, keys: { string }, field: string, response_error: ResponseError): error?
    local sorted: { string } = {}
    local seen: { [string]: boolean } = {}
    for _, key in ipairs(keys) do
        if not seen[key] then seen[key] = true; sorted[#sorted + 1] = key end
    end
    if #sorted == 0 then return nil end
    table.sort(sorted)
    local values: { string } = {}
    for index in ipairs(sorted) do values[index] = "($" .. tostring(index) .. ")" end
    -- PostgreSQL locks the conflicting row before evaluating the UPDATE
    -- predicate. A false predicate keeps the lock without creating a tuple
    -- version. SQLite already serializes writers at this statement.
    local result, err = tx:execute("INSERT INTO kickside_wake_fanout (key) VALUES " .. table.concat(values, ",")
        .. " ON CONFLICT(key) DO UPDATE SET key=excluded.key WHERE FALSE", sorted)
    local _, rows_err = boundary.bounded_row_count(result, err, "wake row lock failed", field .. ".wake_rows",
        #sorted, response_error)
    return rows_err
end

-- lock_job(tx, dbtype, observed, target_key, field, response_error) holds the
-- wake rows of the job's observed key and of the key it moves to, then the
-- job row. Returns the locked active row, or nil when the job is absent or
-- settled. A key moved by a committed concurrent write is a retryable conflict.
function M.lock_job(tx: sql.Transaction, dbtype: string, observed: table, target_key: string?,
        field: string, response_error: ResponseError): (table?, error?)
    local current = wake_key(observed.wake_key)
    local target = wake_key(target_key)
    local keys: { string } = {}
    if current then keys[#keys + 1] = current end
    if target then keys[#keys + 1] = target end
    local lock_err = M.lock(tx, keys, field, response_error)
    if lock_err then return nil, lock_err end
    local suffix = dbtype == sql.type.POSTGRES and " FOR UPDATE" or ""
    local rows, err = tx:query("SELECT * FROM kickside_job WHERE id=$1 AND status IN ('pending','running')" .. suffix,
        { observed.id })
    rows, err = boundary.bounded_rows(rows, err, "job row lock failed", field, 0, 1, response_error)
    if err then return nil, err end
    local row = rows[1]
    if not row then return nil, nil end
    local locked_key = wake_key(row.wake_key)
    if locked_key ~= current and locked_key ~= target then
        return nil, errors.new({message = "job wake key changed concurrently", kind = errors.CONFLICT,
            retryable = true, details = {job_id = tostring(observed.id)}})
    end
    return row, nil
end

-- lock_job_id is lock_job for a job known only by id.
function M.lock_job_id(tx: sql.Transaction, dbtype: string, id: string, field: string,
        response_error: ResponseError): (table?, error?)
    local rows, err = tx:query("SELECT id,wake_key FROM kickside_job WHERE id=$1 AND status IN ('pending','running')", { id })
    rows, err = boundary.bounded_rows(rows, err, "job wake key read failed", field, 0, 1, response_error)
    if err then return nil, err end
    if not rows[1] then return nil, nil end
    return M.lock_job(tx, dbtype, rows[1], nil, field, response_error)
end

return M
