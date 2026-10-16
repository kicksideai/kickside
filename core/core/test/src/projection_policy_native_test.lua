local test = require("test")
local policy = require("policy")
local fixture = require("fixture")
local valid = {meta = {apply = {batch_size = 23}, proc = {max_execution = "11m"}}}
return {run = test.run_cases(function()
    test.describe("native projection policy dependencies", function()
        for _, stage in ipairs({"registry", "duration"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, message = "projection policy dependency failure",
                            retryable = options.retryable, details = {code = "projection_policy_dependency", nested = {stage = stage}}})
                        fixture.reset(stage, source, valid, false, nil)
                        local value, err = policy.policy()
                        test.is_nil(value)
                        test.eq(type(err), "userdata")
                        test.eq(err:kind(), source:kind())
                        test.eq(err:retryable(), source:retryable())
                        test.eq(err:details().code, "projection_policy_dependency")
                        test.eq(err:details().nested.stage, stage)
                        test.eq(fixture.gets, 1)
                        test.eq(fixture.parses, stage == "duration" and 1 or 0)
                    end)
                end
            end
        end
        for _, input in ipairs({{name = "missing"}, {name = "false", value = false},
            {name = "number", value = 42}, {name = "string", value = "entry"}}) do
            test.it("malformed registry response/" .. input.name, function()
                fixture.reset("registry", nil, input.value, false, nil)
                local value, err = policy.policy()
                test.is_nil(value)
                test.is_true(errors.is(err, errors.INTERNAL))
                test.eq(err:retryable(), false)
                test.eq(err:details().code, "projection_policy_response")
                test.eq(err:details().field, "kickside.core.projections:policy.entry")
                test.eq(fixture.gets, 1)
                test.eq(fixture.parses, 0)
            end)
        end
        for _, input in ipairs({{name = "missing"}, {name = "false", value = false}}) do
            test.it("malformed duration response/" .. input.name, function()
                fixture.reset("duration", nil, valid, true, input.value)
                local value, err = policy.policy()
                test.is_nil(value)
                test.is_true(errors.is(err, errors.INTERNAL))
                test.eq(err:retryable(), false)
                test.eq(err:details().code, "projection_policy_response")
                test.eq(err:details().field, "proc.max_execution")
                test.eq(fixture.gets, 1)
                test.eq(fixture.parses, 1)
            end)
        end
        test.it("retains valid registry policy resolution", function()
            fixture.reset("", nil, valid, false, nil)
            local value, err = policy.policy()
            test.is_nil(err)
            test.eq(value.apply_batch_size, 23)
            test.eq(value.proc_max_execution_ms, 660000)
            test.eq(fixture.gets, 1)
            test.eq(fixture.parses, 1)
        end)
        test.it("retains invalid duration refusal", function()
            fixture.reset("", nil, nil, false, nil)
            local value, err = policy.resolve({apply = {batch_size = 1}, proc = {max_execution = "invalid"}})
            test.is_nil(value)
            test.is_true(errors.is(err, errors.INVALID))
            test.eq(fixture.parses, 1)
        end)
    end)
end)}
