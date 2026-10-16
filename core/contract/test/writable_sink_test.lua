local test = require("test")
local sink = require("writable_sink")

return { run = test.run_cases(function()
    test.describe("writable sink request contract", function()
        test.it("accepts only the writing origin named by the automation reference", function()
            local origin, origin_err = sink.origin({ origin = " owner ", automation_ref = { id = "owner" } })
            test.eq(origin, "owner")
            test.is_nil(origin_err)
            for _, request in ipairs({ {}, { origin = " " }, { origin = "owner", automation_ref = {} },
                { origin = "owner", automation_ref = { id = "other" } } }) do
                local accepted, refusal = sink.origin(request)
                test.is_nil(accepted)
                test.is_false(refusal.success)
                test.eq(refusal.error.code, "invalid_request")
                test.eq(refusal.error.scope, "item")
                test.is_false(refusal.error.retriable)
                test.not_nil(refusal.error.message)
            end
        end)
        test.it("retains the caller's failure vocabulary and details", function()
            local details = { reason = "lease_expired" }
            local refusal = sink.fail("provider unavailable", "provider_unavailable", true, "sink", details)
            test.is_false(refusal.success)
            test.eq(refusal.error.code, "provider_unavailable")
            test.eq(refusal.error.message, "provider unavailable")
            test.eq(refusal.error.scope, "sink")
            test.is_true(refusal.error.retriable)
            test.eq(refusal.error.details, details)
        end)
    end)
end) }
