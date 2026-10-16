local test = require("test")
local writer = require("writer")
local fixture = require("fixture")
local sql = require("sql")
local routes = {{operation = "pause", stage = "cursor"}, {operation = "resume", stage = "cursor"},
    {operation = "resume", stage = "posttype"}, {operation = "resume", stage = "nudge"},
    {operation = "remove_projection", stage = "posttype"}, {operation = "remove_projection", stage = "cursor"},
    {operation = "remove_projection", stage = "cursor2"}, {operation = "remove_projection", stage = "cancellations"},
    {operation = "remove_projection", stage = "retention"}}
local function required(err: error?): error
    if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "postcommit guard requires an error"})) end
    return err
end
local function invoke(operation: string): (any, error?)
    return writer[operation](fixture.database(), "thread", {cursor_id = "cursor", projection_id = "projection"})
end
local function source(kind: string, retryable: boolean?, stage: string): error
    return errors.new({kind = kind, retryable = retryable, message = "opaque",
        details = {code = "projection_postcommit_dependency", nested = {stage = stage}}})
end
return {run = test.run_cases(function()
    test.describe("native projection postcommit failures", function()
        for _, dialect in ipairs({sql.type.SQLITE, sql.type.POSTGRES}) do
            for _, route in ipairs(routes) do
                for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                    for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        test.it(dialect .. "/" .. route.operation .. "/" .. route.stage .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                            local cause = source(kind, policy.retryable, route.stage)
                            fixture.reset(route.operation, route.stage, cause, dialect)
                            local value, err = invoke(route.operation); test.is_nil(value); local actual = required(err)
                            test.eq(actual:kind(), cause:kind()); test.is_false(actual:retryable())
                            test.eq(actual:details().code, "projection_postcommit_dependency")
                            test.eq(actual:details().nested.stage, route.stage)
                            test.eq(actual:details().cause.kind, cause:kind())
                            test.eq(actual:details().cause.retryable, cause:retryable())
                            test.eq(actual:details().cause.details.code, "projection_postcommit_dependency")
                            test.eq(fixture.commits, 1)
                            test.eq(cause:retryable(), policy.retryable)
                        end)
                    end
                end
            end
            for _, operation in ipairs({"resume", "remove_projection"}) do
                for index, proof in ipairs({{}, {value = false}, {value = 1}, {value = ""}, {value = {}}}) do
                    test.it("postcommit dialect proof/" .. dialect .. "/" .. operation .. "/" .. tostring(index), function()
                        fixture.reset(operation, "", nil, dialect); fixture.proof_stage, fixture.proof = "posttype", proof.value
                        local ok, value, err = pcall(function() return invoke(operation) end)
                        test.is_true(ok); test.is_nil(value); local actual = required(err)
                        test.is_true(errors.is(actual, errors.INTERNAL)); test.is_false(actual:retryable())
                        test.eq(actual:details().code, "projection_transaction_response")
                        test.eq(fixture.commits, 1)
                    end)
                end
            end
            for _, second in ipairs({"posttype", "nudge"}) do
                test.it("resume retains both notification failures/" .. dialect .. "/" .. second, function()
                    fixture.reset("resume", "", nil, dialect)
                    fixture.failures.cursor = source(errors.CONFLICT, true, "cursor")
                    fixture.failures[second] = source(errors.UNAVAILABLE, true, second)
                    local value, err = invoke("resume"); test.is_nil(value); local actual = required(err)
                    test.is_true(errors.is(actual, errors.UNAVAILABLE)); test.is_false(actual:retryable())
                    test.eq(actual:details().nested.stage, second)
                    test.eq(actual:details().operation_error.kind, errors.CONFLICT)
                    test.eq(actual:details().operation_error.details.nested.stage, "cursor")
                    test.eq(fixture.commits, 1)
                end)
            end
            test.it("removal retains every cursor and cancellation failure/" .. dialect, function()
                fixture.reset("remove_projection", "", nil, dialect)
                fixture.failures.cursor = source(errors.INVALID, false, "cursor")
                fixture.failures.cursor2 = source(errors.CONFLICT, true, "cursor2")
                fixture.failures.cancellations = source(errors.UNAVAILABLE, true, "cancellations")
                local value, err = invoke("remove_projection"); test.is_nil(value); local actual = required(err)
                test.is_true(errors.is(actual, errors.UNAVAILABLE)); test.is_false(actual:retryable())
                test.eq(actual:details().nested.stage, "cancellations")
                test.eq(actual:details().operation_error.details.nested.stage, "cursor2")
                test.eq(actual:details().operation_error.details.operation_error.details.nested.stage, "cursor")
                test.eq(fixture.cursors, 2); test.eq(fixture.cancellations, 1); test.eq(fixture.retention, 0)
            end)
            for _, operation in ipairs({"pause", "resume", "remove_projection"}) do
                test.it("healthy output and absent subscriber remain valid/" .. dialect .. "/" .. operation, function()
                    fixture.reset(operation, "", nil, dialect); local value, err = invoke(operation)
                    test.is_nil(err); test.not_nil(value); test.eq(fixture.commits, 1)
                    if operation == "remove_projection" then test.eq(value.removed_cursors, 2)
                    else test.eq(value.cursor_id, "cursor"); test.eq(value.status, operation == "pause" and "paused" or "active") end
                end)
            end
        end
    end)
end)}
