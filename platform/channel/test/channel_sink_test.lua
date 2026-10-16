local test = require("test")
local channel_sink = require("channel_sink")
local reply_sender_stub = require("reply_sender_stub")
local test_state = require("test_state")

-- The writing automation every direct sink write names as its origin.
local ORIGIN = "channel-sink-test-automation"

local function define_tests()
    test.describe("channel writable sink", function()
        test.before_each(function()
            reply_sender_stub.reset()
            test_state.reset()
        end)

        test.it("classifies an unavailable component service as retriable infrastructure", function()
            test_state.state.sink_access_error = errors.new({ message = "component service unavailable", kind = errors.UNAVAILABLE })
            local res = channel_sink.write({
                origin = ORIGIN,
                config = { connection_id = "conn-1", channel_id = "chan-1" },
                input = { content = "hello" },
            })
            test.is_false(res.success)
            test.eq(res.error.code, "provider_unavailable")
            test.is_true(res.error.retriable)
            test.eq(#reply_sender_stub.calls(), 0)
        end)


        test.it("posts content to the configured connection/channel on upsert", function()
            local res = channel_sink.write({
                origin = ORIGIN,
                config = { connection_id = "conn-1", channel_id = "chan-1" },
                sink_op = "upsert",
                input = { content = "hello there" },
            })
            test.is_true(res.success, "write failed")
            test.eq(res.result, "created")
            test.eq(res.dest_ref.connection_id, "conn-1")
            test.eq(res.dest_ref.channel_id, "chan-1")
            test.eq(res.dest_refs.default.dest_ref.connection_id, "conn-1")
            test.eq(res.dest_refs.default.dest_ref.channel_id, "chan-1")

            local calls = reply_sender_stub.calls()
            test.eq(#calls, 1)
            local call = (calls[1] or {}) :: any
            test.eq(call.worker_config.component_id, "conn-1")
            test.eq(call.worker_config.resource_id, "chan-1")
            test.is_true(call.worker_config.outbound)
            test.is_nil(call.worker_config.reply_proof)
            test.eq(call.content, "hello there")
        end)

        test.it("does not acknowledge a partially delivered message", function()
            reply_sender_stub.fail_partially()
            local res = channel_sink.write({
                origin = ORIGIN,
                config = { connection_id = "conn-1", channel_id = "chan-1" },
                input = { content = "incomplete message" },
            })
            test.is_false(res.success)
            test.eq(res.error.code, "provider_error")
            test.is_false(res.error.retriable)
            test.is_true(res.error.details.partial_delivery)
        end)

        test.it("defaults to upsert when sink_op is absent", function()
            local res = channel_sink.write({
                origin = ORIGIN,
                config = { connection_id = "conn-1", channel_id = "chan-1" },
                input = { content = "hello there" },
            })
            test.is_true(res.success, "write failed")
            test.eq(#reply_sender_stub.calls(), 1)
        end)

        test.it("preserves the destination slot supplied by sync", function()
            local res = channel_sink.write({
                origin = ORIGIN,
                config = { connection_id = "conn-1", channel_id = "chan-1" },
                input = { content = "hello there" },
                map_slot = "notification",
            })
            test.is_true(res.success)
            test.eq(res.dest_refs.notification.dest_ref.channel_id, "chan-1")
            test.is_nil(res.dest_refs.default)
            test.eq(#reply_sender_stub.calls(), 1)
        end)

        test.it("refuses a write that names no origin before posting", function()
            local res = channel_sink.write({
                config = { connection_id = "conn-1", channel_id = "chan-1" },
                sink_op = "upsert",
                input = { content = "must not be posted" },
            })
            test.is_false(res.success)
            test.eq(res.error.code, "invalid_request")
            test.is_false(res.error.retriable)
            test.eq(#reply_sender_stub.calls(), 0)
            test.is_nil(test_state.state.sink_access_calls, "a refused write must not check connection access")
        end)

        test.it("rejects an unsupported sink_op instead of silently posting", function()
            local res = channel_sink.write({
                origin = ORIGIN,
                config = { connection_id = "conn-1", channel_id = "chan-1" },
                sink_op = "delete",
                input = { content = "hello there" },
            })
            test.is_false(res.success)
            test.eq(res.error.code, "invalid_request")
            test.contains(res.error.message, "unsupported sink operation: delete")
            test.eq(#reply_sender_stub.calls(), 0)
        end)



        test.it("checks the selected principal's connection WRITE grant before private transport", function()
            test_state.state.sink_access_error = errors.new({ message = "connection WRITE denied", kind = errors.PERMISSION_DENIED })
            local result = channel_sink.write({
                origin = ORIGIN,
                config = { connection_id = "conn-1", channel_id = "chan-1" },
                input = { content = "secret" },
            })
            test.is_false(result.success)
            test.eq(result.error.code, "permission_denied")
            test.eq(#reply_sender_stub.calls(), 0)
            test.eq(#test_state.state.sink_access_calls, 1)
            test.eq(test_state.state.sink_access_calls[1].access, 2)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
