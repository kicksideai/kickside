local test = require("test")
local context = require("context")
local fixture = require("fixture")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
local function prepare()
    return context.prepare_identity({component_id = "component", principal = {kind = "user", id = "user-1"},
        request_id = "request", expected_identity_generation = 7})
end
return {run = test.run_cases(function()
    test.describe("native identity preparation", function()
        for _, stage in ipairs({"actor", "id", "subjects", "filter"}) do
            for _, kind in ipairs(kinds) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    for _, detail in ipairs({false, true}) do
                        test.it(stage .. "/" .. kind .. "/" .. tostring(options.retryable) .. "/" .. tostring(detail), function()
                            local source = errors.new({kind = kind, retryable = options.retryable, message = "identity preparation refuses",
                                details = detail and {code = "identity_prepare_dependency", nested = {marker = "kept"}} or nil})
                            fixture.reset(stage, source); local token, err = prepare()
                            test.is_nil(token); test.eq(type(err), "userdata"); test.eq(err:kind(), source:kind())
                            test.eq(err:retryable(), source:retryable())
                            if detail then test.eq(err:details().code, "identity_prepare_dependency"); test.eq(err:details().nested.marker, "kept")
                            else test.is_nil(err:details()) end
                            test.eq(fixture.captures, (stage == "subjects" or stage == "filter") and 1 or 0)
                            test.eq(fixture.resolutions, (stage == "subjects" or stage == "filter") and 1 or 0)
                            test.eq(fixture.filters, stage == "filter" and 1 or 0)
                        end)
                    end
                end
            end
        end
        test.it("healthy preparation issues one-use authorization", function()
            fixture.reset("", nil); local token, err = prepare(); test.is_nil(err); test.eq(type(token), "table")
            test.eq(fixture.captures, 1); test.eq(fixture.resolutions, 1); test.eq(fixture.filters, 1)
        end)
    end)
end)}
