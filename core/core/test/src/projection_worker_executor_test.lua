local test = require("test")
local worker = require("worker")
local fixture = require("fixture")
local function binding(): table
    return {worker_ref = "func://app:worker", worker_runtime = "func", target_id = "app:worker",
        actor_id = "owner", actor_context = "stored identity"}
end
return {run = test.run_cases(function()
    test.describe("native projection executor configuration", function()
        for _, stage in ipairs({"actor", "scope", "options"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, retryable = options.retryable,
                            message = "executor configuration refuses", details = {code = "executor_dependency", nested = {stage = stage}}})
                        fixture.reset(stage, source)
                        local result, err = worker.run(binding(), {})
                        test.is_nil(result)
                        test.eq(type(err), "userdata")
                        test.eq(err:kind(), source:kind())
                        test.eq(err:retryable(), source:retryable())
                        test.eq(err:details().code, "executor_dependency")
                        test.eq(err:details().nested.stage, stage)
                        test.eq(fixture.actors, 1)
                        test.eq(fixture.scopes, stage == "actor" and 0 or 1)
                        test.eq(fixture.configures, stage == "options" and 1 or 0)
                        test.eq(fixture.calls, 0)
                    end)
                end
            end
            test.it("missing executor proof/" .. stage, function()
                fixture.reset("missing_" .. stage, nil)
                local result, err = worker.run(binding(), {})
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INTERNAL))
                test.eq(err:retryable(), false)
                test.eq(err:details().code, "projection_worker_executor_response")
                test.eq(err:details().field, stage)
                test.eq(fixture.calls, 0)
            end)
        end
        test.it("bounded actor executor configures one invocation", function()
            fixture.reset("", nil)
            local result, err = worker.run(binding(), {})
            test.is_nil(err)
            test.eq(type(result), "table")
            test.eq(fixture.actors, 1)
            test.eq(fixture.scopes, 1)
            test.eq(fixture.configures, 1)
            test.eq(fixture.max_attempts, 1)
            test.eq(fixture.calls, 1)
        end)
    end)
end)}
