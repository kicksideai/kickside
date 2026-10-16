local test = require("test")
local wake = require("wake")
local fixture = require("fixture")
local function invoke(route: string): (any?, error?)
    if route == "continue" then return wake.continue_job(fixture.database(), "sqlite", {id = "continuation", payload = "{}"}) end
    if route == "multi" then return wake.wake_multi(fixture.transaction(), {"key"}, nil) end
    if route == "fanout" then return wake.wake_tx(fixture.transaction(), "key", nil) end
    if route == "nudge" then return wake.nudge_workers() end
    return wake.wake_job(fixture.database(), "job", route == "addressed" and {control = true, ensure_due = true} or {}, "sqlite")
end
local function required(err: error?): error
    if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "wake guard requires an error"})) end
    return err
end
local function retained(actual: error, source: error, secondary: boolean?)
    test.is_true(errors.is(actual, source:kind())); test.eq(actual:retryable(), source:retryable())
    if source:details() then test.eq(actual:details().code, "wake_dependency"); test.eq(actual:details().nested.marker, "kept")
    elseif not secondary then test.is_nil(actual:details()) end
end
local routes = {wake = {"begin", "policy", "size", "update", "read", "commit"}, addressed = {"begin", "addressed", "policy", "size", "dispatch", "commit"},
    fanout = {"dialect", "policy", "demand", "identity", "discovery", "prelock", "size", "update", "ack"},
    multi = {"dialect", "policy", "demand", "identity", "discovery", "prelock", "size", "update", "ack"},
    continue = {"payload", "begin", "fanout", "policy", "candidates", "prelock", "size", "update", "ack", "complete", "commit"}, nudge = {"nudge"}}
return {run = test.run_cases(function()
    for route, phases in pairs(routes) do
        test.describe("native wake/" .. route, function()
            for _, phase in ipairs(phases) do
                for _, kind in ipairs({errors.INVALID, errors.UNAVAILABLE, errors.CONFLICT}) do
                    for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        for _, detailed in ipairs({false, true}) do
                            test.it(phase .. "/" .. kind .. "/" .. tostring(policy.retryable) .. "/" .. tostring(detailed), function()
                                local source = errors.new({kind = kind, retryable = policy.retryable, message = "wake dependency refusal",
                                    details = detailed and {code = "wake_dependency", nested = {marker = "kept"}} or nil})
                                fixture.reset(route, phase, source); local _, err = invoke(route); retained(required(err), source)
                                test.eq(fixture.commits, phase == "commit" and 1 or 0)
                            end)
                        end
                    end
                end
            end
            if route == "continue" or route == "wake" or route == "addressed" then
                for _, phase in ipairs(phases) do
                    if phase ~= "begin" and phase ~= "payload" and phase ~= "commit" then
                        test.it("rollback/" .. phase, function()
                            local primary = errors.new({kind = errors.PERMISSION_DENIED, retryable = false, message = "wake primary refusal", details = {code = "wake_primary"}})
                            local source = errors.new({kind = errors.UNAVAILABLE, retryable = true, message = "wake rollback refusal", details = {code = "wake_dependency", nested = {marker = "kept"}}})
                            fixture.reset(route, phase, primary); fixture.rollback_error = source
                            local _, err = invoke(route); local actual = required(err); retained(actual, source, true)
                            test.eq(actual:details().operation_error.kind, primary:kind()); test.is_false(actual:details().operation_error.retryable)
                            test.eq(actual:details().operation_error.details.code, "wake_primary"); test.eq(fixture.rollbacks, 1); test.eq(fixture.commits, 0)
                        end)
                    end
                end
            end
            test.it("successful boundary", function()
                fixture.reset(route, "", nil); local result, err = invoke(route); test.is_nil(err); test.not_nil(result)
                if route == "wake" or route == "addressed" or route == "continue" then test.eq(fixture.commits, 1) end
            end)
        end)
    end
end)}
