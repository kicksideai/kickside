local test = require("test")
local callback_params = require("callback_params")
local callback_waiter = require("callback_waiter")
local callback_names = require("callback_names")

type CallbackMessage = {
    code: string?,
    state: string?,
    error: string?,
    error_description: string?,
}

local function fake_channel(name: string): any
    return {
        name = name,
        case_receive = function(self: any)
            return { channel = self }
        end,
    }
end

local function define_tests()
    test.describe("OAuth callback parameter extraction", function()
        test.it("treats a missing error param as no provider error", function()
            local data = callback_params.normalize({
                code = "4/0AeoWuM-success",
                state = "state-token-123",
                error = "",
                error_description = ""
            })

            test.is_nil(data.error)
            test.eq(data.code, "4/0AeoWuM-success")
            test.eq(data.state, "state-token-123")
        end)

        test.it("preserves a real provider error", function()
            local data = callback_params.normalize({
                state = "state-token-123",
                error = "access_denied",
                error_description = "The user denied the request"
            })

            test.eq(data.error, "access_denied")
            test.eq(data.error_description, "The user denied the request")
        end)

        test.it("normalizes absent callback params to nil", function()
            local data = callback_params.normalize({})

            test.is_nil(data.code)
            test.is_nil(data.state)
            test.is_nil(data.error)
            test.is_nil(data.error_description)
        end)

        test.it("normalizes nil and empty strings only", function()
            test.is_nil(callback_params.blank_to_nil(nil))
            test.is_nil(callback_params.blank_to_nil(""))
            test.eq(callback_params.blank_to_nil("x"), "x")
        end)

        test.it("releases the response listener when the negotiator send fails", function()
            local response_ch = fake_channel("response")
            local unlistened = nil
            local runtime = {
                listen = function(topic: string): any
                    test.eq(topic, "oauth_callback_response")
                    return response_ch
                end,
                lookup = function(_name: string): any
                    return "pid-1"
                end,
                send = function(pid: string, topic: string, payload: CallbackMessage): any
                    test.eq("pid-1", pid)
                    test.eq("oauth_callback", topic)
                    test.eq("code", payload.code)
                    return false
                end,
                unlisten = function(ch: any)
                    unlistened = ch
                end,
                after = function(_duration: string): any
                    error("timeout should not be created when send fails")
                end,
                select = function(_cases: { any }): any
                    error("select should not run when send fails")
                end,
            }

            local response, err = callback_waiter.send_callback_and_wait("pid-1", { code = "code", state = "state" }, runtime)
            test.is_nil(response)
            test.eq("communication_failed", err)
            test.eq(response_ch, unlistened)
        end)

        test.it("releases the response listener on timeout", function()
            local response_ch = fake_channel("response")
            local timeout_ch = fake_channel("timeout")
            local unlistened = nil
            local runtime = {
                listen = function(_topic: string): any
                    return response_ch
                end,
                lookup = function(_name: string): any
                    return "pid-1"
                end,
                send = function(_pid: string, _topic: string, _payload: CallbackMessage): any
                    return true
                end,
                unlisten = function(ch: any)
                    unlistened = ch
                end,
                after = function(_duration: string): any
                    return timeout_ch
                end,
                select = function(_cases: { any }): any
                    return { channel = timeout_ch }
                end,
            }

            local response, err = callback_waiter.send_callback_and_wait("pid-1", { code = "code", state = "state" }, runtime)
            test.is_nil(response)
            test.eq("timeout", err)
            test.eq(response_ch, unlistened)
        end)

        test.it("returns session_not_found when no negotiator is registered", function()
            local runtime = {
                lookup = function(name: string): any
                    test.eq(callback_names.NEGOTIATOR_PREFIX .. "state-1", name)
                    return nil
                end,
                listen = function(_topic: string): any
                    error("must not listen without a negotiator")
                end,
                send = function(_pid: string, _topic: string, _payload: CallbackMessage): any
                    error("must not send without a negotiator")
                end,
                unlisten = function(_ch: any) end,
                after = function(_duration: string): any
                    error("must not start timeout without a negotiator")
                end,
                select = function(_cases: { any }): any
                    error("must not select without a negotiator")
                end,
            }

            local response, err = callback_waiter.deliver("state-1", { code = "code", state = "state-1" }, runtime)
            test.is_nil(response)
            test.eq("session_not_found", err)
        end)

        test.it("releases the response listener after a negotiator response", function()
            local response_ch = fake_channel("response")
            local timeout_ch = fake_channel("timeout")
            local unlistened = nil
            local payload = { success = true }
            local runtime = {
                lookup = function(_name: string): any
                    return "pid-1"
                end,
                listen = function(_topic: string): any
                    return response_ch
                end,
                send = function(_pid: string, _topic: string, _payload: CallbackMessage): any
                    return true
                end,
                unlisten = function(ch: any)
                    unlistened = ch
                end,
                after = function(_duration: string): any
                    return timeout_ch
                end,
                select = function(_cases: { any }): any
                    return { channel = response_ch, value = payload }
                end,
            }

            local response, err = callback_waiter.send_callback_and_wait("pid-1", { code = "code", state = "state" }, runtime)
            test.is_nil(err)
            test.eq(payload, response)
            test.eq(response_ch, unlistened)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
