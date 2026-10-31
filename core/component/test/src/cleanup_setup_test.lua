local test = require("test")
local teardown = require("teardown")
local fixture = require("fixture")
local function invoke()
    return teardown.run_deletable({impl_id = "fixture:impl", private_context = {marker = "kept"}}, {}, {}, "component", {batch_size = 5})
end
return {run = test.run_cases(function()
    test.describe("native declared component cleanup setup", function()
        for _, stage in ipairs({"contract", "registry", "authorization", "actor", "scope", "open", "delete", "reported"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, message = "cleanup setup refusal", retryable = options.retryable,
                            details = {code = "cleanup_setup_dependency", nested = {marker = "kept"}}})
                        fixture.reset(stage, source); local actual: any
                        if stage == "authorization" then
                            local ok, failure = pcall(invoke); test.is_false(ok); actual = failure
                        else
                            local declared, success, failure = invoke()
                            test.is_true(declared); test.is_false(success); actual = failure
                        end
                        if not actual then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "cleanup setup guard requires failure"})) end
                        test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
                        test.eq(actual:details().code, "cleanup_setup_dependency"); test.eq(actual:details().nested.marker, "kept")
                        test.eq(fixture.calls, (stage == "delete" or stage == "reported") and 1 or 0)
                    end)
                end
            end
        end
        for _, stage in ipairs({"actor", "scope", "open"}) do
            test.it("missing successful binding/" .. stage, function()
                fixture.reset(stage, nil); local declared, success, actual = invoke()
                test.is_true(declared); test.is_false(success); test.is_true(errors.is(actual, errors.INTERNAL))
                test.is_false(actual:retryable()); test.eq(actual:details().code, "component_teardown_response"); test.eq(fixture.calls, 0)
            end)
        end
        test.it("denied declaration lookup invokes no query or cleanup", function()
            fixture.reset("denied", nil); local declared, success, actual = invoke()
            test.is_true(declared); test.is_false(success); test.is_true(errors.is(actual, errors.PERMISSION_DENIED)); test.is_false(actual:retryable())
            test.eq(fixture.find_calls, 0); test.eq(fixture.calls, 0)
        end)
        test.it("absent implementation keeps optional cleanup undeclared", function()
            fixture.reset("absent", nil); local declared, success, actual = invoke()
            test.is_false(declared); test.is_false(success); test.is_nil(actual); test.eq(fixture.calls, 0)
        end)
        test.it("healthy cleanup preserves context and request", function()
            fixture.reset("", nil); local actor, scope, options, context = {}, {}, {batch_size = 5}, {marker = "kept"}
            local declared, success, err, result = teardown.run_deletable({impl_id = "fixture:impl", private_context = context}, actor, scope, "component", options, "lease-token")
            test.is_true(declared); test.is_true(success); test.is_nil(err); test.is_true(result.success); test.eq(fixture.calls, 1)
            test.eq(fixture.actor, actor); test.eq(fixture.scope, scope); test.eq(fixture.impl, "fixture:impl")
            test.eq(fixture.context.component_id, "component"); test.eq(fixture.context.marker, "kept"); test.is_nil(context.component_id)
            test.eq(fixture.request.options, options)
            test.eq(fixture.context.lease_token, "lease-token")
            test.is_nil(context.lease_token)
        end)
        test.it("trusted cleanup keeps optional actor and scope absent", function()
            fixture.reset("", nil); local declared, success, err = teardown.run_deletable({impl_id = "fixture:impl"}, nil, nil, "component")
            test.is_true(declared); test.is_true(success); test.is_nil(err); test.is_nil(fixture.actor); test.is_nil(fixture.scope)
        end)
    end)
end)}
