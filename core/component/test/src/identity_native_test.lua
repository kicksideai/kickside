local test = require("test")
local identity = require("identity")
local fixture = require("fixture")
local component_types = require("component_types")
local component_id = "11111111-1111-4111-8111-111111111111"
local principal = {kind = "user", id = "principal"}
local operations = {
    admin = function() return identity.validate_identity_authorizer_admin(component_id, principal, {}) end,
    principal = function() return identity.validate_principal_access(component_id, component_types.ACCESS.ADMIN, principal, {}, nil) end,
    receipt = function() return identity.get_identity_receipt(component_id) end,
}
return {run = test.run_cases(function()
    test.describe("native identity storage dependency failures", function()
        for name, operation in pairs(operations) do
            local terminal = name == "receipt" and "query" or "access"
            for _, stage in ipairs({"get", terminal}) do
                for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                    errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                    errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                    for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        for _, classification in ipairs({{}, {error_kind = "source_classifier"}}) do
                            test.it(name .. "/" .. stage .. "/" .. kind .. "/" .. tostring(options.retryable) .. "/" .. tostring(classification.error_kind), function()
                                local source = errors.new({kind = kind, message = "identity storage failure",
                                    retryable = options.retryable, details = {code = "identity_dependency",
                                        nested = {stage = stage}, error_kind = classification.error_kind}})
                                fixture.configure(stage, source)
                                local value, err = operation()
                                if name == "receipt" then test.is_nil(value) else test.is_false(value) end
                                test.eq(type(err), "userdata")
                                test.eq(err:kind(), source:kind())
                                test.eq(err:retryable(), source:retryable())
                                test.eq(err:details().code, source:details().code)
                                test.eq(err:details().nested.stage, stage)
                                if classification.error_kind then
                                    test.eq(err:details().error_kind, classification.error_kind)
                                elseif name ~= "admin" and (stage == "get" or stage == "query") then
                                    test.eq(err:details().error_kind, "infrastructure")
                                end
                                test.eq(#fixture.calls, stage == "get" and 1 or 3)
                                if stage ~= "get" then test.eq(fixture.calls[3], "release") end
                            end)
                        end
                    end
                end
            end
            test.it(name .. "/missing_database", function()
                fixture.configure("missing_database", nil)
                local value, err = operation()
                if name == "receipt" then test.is_nil(value) else test.is_false(value) end
                test.is_true(errors.is(err, errors.UNAVAILABLE))
                test.eq(#fixture.calls, 1)
            end)
            test.it(name .. "/success", function()
                fixture.configure("success", nil)
                local value, err = operation()
                test.is_nil(err)
                if name == "receipt" then
                    test.eq(value.principal.id, principal.id)
                    test.eq(value.identity_generation, 1)
                else test.is_true(value) end
                test.eq(#fixture.calls, 3)
                test.eq(fixture.calls[3], "release")
            end)
        end
    end)
end)}
