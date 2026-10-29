-- Durable owner state is readable without messaging the singleton process.
local sql = require("sql")
local json = require("json")
local boundary = require("sql_boundary")
local envelope = require("error_envelope")
local M = {}
local function malformed(field: string): error
    return errors.new({kind = errors.INTERNAL, retryable = false,
        message = "Pool applied state is invalid", details = {code = "jobs_pool_applied_response", field = field}})
end
function M.read(db_id: string): (table?, error?)
    local db, err = sql.get(db_id)
    if err then return nil, err end
    local rows, read_err = db:query("SELECT * FROM kickside_job_pool_applied WHERE id=1", {})
    rows, read_err = boundary.bounded_rows(rows, read_err, "Pool state read failed", "row", 1, 1, malformed)
    if read_err then return nil, boundary.release(db, read_err, "Pool state release failed") end
    local row = rows[1]
    for _, key in ipairs({"applied_revision", "total", "general", "awaited"}) do
        local value, value_err = boundary.number_value(row[key], key, key == "applied_revision" and -1 or 0, true, false, malformed)
        if value_err then return nil, boundary.release(db, value_err, "Pool state release failed") end
        row[key] = value
    end
    local decode_err = nil
    if row.apply_error then row.apply_error, decode_err = json.decode(row.apply_error) end
    return row, boundary.release(db, decode_err, "Pool state release failed")
end
function M.write(db_id: string, state: table, apply_err: error?): error?
    local encoded = nil
    if apply_err then
        local encode_err
        local failure = envelope.encode(apply_err)
        failure.kind = failure.kind ~= "" and failure.kind or errors.INTERNAL
        failure.retryable = failure.retryable == true
        failure.details = failure.details or {}
        failure.code = failure.details.code or "jobs_policy_apply_failed"
        encoded, encode_err = json.encode(failure)
        if encode_err then return encode_err end
    end
    local db, err = sql.get(db_id)
    if err then return err end
    local params = {state.applied_revision, state.total, state.general, state.awaited}
    local function optional(value): string
        if value == nil then return "NULL" end
        params[#params + 1] = value
        return "$" .. tostring(#params)
    end
    local database, failure = optional(state.database), optional(encoded)
    local result, write_err = db:execute([[UPDATE kickside_job_pool_applied SET applied_revision=$1,
        total=$2,general=$3,awaited=$4,database=]] .. database .. ",apply_error=" .. failure
        .. ",updated_at=CURRENT_TIMESTAMP WHERE id=1", params)
    local _, result_err = boundary.exact_row_count(result, write_err, "Pool state write failed", "row", 1, malformed)
    return boundary.release(db, result_err, "Pool state release failed")
end
return M
