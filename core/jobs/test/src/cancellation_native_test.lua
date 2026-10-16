local test = require("test")
local sql = require("sql")
local cancellation = require("cancellation")
local fixture = require("fixture")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
local function required(err: error?): error
    if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "cancellation guard requires an error"})) end
    return err
end
local function invoke(api, dialect): (any, error?, any?)
    local db = fixture.database()
    if api == "finish_cancellation" then return cancellation.finish_cancellation(db, dialect, {id = "job", token = "token", execution_seq = 1}) end
    return cancellation[api](db, dialect, {id = "job"})
end
local function retains(actual: error, source: error): ()
    test.is_true(errors.is(actual, source:kind()))
    test.eq(actual:retryable(), source:retryable())
    if source:details() then
        test.eq(actual:details().code, "cancellation_dependency")
        test.eq(actual:details().nested.marker, "kept")
        test.eq(source:details().nested.marker, "kept")
    else test.is_nil(actual:details()) end
end
return {run = test.run_cases(function()
    test.describe("native cancellation transaction failures", function()
        for _, dialect in ipairs({sql.type.SQLITE, sql.type.POSTGRES}) do
            for _, api in ipairs({"cancel_job", "cancel_job_tx", "cancel_jobs", "cancel_jobs_tx", "finish_cancellation"}) do
                local standalone = api == "cancel_job" or api == "cancel_jobs" or api == "finish_cancellation"
                local numeric = api == "cancel_jobs" or api == "cancel_jobs_tx"
                local stages = {"size", "update", "marker"}
                if api ~= "finish_cancellation" then stages[#stages + 1] = "lookup" end
                if standalone then stages[#stages + 1] = "begin"; stages[#stages + 1] = "commit" end
                for _, stage in ipairs(stages) do
                    for _, kind in ipairs(kinds) do
                        for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                            for _, detailed in ipairs({false, true}) do
                                test.it(dialect .. "/" .. api .. "/" .. stage .. "/" .. kind .. "/" .. tostring(policy.retryable) .. "/" .. tostring(detailed), function()
                                    local source = errors.new({kind = kind, message = "dependency refusal", retryable = policy.retryable,
                                        details = detailed and {code = "cancellation_dependency", nested = {marker = "kept"}} or nil})
                                    fixture.reset(stage, source)
                                    local value, err = invoke(api, dialect)
                                    test.eq(value, numeric and 0 or false)
                                    retains(required(err), source)
                                    test.eq(fixture.rollbacks, standalone and stage ~= "begin" and stage ~= "commit" and 1 or 0)
                                    test.eq(fixture.commits, stage == "commit" and 1 or 0)
                                end)
                            end
                        end
                    end
                end
                if standalone then
                    for _, kind in ipairs(kinds) do
                        test.it("rollback/" .. dialect .. "/" .. api .. "/" .. kind, function()
                            local source = errors.new({kind = kind, message = "rollback refusal", retryable = true,
                                details = {code = "cancellation_dependency", nested = {marker = "kept"}}})
                            local primary = errors.new({kind = errors.PERMISSION_DENIED, message = "check refusal", retryable = false,
                                details = {code = "cancellation_primary", nested = {marker = "primary"}}})
                            fixture.reset("rollback", source)
                            fixture.primary = primary
                            local value, err = invoke(api, dialect)
                            test.eq(value, numeric and 0 or false)
                            local actual = required(err)
                            retains(actual, source)
                            test.eq(actual:details().operation_error.kind, primary:kind())
                            test.eq(actual:details().operation_error.retryable, primary:retryable())
                            test.eq(actual:details().operation_error.details.code, "cancellation_primary")
                            test.eq(actual:details().operation_error.details.nested.marker, "primary")
                            test.eq(fixture.rollbacks, 1)
                            test.eq(fixture.commits, 0)
                        end)
                    end
                end
                local proofs = {"update"}
                if standalone then proofs[#proofs + 1] = "begin" end
                if api ~= "finish_cancellation" then proofs[#proofs + 1] = "lookup" end
                for _, stage in ipairs(proofs) do
                    test.it("missing/" .. dialect .. "/" .. api .. "/" .. stage, function()
                        fixture.reset(stage, nil)
                        fixture.missing = true
                        local ok, value, err = pcall(function() return invoke(api, dialect) end)
                        test.is_true(ok)
                        test.eq(value, numeric and 0 or false)
                        local actual = required(err)
                        test.is_true(errors.is(actual, errors.INTERNAL))
                        test.is_false(actual:retryable())
                        test.eq(actual:details().code, "job_cancellation_response")
                        test.eq(fixture.commits, 0)
                    end)
                end
                for _, count in ipairs({-1, 0.5, 2, "bad"}) do
                    test.it("invalid count/" .. dialect .. "/" .. api .. "/" .. tostring(count), function()
                        fixture.reset("update", nil)
                        fixture.missing, fixture.value = true, {rows_affected = count}
                        local value, err = invoke(api, dialect)
                        test.eq(value, numeric and 0 or false)
                        local actual = required(err)
                        test.is_true(errors.is(actual, errors.INTERNAL))
                        test.is_false(actual:retryable())
                        test.eq(actual:details().code, "job_cancellation_response")
                        test.eq(fixture.commits, 0)
                    end)
                end
                for _, count in ipairs({0, 1}) do
                    test.it("success/" .. dialect .. "/" .. api .. "/" .. tostring(count), function()
                        fixture.reset("update", nil)
                        fixture.missing, fixture.value = true, {rows_affected = count}
                        local value, err = invoke(api, dialect)
                        test.is_nil(err)
                        if numeric then test.eq(value, count) else test.eq(value, count == 1) end
                        test.eq(fixture.rollbacks, 0)
                        test.eq(fixture.commits, standalone and 1 or 0)
                        test.eq(fixture.markers, count)
                    end)
                end
                if api ~= "finish_cancellation" then
                    for _, mode in ipairs({"empty", "running"}) do
                        test.it(mode .. "/" .. dialect .. "/" .. api, function()
                            fixture.reset("", nil)
                            fixture.empty, fixture.running = mode == "empty", mode == "running"
                            local value, err, revoked = invoke(api, dialect)
                            test.is_nil(err)
                            if numeric then test.eq(value, mode == "empty" and 0 or 1) else test.eq(value, mode ~= "empty") end
                            test.eq(#revoked, mode == "running" and 1 or 0)
                            test.eq(fixture.markers, 0)
                            test.eq(fixture.commits, standalone and 1 or 0)
                        end)
                    end
                end
            end
        end
    end)
end)}
