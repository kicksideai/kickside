local test = require("test")
local waiters = require("waiters")
local fixture = require("fixture")
local process = require("process")
local function required(err: error?): error
    if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "cursor waiter guard requires an error"})) end
    return err
end
local function retains(actual: error, source: error): ()
    test.is_true(errors.is(actual, source:kind()))
    test.eq(actual:retryable(), source:retryable())
    if source:details() then
        test.eq(actual:details().code, source:details().code)
        test.eq(actual:details().nested.marker, "kept")
        test.eq(source:details().nested.marker, "kept")
    else test.is_nil(actual:details()) end
end
return {run = test.run_cases(function()
    test.describe("native cursor waiter dependency fields", function()
        for _, stage in ipairs({"lookup", "send", "listen", "call", "claim"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT,
                errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    for _, detailed in ipairs({false, true}) do
                        test.it(stage .. "/" .. kind .. "/" .. tostring(policy.retryable) .. "/" .. tostring(detailed), function()
                            local source = errors.new({kind = kind, retryable = policy.retryable, message = "cursor waiter dependency refusal",
                                details = detailed and {code = "cursor_waiter_dependency", nested = {marker = "kept"}} or nil})
                            fixture.reset(stage, source)
                            if stage == "lookup" or stage == "send" then
                                local delivered, err = waiters.signal("cursor_waiter.commit", {cursor_id = "cursor", last_seq = 7})
                                test.is_false(delivered)
                                if stage == "lookup" and kind == errors.NOT_FOUND then test.is_nil(err)
                                else retains(required(err), source) end
                                test.eq(fixture.lookups, 1)
                                test.eq(fixture.consistency, process.registry.CONSISTENT)
                                test.eq(fixture.sends, stage == "send" and 1 or 0)
                            elseif stage == "claim" then
                                local value, err = waiters.main()
                                test.is_nil(value); retains(required(err), source)
                                test.eq(fixture.unlistens, 3)
                            else
                                local value, err = waiters.begin_wait("cursor", 7, 1000)
                                test.is_nil(value); retains(required(err), source)
                                test.eq(fixture.listens, 1)
                                test.eq(fixture.calls, stage == "call" and 1 or 0)
                                test.eq(fixture.unlistens, stage == "call" and 1 or 0)
                            end
                        end)
                    end
                end
            end
        end
        test.it("an absent optional broker keeps false and no delivery", function()
            fixture.reset("", nil); fixture.pid = nil
            local delivered, err = waiters.signal("cursor_waiter.commit", {cursor_id = "cursor"})
            test.is_false(delivered); test.is_nil(err); test.eq(fixture.sends, 0)
        end)
        test.it("successful delivery retains its topic and cursor data", function()
            fixture.reset("", nil)
            local payload = {cursor_id = "cursor", last_seq = 7, status = "active"}
            local delivered, err = waiters.signal("cursor_waiter.commit", payload)
            test.is_true(delivered); test.is_nil(err)
            test.eq(fixture.target, "broker"); test.eq(fixture.topic, "cursor_waiter.commit")
            test.eq(fixture.payload, payload); test.eq(fixture.sends, 1)
        end)
        test.it("an unregistered broker retains retryable infrastructure refusal", function()
            fixture.reset("", nil)
            local value, err = waiters.begin_wait("cursor", 7, 1000)
            test.is_nil(value); test.is_true(errors.is(required(err), errors.UNAVAILABLE))
            test.is_true(required(err):retryable()); test.eq(fixture.unlistens, 1)
        end)
        test.it("unknown signal topics remain permanent invalid input", function()
            fixture.reset("", nil)
            local value, err = waiters.signal("unknown", {})
            test.is_false(value); test.is_true(errors.is(required(err), errors.INVALID))
            test.eq(fixture.lookups, 0)
        end)
    end)
end)}
