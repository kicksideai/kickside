local test = require("test")
local automation_test_engine = require("automation_test_engine")

return test.run_cases(function()
    test.describe("automation rollback cleanup envelopes", function()
        test.it("counts a typed partial cleanup result from the default runner", function()
            local cleanup_error = errors.new({ message = "owner page incomplete", kind = errors.CONFLICT,
                retryable = true, details = { cleanup_pending = true } })
            local lib = select(1, automation_test_engine.new({ funcs = {
                new = function()
                    return { call = function(_self: any, _target: string, _args: any)
                        return { success = false, error = cleanup_error }, nil
                    end }, nil
                end,
            } }))
            local count, failed = lib.replay({ { target = "app:partial_owner_cleanup", args = {} } })
            test.eq(count, 1)
            test.eq(failed, 1, "a typed partial result must retain the owner for retry")
        end)
    end)
end)
