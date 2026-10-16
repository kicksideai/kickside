local test = require("test")
local capacity = require("connection_capacity")

return {run = test.run_cases(function()
    test.describe("optional connection capacity owner", function()
        test.it("permits a consumer when the optional owner is unbound", function()
            for _, boundary in ipairs({"get", "open"}) do
                local absent = errors.new({kind = errors.NOT_FOUND, retryable = false, message = "unbound",
                    details = {code = "test_unbound"}})
                local gate = capacity.new({contract = {get = function()
                    if boundary == "get" then return nil, absent end
                    return {with_options = function(self) return self end, open = function() return nil, absent end}, nil
                end}})
                local checked, check_err = gate.check("connection")
                test.is_nil(check_err)
                test.eq(checked.status, "not_supported")
                local calls = 0
                local value, err = gate.invoke("connection", function() calls = calls + 1; return "delivered", nil end)
                test.is_nil(err)
                test.eq(value, "delivered")
                test.eq(calls, 1)
            end
        end)
        test.it("preserves failures from bound owner lookup, configuration and calls", function()
            for _, boundary in ipairs({"get", "options", "open", "check"}) do
                local failure = errors.new({kind = errors.UNAVAILABLE, retryable = true, message = "owner unavailable",
                    details = {code = "test_capacity_owner_failed"}})
                local gate = capacity.new({contract = {get = function()
                    if boundary == "get" then return nil, failure end
                    return {with_options = function(self)
                        if boundary == "options" then return nil, failure end
                        return self, nil
                    end, open = function()
                        if boundary == "open" then return nil, failure end
                        return {check = function() return nil, failure end}, nil
                    end}, nil
                end}})
                local calls = 0
                local value, err = gate.invoke("connection", function() calls = calls + 1; return true, nil end)
                test.is_nil(value)
                test.eq(err:kind(), errors.UNAVAILABLE)
                test.eq(err:retryable(), true)
                test.eq(err:details().code, "test_capacity_owner_failed")
                test.eq(calls, 0)
            end
        end)
    end)
end)}
