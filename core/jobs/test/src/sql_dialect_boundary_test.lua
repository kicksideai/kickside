local test = require("test")
local boundary = require("boundary")
local sql = require("sql")
local function response_error(field: string): error
    return errors.new({kind = errors.INTERNAL, retryable = false, message = "SQL database response lacks proof",
        details = {code = "sql_database_response", field = field}})
end
local function required(err: error?): error
    if not err then error(response_error("guard.error")) end
    return err
end
return {run = test.run_cases(function()
    test.describe("shared SQL dialect proof capability", function()
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
            errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
            for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                test.it(kind .. "/" .. tostring(policy.retryable), function()
                    local cause = errors.new({kind = kind, retryable = policy.retryable, message = "opaque",
                        details = {code = "sql_dialect_dependency", nested = {marker = "kept"}}})
                    local db: any = {type = function(): (any, error?) return nil, cause end}
                    local value, err = boundary.database_type(db, "read dialect", "database.type", response_error)
                    test.is_nil(value); local actual = required(err)
                    test.eq(actual:kind(), cause:kind()); test.eq(actual:retryable(), cause:retryable())
                    test.eq(actual:details().code, "sql_dialect_dependency"); test.eq(actual:details().nested.marker, "kept")
                    test.eq(cause:retryable(), policy.retryable)
                end)
            end
        end
        for index, proof in ipairs({{}, {value = false}, {value = true}, {value = 1}, {value = ""}, {value = {}}}) do
            test.it("missing mandatory dialect/" .. tostring(index), function()
                local db: any = {type = function(): (any, error?) return proof.value, nil end}
                local value, err = boundary.database_type(db, "read dialect", "owner.database.type", response_error)
                test.is_nil(value); local actual = required(err)
                test.is_true(errors.is(actual, errors.INTERNAL)); test.is_false(actual:retryable())
                test.eq(actual:details().code, "sql_database_response"); test.eq(actual:details().field, "owner.database.type")
            end)
        end
        for _, dialect in ipairs({sql.type.SQLITE, sql.type.POSTGRES, "future-engine"}) do
            test.it("preserves a native dialect/" .. dialect, function()
                local db: any = {type = function(): (any, error?) return dialect, nil end}
                local value, err = boundary.database_type(db, "read dialect", "database.type", response_error)
                test.is_nil(err); test.eq(value, dialect)
            end)
        end
    end)
end)}
