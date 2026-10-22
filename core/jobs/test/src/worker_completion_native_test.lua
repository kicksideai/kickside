local test = require("test")
local worker = require("worker")
local fixture = require("fixture")
local sql = require("sql")
local job = {id = "job", lease_token = "lease", execution_seq = 7, owner_kind = "component", owner_id = "owner"}
local function required(err: error?): error
    if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "worker completion guard requires an error"})) end
    return err
end
local function invoke(operation, dialect)
    if operation == "complete" then return worker.complete_job(fixture.database(), dialect, job,
        {record = {status = "completed"}}, {execution_seq = 7}), nil end
    return worker.fail_job(fixture.database(), dialect, job, {}, "operation refusal", "deterministic", {execution_seq = 7})
end
local function retains(actual: error, source: error): ()
    test.is_true(errors.is(actual, source:kind()))
    test.eq(actual:retryable(), source:retryable())
    if source:details() then
        test.eq(actual:details().code, "worker_completion_dependency")
        test.eq(actual:details().nested.marker, "kept")
        test.eq(source:details().nested.marker, "kept")
    else test.is_nil(actual:details()) end
end
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
return {run = test.run_cases(function()
    test.describe("native worker completion dependencies", function()
        test.it("forwards the structured retry floor into the failure transaction", function()
            fixture.reset("fail", "", nil)
            local err, recorded = worker.fail_job(fixture.database(), sql.type.SQLITE, job, {},
                "provider unavailable", "infrastructure", {execution_seq = 7}, {retry_after_ms = 901500})
            test.is_nil(err)
            test.is_true(recorded)
            test.not_nil(fixture.retry_floor)
            test.eq(fixture.retry_floor.retry_after_ms, 901500)
        end)
        for _, dialect in ipairs({sql.type.SQLITE, sql.type.POSTGRES}) do
            for _, path in ipairs({{operation = "complete", stages = {"begin", "transition", "history", "commit", "notify"}},
                {operation = "fail", stages = {"begin", "settled", "failure", "history", "commit", "notify"}}}) do
                for _, stage in ipairs(path.stages) do
                    for _, kind in ipairs(kinds) do
                        for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                            for _, detailed in ipairs({false, true}) do
                                test.it(path.operation .. "/" .. dialect .. "/" .. stage .. "/" .. kind .. "/" .. tostring(policy.retryable) .. "/" .. tostring(detailed), function()
                                    local source = errors.new({kind = kind, message = "completion dependency refusal", retryable = policy.retryable,
                                        details = detailed and {code = "worker_completion_dependency", nested = {marker = "kept"}} or nil})
                                    fixture.reset(path.operation, stage, source)
                                    local err, settled = invoke(path.operation, dialect)
                                    retains(required(err), source)
                                    if path.operation == "fail" then test.eq(settled, stage == "notify") end
                                    test.eq(fixture.rollbacks, (stage == "transition" or stage == "history" or stage == "failure" or stage == "settled") and 1 or 0)
                                    test.eq(fixture.commits, (stage == "commit" or stage == "notify") and 1 or 0)
                                    test.eq(fixture.notifications, stage == "notify" and 1 or 0)
                                end)
                            end
                        end
                    end
                end
            end
            for _, operation in ipairs({"complete", "fail"}) do
                for _, kind in ipairs(kinds) do
                    test.it("rollback/" .. operation .. "/" .. dialect .. "/" .. kind, function()
                        local secondary = errors.new({kind = kind, message = "rollback refusal", retryable = false,
                            details = {code = "worker_completion_dependency", nested = {marker = "kept"}}})
                        local primary = errors.new({kind = errors.PERMISSION_DENIED, message = "operation refusal", retryable = false,
                            details = {code = "primary_completion", nested = {value = "retained"}}})
                        fixture.reset(operation, "rollback", secondary)
                        fixture.primary = primary
                        local err, settled = invoke(operation, dialect)
                        local actual = required(err)
                        retains(actual, secondary)
                        test.eq(actual:details().operation_error.kind, primary:kind())
                        test.eq(actual:details().operation_error.message, primary:message())
                        test.eq(actual:details().operation_error.retryable, primary:retryable())
                        test.eq(actual:details().operation_error.details.code, "primary_completion")
                        test.eq(actual:details().operation_error.details.nested.value, "retained")
                        test.eq(fixture.rollbacks, 1)
                        test.eq(fixture.commits, 0)
                        test.eq(fixture.notifications, 0)
                        if operation == "fail" then test.is_false(settled) end
                    end)
                end
                test.it("missing transaction/" .. operation .. "/" .. dialect, function()
                    fixture.reset(operation, "begin", nil)
                    fixture.missing = true
                    local ok, err = pcall(function() return invoke(operation, dialect) end)
                    test.is_true(ok)
                    local actual = required(err)
                    test.is_true(errors.is(actual, errors.INTERNAL))
                    test.is_false(actual:retryable())
                    test.eq(actual:details().code, "job_worker_completion_response")
                    test.eq(actual:details().field, "transaction")
                    test.eq(fixture.commits, 0)
                    test.eq(fixture.notifications, 0)
                end)
                for _, rollback_fails in ipairs({false, true}) do
                    test.it("already settled/" .. operation .. "/" .. dialect .. "/" .. tostring(rollback_fails), function()
                        local source = errors.new({kind = errors.UNAVAILABLE, retryable = true, message = "settled rollback refusal",
                            details = {code = "worker_completion_dependency", nested = {marker = "kept"}}})
                        fixture.reset(operation, rollback_fails and "rollback" or "", source)
                        fixture.already, fixture.settled = true, true
                        local err, settled = invoke(operation, dialect)
                        if rollback_fails then retains(required(err), source) else test.is_nil(err) end
                        if operation == "fail" then test.eq(settled, not rollback_fails) end
                        test.eq(fixture.rollbacks, 1)
                        test.eq(fixture.commits, 0)
                        test.eq(fixture.notifications, 0)
                    end)
                end
                test.it("successful transition/" .. operation .. "/" .. dialect, function()
                    fixture.reset(operation, "", nil)
                    local err, settled = invoke(operation, dialect)
                    test.is_nil(err)
                    if operation == "fail" then test.is_true(settled) end
                    test.eq(fixture.rollbacks, 0)
                    test.eq(fixture.commits, 1)
                    test.eq(fixture.notifications, 1)
                end)
            end
            test.it("missing completion proof/" .. dialect, function()
                fixture.reset("complete", "transition", nil)
                fixture.missing = true
                local err = required(invoke("complete", dialect))
                test.is_true(errors.is(err, errors.INTERNAL))
                test.is_false(err:retryable())
                test.eq(err:details().code, "job_worker_completion_response")
                test.eq(err:details().field, "completion")
                test.eq(fixture.rollbacks, 1)
                test.eq(fixture.commits, 0)
                test.eq(fixture.notifications, 0)
            end)
            for _, kind in ipairs(kinds) do
                test.it("invalid output and parking refusal/" .. dialect .. "/" .. kind, function()
                    local source = errors.new({kind = kind, message = "parking refusal", retryable = false,
                        details = {code = "worker_completion_dependency", nested = {marker = "kept"}}})
                    fixture.reset("complete", "park", source)
                    local actual = required(worker.complete_job(fixture.database(), dialect, job, {next_run_at = "invalid"}, nil))
                    retains(actual, source)
                    test.eq(actual:details().operation_error.kind, errors.INVALID)
                    test.eq(fixture.commits, 0)
                    test.eq(fixture.notifications, 0)
                end)
            end
        end
    end)
end)}
