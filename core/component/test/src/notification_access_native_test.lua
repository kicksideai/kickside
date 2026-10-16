local test = require("test")
local metadata = require("metadata")
local fixture = require("fixture")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
local id = "11111111-1111-4111-8111-111111111111"
return {run = test.run_cases(function()
    test.describe("notification required-access native failures", function()
        for _, kind in ipairs(kinds) do
            for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                for _, detail in ipairs({{}, {details = {code = "notification_access", nested = {marker = "kept"}}}}) do
                    test.it(kind .. "/" .. tostring(options.retryable) .. "/" .. tostring(detail.details ~= nil), function()
                        local source = errors.new({kind = kind, retryable = options.retryable, message = "required access refuses", details = detail.details})
                        fixture.reset(source); local result, err = metadata.fanout(id, nil, nil, {access_mask = 1})
                        test.is_nil(result); test.eq(type(err), "userdata"); test.eq(err:kind(), source:kind()); test.eq(err:retryable(), source:retryable())
                        if detail.details then
                            test.eq(err:details().code, "notification_access"); test.eq(err:details().nested.marker, "kept")
                        else test.is_nil(err:details()) end
                        test.eq(fixture.normalizations, 1); test.eq(fixture.grants, 0)
                    end)
                end
            end
        end
        test.it("healthy mask", function()
            fixture.reset(nil); local result, err = metadata.fanout(id, nil, nil, {access_mask = 1})
            test.is_nil(err); test.is_true(result.success); test.eq(result.notified, 0)
            test.eq(fixture.normalizations, 1); test.eq(fixture.grants, 1)
        end)
        test.it("default mask", function()
            fixture.reset(nil); local result, err = metadata.fanout(id, nil, nil, nil)
            test.is_nil(err); test.is_true(result.success); test.eq(result.notified, 0)
            test.eq(fixture.normalizations, 0); test.eq(fixture.grants, 1)
        end)
        for _, value in ipairs({0, "bad"}) do
            test.it("invalid mask/" .. tostring(value), function()
                fixture.reset(nil); local result, err = metadata.fanout(id, nil, nil, {access_mask = value})
                test.is_nil(result); test.eq(err:kind(), errors.INVALID); test.eq(fixture.grants, 0)
            end)
        end
        test.it("missing normalization", function()
            fixture.reset(nil); fixture.missing = true
            local result, err = metadata.fanout(id, nil, nil, {access_mask = 1})
            test.is_nil(result); test.eq(err:kind(), errors.INVALID); test.eq(fixture.grants, 0)
        end)
    end)
end)}
