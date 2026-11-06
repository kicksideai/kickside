local test = require("test")
local lease = require("lease")
local fixture = require("fixture")
local sql = require("sql")
local job_types = require("job_types")
local function invoke(route: string): (any?, error?)
    if route == "extend" then return lease.extend_lease(fixture.database(), sql.type.SQLITE, "job", "token", 1) end
    local job = {id = "job", lease_token = "token", execution_seq = 1, lease_until = "2026-10-10 00:00:30"}
    if route == "dispatch" then return lease.validate_for_dispatch(fixture.database(), sql.type.SQLITE, job) end
    return lease.start(job)
end
local function required(err: error?): error
    if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "lease guard requires an error"})) end
    return err
end
local function retained(actual: error, source: error, secondary: boolean?)
    test.is_true(errors.is(actual, source:kind())); test.eq(actual:retryable(), source:retryable())
    if source:details() then test.eq(actual:details().code, "lease_dependency"); test.eq(actual:details().nested.marker, "kept")
    elseif not secondary then test.is_nil(actual:details()) end
end
local function proof(route: string, stage: string, value: any, field: string)
    fixture.reset(route, stage, nil); fixture.missing, fixture.value = true, value
    local ok, result, err = pcall(function() return invoke(route) end)
    test.is_true(ok); if route == "start" then test.is_nil(result) else test.is_false(result) end
    local actual = required(err); test.is_true(errors.is(actual, errors.INTERNAL)); test.is_false(actual:retryable())
    test.eq(actual:details().code, "job_lease_response"); test.eq(actual:details().field, field)
end
local function group(route: string, phases: {string})
    return test.run_cases(function()
        test.describe("native Jobs lease/" .. route, function()
            for _, phase in ipairs(phases) do
                for _, kind in ipairs({errors.INVALID, errors.UNAVAILABLE, errors.CONFLICT}) do
                    for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        for _, detailed in ipairs({false, true}) do
                            test.it(phase .. "/" .. kind .. "/" .. tostring(policy.retryable) .. "/" .. tostring(detailed), function()
                                local source = errors.new({kind = kind, message = "lease dependency refusal", retryable = policy.retryable,
                                    details = detailed and {code = "lease_dependency", nested = {marker = "kept"}} or nil})
                                fixture.reset(route, phase, source); local result, err = invoke(route)
                                if route == "start" then test.is_nil(result) else test.is_false(result) end
                                retained(required(err), source)
                                test.eq(fixture.commits, phase == "commit" and 1 or 0)
                            end)
                        end
                    end
                end
            end
            for _, phase in ipairs(route == "extend" and {"policy", "begin", "update"} or (route == "dispatch" and {"policy", "read"} or {"policy", "spawn"})) do
                for index, response in ipairs({{}, {value = false}, {value = 0}, {value = ""}}) do
                    test.it("missing response/" .. phase .. "/" .. tostring(index), function()
                        proof(route, phase, response.value, phase == "begin" and "transaction" or phase == "update" and "rows_affected" or phase == "spawn" and "process.id" or phase)
                    end)
                end
            end
            test.it("successful boundary", function()
                fixture.reset(route, "", nil); local result, err = invoke(route); test.is_nil(err)
                if route == "start" then test.eq(result, "lease-process") else test.is_true(result) end
            end)
            if route == "extend" then
                test.it("renews with the active execution lease snapshot after a live edit", function()
                    fixture.reset(route, "", nil)
                    local alive, err = lease.extend_lease(fixture.database(), sql.type.SQLITE, "job", "token", 1, 60)
                    test.is_nil(err)
                    test.is_true(alive)
                    test.eq(fixture.future_seconds, 60)
                end)
                for _, phase in ipairs({"size", "update", "lost"}) do
                    for _, kind in ipairs({errors.INVALID, errors.UNAVAILABLE, errors.CONFLICT}) do
                        for _, retryable in ipairs({false, true}) do
                            test.it("rollback/" .. phase .. "/" .. kind .. "/" .. tostring(retryable), function()
                                local primary = errors.new({kind = errors.PERMISSION_DENIED, retryable = false, message = "lease primary refusal", details = {code = "lease_primary"}})
                                local source = errors.new({kind = kind, retryable = retryable, message = "lease rollback refusal", details = {code = "lease_dependency", nested = {marker = "kept"}}})
                                fixture.reset(route, phase, primary); fixture.rollback_error = source
                                if phase == "lost" then fixture.count = 0 end
                                local result, err = invoke(route); test.is_false(result); local actual = required(err); retained(actual, source, true)
                                if phase ~= "lost" then test.eq(actual:details().operation_error.kind, primary:kind()); test.eq(actual:details().operation_error.details.code, "lease_primary") end
                                test.eq(fixture.rollbacks, 1); test.eq(fixture.commits, 0)
                            end)
                        end
                    end
                end
                for _, value in ipairs({-1, 0.5, 2, "bad"}) do
                    test.it("invalid row count/" .. tostring(value), function() proof(route, "update", {rows_affected = value}, "rows_affected") end)
                end
                test.it("valid lost lease remains false without an error", function()
                    fixture.reset(route, "", nil); fixture.count = 0; local result, err = invoke(route)
                    test.is_false(result); test.is_nil(err); test.eq(fixture.rollbacks, 1); test.eq(fixture.commits, 0)
                end)
            elseif route == "start" then
                test.it("starts heartbeat with claim-time timing rather than a newer policy", function()
                    fixture.reset(route, "", nil)
                    local pid, err = lease.start({id = "job", lease_token = "token", execution_seq = 1,
                        lease_until = "2026-10-10 00:00:30", lease_policy = {lease_timeout_seconds = 60, lease_heartbeat_ms = 4500}})
                    test.is_nil(err)
                    test.eq(pid, "lease-process")
                    test.eq(fixture.spawn_args.interval_ms, 4500)
                    test.eq(fixture.spawn_args.lease_timeout_seconds, 60)
                end)
            elseif route == "dispatch" then
                for _, value in ipairs({false, -1, 0.5, 2, "bad"}) do
                    test.it("invalid renewal proof/" .. tostring(value), function() proof(route, "read", {{needs_renewal = value}}, "read.needs_renewal") end)
                end
                test.it("valid empty read remains a lost lease", function()
                    fixture.reset(route, "", nil); fixture.empty = true; local result, err = invoke(route)
                    test.is_false(result); test.is_true(job_types.is_lease_lost_error(err))
                end)
                test.it("dispatch renews the near-expiry fenced lease", function()
                    fixture.reset(route, "", nil); fixture.renewal = 1; local result, err = invoke(route)
                    test.is_true(result); test.is_nil(err); test.eq(fixture.updates, 1); test.eq(fixture.commits, 1)
                end)
            end
        end)
    end)
end
return {run = group("extend", {"policy", "begin", "size", "update", "commit"}),
    dispatch = group("dispatch", {"policy", "read"}), start = group("start", {"policy", "spawn"})}
