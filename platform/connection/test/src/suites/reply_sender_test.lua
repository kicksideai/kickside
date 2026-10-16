-- Tests for reply_sender.chunk_content — the pure message-splitting used by the
-- agent runner and session bridge before sending to a reply provider.
--
-- Invariants: every chunk is <= max_len, the chunks concatenate back to the
-- original (no data loss), and a late newline is preferred as the break point
-- while an early one is ignored.

local test = require("test")

local function define_tests()
    test.describe("reply_sender.chunk_content", function()
        local reply_sender = require("reply_sender")
        local chunk = reply_sender.chunk_content

        test.it("returns a single chunk when content fits", function()
            local chunks = chunk("hello", 10)
            test.eq(#chunks, 1)
            test.eq(chunks[1], "hello")
        end)

        test.it("returns a single chunk at exactly max_len", function()
            local body = string.rep("a", 10)
            local chunks = chunk(body, 10)
            test.eq(#chunks, 1)
            test.eq(chunks[1], body)
        end)

        test.it("hard-cuts at max_len when there is no newline", function()
            local body = string.rep("a", 25)
            local chunks = chunk(body, 10)
            test.eq(#chunks, 3)
            for _, c in ipairs(chunks) do
                test.is_true(#c <= 10, "chunk exceeds max_len")
            end
            test.eq(table.concat(chunks), body, "chunks must reassemble the original")
        end)

        test.it("breaks on a late newline (past the midpoint)", function()
            local body = string.rep("a", 6) .. "\n" .. string.rep("b", 10)
            local chunks = chunk(body, 10)
            -- first chunk stops before the newline at position 7
            test.eq(chunks[1], string.rep("a", 6))
            for _, c in ipairs(chunks) do
                test.is_true(#c <= 10, "chunk exceeds max_len")
            end
            test.eq(table.concat(chunks), body, "no data lost across the newline break")
        end)

        test.it("ignores an early newline and hard-cuts instead", function()
            local body = "a\n" .. string.rep("b", 20)
            local chunks = chunk(body, 10)
            -- newline at position 2 (<= max_len/2) is not used as the break,
            -- so the first chunk fills to max_len including it.
            test.eq(#chunks[1], 10)
            test.eq(chunks[1], "a\n" .. string.rep("b", 8))
            test.eq(table.concat(chunks), body)
        end)

        test.it("preserves a multi-line payload exactly", function()
            local body = string.rep("line one is fairly long\nline two also\n", 20)
            local chunks = chunk(body, 64)
            for _, c in ipairs(chunks) do
                test.is_true(#c <= 64, "chunk exceeds max_len")
            end
            test.is_true(#chunks > 1, "expected the payload to span multiple chunks")
            test.eq(table.concat(chunks), body, "round-trip must equal the input")
        end)

        test.it("handles empty content as one empty chunk", function()
            local chunks = chunk("", 10)
            test.eq(#chunks, 1)
            test.eq(chunks[1], "")
        end)
    end)

    -- Partial-failure semantics of the chunk send loop: a failure before any
    -- chunk is delivered is retriable; a failure after partial delivery must NOT
    -- be retriable (a retry would resend the chunks already delivered).
    test.describe("reply_sender.send_chunks", function()
        local reply_sender = require("reply_sender")

        local function counting_sender(fail_on)
            local calls = { n = 0 }
            local fn = function(_)
                calls.n = calls.n + 1
                if fail_on and calls.n == fail_on then return nil, "boom" end
                return { ok = calls.n }, nil
            end
            return fn, calls
        end

        test.it("preserves the provider error and signals partial delivery separately", function()
            local sender = reply_sender.send_chunks
            for _, position in ipairs({ 1, 2 }) do
                local failure = errors.new({ kind = errors.UNAVAILABLE, message = "provider unavailable", retryable = true })
                local calls = 0
                local result, err, partial = sender({ "first", "second" }, function()
                    calls = calls + 1
                    if calls == position then return nil, failure end
                    return { success = true }, nil
                end)
                test.is_nil(result)
                test.eq(err, failure)
                test.eq(partial == true, position == 2)
                test.eq(calls, position)
            end
        end)

        test.it("sends every chunk and returns the last result on success", function()
            local fn, calls = counting_sender(0)  -- 0 never matches calls.n (starts at 1)
            local result, err = reply_sender.send_chunks({ "a", "b", "c" }, fn)
            test.is_nil(err)
            test.eq(calls.n, 3, "all chunks attempted")
            test.eq(result.ok, 3, "returns the last send result")
        end)

        test.it("returns a retriable error when the first chunk fails (nothing delivered)", function()
            local fn, calls = counting_sender(1)
            local result, err = reply_sender.send_chunks({ "a", "b", "c" }, fn)
            test.not_nil(err, "first-chunk failure must surface an error")
            test.is_nil(result)
            test.eq(calls.n, 1, "stops at the failed first chunk")
            test.eq(err, "boom")
        end)

        test.it("reports an incomplete message without allowing automatic retry", function()
            local fn, calls = counting_sender(3)
            local result, err, partial = reply_sender.send_chunks({ "a", "b", "c", "d" }, fn)
            test.not_nil(err, "partial delivery must surface an incomplete outcome")
            test.is_true(partial, "the sink needs the partial-delivery evidence")
            test.eq(calls.n, 3, "stops at the first failure, keeping order")
            test.is_nil(result, "an incomplete message has no success result")
        end)

        test.it("surfaces a provider refusal before any chunk is delivered", function()
            local result, err = reply_sender.send_chunks({ "one" }, function()
                return { success = false, error = "sealed reply proof is required" }, nil
            end)
            test.is_nil(result)
            test.not_nil(err)
            test.contains(err, "proof")
        end)
    end)

    test.describe("reply_sender status updates", function()
        local reply_sender = require("reply_sender")
        local original_send = reply_sender.send_reply
        local original_update = reply_sender.update_reply

        test.after_each(function()
            reply_sender.send_reply = original_send
            reply_sender.update_reply = original_update
        end)

        local function with_stubs(send_fn, update_fn, body)
            reply_sender.send_reply = send_fn
            reply_sender.update_reply = update_fn
            body()
            reply_sender.send_reply = original_send
            reply_sender.update_reply = original_update
        end

        test.it("sends the first status and stores the provider message reference", function()
            local sends = 0
            with_stubs(function(config, content)
                sends = sends + 1
                test.eq(config.component_id, "conn-1")
                test.eq(config.resource_id, "room-1")
                test.eq(content, "Using Search.")
                return { success = true, message_ref = "msg-1" }, nil
            end, function()
                error("update should not run before a message_ref exists")
            end, function()
                local handle, err, changed = reply_sender.update_status({
                    component_id = "conn-1",
                    resource_id = "room-1",
                }, "Using Search.")
                test.is_nil(err)
                test.is_true(changed)
                test.eq(sends, 1)
                test.eq(handle.message_ref, "msg-1")
                test.is_true(handle.editable)
                test.is_true(handle.sent)
            end)
        end)

        test.it("edits subsequent status messages when the provider supports updates", function()
            local updates = 0
            with_stubs(function()
                error("send should not run when an editable message_ref exists")
            end, function(config, message_ref, content)
                updates = updates + 1
                test.eq(config.component_id, "conn-1")
                test.eq(config.resource_id, "room-1")
                test.eq(message_ref, "msg-1")
                test.eq(content, "Using Read Page.")
                return { success = true, message_ref = "msg-1" }, nil
            end, function()
                local handle, err, changed = reply_sender.update_status({
                    component_id = "conn-1",
                    resource_id = "room-1",
                    message_ref = "msg-1",
                    sent = true,
                    editable = true,
                }, "Using Read Page.")
                test.is_nil(err)
                test.is_true(changed)
                test.eq(updates, 1)
                test.eq(handle.message_ref, "msg-1")
                test.is_true(handle.editable)
            end)
        end)

        test.it("does not spam repeated status messages when updates are unsupported", function()
            local sends = 0
            with_stubs(function(_config, _content)
                sends = sends + 1
                return { success = true }, nil
            end, function()
                return nil, "update_reply unsupported"
            end, function()
                local handle, err, changed = reply_sender.update_status({
                    component_id = "conn-1",
                    resource_id = "room-1",
                }, "Using Search.")
                test.is_nil(err)
                test.is_true(changed)
                test.eq(sends, 1)
                test.is_true(handle.sent)
                test.is_false(handle.editable)

                handle, err, changed = reply_sender.update_status(handle, "Using Read Page.")
                test.is_nil(err)
                test.is_false(changed)
                test.eq(sends, 1)
            end)
        end)

        test.it("turns the status message into the final answer when editable", function()
            with_stubs(function()
                error("send should not run when final status can be edited")
            end, function(_config, message_ref, content)
                test.eq(message_ref, "msg-1")
                test.eq(content, "Production is up.")
                return { success = true, message_ref = "msg-1" }, nil
            end, function()
                local result, err, updated = reply_sender.finish_status({
                    component_id = "conn-1",
                    resource_id = "room-1",
                    message_ref = "msg-1",
                    sent = true,
                    editable = true,
                }, "Production is up.")
                test.is_nil(err)
                test.is_true(updated)
                test.eq(result.message_ref, "msg-1")
            end)
        end)

        test.it("propagates a failed status edit without sending or disabling edits", function()
            local failure = errors.new({ kind = errors.UNAVAILABLE, message = "provider unavailable" })
            with_stubs(function() error("failed edit must not send") end,
                function() return nil, failure end, function()
                    local handle = { component_id = "conn-1", resource_id = "room-1",
                        message_ref = "msg-1", sent = true, editable = true }
                    local current, err, changed = reply_sender.update_status(handle, "Using Search.")
                    test.eq(err, failure)
                    test.is_false(changed)
                    test.eq(current, handle)
                    test.is_true(handle.editable)
                end)
        end)

        test.it("propagates a failed final edit without posting another reply", function()
            local failure = errors.new({ kind = errors.UNAVAILABLE, message = "provider unavailable" })
            with_stubs(function() error("failed edit must not send") end,
                function() return nil, failure end, function()
                    local result, err, changed = reply_sender.finish_status({ component_id = "conn-1",
                        resource_id = "room-1", message_ref = "msg-1", sent = true, editable = true }, "Answer")
                    test.is_nil(result)
                    test.eq(err, failure)
                    test.is_false(changed)
                end)
        end)

        test.it("reports a provider refusal to edit without posting another reply", function()
            with_stubs(function() error("refused edit must not send") end,
                function() return { success = false, error = "edit refused" }, nil end, function()
                    local result, err, changed = reply_sender.finish_status({ component_id = "conn-1",
                        resource_id = "room-1", message_ref = "msg-1", sent = true, editable = true }, "Answer")
                    test.is_nil(result)
                    test.eq(err, "edit refused")
                    test.is_false(changed)
                end)
        end)

        test.it("sends the final answer separately when there is no editable status", function()
            with_stubs(function(_config, content)
                test.eq(content, "Production is up.")
                return { success = true, message_ref = "msg-2" }, nil
            end, function()
                error("update should not run without a message_ref")
            end, function()
                local result, err, updated = reply_sender.finish_status({
                    component_id = "conn-1",
                    resource_id = "room-1",
                    sent = true,
                    editable = false,
                }, "Production is up.")
                test.is_nil(err)
                test.is_false(updated)
                test.eq(result.message_ref, "msg-2")
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
