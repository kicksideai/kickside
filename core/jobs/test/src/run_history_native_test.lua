local test = require("test")
local lifecycle = require("lifecycle")
local fixture = require("fixture")
local sql = require("sql")
local function invoke(route: string): (any?, error?)
    if route == "finalize" then
        return nil, lifecycle.finalize_job_run(fixture.database(), sql.type.SQLITE, {id = "run", started_at_unix = 1}, "completed", {}, {}, nil)
    end
    return lifecycle.start_job_run(fixture.database(), sql.type.SQLITE,
        {id = "job", owner_kind = "thread", owner_id = "owner", execution_seq = 1, lease_token = "token", job_type = "app:job"}, "worker", 1)
end
local function required(err: error?): error
    if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "run history guard requires an error"})) end
    return err
end
local function retained(actual: error, source: error, secondary: boolean?)
    test.is_true(errors.is(actual, source:kind())); test.eq(actual:retryable(), source:retryable())
    if source:details() then test.eq(actual:details().code, "run_history_dependency"); test.eq(actual:details().nested.marker, "kept")
    elseif not secondary then test.is_nil(actual:details()) end
end
local function proof(route: string, phase: string, value: any, field: string)
    fixture.reset(route, phase, nil); fixture.missing, fixture.value = true, value
    local ok, result, err = pcall(function() return invoke(route) end)
    test.is_true(ok); test.is_nil(result); local actual = required(err)
    test.is_true(errors.is(actual, errors.INTERNAL)); test.is_false(actual:retryable())
    test.eq(actual:details().code, "job_run_response"); test.eq(actual:details().field, field)
end
local function group(route: string, phases: {string})
    return test.run_cases(function()
        test.describe("native run history/" .. route, function()
            for _, phase in ipairs(phases) do
                for _, kind in ipairs({errors.INVALID, errors.UNAVAILABLE, errors.CONFLICT}) do
                    for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        for _, detailed in ipairs({false, true}) do
                            test.it(phase .. "/" .. kind .. "/" .. tostring(policy.retryable) .. "/" .. tostring(detailed), function()
                                local source = errors.new({kind = kind, message = "run history dependency refusal", retryable = policy.retryable,
                                    details = detailed and {code = "run_history_dependency", nested = {marker = "kept"}} or nil})
                                fixture.reset(route, phase, source); local result, err = invoke(route); test.is_nil(result); retained(required(err), source)
                                test.eq(fixture.commits, phase == "commit" and 1 or 0)
                            end)
                        end
                    end
                end
            end
            local proof_phases = route == "finalize" and {"policy", "update"} or (route == "existing" and {"read"} or {"policy", "begin", "insert"})
            for _, phase in ipairs(proof_phases) do
                for index, response in ipairs({{}, {value = false}, {value = 0}, {value = ""}}) do
                    test.it("missing proof/" .. phase .. "/" .. tostring(index), function()
                        proof(route, phase, response.value, phase == "begin" and "transaction" or phase == "insert" and "insert.rows_affected" or phase == "update" and "finalize.rows_affected" or phase)
                    end)
                end
            end
            if route ~= "finalize" then
                for _, phase in ipairs(route == "existing" and {"read"} or {"size", "build", "insert"}) do
                    for _, kind in ipairs({errors.INVALID, errors.UNAVAILABLE, errors.CONFLICT}) do
                        test.it("rollback/" .. phase .. "/" .. kind, function()
                            local primary = errors.new({kind = errors.PERMISSION_DENIED, retryable = false, message = "run operation refusal", details = {code = "run_primary"}})
                            local source = errors.new({kind = kind, retryable = true, message = "run rollback refusal", details = {code = "run_history_dependency", nested = {marker = "kept"}}})
                            fixture.reset(route, phase, primary); fixture.rollback_error = source
                            local result, err = invoke(route); test.is_nil(result); local actual = required(err); retained(actual, source, true)
                            test.eq(actual:details().operation_error.kind, primary:kind()); test.eq(actual:details().operation_error.details.code, "run_primary")
                            test.eq(fixture.rollbacks, 1); test.eq(fixture.commits, 0)
                        end)
                    end
                end
            end
            if route ~= "existing" then
                for _, value in ipairs({-1, 0.5, 2, "bad"}) do
                    test.it("invalid count/" .. tostring(value), function()
                        proof(route, route == "finalize" and "update" or "insert", {rows_affected = value}, route == "finalize" and "finalize.rows_affected" or "insert.rows_affected")
                    end)
                end
            else
                test.it("missing existing run identity refuses permanently", function()
                    proof(route, "read", {{lease_token = "token", status = "running"}}, "read.id")
                end)
                test.it("a different lease retains Conflict", function()
                    fixture.reset(route, "read", nil); fixture.missing, fixture.value = true, {{id = "run", lease_token = "other", status = "running"}}
                    local result, err = invoke(route); test.is_nil(result); test.is_true(errors.is(err, errors.CONFLICT))
                end)
            end
            test.it("successful boundary", function()
                fixture.reset(route, "", nil); local result, err = invoke(route); test.is_nil(err)
                if route == "finalize" then test.is_nil(result) else test.not_nil(result); test.eq(fixture.commits, 1) end
                if route == "existing" then test.eq(result.id, "run") end
            end)
            if route == "finalize" then
                test.it("valid zero rows remain NotFound", function()
                    fixture.reset(route, "", nil); fixture.count = 0; local _, err = invoke(route)
                    test.is_true(errors.is(err, errors.NOT_FOUND))
                end)
            end
        end)
    end)
end
return {run = group("start", {"begin", "policy", "size", "build", "insert", "commit"}),
    existing = group("existing", {"read"}), finalize = group("finalize", {"encode.result", "encode.actions", "policy", "size", "update"})}
