-- A portable upper bound for the encoded values stored in one jobs row.
-- Object encoding includes column names and punctuation, so neither engine can
-- store an omitted variable-length value without it contributing to this cap.
local json = require("json")
local sql = require("sql")

local M = {}
M.NULL = {}
-- kickside_job has an automatic updated_at trigger. Its future timestamp is
-- not an explicit caller change, so reserve the longest JSON-safe canonical
-- RFC3339 representation while checking that trigger-bearing row. This is a
-- bounded, fail-closed near-cap projection; kickside_job_run has no trigger.
local JOB_UPDATED_AT_MAX = "9999-12-31T23:59:59.999999999+00:00"
local function response_error(field: string): error
    return errors.new({message = "retained row response is invalid", kind = errors.INTERNAL,
        retryable = false, details = {code = "job_row_bytes_response", field = field}})
end

function M.measure(row: table): (integer?, error?)
    local encoded, err = json.encode(row)
    if err then return nil, errors.wrap(err, "job row encoding failed") end
    if type(encoded) ~= "string" then return nil, response_error("encoded") end
    return #encoded, nil
end

-- too_large(scope, bytes, cap, operation) refuses one row above the row byte
-- limit. It bounds a single record, not retained volume.
function M.too_large(scope: string, bytes: integer, cap: integer, operation: string): error
    return (errors.new({ message = operation .. " row of " .. tostring(bytes)
        .. " bytes exceeds the " .. tostring(cap) .. "-byte row limit",
        kind = errors.INVALID, retryable = false,
        details = { reason = "row_too_large", scope = scope, cap = cap, used = bytes,
            operation = operation } }) :: error)
end

-- check(row, cap, scope, operation) measures one row about to be stored.
function M.check(row: table, cap: integer, scope: string, operation: string): error?
    local bytes, bytes_err = M.measure(row)
    if bytes_err then return bytes_err end
    if (bytes :: integer) <= cap then return nil end
    return M.too_large(scope, bytes :: integer, cap, operation)
end

-- Enqueue omits these non-null defaults from 04_jobs. Predict their retained
-- encoding without supplying values to INSERT, so database timestamps and
-- defaults keep their existing semantics. PostgreSQL booleans bound SQLite's
-- numeric flags; the timestamp bound covers both supported dialects.
function M.check_job_insert(exec: any, dbtype: string, row: table,
    cap: integer, scope: string, operation: string): error?
    local predicted: { [string]: any } = {}
    for key, value in pairs(row) do predicted[key] = value end
    -- JSONB normalizes whitespace and numeric notation. Ask the same database
    -- for its retained representation, while INSERT still receives the caller's
    -- original payload. Compact JSON length cannot bound arbitrary JSONB.
    if dbtype == sql.type.POSTGRES then
        local rows, err = exec:query("SELECT CAST($1 AS JSONB) AS payload", { row.payload })
        if err then return errors.wrap(err, "job insert payload projection failed") end
        if type(rows) ~= "table" or type(rows[1]) ~= "table" or type(rows[1].payload) ~= "string" then
            return response_error("insert.payload")
        end
        predicted.payload = rows[1].payload
    end
    predicted.actor_context = "{}"
    predicted.created_at = JOB_UPDATED_AT_MAX
    predicted.updated_at = JOB_UPDATED_AT_MAX
    predicted.execution_seq = 0
    predicted.wake_enabled = true
    predicted.wake_generation = 0
    predicted.wake_control_pending = false
    if predicted.scheduled_at ~= nil then predicted.scheduled_at = JOB_UPDATED_AT_MAX end
    return M.check(predicted, cap, scope, operation)
end

-- Read the complete retained row and measure the values that the caller will
-- store. A missing row is left to the caller's fenced UPDATE/row-count check.
-- A supplied snapshot is the complete row already locked by this transaction.
function M.check_update(exec: any, table_name: string, id: string, changes: any,
    cap: integer, operation: string, snapshot: table?): error?
    if table_name ~= "kickside_job" and table_name ~= "kickside_job_run" then
        return (errors.new({ message = "invalid retained jobs table", kind = errors.INTERNAL }) :: error)
    end
    local row: any = snapshot
    if snapshot ~= nil and (type(snapshot) ~= "table" or tostring(snapshot.id):lower() ~= id:lower()) then
        return (errors.new({ message = "retained row snapshot identity mismatch", kind = errors.INTERNAL }) :: error)
    end
    if snapshot == nil then
        local lock = ""
        if type(exec.db_type) == "function" then
            local dbtype, type_err = exec:db_type()
            if type_err then return errors.wrap(type_err, "retained row dialect failed") end
            if type(dbtype) ~= "string" or dbtype == "" then return response_error("dialect") end
            if tostring(dbtype) == sql.type.POSTGRES then lock = " FOR UPDATE" end
        end
        local rows, err = exec:query("SELECT * FROM " .. table_name .. " WHERE id=$1" .. lock, { id })
        if err then return errors.wrap(err, "retained row read failed") end
        if type(rows) ~= "table" then return response_error("rows") end
        if not rows[1] then return nil end
        row = rows[1]
    else
        row = {}
        for key, value in pairs(snapshot) do row[key] = value end
    end
    if type(changes) == "function" then
        local built, build_err = changes(row)
        if build_err then return build_err end
        changes = built
    end
    if type(changes) ~= "table" then
        return (errors.new({ message = "invalid retained row changes", kind = errors.INTERNAL }) :: error)
    end
    for key, value in pairs(changes) do
        if value == M.NULL then row[key] = nil else row[key] = value end
    end
    if table_name == "kickside_job" and row.updated_at ~= nil then
        row.updated_at = JOB_UPDATED_AT_MAX
    end
    local bytes, bytes_err = M.measure(row)
    if bytes_err then return bytes_err end
    if (bytes :: integer) <= cap then return nil end
    return M.too_large(tostring(row.owner_kind or "") .. ":" .. tostring(row.owner_id or ""),
        bytes :: integer, cap, operation)
end

return M
