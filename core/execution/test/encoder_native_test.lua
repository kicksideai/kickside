local test = require("test")
local identity = require("identity")
local fixture = require("fixture")
local production = require("production")
local function candidate()
    return {version = 2, principal = {kind = "user", id = "user"},
        authorized_by = {kind = "user", id = "user"}, captured_at = "2026-10-10T00:00:00Z"}
end
local function origin(err: error?)
    if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "encoder guard expects an error"})) end
    test.is_true(errors.is(err, errors.INVALID))
    test.is_false(err:retryable())
    test.eq(err:details().code, "declaration")
    test.eq(err:details().error_kind, "declaration")
    return err
end
return {run = test.run_cases(function()
    test.describe("execution row encoder native causes", function()
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
            errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT,
            errors.RATE_LIMITED, errors.UNKNOWN}) do
            for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                for _, detailed in ipairs({false, true}) do
                    test.it(kind .. "/" .. tostring(options.retryable) .. "/" .. tostring(detailed), function()
                        local details = detailed and {code = "encoder_dependency", nested = {marker = "kept"}} or nil
                        local source = errors.new({kind = kind, message = "encoder dependency refusal", retryable = options.retryable, details = details})
                        fixture.source, fixture.missing = source, false
                        local row, err = identity.to_row(candidate())
                        test.is_nil(row)
                        local refusal = origin(err)
                        local cause = refusal:details().cause
                        test.not_nil(cause)
                        test.eq(cause.kind, source:kind())
                        test.eq(cause.message, source:message())
                        test.eq(cause.retryable, source:retryable())
                        if detailed then
                            test.eq(cause.details.code, "encoder_dependency")
                            test.eq(cause.details.nested.marker, "kept")
                            test.eq(source:details().nested.marker, "kept")
                        else test.is_nil(cause.details) end
                    end)
                end
            end
        end
        test.it("missing encoded proof remains permanent Invalid without a cause", function()
            fixture.source, fixture.missing = nil, true
            local row, err = identity.to_row(candidate())
            test.is_nil(row)
            test.is_nil(origin(err):details().cause)
        end)
        test.it("valid identity rows retain the real SDK bytes", function()
            fixture.source, fixture.missing = nil, false
            local expected, expected_err = production.to_row(candidate())
            test.is_nil(expected_err)
            local row, err = identity.to_row(candidate())
            test.is_nil(err)
            test.eq(row.actor_id, expected.actor_id)
            test.eq(row.actor_context, expected.actor_context)
        end)
    end)
end)}
