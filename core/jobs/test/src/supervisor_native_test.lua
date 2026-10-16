local test = require("test")
local supervisor = require("supervisor")
local fixture = require("fixture")
local function invoke(route: string): (boolean, error?)
    if route == "child" then return supervisor.child_alive("job", "lease") end
    return supervisor.signal_execution("job", "lease", 3, "revoked", nil)
end
return {run = test.run_cases(function()
    test.describe("native Jobs supervisor lookup and delivery dependencies", function()
        for _, route in ipairs({"child", "owner", "send"}) do
            local stage = route == "send" and "send" or "lookup"
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(route .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, message = "dependency failure",
                            retryable = options.retryable, details = {code = "supervisor_dependency", nested = {route = route}}})
                        fixture.reset(stage, source, "owner-pid", true)
                        local sent, err = invoke(route)
                        test.is_false(sent)
                        if stage == "lookup" and kind == errors.NOT_FOUND then
                            test.is_nil(err)
                        else
                            test.eq(type(err), "userdata")
                            test.eq(err:kind(), source:kind())
                            test.eq(err:retryable(), source:retryable())
                            test.eq(err:details().code, "supervisor_dependency")
                            test.eq(err:details().nested.route, route)
                        end
                        test.eq(fixture.lookups, 1)
                        test.eq(fixture.sends, stage == "send" and 1 or 0)
                        test.eq(source:kind(), kind)
                        test.eq(source:details().nested.route, route)
                    end)
                end
            end
        end
        for _, route in ipairs({"child", "owner"}) do
            test.it("absent owner/" .. route, function()
                fixture.reset("", nil, nil, true)
                local sent, err = invoke(route)
                test.is_false(sent)
                test.is_nil(err)
                test.eq(fixture.lookups, 1)
                test.eq(fixture.sends, 0)
            end)
        end
        test.it("empty lease avoids child lookup", function()
            fixture.reset("", nil, "owner-pid", true)
            local alive, err = supervisor.child_alive("job", "")
            test.is_false(alive)
            test.is_nil(err)
            test.eq(fixture.lookups, 0)
        end)
        test.it("registered child is alive", function()
            fixture.reset("", nil, "child-pid", true)
            local alive, err = invoke("child")
            test.is_true(alive)
            test.is_nil(err)
            test.eq(fixture.sends, 0)
        end)
        for _, sent in ipairs({true, false}) do
            test.it("delivery acknowledgement/" .. tostring(sent), function()
                fixture.reset("", nil, "owner-pid", sent)
                local delivered, err = invoke("owner")
                test.eq(delivered, sent)
                test.is_nil(err)
                test.eq(fixture.lookups, 1)
                test.eq(fixture.sends, 1)
            end)
        end
        test.it("invalid control avoids delivery", function()
            fixture.reset("", nil, "owner-pid", true)
            local sent, err = supervisor.signal_execution("job", "lease", 3, "unknown", nil)
            test.is_false(sent)
            test.eq(err:kind(), errors.INVALID)
            test.eq(fixture.lookups, 0)
            test.eq(fixture.sends, 0)
        end)
    end)
end)}
