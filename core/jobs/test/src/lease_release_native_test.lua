local test = require("test")
local process = require("process")
local release = require("release")
local fixture = require("fixture")
local function required(err: error?): error
    if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "lease release guard requires an error"})) end
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
    test.describe("native lease-release dependency fields", function()
        for _, stage in ipairs({"lookup", "send", "call"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT,
                errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    for _, detailed in ipairs({false, true}) do
                        test.it(stage .. "/" .. kind .. "/" .. tostring(policy.retryable) .. "/" .. tostring(detailed), function()
                            local source = errors.new({kind = kind, retryable = policy.retryable, message = "lease release dependency refusal",
                                details = detailed and {code = "lease_release_dependency", nested = {marker = "kept"}} or nil})
                            fixture.reset(stage, source)
                            local owner = {owner_kind = "component", owner_id = "owner"}
                            if stage == "call" then
                                retains(required(release.notify("job", 7, owner)), source)
                                test.eq(fixture.target, release.SIGNAL)
                                test.eq(fixture.id, "job")
                                test.eq(fixture.sequence, 7)
                                test.eq(fixture.owner, owner)
                                test.eq(fixture.calls, 1)
                                test.eq(fixture.lookups, 0)
                                test.eq(fixture.sends, 0)
                            else
                                local delivered, err = release.deliver("job", 7, owner)
                                test.is_false(delivered)
                                if stage == "lookup" and kind == errors.NOT_FOUND then test.is_nil(err)
                                else retains(required(err), source) end
                                test.eq(fixture.lookups, 1)
                                test.eq(fixture.name, release.NAME)
                                test.eq(fixture.consistency, process.registry.CONSISTENT)
                                test.eq(fixture.sends, stage == "send" and 1 or 0)
                                if stage == "send" then
                                    test.eq(fixture.recipient, "listener")
                                    test.eq(fixture.topic, release.TOPIC)
                                    test.eq(fixture.payload.kind, "lease_released")
                                    test.eq(fixture.payload.job_id, "job")
                                    test.eq(fixture.payload.execution_seq, 7)
                                    test.eq(fixture.payload.owner_locator, owner)
                                end
                            end
                        end)
                    end
                end
            end
        end
        test.it("an absent optional listener keeps its false outcome", function()
            fixture.reset("", nil)
            fixture.pid = nil
            local delivered, err = release.deliver("job", nil, nil)
            test.is_false(delivered)
            test.is_nil(err)
            test.eq(fixture.lookups, 1)
            test.eq(fixture.sends, 0)
        end)
        test.it("successful delivery keeps the established event payload", function()
            fixture.reset("", nil)
            local delivered, err = release.deliver("job", nil, nil)
            test.is_true(delivered)
            test.is_nil(err)
            test.eq(fixture.payload.kind, "lease_released")
            test.eq(fixture.payload.job_id, "job")
            test.is_nil(fixture.payload.execution_seq)
            test.is_nil(fixture.payload.owner_locator)
            test.eq(fixture.sends, 1)
        end)
        test.it("successful notification keeps one Jobs-identity signal call", function()
            fixture.reset("", nil)
            test.is_nil(release.notify("job", nil, nil))
            test.eq(fixture.calls, 1)
            test.eq(fixture.target, release.SIGNAL)
            test.eq(fixture.id, "job")
            test.is_nil(fixture.sequence)
            test.is_nil(fixture.owner)
        end)
    end)
end)}
