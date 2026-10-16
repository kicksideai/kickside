local test = require("test")
local identity = require("identity")
local fixture = require("fixture")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
local function invoke(route: string): (any, error?)
    local id = "11111111-1111-4111-8111-111111111111"
    local principal = {kind = "user", id = "user-1"}
    if route == "admin" then return identity.validate_identity_authorizer_admin(id, principal, {}) end
    if route == "access" then return identity.validate_principal_access(id, 1, principal, {}, nil) end
    return identity.get_identity_receipt(id)
end
return {run = test.run_cases(function()
    test.describe("identity read cleanup causes", function()
        for _, route in ipairs({"admin", "access", "receipt"}) do
            for _, kind in ipairs(kinds) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    for _, secondary in ipairs({false, true}) do
                        test.it(route .. "/" .. kind .. "/" .. tostring(options.retryable) .. "/" .. tostring(secondary), function()
                            local source = errors.new({kind = kind, retryable = options.retryable, message = "identity read release refuses",
                                details = {code = "identity_release", nested = {marker = "kept"}}})
                            local primary: error? = nil
                            if secondary then primary = errors.new({kind = errors.INVALID, retryable = false, message = "identity read refuses",
                                details = {code = "identity_read", nested = {marker = "primary"}}}) end
                            fixture.reset(route, source, primary); local result, err = invoke(route)
                            if route == "receipt" then test.is_nil(result) else test.is_false(result) end
                            test.eq(type(err), "userdata"); test.eq(err:kind(), source:kind()); test.eq(err:retryable(), source:retryable())
                            test.eq(err:details().code, "identity_release"); test.eq(err:details().nested.marker, "kept"); test.eq(fixture.releases, 1)
                            if secondary then
                                local cause = err:details().operation_error
                                test.eq(cause.kind, errors.INVALID); test.is_false(cause.retryable)
                                test.eq(cause.details.code, "identity_read"); test.eq(cause.details.nested.marker, "primary")
                            end
                        end)
                    end
                end
            end
            test.it(route .. "/healthy", function()
                fixture.reset(route, nil, nil); local result, err = invoke(route); test.is_nil(err); test.eq(fixture.releases, 1)
                if route == "receipt" then test.eq(result.identity_generation, 2); test.eq(result.principal.id, "user-1")
                else test.is_true(result) end
            end)
            test.it(route .. "/primary", function()
                local source = errors.new({kind = errors.PERMISSION_DENIED, retryable = false, message = "identity access refuses", details = {code = "identity_access"}})
                fixture.reset(route, nil, source); local result, err = invoke(route)
                if route == "receipt" then test.is_nil(result) else test.is_false(result) end
                test.eq(err:kind(), source:kind()); test.is_false(err:retryable()); test.eq(err:details().code, "identity_access"); test.eq(fixture.releases, 1)
            end)
        end
    end)
end)}
