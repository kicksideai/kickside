local test = require("test")
local lease = require("lease")
local fixture = require("fixture")
local function invoke()
    return pcall(lease.main, {job_id = "job", lease_token = "token", execution_seq = 1, lease_until = "future"})
end
return {run = test.run_cases(function()
    test.describe("native lease heartbeat exit causes", function()
        test.it("keeps renewal timeout paired with the running heartbeat interval", function()
            fixture.reset("main", "", nil)
            local ok, err = pcall(lease.main, {job_id = "job", lease_token = "token", execution_seq = 1,
                lease_until = "future", interval_ms = 4500, lease_timeout_seconds = 60})
            test.is_true(ok)
            test.is_nil(err)
            test.eq(fixture.future_seconds, 60)
        end)
        for _, stage in ipairs({"database", "dialect", "policy", "deadline", "extend", "revocation", "notify", "committed_deadline", "release"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, message = "heartbeat dependency refusal", retryable = options.retryable,
                            details = {code = "lease_heartbeat_dependency", nested = {stage = stage}}})
                        fixture.reset("main", stage, source)
                        if stage == "revocation" then fixture.count = 0 end
                        if stage == "release" then fixture.release_error = source end
                        local ok, actual = invoke(); test.is_false(ok)
                        test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
                        test.eq(actual:details().code, "lease_heartbeat_dependency"); test.eq(actual:details().nested.stage, stage)
                        test.eq(fixture.releases, stage == "database" and 0 or 1)
                        if stage == "extend" then test.eq(fixture.renewal_attempts, 3); test.eq(fixture.commits, 0) end
                    end)
                end
            end
        end
        test.it("exit retains renewal and release causes", function()
            local primary = errors.new({kind = errors.PERMISSION_DENIED, retryable = false, message = "renewal denied", details = {code = "renewal_refusal"}})
            local secondary = errors.new({kind = errors.UNAVAILABLE, retryable = true, message = "release unavailable", details = {code = "release_refusal"}})
            fixture.reset("main", "extend", primary); fixture.release_error = secondary
            local ok, actual = invoke(); test.is_false(ok); test.is_true(errors.is(actual, errors.UNAVAILABLE)); test.is_true(actual:retryable())
            test.eq(actual:details().code, "release_refusal"); test.eq(actual:details().operation_error.kind, primary:kind())
            test.eq(actual:details().operation_error.retryable, false); test.eq(actual:details().operation_error.details.code, "renewal_refusal")
            test.eq(fixture.renewal_attempts, 3); test.eq(fixture.releases, 1)
        end)
        for _, route in ipairs({"cancel", "main"}) do
            test.it("healthy heartbeat/" .. route, function()
                fixture.reset(route, "", nil); local ok, err = invoke(); test.is_true(ok); test.is_nil(err); test.eq(fixture.releases, 1)
                test.eq(fixture.commits, route == "cancel" and 0 or 1)
            end)
        end
        test.it("missing identity raises Invalid", function()
            fixture.reset("main", "", nil); local ok, actual = pcall(lease.main, {})
            test.is_false(ok); test.is_true(errors.is(actual, errors.INVALID)); test.is_false(actual:retryable()); test.eq(fixture.releases, 0)
        end)
        for _, stage in ipairs({"database", "dialect", "policy", "deadline", "committed_deadline"}) do
            for index, case in ipairs({{}, {value = false}, {value = 0}, {value = ""}}) do
                test.it("invalid success/" .. stage .. "/" .. tostring(index), function()
                    fixture.reset("main", stage, nil); fixture.missing, fixture.value = true, case.value
                    local ok, actual = invoke(); test.is_false(ok); test.is_true(errors.is(actual, errors.INTERNAL)); test.is_false(actual:retryable())
                    test.eq(actual:details().code, "job_lease_response")
                    test.eq(actual:details().field, stage == "dialect" and "database.type" or stage)
                    test.eq(fixture.releases, stage == "database" and 0 or 1)
                end)
            end
        end
    end)
end)}
