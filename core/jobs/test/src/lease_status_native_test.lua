local test = require("test")
local lease = require("lease")
local fixture = require("fixture")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
local executor: any = {}
local job = {id = "job", lease_token = "token", execution_seq = 1}
local function required(err: error?): error
    if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "lease status guard requires an error"})) end
    return err
end
return {run = test.run_cases(function()
    test.describe("native lease status classification", function()
        for _, dialect in ipairs({"sqlite", "postgres"}) do
            for _, stage in ipairs({"active", "run"}) do
                for _, kind in ipairs(kinds) do
                    for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        for _, detailed in ipairs({false, true}) do
                            test.it(dialect .. "/" .. stage .. "/" .. kind .. "/" .. tostring(policy.retryable) .. "/" .. tostring(detailed), function()
                                local source = errors.new({kind = kind, message = "dependency refusal", retryable = policy.retryable,
                                    details = detailed and {code = "lease_dependency", nested = {marker = "kept"}} or nil})
                                fixture.reset(stage, source)
                                local active, err, until_value = lease.job_still_running(executor, job, dialect, "run")
                                test.is_false(active)
                                test.is_nil(until_value)
                                local actual = required(err)
                                test.is_true(errors.is(actual, source:kind()))
                                test.eq(actual:retryable(), source:retryable())
                                if detailed then
                                    test.eq(actual:details().code, "lease_dependency")
                                    test.eq(actual:details().nested.marker, "kept")
                                else test.is_nil(actual:details()) end
                                test.eq(fixture.queries, stage == "active" and 1 or 2)
                            end)
                        end
                    end
                end
                for index, malformed in ipairs({{}, {value = false}, {value = "rows"}, {value = {false}}, {value = {{}}}}) do
                    test.it("proof/" .. dialect .. "/" .. stage .. "/" .. tostring(index), function()
                        fixture.reset(stage, nil)
                        fixture.missing, fixture.value = true, malformed.value
                        local ok, active, err = pcall(function() return lease.job_still_running(executor, job, dialect, "run") end)
                        test.is_true(ok)
                        test.is_false(active)
                        local actual = required(err)
                        test.is_true(errors.is(actual, errors.INTERNAL))
                        test.is_false(actual:retryable())
                        test.eq(actual:details().code, "job_lease_status_response")
                        test.eq(fixture.queries, stage == "active" and 1 or 2)
                    end)
                end
            end
            test.it("active/" .. dialect, function()
                fixture.reset("", nil); fixture.active = {{lease_until = "lease deadline"}}
                local active, err, until_value = lease.job_still_running(executor, job, dialect, "run")
                test.is_true(active); test.is_nil(err); test.eq(until_value, "lease deadline"); test.eq(fixture.queries, 1)
            end)
            for _, status in ipairs({"running", "lease_lost", "success", "failed", "canceled"}) do
                test.it("status/" .. dialect .. "/" .. status, function()
                    fixture.reset("", nil); fixture.runs = {{status = status}}
                    local active, err, until_value = lease.job_still_running(executor, job, dialect, "run")
                    test.eq(active, status ~= "running" and status ~= "lease_lost")
                    test.is_nil(err); test.is_nil(until_value); test.eq(fixture.queries, 2)
                end)
            end
            for _, with_run in ipairs({false, true}) do
                test.it("absent/" .. dialect .. "/" .. tostring(with_run), function()
                    fixture.reset("", nil)
                    local active, err = lease.job_still_running(executor, job, dialect, with_run and "run" or nil)
                    test.is_false(active); test.is_nil(err); test.eq(fixture.queries, with_run and 2 or 1)
                end)
            end
        end
    end)
end)}
