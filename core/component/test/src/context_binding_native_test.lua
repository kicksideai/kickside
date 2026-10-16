local test = require("test")
local context_policy = require("context_policy")
local fixture = require("fixture")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED, errors.UNAVAILABLE,
    errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
local function invoke(operation)
    if operation == "service" then return context_policy.get_component_service() end
    return context_policy.open_contract_instance("fixture:implementation", {marker = "context"}, nil, fixture.actor, fixture.scope)
end
return {run = test.run_cases(function()
    test.describe("native component context contract bindings", function()
        for _, operation in ipairs({"service", "instance"}) do
            for _, stage in ipairs({"get", "actor", "scope", "open"}) do
                for _, kind in ipairs(kinds) do
                    for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        test.it(operation .. "/" .. stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                            local source = errors.new({kind = kind, message = "context binding refusal", retryable = options.retryable,
                                details = {code = "context_binding_dependency", nested = {marker = "kept"}}})
                            fixture.reset(stage, source); local result, err = invoke(operation)
                            test.is_nil(result); test.not_nil(err)
                            test.eq(err:kind(), source:kind()); test.eq(err:retryable(), source:retryable())
                            test.eq(err:details().code, "context_binding_dependency"); test.eq(err:details().nested.marker, "kept")
                            test.eq(fixture.opens, stage == "open" and 1 or 0)
                        end)
                    end
                end
            end
            for _, stage in ipairs({"get", "actor", "scope", "open"}) do
                test.it(operation .. "/missing/" .. stage, function()
                    fixture.reset(stage, nil); fixture.missing = true; local result, err = invoke(operation)
                    test.is_nil(result); test.is_true(errors.is(err, errors.INTERNAL)); test.is_false(err:retryable())
                    test.eq(err:details().code, "component_binding_response")
                end)
            end
            test.it(operation .. "/healthy", function()
                fixture.reset("", nil); local result, err = invoke(operation)
                test.not_nil(result); test.is_nil(err); test.eq(fixture.opens, 1); test.eq(fixture.lookups, 1)
                test.eq(fixture.bound_actor, fixture.actor); test.eq(fixture.bound_scope, fixture.scope)
                if operation == "instance" then test.eq(fixture.impl, "fixture:implementation"); test.eq(fixture.context.marker, "context") end
            end)
        end
        test.it("instance with absent frame retains ambient opening", function()
            fixture.reset("", nil); local result, err = context_policy.open_contract_instance("fixture:implementation", {}, nil, nil, nil)
            test.not_nil(result); test.is_nil(err); test.eq(fixture.actors, 0); test.eq(fixture.scopes, 0); test.eq(fixture.opens, 1)
        end)
        test.it("instance requires actor and scope together", function()
            fixture.reset("", nil); local result, err = context_policy.open_contract_instance("fixture:implementation", {}, nil, fixture.actor, nil)
            test.is_nil(result); test.is_true(errors.is(err, errors.INVALID)); test.eq(fixture.opens, 0)
        end)
    end)
end)}
