local test = require("test")
local models = require("models")
local fixture = require("fixture")
local funcs = require("funcs")
local function check(err: any, source: any, stage: string)
    test.eq(type(err), "userdata")
    test.eq(err:kind(), source:kind())
    test.eq(err:retryable(), source:retryable())
    test.eq(err:details().code, "read_model_dependency")
    test.eq(err:details().nested.stage, stage)
end
return {run = test.run_cases(function()
    test.describe("native committed read-model dependencies", function()
        for _, stage in ipairs({"access", "get", "query", "decode"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, message = "read-model dependency refusal", retryable = options.retryable,
                            details = {code = "read_model_dependency", nested = {stage = stage}}})
                        fixture.reset(stage, source, {{body = "{}"}})
                        local result, err = models.get({owner_id = "owner", kind = "model"})
                        test.is_nil(result)
                        check(err, source, stage)
                        test.eq(fixture.accesses, 1)
                        test.eq(fixture.gets, stage == "access" and 0 or 1)
                        test.eq(fixture.queries, (stage == "query" or stage == "decode") and 1 or 0)
                        test.eq(fixture.releases, (stage == "query" or stage == "decode") and 1 or 0)
                        test.eq(fixture.decodes, stage == "decode" and 1 or 0)
                        test.eq(source:details().nested.stage, stage)
                    end)
                    if kind ~= errors.UNKNOWN then
                        test.it("funcs/" .. stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                            local source = errors.new({kind = kind, message = "expected", retryable = options.retryable})
                            local result, err = funcs.call("app:read_model_native_probe", stage, kind, options.retryable)
                            test.is_nil(result)
                            check(err, source, stage)
                        end)
                    end
                end
            end
        end
        test.it("real decoder retains its native failure fields", function()
            fixture.reset("", nil, {{body = "{"}})
            local result, err = models.get({owner_id = "owner", kind = "model"})
            test.is_nil(result)
            test.eq(type(fixture.source), "userdata")
            test.eq(err:kind(), fixture.source:kind())
            test.eq(err:retryable(), fixture.source:retryable())
            test.eq(err:details(), fixture.source:details())
            test.eq(fixture.releases, 1)
        end)
        test.it("denied access avoids database work", function()
            fixture.reset("denied", nil, {})
            local result, err = models.get({owner_id = "owner", kind = "model"})
            test.is_nil(result)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED))
            test.eq(fixture.gets, 0)
        end)
        for _, body in ipairs({{count = 7}, '{"count":7}'}) do
            test.it("committed body/" .. type(body), function()
                fixture.reset("", nil, {{body = body}})
                local result, err = models.get({owner_id = "owner", kind = "model"})
                test.is_nil(err)
                test.eq(result.body.count, 7)
                test.eq(fixture.releases, 1)
            end)
        end
        test.it("absent projection retains empty body", function()
            fixture.reset("", nil, {})
            local result, err = models.get({owner_id = "owner", kind = "model"})
            test.is_nil(err)
            test.eq(next(result.body), nil)
            test.eq(fixture.releases, 1)
        end)
    end)
end)}
