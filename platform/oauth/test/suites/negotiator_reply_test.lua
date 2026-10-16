local test = require("test")
local process = require("process")
local negotiator = require("negotiator")
local faults = require("faults")

local function callback(options)
    faults.setup(options)
    local sent, send_err = process.send(process.pid(), "oauth_callback",
        { code = "authorization-code", state = "negotiation-state", error = "access_denied" })
    test.is_nil(send_err)
    test.is_true(sent)
    return negotiator.run({ state_token = "negotiation-state",
        connection_data = { provider_name = "fixture" }, connector_info = {} })
end

local function define_tests()
    test.describe("OAuth negotiation callback reply", function()
        test.it("delivers an arrived callback response before surfacing name-release failure", function()
            local result, err = callback({ release = true })
            test.is_nil(result)
            test.is_true(errors.is(err, errors.UNAVAILABLE))
            test.contains(tostring(err), "callback release fault")
            local response = faults.response()
            test.not_nil(response)
            test.is_false(response.success)
            test.is_true(response.oauth_error)
            test.contains(response.error, "access_denied")
        end)

        test.it("surfaces reply delivery failure after a successful name release", function()
            local result, err = callback({ reply = true })
            test.is_nil(result)
            test.is_true(errors.is(err, errors.UNAVAILABLE))
            test.contains(tostring(err), "callback reply fault")
            test.is_nil(faults.response())
        end)

        test.it("preserves both reply and name-release failures", function()
            local result, err = callback({ release = true, reply = true })
            test.is_nil(result)
            test.contains(tostring(err), "callback reply fault")
            test.contains(err:stack(), "callback release fault")
            test.is_true(errors.is(err, errors.UNAVAILABLE))
        end)
    end)
end

return { run = test.run_cases(define_tests) }
