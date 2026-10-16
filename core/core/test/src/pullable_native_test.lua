local test = require("test")
local pullable = require("pullable")
local fixture = require("fixture")
local function request(): table
    return {config = {thread_id = "thread"}, cursor = 0, limit = 1, idempotency_key = "pull"}
end
local function check(err: any, source: any)
    test.eq(type(err), "userdata")
    test.eq(err:kind(), source:kind())
    test.eq(err:retryable(), source:retryable())
    test.eq(err:details().code, "pullable_dependency")
    test.eq(err:details().nested.marker, "kept")
end
return {run = test.run_cases(function()
    test.describe("thread pullable native boundary", function()
        for _, stage in ipairs({"get", "read", "decode"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, message = "dependency refusal", retryable = options.retryable,
                            details = {code = "pullable_dependency", nested = {marker = "kept"}}})
                        fixture.reset(stage, source)
                        local result, err = pullable.pull(request())
                        if stage == "read" and (errors.is(source, errors.NOT_FOUND) or errors.is(source, errors.PERMISSION_DENIED)
                            or errors.is(source, errors.INVALID)) then
                            test.is_nil(err)
                            test.is_false(result.success)
                            test.eq(result.error.kind, source:kind())
                            test.eq(result.error.retryable, source:retryable())
                            test.eq(result.error.details.code, "pullable_dependency")
                            test.eq(result.error.details.nested.marker, "kept")
                            local restored = errors.new(result.error)
                            check(restored, source)
                            test.is_false(result.error.retriable)
                            test.eq(result.error.scope, "flow")
                            local code = kind == errors.NOT_FOUND and "not_found"
                                or kind == errors.PERMISSION_DENIED and "permission_denied" or "invalid_config"
                            test.eq(result.error.code, code)
                        else
                            test.is_nil(result)
                            check(err, source)
                        end
                        test.eq(fixture.gets, 1)
                        test.eq(fixture.reads, stage == "get" and 0 or 1)
                        test.eq(fixture.releases, stage == "get" and 0 or 1)
                        test.eq(fixture.decodes, stage == "decode" and 1 or 0)
                        test.eq(source:details().nested.marker, "kept")
                    end)
                end
            end
        end
        for _, invalid in ipairs({"thread_id", "event_type", "cursor", "limit", "idempotency_key"}) do
            test.it("validation/" .. invalid, function()
                fixture.reset("", nil)
                local input = request()
                if invalid == "thread_id" or invalid == "event_type" then input.config[invalid] = false
                else input[invalid] = false end
                local result, err = pullable.pull(input)
                test.is_nil(err)
                test.is_false(result.success)
                test.eq(result.error.kind, errors.INVALID)
                test.eq(result.error.retryable, false)
                test.eq(result.error.details.code, result.error.code)
                test.is_true(errors.is(errors.new(result.error), errors.INVALID))
                test.eq(fixture.gets, 0)
            end)
        end
        test.it("missing database proof refuses before reads", function()
            fixture.reset("missing_get", nil)
            local result, err = pullable.pull(request())
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INTERNAL))
            test.eq(err:retryable(), false)
            test.eq(err:details().code, "pullable_database_response")
            test.eq(fixture.reads, 0)
        end)
        test.it("actual JSON decoder retains native fields", function()
            fixture.reset("real_decode", nil)
            local result, err = pullable.pull(request())
            test.is_nil(result)
            test.eq(type(fixture.source), "userdata")
            test.eq(err:kind(), fixture.source:kind())
            test.eq(err:retryable(), fixture.source:retryable())
            test.eq(err:details(), fixture.source:details())
            test.eq(fixture.releases, 1)
        end)
        test.it("valid event retains cursor and declared body", function()
            fixture.reset("", nil)
            local result, err = pullable.pull(request())
            test.is_nil(err)
            test.is_true(result.success)
            test.eq(result.items[1].payload.n, 7)
            test.eq(result.next_cursor, 1)
            test.is_false(result.has_more)
            test.eq(fixture.releases, 1)
        end)
    end)
end)}
