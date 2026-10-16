local test = require("test")
local marker = require("marker")
return {run = test.run_cases(function()
    test.describe("native Jobs worker marker dependency", function()
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
            errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
            errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
            for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                test.it(kind .. "/" .. tostring(options.retryable), function()
                    local source = errors.new({kind = kind, message = "marker dependency failure",
                        retryable = options.retryable, details = {code = "marker_dependency", nested = {operation = "clear"}}})
                    local writes = 0
                    local err = marker.clear({execute = function()
                        writes = writes + 1
                        return nil, source
                    end}, "job-id")
                    test.eq(type(err), "userdata")
                    test.eq(err:kind(), source:kind())
                    test.eq(err:retryable(), source:retryable())
                    test.eq(err:details().code, "marker_dependency")
                    test.eq(err:details().nested.operation, "clear")
                    test.eq(writes, 1)
                end)
            end
        end
        test.it("retains successful marker clearing", function()
            local writes = 0
            local err = marker.clear({execute = function()
                writes = writes + 1
                return {rows_affected = 1}, nil
            end}, "job-id")
            test.is_nil(err)
            test.eq(writes, 1)
        end)
    end)
end)}
