local test = require("test")
local lifecycle = require("lifecycle")
local fixture = require("fixture")
local sql = require("sql")
local job_types = require("job_types")
local function invoke(route: string): error?
    local job = {id = "job", execution_seq = 1, lease_token = "token", payload = "{}", attempts = 1}
    if route == "heartbeat" then return lifecycle.heartbeat_job(fixture.database(), job, sql.type.SQLITE) end
    if route == "complete" then return lifecycle.complete_job(fixture.database(), job, sql.type.SQLITE, {}) end
    if route == "complete_tx" then return lifecycle.complete_tx(fixture.database(), job, sql.type.SQLITE, {}) end
    if route == "fail_tx" then return lifecycle.fail_tx(fixture.database(), job, sql.type.SQLITE, "execution refusal", "deterministic") end
    return lifecycle.fail_job(fixture.database(), job, sql.type.SQLITE, "execution refusal", route == "fail_retry" and "infrastructure" or "deterministic")
end
local function required(err: error?): error
    if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "transition guard requires an error"})) end
    return err
end
local function retained(actual: error, source: error, secondary: boolean?)
    test.is_true(errors.is(actual, source:kind())); test.eq(actual:retryable(), source:retryable())
    if source:details() then test.eq(actual:details().code, "transition_dependency"); test.eq(actual:details().nested.marker, "kept")
    elseif not secondary then test.is_nil(actual:details()) end
end
local function proof(route: string, phase: string, value: any, field: string)
    fixture.reset(route, phase, nil); fixture.missing, fixture.value = true, value
    local ok, err = pcall(function() return invoke(route) end); test.is_true(ok); local actual = required(err)
    test.is_true(errors.is(actual, errors.INTERNAL)); test.is_false(actual:retryable())
    test.eq(actual:details().code, "job_run_response"); test.eq(actual:details().field, field)
end
local function group(route: string, own: boolean)
    return test.run_cases(function()
        test.describe("native lifecycle transition/" .. route, function()
            local phases: {string} = {"policy", "size", "update"}
            if route ~= "heartbeat" then phases[#phases + 1] = "marker" end
            if route == "fail_retry" then phases[#phases + 1] = "payload" end
            if own then phases[#phases + 1] = "begin"; phases[#phases + 1] = "commit" end
            for _, phase in ipairs(phases) do
                for _, kind in ipairs({errors.INVALID, errors.UNAVAILABLE, errors.CONFLICT}) do
                    for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        for _, detailed in ipairs({false, true}) do
                            test.it(phase .. "/" .. kind .. "/" .. tostring(policy.retryable) .. "/" .. tostring(detailed), function()
                                local source = errors.new({kind = kind, message = "transition dependency refusal", retryable = policy.retryable,
                                    details = detailed and {code = "transition_dependency", nested = {marker = "kept"}} or nil})
                                fixture.reset(route, phase, source); local actual = required(invoke(route)); retained(actual, source)
                                test.eq(fixture.commits, phase == "commit" and 1 or 0)
                            end)
                        end
                    end
                end
            end
            local proofs: {string} = {"policy", "update"}; if own then proofs[#proofs + 1] = "begin" end
            local field = route == "heartbeat" and "heartbeat.rows_affected" or ((route == "complete" or route == "complete_tx") and "complete.rows_affected" or "fail.rows_affected")
            for _, phase in ipairs(proofs) do
                for index, response in ipairs({{}, {value = false}, {value = 0}, {value = ""}}) do
                    test.it("missing proof/" .. phase .. "/" .. tostring(index), function()
                        proof(route, phase, response.value, phase == "begin" and "transaction" or phase == "update" and field or phase)
                    end)
                end
            end
            for _, value in ipairs({-1, 0.5, 2, "bad"}) do
                test.it("invalid count/" .. tostring(value), function() proof(route, "update", {rows_affected = value}, field) end)
            end
            if own then
                for _, phase in ipairs({"policy", "size", "update", "marker"}) do
                    for _, kind in ipairs({errors.INVALID, errors.UNAVAILABLE, errors.CONFLICT}) do
                        test.it("rollback/" .. phase .. "/" .. kind, function()
                            local primary = errors.new({kind = errors.PERMISSION_DENIED, retryable = false, message = "transition primary refusal", details = {code = "transition_primary"}})
                            local source = errors.new({kind = kind, retryable = true, message = "transition rollback refusal", details = {code = "transition_dependency", nested = {marker = "kept"}}})
                            fixture.reset(route, phase, primary); fixture.rollback_error = source; local actual = required(invoke(route)); retained(actual, source, true)
                            test.eq(actual:details().operation_error.kind, primary:kind()); test.eq(actual:details().operation_error.details.code, "transition_primary")
                            test.eq(fixture.rollbacks, 1); test.eq(fixture.commits, 0)
                        end)
                    end
                end
            end
            test.it("valid zero rows retain lost lease", function()
                fixture.reset(route, "", nil); fixture.count = 0; local err = invoke(route); test.is_true(job_types.is_lease_lost_error(err))
                test.eq(fixture.commits, 0)
            end)
            test.it("successful boundary", function()
                fixture.reset(route, "", nil); test.is_nil(invoke(route)); test.eq(fixture.commits, own and 1 or 0); test.eq(fixture.rollbacks, 0)
            end)
        end)
    end)
end
return {run = group("heartbeat", false), complete = group("complete", true), complete_tx = group("complete_tx", false),
    fail = group("fail", true), fail_tx = group("fail_tx", false), fail_retry = group("fail_retry", true)}
