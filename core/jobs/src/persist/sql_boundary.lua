local sql = require("sql")
local error_envelope = require("error_envelope")
local committed_error = require("committed_error")
local M = {}
type ResponseError = (string) -> error

function M.database_type(db: sql.DB, operation: string, field: string,
    response_error: ResponseError): (string?, error?)
    local raw, err = db:type()
    if err then return nil, errors.wrap(err, operation) end
    if type(raw) ~= "string" or raw == "" then return nil, response_error(field) end
    return raw, nil
end

function M.begin(db: sql.DB, operation: string, field: string, response_error: ResponseError): (sql.Transaction?, error?)
    local tx, err = db:begin()
    if err then return nil, errors.wrap(err, operation) end
    if type(tx) ~= "table" and type(tx) ~= "userdata" then return nil, response_error(field) end
    return tx, nil
end

function M.bounded_row_count(result: any, err: error?, operation: string, field: string,
    maximum: integer, response_error: ResponseError): (integer?, error?)
    if err then return nil, errors.wrap(err, operation) end
    if type(result) ~= "table" then return nil, response_error(field) end
    local count = tonumber(result.rows_affected)
    if count == nil or count ~= count or count < 0 or count > maximum or count % 1 ~= 0 then
        return nil, response_error(field)
    end
    return count :: integer, nil
end

function M.exact_row_count(result: any, err: error?, operation: string, field: string,
    expected: integer, response_error: ResponseError): (integer?, error?)
    local count, count_err = M.bounded_row_count(result, err, operation, field, expected, response_error)
    if count_err then return nil, count_err end
    if count ~= expected then return nil, response_error(field) end
    return count, nil
end

function M.single_row_count(result: any, err: error?, operation: string, field: string,
    response_error: ResponseError): (integer?, error?)
    return M.bounded_row_count(result, err, operation, field, 1, response_error)
end

function M.rows(result: any, err: error?, operation: string, field: string,
    response_error: ResponseError): (table[]?, error?)
    if err then return nil, errors.wrap(err, operation) end
    if type(result) ~= "table" then return nil, response_error(field) end
    local count, last = 0, 0
    for index, row in pairs(result) do
        if type(index) ~= "number" or index < 1 or index % 1 ~= 0 or type(row) ~= "table" then
            return nil, response_error(field)
        end
        count = count + 1
        last = math.max(last, index)
    end
    if count ~= last then return nil, response_error(field) end
    return result, nil
end

function M.bounded_rows(result: any, err: error?, operation: string, field: string,
    minimum: integer, maximum: integer?, response_error: ResponseError): (table[]?, error?)
    local rows, rows_err = M.rows(result, err, operation, field, response_error)
    if rows_err then return nil, rows_err end
    if not rows or #rows < minimum or (maximum ~= nil and #rows > maximum) then
        return nil, response_error(field)
    end
    return rows, nil
end

function M.number_value(value: any, field: string, minimum: number?, integral: boolean,
    nullable: boolean, response_error: ResponseError): (number?, error?)
    if value == nil and nullable then return 0, nil end
    if type(value) ~= "number" and type(value) ~= "string" then return nil, response_error(field) end
    local number = tonumber(value)
    if number == nil or number ~= number or math.abs(number) >= math.huge
        or (minimum ~= nil and number < minimum) or (integral and number % 1 ~= 0) then
        return nil, response_error(field)
    end
    return number, nil
end

function M.query_count(result: any, err: error?, operation: string, field: string,
    response_error: ResponseError): (number?, error?)
    local rows, rows_err = M.rows(result, err, operation, field, response_error)
    if rows_err then return nil, rows_err end
    if not rows or #rows ~= 1 or type(rows[1]) ~= "table" then return nil, response_error(field .. ".count") end
    return M.number_value(rows[1].n, field .. ".count", 0, true, false, response_error)
end

function M.rollback(tx: sql.Transaction, primary: error?, operation: string,
    response_error: ResponseError?, field: string?): error?
    local rollback_err: error? = nil
    local failed = error_envelope.cleanup(function(): (any, error?)
        local rolled, err = tx:rollback()
        if not err and response_error and rolled ~= true then err = response_error(field or "transaction.rollback") end
        rollback_err = err
        return rolled, err
    end, primary, operation)
    if response_error and rollback_err then return committed_error.new(failed :: error) end
    return failed
end

function M.transaction(db: sql.DB, fn: (sql.Transaction) -> (any?, error?), operation: string,
    response_error: ResponseError): (any?, error?)
    local tx, begin_err = M.begin(db, operation .. " begin failed", "transaction.begin", response_error)
    if begin_err then return nil, begin_err end
    if not tx then return nil, response_error("transaction.begin") end
    if type(tx.commit) ~= "function" then return nil, response_error("transaction.commit") end
    if type(tx.rollback) ~= "function" then return nil, response_error("transaction.rollback") end
    local value, err = fn(tx)
    if err then return nil, M.rollback(tx, err, operation .. " rollback failed", response_error) end
    local committed, commit_err = tx:commit()
    if not commit_err and committed ~= true then commit_err = response_error("transaction.commit") end
    if commit_err then return nil, committed_error.new(errors.wrap(commit_err, operation .. " commit failed")) end
    return value, nil
end

function M.release(db: sql.DB, primary: error?, operation: string,
    diagnostic: {cleanup_error: error?}?): error?
    return error_envelope.cleanup(function()
        local released, err = db:release()
        if diagnostic then diagnostic.cleanup_error = err end
        return released, err
    end, primary, operation)
end

return M
