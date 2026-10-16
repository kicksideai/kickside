local test = require("test")
local inject = require("inject")
local test_state = require("test_state")

-- A routable thread's hydrated attrs. receive_target is the surface's own inbound
-- contract; inject resolves the dispatch from it, never from managed_by.
local function attrs(overrides)
    local a = {
        receive_target = "kickside.dm:receive",
        managed_by = "kickside.dm",
        provider = "discord",
        reply_component_id = "conn-1",
        reply_resource_id = "chan-1",
        channel_id = "chan-1",
        external_user_id = "ext-1",
    }
    if type(overrides) == "table" then
        for k, v in pairs(overrides) do a[k] = v end
    end
    return a
end

local function define_tests()
    test.describe("channel inject", function()
        test.before_each(function()
            test_state.reset()
        end)

        test.it("re-dispatches to the thread's declared receive_target, not a hardcoded id", function()
            -- managed_by points at the DM surface, but the declared receive seam is a
            -- custom contract; a hardcoded managed_by branch would resolve the wrong one.
            test_state.add_thread(attrs({ receive_target = "custom:surface_receive", managed_by = "kickside.dm" }))
            test_state.add_receive_target("custom:surface_receive", { accepted = true, status = "routed" })

            local result = inject.inject({ thread_id = "thread-1", text = "ping" })

            test.eq(result.status, "routed")
            test.eq(#test_state.state.receive_calls, 1)
            local call = test_state.state.receive_calls[1] :: any
            test.eq(call.target, "custom:surface_receive")
            test.eq(call.inbound.provider, "discord")
            test.eq(call.inbound.reply_component_id, "conn-1")
            test.eq(call.inbound.channel_id, "chan-1")
            test.eq(call.inbound.text, "ping")
            test.eq(#test_state.state.sink_access_calls, 1)
            test.eq(test_state.state.sink_access_calls[1].id, "thread-1")
            test.eq(test_state.state.sink_access_calls[1].access, 2)
            test.eq(#test_state.state.contract_open_frames, 2)
            test.not_nil(test_state.state.contract_open_frames[1].actor)
            test.not_nil(test_state.state.contract_open_frames[1].scope)
            test.eq(test_state.state.contract_open_frames[1].actor, test_state.state.contract_open_frames[2].actor)
            test.eq(test_state.state.contract_open_frames[1].scope, test_state.state.contract_open_frames[2].scope)
        end)

        test.it("frames the inbound as a System author turn", function()
            test_state.add_thread(attrs())
            test_state.add_receive_target("kickside.dm:receive")

            local result = inject.inject({ thread_id = "thread-1", text = "hello" })
            test.eq(result.status, "routed")
            local call = test_state.state.receive_calls[1] :: any
            test.eq(call.inbound.external_username, "System")
            test.eq(call.inbound.external_display_name, "System")

            inject.inject({ thread_id = "thread-1", text = "hello", author = "Watcher" })
            local call2 = test_state.state.receive_calls[2] :: any
            test.eq(call2.inbound.external_username, "Watcher")
        end)

        test.it("consumes attrs as a table -- a JSON string is not routable", function()
            -- inject no longer decodes attrs; a single-thread read hydrates it to a
            -- table, so a raw string carries no routing fields.
            test_state.state.thread = { id = "thread-1", component_id = "thread-1", attrs = '{"receive_target":"kickside.dm:receive","provider":"discord","reply_component_id":"conn-1","channel_id":"chan-1"}' }
            test_state.add_receive_target("kickside.dm:receive")

            local result = inject.inject({ thread_id = "thread-1", text = "ping" })
            test.eq(result.accepted, false)
            test.eq(result.error, "thread is not a routable conversation")
            test.eq(#test_state.state.receive_calls, 0)
        end)

        test.it("rejects a thread with no declared receive_target", function()
            test_state.add_thread(attrs({ receive_target = "" }))

            local result = inject.inject({ thread_id = "thread-1", text = "ping" })
            test.eq(result.accepted, false)
            test.eq(result.error, "thread is not a routable conversation")
            test.eq(#test_state.state.receive_calls, 0)
        end)

        test.it("requires WRITE before dispatching an injected turn", function()
            test_state.add_thread(attrs())
            test_state.add_receive_target("kickside.dm:receive")
            test_state.state.sink_access_error = "WRITE denied"

            local result = inject.inject({ thread_id = "thread-1", text = "ping" })

            test.eq(result.accepted, false)
            test.eq(result.error, "WRITE denied")
            test.eq(#test_state.state.receive_calls, 0)
        end)

        test.it("errors when the thread is not found", function()
            local result = inject.inject({ thread_id = "missing", text = "ping" })
            test.eq(result.accepted, false)
            test.eq(result.status, "error")
        end)

        test.it("requires thread_id and text", function()
            test.eq(inject.inject({ text = "x" }).error, "thread_id is required")
            test.eq(inject.inject({ thread_id = "thread-1" }).error, "text is required")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
