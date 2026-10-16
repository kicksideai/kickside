local test = require("test")
local fence = require("fence")
local fixture = require("fixture")
local job = {id = "job", lease_token = "lease"}
local function invoke(route: string): error?
    if route == "prepare" then return fence.prepare_termination(fixture.database(), job) end
    return fence.hold_unconfirmed_execution(fixture.database(), job)
end
local function required(actual: error?): error
    if not actual then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "worker fence guard requires failure"})) end
    return actual
end
return {run = test.run_cases(function()
    test.describe("native worker termination fence", function()
        for _, route in ipairs({"prepare", "hold"}) do
            local stages = route == "prepare" and {"policy", "begin", "size", "update", "commit"} or {"policy", "begin", "dialect", "size", "update", "marker", "commit"}
            for _, stage in ipairs(stages) do
                for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                    for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        test.it(route .. "/" .. stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                            local source = errors.new({kind = kind, message = "fence dependency refusal", retryable = options.retryable,
                                details = {code = "fence_dependency", nested = {stage = stage}}})
                            fixture.reset(stage, source); local actual = required(invoke(route))
                            test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
                            test.eq(actual:details().code, "fence_dependency"); test.eq(actual:details().nested.stage, stage)
                            test.eq(fixture.commits, stage == "commit" and 1 or 0)
                            test.eq(fixture.rollbacks, (stage == "size" or stage == "update" or stage == "dialect" or stage == "marker") and 1 or 0)
                        end)
                    end
                end
            end
            for _, stage in ipairs({"size", "update"}) do
                test.it(route .. "/rollback/" .. stage, function()
                    local primary = errors.new({kind = errors.INVALID, retryable = false, message = "operation refused", details = {code = "operation_refusal"}})
                    local secondary = errors.new({kind = errors.UNAVAILABLE, retryable = true, message = "rollback unavailable", details = {code = "rollback_refusal"}})
                    fixture.reset(stage, primary); fixture.secondary = secondary
                    local actual = required(invoke(route)); test.is_true(errors.is(actual, errors.UNAVAILABLE)); test.is_true(actual:retryable())
                    test.eq(actual:details().code, "rollback_refusal"); test.eq(actual:details().operation_error.kind, primary:kind())
                    test.eq(actual:details().operation_error.retryable, false); test.eq(actual:details().operation_error.details.code, "operation_refusal")
                    test.eq(fixture.commits, 0); test.eq(fixture.rollbacks, 1)
                end)
            end
            local proofs = {policy = "policy", begin = "transaction", update = "update.rows_affected"}
            if route == "hold" then proofs.dialect = "database.type" end
            for stage, field in pairs(proofs) do
                for index, case in ipairs({{}, {value = false}, {value = 0}, {value = ""}}) do
                    test.it(route .. "/proof/" .. stage .. "/" .. tostring(index), function()
                        fixture.reset(stage, nil); fixture.missing, fixture.value = true, case.value
                        local ok, actual = pcall(invoke, route); test.is_true(ok); actual = required(actual)
                        test.is_true(errors.is(actual, errors.INTERNAL)); test.is_false(actual:retryable())
                        test.eq(actual:details().code, "job_termination_response"); test.eq(actual:details().field, field); test.eq(fixture.commits, 0)
                    end)
                end
            end
            for _, count in ipairs({-1, 0.5, 2, "bad"}) do
                test.it(route .. "/invalid update count/" .. tostring(count), function()
                    fixture.reset("update", nil); fixture.missing, fixture.value = true, {rows_affected = count}
                    local actual = required(invoke(route)); test.is_true(errors.is(actual, errors.INTERNAL)); test.is_false(actual:retryable())
                    test.eq(actual:details().code, "job_termination_response"); test.eq(actual:details().field, "update.rows_affected"); test.eq(fixture.commits, 0)
                end)
            end
            test.it(route .. "/numeric row count remains", function()
                fixture.reset("update", nil); fixture.missing, fixture.value = true, {rows_affected = "1"}
                test.is_nil(invoke(route)); test.eq(fixture.commits, 1)
            end)
            test.it(route .. "/successful fence remains", function()
                fixture.reset("", nil); test.is_nil(invoke(route)); test.eq(fixture.commits, 1); test.eq(fixture.rollbacks, 0)
            end)
        end
        test.it("stolen preparation remains a no-op", function()
            fixture.reset("update", nil); fixture.missing, fixture.value = true, {rows_affected = 0}
            test.is_nil(invoke("prepare")); test.eq(fixture.commits, 1)
        end)
        test.it("stolen hold retains conflict", function()
            fixture.reset("update", nil); fixture.missing, fixture.value = true, {rows_affected = 0}
            local actual = required(invoke("hold")); test.is_true(errors.is(actual, errors.CONFLICT)); test.eq(fixture.commits, 0); test.eq(fixture.rollbacks, 1)
        end)
    end)
end)}
