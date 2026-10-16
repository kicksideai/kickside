local test = require("test")
local child = require("child")
local fixture = require("fixture")
return {run = test.run_cases(function()
    test.describe("native worker child dependencies", function()
        for _, stage in ipairs({"register", "database", "dialect", "lease", "settle_database", "settle_dialect", "spawn", "fence_database", "fence"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, message = "child dependency refusal", retryable = options.retryable,
                            details = {code = "child_dependency", nested = {stage = stage}}})
                        fixture.reset(stage, source)
                        local actual, control = child.supervise_job_child({id = "job", lease_token = "lease", execution_seq = 1})
                        test.is_nil(control)
                        if not actual then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "native child guard requires failure"})) end
                        test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
                        test.eq(actual:details().code, "child_dependency"); test.eq(actual:details().nested.stage, stage)
                        test.eq(source:details().nested.stage, stage)
                        test.eq(fixture.spawns, (stage == "spawn" or stage == "fence_database" or stage == "fence") and 1 or 0)
                    end)
                end
            end
        end
        test.it("cancellation settlement retains liveness failure", function()
            local source = errors.new({kind = errors.PERMISSION_DENIED, message = "liveness denied", retryable = false,
                details = {code = "child_dependency", nested = {stage = "lease"}}})
            fixture.reset("lease", source); fixture.settled = true
            local actual, control = child.supervise_job_child({id = "job", lease_token = "lease", execution_seq = 1})
            test.is_nil(control); test.is_true(errors.is(actual, errors.PERMISSION_DENIED)); test.is_false(actual:retryable())
            test.eq(actual:details().nested.stage, "lease"); test.eq(fixture.spawns, 0)
        end)
        test.it("successful child supervision remains", function()
            fixture.reset("", nil)
            local actual, control = child.supervise_job_child({id = "job", lease_token = "lease", execution_seq = 1})
            test.is_nil(actual); test.is_nil(control); test.eq(fixture.spawns, 1); test.eq(fixture.releases, 1)
        end)
    end)
end)}
