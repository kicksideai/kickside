-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local realtime = require("realtime")
local process_fixture = require("process_fixture")

local function assert_cause(err: error, source: error, code: string)
    test.is_true(errors.is(err, errors.UNAVAILABLE))
    test.is_true(err:retryable())
    test.eq(err:details().code, code)
    local cause = err:details().cause
    test.not_nil(cause)
    test.eq(cause.kind, source:kind())
    test.eq(cause.message, source:message())
    test.eq(cause.retryable, source:retryable())
    test.eq(cause.details.code, source:details().code)
end

local function define_tests()
    test.describe("KickSide Realtime native causes", function()
        test.after_each(function() process_fixture.reset(nil, nil) end)

        test.it("retains a hub lookup failure as the unavailable error cause", function()
            local source = errors.new({ kind = errors.INVALID, message = "lookup fixture refused", retryable = false,
                details = { code = "lookup_fixture" } })
            process_fixture.reset(source, nil)
            local result, err = realtime.notify({ user_id = "fixture-user", topic = "fixture.topic" })
            test.is_nil(result)
            assert_cause(err, source, "realtime_hub_lookup_failed")
        end)

        test.it("retains a hub send failure as the unavailable error cause", function()
            local source = errors.new({ kind = errors.CONFLICT, message = "send fixture refused", retryable = true,
                details = { code = "send_fixture" } })
            process_fixture.reset(nil, source)
            local result, err = realtime.broadcast({ topic = "fixture.topic" })
            test.is_nil(result)
            assert_cause(err, source, "realtime_delivery_failed")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(o) return run_cases(o) end }
