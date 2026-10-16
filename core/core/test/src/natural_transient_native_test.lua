local test = require("test")
local fixture = require("fixture")
local api = require("api")
return {run = test.run_cases(function()
    test.describe("natural upsert dependency propagation", function()
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED, errors.UNAVAILABLE,
            errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
            for _, opts in ipairs({{}, {retryable = false}, {retryable = true}}) do
                for _, message in ipairs({"opaque refusal", "database is locked", "database table is locked", "sqlite_busy",
                    "could not serialize access", "deadlock detected"}) do
                    test.it(kind .. "/" .. tostring(opts.retryable) .. "/" .. message, function()
                        local source = errors.new({kind = kind, retryable = opts.retryable, message = message,
                            details = {code = "dependency", nested = {marker = "kept"}}})
                        fixture.reset("created", "resolve", source, nil)
                        local value, err = api.upsert({thread_class = "class", external_ref = "ref"})
                        test.is_nil(value)
                        test.not_nil(err)
                        test.eq(err:kind(), source:kind())
                        test.eq(err:retryable(), source:retryable())
                        test.eq(err:details().code, source:details().code)
                        test.eq(err:details().nested.marker, source:details().nested.marker)
                        test.eq(fixture.registrations, 0)
                        test.eq(fixture.opens, 1)
                        test.eq(fixture.releases, 1)
                    end)
                end
            end
        end
        test.it("absence of a failure returns the canonical thread without registration", function()
            fixture.reset("existing", "", nil, nil)
            local value, err = api.upsert({thread_class = "class", external_ref = "ref"})
            test.is_nil(err)
            test.eq(value.thread_id, "thread")
            test.is_false(value.created)
            test.eq(fixture.registrations, 0)
            test.eq(fixture.opens, 1)
        end)
    end)
end)}
