local test = require("test")
local receipt = require("receipt")
local fixture = require("fixture")
local sql = require("sql")
local function params()
    return {sink_id = "sink", idempotency_key = "key", identity_key = "identity", payload_hash = "hash",
        created_at = "2026-10-10T00:00:00Z", completed_at = "2026-10-10T01:00:00Z", dest_refs = {}, outcome = {}}
end
local function invoke(operation: string)
    if operation == "replay" then return receipt.replay("sink", "key", "hash") end
    if operation == "reserve" then return receipt.reserve(fixture.transaction(), params()) end
    if operation == "commit" then return receipt.commit(fixture.transaction(), params()) end
    local p = params()
    p.config = {}
    p.reconcile_binding = {lookup = function()
        return {state = operation == "settle_absent" and "settled_absent" or "settled_committed", dest_refs = {}, outcome = {}}, nil
    end}
    return receipt.resolve_pending(p)
end
local function native(err: error?, source: error)
    if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "receipt SQL guard expects an error"})) end
    test.eq(err:kind(), source:kind())
    test.eq(err:retryable(), source:retryable())
    test.eq(err:details().code, "receipt_sql_dependency")
    test.eq(err:details().nested.marker, "kept")
end
local paths = {
    {operation = "replay", stage = "open1"}, {operation = "replay", stage = "read"},
    {operation = "reserve", stage = "dialect"}, {operation = "reserve", stage = "locked_read"},
    {operation = "reserve", stage = "insert"}, {operation = "commit", stage = "update"},
    {operation = "settle_committed", stage = "open2"}, {operation = "settle_committed", stage = "begin"},
    {operation = "settle_committed", stage = "locked_read"}, {operation = "settle_committed", stage = "update"},
    {operation = "settle_committed", stage = "commit"}, {operation = "settle_absent", stage = "begin"},
    {operation = "settle_absent", stage = "delete"}, {operation = "settle_absent", stage = "commit"},
}
return {run = test.run_cases(function()
    test.describe("native receipt SQL failures", function()
        for _, dialect in ipairs({sql.type.SQLITE, sql.type.POSTGRES}) do
            for _, path in ipairs(paths) do
                for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT,
                    errors.RATE_LIMITED, errors.UNKNOWN}) do
                    for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        test.it(dialect .. "/" .. path.operation .. "/" .. path.stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                            local source = errors.new({kind = kind, message = "receipt SQL refusal", retryable = options.retryable,
                                details = {code = "receipt_sql_dependency", nested = {marker = "kept"}}})
                            fixture.reset(path.operation, path.stage, source, dialect)
                            local result, err = invoke(path.operation)
                            test.is_nil(result)
                            native(err, source)
                            test.eq(source:details().nested.marker, "kept")
                            test.eq(fixture.notifies, 0)
                        end)
                    end
                end
            end
        end
    end)
    test.describe("native receipt rollback failures", function()
        for _, operation in ipairs({"settle_committed", "settle_absent"}) do
            for _, dialect in ipairs({sql.type.SQLITE, sql.type.POSTGRES}) do
                for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT,
                    errors.RATE_LIMITED, errors.UNKNOWN}) do
                    test.it(operation .. "/" .. dialect .. "/" .. kind, function()
                        local primary = errors.new({kind = errors.PERMISSION_DENIED, retryable = false, message = "read refused",
                            details = {code = "receipt_sql_dependency", nested = {marker = "kept"}}})
                        local secondary = errors.new({kind = kind, retryable = true, message = "rollback refused",
                            details = {code = "receipt_sql_dependency", nested = {marker = "kept"}}})
                        fixture.reset(operation, "locked_read", primary, dialect)
                        fixture.rollback_source = secondary
                        local result, err = invoke(operation)
                        test.is_nil(result)
                        native(err, secondary)
                        test.eq(err:details().operation_error.kind, primary:kind())
                        test.eq(err:details().operation_error.retryable, false)
                        test.eq(err:details().operation_error.details.code, "receipt_sql_dependency")
                        test.eq(err:details().operation_error.details.nested.marker, "kept")
                        test.eq(fixture.rollbacks, 1)
                        test.eq(fixture.commits, 0)
                        test.eq(fixture.releases, 2)
                        test.eq(fixture.notifies, 0)
                    end)
                end
                for _, abort in ipairs({"absent", "mismatch", "committed", "row_size", "deletion_proof"}) do
                    if operation ~= "settle_committed" or abort ~= "deletion_proof" then
                        if operation ~= "settle_absent" or abort ~= "row_size" then
                            test.it("rollback cannot hide behind " .. operation .. "/" .. dialect .. "/" .. abort, function()
                                local source = errors.new({kind = errors.UNAVAILABLE, retryable = false, message = "rollback refused",
                                    details = {code = "receipt_sql_dependency", nested = {marker = "kept"}}})
                                local primary = errors.new({kind = errors.INVALID, retryable = false, message = "row size refused",
                                    details = {code = "receipt_size", nested = {marker = "kept"}}})
                                fixture.reset(operation, abort == "row_size" and "row_size" or nil, primary, dialect)
                                fixture.abort, fixture.rollback_source = abort, source
                                local result, err = invoke(operation)
                                test.is_nil(result)
                                native(err, source)
                                test.eq(fixture.rollbacks, 1)
                                test.eq(fixture.commits, 0)
                                test.eq(fixture.notifies, 0)
                                if abort == "mismatch" then
                                    test.eq(err:details().operation_error.kind, errors.CONFLICT)
                                    test.is_true(err:details().operation_error.retryable)
                                elseif abort == "row_size" then
                                    test.eq(err:details().operation_error.kind, primary:kind())
                                    test.eq(err:details().operation_error.details.code, "receipt_size")
                                elseif abort == "deletion_proof" then test.eq(err:details().operation_error.kind, errors.INTERNAL)
                                else test.is_nil(err:details().operation_error) end
                            end)
                        end
                    end
                end
            end
        end
    end)
    test.describe("successful receipt SQL behavior", function()
        for _, operation in ipairs({"replay", "reserve", "commit", "settle_committed", "settle_absent"}) do
            test.it(operation, function()
                fixture.reset(operation, nil, nil, sql.type.SQLITE)
                local result, err = invoke(operation)
                test.is_nil(err)
                test.eq(result.state, operation == "replay" and "pending" or
                    (operation == "reserve" and "reserved" or (operation == "settle_absent" and "absent" or "committed")))
                test.eq(fixture.notifies, (operation == "settle_committed" or operation == "settle_absent") and 1 or 0)
            end)
        end
    end)
end)}
