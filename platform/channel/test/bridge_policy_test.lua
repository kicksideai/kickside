local test = require("test")
local reply_policy = require("reply_policy")

local function define_tests()
    test.describe("channel bridge reply policy", function()
        local lazy = { response_policy = { mode = "lazy" } }
        local immediate = { response_policy = { mode = "immediate" } }

        test.it("only suppresses empty replies", function()
            test.eq(reply_policy.should_send_reply(lazy, ""), false)
            test.eq(reply_policy.should_send_reply(lazy, "   "), false)
            test.eq(reply_policy.should_send_reply(lazy, "[[NO_RESPONSE]]"), true)
            test.eq(reply_policy.should_send_reply(immediate, "(No response)"), true)
        end)

        test.it("keeps real lazy replies and immediate replies", function()
            test.eq(reply_policy.should_send_reply(lazy, "I can help with that."), true)
            test.eq(reply_policy.should_send_reply(immediate, "I can help with that."), true)
        end)

        test.it("defaults the assessor model for lazy policy", function()
            test.eq(reply_policy.assessor_model(lazy), "class:fast")
            test.eq(reply_policy.assessor_model({ response_policy = { mode = "lazy", assessor_model = "class:smart" } }), "class:smart")
        end)

        test.it("builds bounded assessor LLM options with a timeout", function()
            local opts = reply_policy.assessor_options(lazy)
            test.eq(opts.model, "class:fast")
            test.eq(opts.temperature, 0)
            test.eq(opts.max_tokens, 8)
            test.eq(opts.timeout, "30s")

            local custom = reply_policy.assessor_options({
                response_policy = {
                    mode = "lazy",
                    assessor_model = "class:smart",
                    assessor_timeout_seconds = 99,
                },
            })
            test.eq(custom.model, "class:smart")
            test.eq(custom.timeout, "30s")
        end)

        test.it("assesses lazy turns only before the session is active", function()
            test.eq(reply_policy.should_assess(lazy, false), true)
            test.eq(reply_policy.should_assess(lazy, true), false)
            test.eq(reply_policy.should_assess(immediate, false), false)
        end)

        test.it("does not expose a lazy policy prompt for the agent session", function()
            test.eq((reply_policy :: any).lazy_prompt, nil)
        end)

        test.it("formats public tool progress without exposing control tools", function()
            test.eq(reply_policy.tool_status_text("function_call", "GoogleSearch"), "Using Google Search.")
            test.eq(reply_policy.tool_status_text("function_call", "ReadPage"), "Using Read Page.")
            test.eq(reply_policy.tool_status_text("function_call", "Capabilities"), nil)
        end)

        test.it("formats tool errors without arguments or results", function()
            test.eq(reply_policy.tool_status_text("function_error", "ReadPage"), "Read Page failed.")
            test.eq(reply_policy.tool_status_text("function_success", "ReadPage"), nil)
        end)

        test.it("formats each channel turn with only configured instructions", function()
            local text = reply_policy.channel_turn_text("Keep it terse.", "Example User: prod is down")
            test.eq(text:find("Channel responder instructions:\nKeep it terse.", 1, true) ~= nil, true)
            test.eq(text:find("Incoming channel message:\nExample User: prod is down", 1, true) ~= nil, true)
            test.eq(text:find("Channel responder runtime rules:", 1, true), nil)
            test.eq(text:find("Do not send progress placeholders", 1, true), nil)
        end)

        test.it("formats channel turns even when no configurable instructions exist", function()
            local text = reply_policy.channel_turn_text("", "Example User: ping")
            test.eq(text:find("Channel responder instructions:", 1, true), nil)
            test.eq(text:find("Incoming channel message:\nExample User: ping", 1, true) ~= nil, true)
            test.eq(text:find("Channel responder runtime rules:", 1, true), nil)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
