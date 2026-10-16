local test = require("test")
local projection = require("responder_projection")

local STATUS_CHANGED = "kickside.channel.responder.events:status.changed"
local SESSION_ACTIVATED = "kickside.channel.responder.events:session.activated"
local SESSION_COMPLETED = "kickside.channel.responder.events:session.completed"

local function define_tests()
    test.describe("channel responder status projection", function()
        test.it("folds pause and resume events into public meta", function()
            local patches: { any } = {}
            local out, err = projection.run({
                thread_id = "responder-1",
                projection = { body = {} },
                range = { to_seq = 2 },
                events = {
                    { type = STATUS_CHANGED, body = { status = "paused", paused = true } },
                    { type = STATUS_CHANGED, body = { status = "active", paused = false } },
                },
                component = {
                    set_meta = function(id, patch)
                        patches[#patches + 1] = { id = id, patch = patch }
                        return true, nil
                    end,
                },
            })

            test.is_nil(err)
            test.eq(out.last_seq, 2)
            test.eq(out.body.status, "active")
            local patch: any = patches[1] or {}
            test.not_nil(patches[1])
            test.eq(patch.id, "responder-1")
            test.eq(patch.patch.status, "active")
        end)

        -- Regression for the meta/projection interaction: core set_meta is a per-key
        -- merge, so the status sync must patch ONLY status. If it ever wrote a full
        -- public_state it would drop the routing keys (connection_id/channel_id) that
        -- the indexed lookup depends on. Assert the patch touches status alone.
        test.it("status sync patches only status, never rewriting the routing keys", function()
            local patches: { any } = {}
            local _, err = projection.run({
                thread_id = "responder-1",
                projection = { body = {} },
                range = { to_seq = 1 },
                events = { { type = STATUS_CHANGED, body = { status = "paused", paused = true } } },
                component = {
                    set_meta = function(id, patch)
                        patches[#patches + 1] = { id = id, patch = patch }
                        return true, nil
                    end,
                },
            })

            test.is_nil(err)
            local patch: any = (patches[1] or { patch = {} }).patch
            local keys = 0
            for _ in pairs(patch) do keys = keys + 1 end
            test.eq(keys, 1)
            test.eq(patch.status, "paused")
            test.is_nil(patch.connection_id)
            test.is_nil(patch.channel_id)
        end)

        test.it("ignores non-canonical responder status event names", function()
            local out, err = projection.run({
                thread_id = "responder-1",
                projection = { body = {} },
                range = { to_seq = 1 },
                events = { { type = "kickside.channel.responder:status.changed", body = { status = "paused", paused = true } } },
                component = {
                    set_meta = function()
                        return true, nil
                    end,
                },
            })

            test.is_nil(err)
            test.eq(out.last_seq, 1)
            test.is_nil(out.body.status)
        end)

        test.it("folds responder session activation into pass-through gate state", function()
            local out, err = projection.run({
                thread_id = "responder-1",
                projection = { body = {} },
                range = { to_seq = 1 },
                events = {
                    { type = SESSION_ACTIVATED, body = {
                        session_id = "session-1",
                        thread_id = "thread-1",
                        route_key = "route-1",
                        at = "2026-07-02T20:00:00Z",
                    } },
                },
                component = {
                    set_meta = function()
                        return true, nil
                    end,
                },
            })

            test.is_nil(err)
            test.eq(out.body.session.state, "active")
            test.eq(out.body.session.session_id, "session-1")
            test.eq(out.body.response_gate.mode, "pass_through")
            test.eq(out.body.response_gate.reason, "session_active")
        end)

        test.it("folds matching responder session completion back to configured gate state", function()
            local out, err = projection.run({
                thread_id = "responder-1",
                projection = {
                    body = {
                        session = {
                            state = "active",
                            session_id = "session-1",
                            thread_id = "thread-1",
                            route_key = "route-1",
                            activated_at = "2026-07-02T20:00:00Z",
                        },
                        response_gate = { mode = "pass_through", reason = "session_active" },
                    },
                },
                range = { to_seq = 2 },
                events = {
                    { type = SESSION_COMPLETED, body = {
                        session_id = "session-1",
                        thread_id = "thread-1",
                        route_key = "route-1",
                        reason = "idle_timeout",
                        at = "2026-07-02T21:00:00Z",
                    } },
                },
                component = {
                    set_meta = function()
                        return true, nil
                    end,
                },
            })

            test.is_nil(err)
            test.eq(out.body.session.state, "idle")
            test.eq(out.body.session.completed_reason, "idle_timeout")
            test.eq(out.body.response_gate.mode, "configured")
        end)

        test.it("ignores stale session completion for an older session", function()
            local out, err = projection.run({
                thread_id = "responder-1",
                projection = {
                    body = {
                        session = { state = "active", session_id = "session-2" },
                        response_gate = { mode = "pass_through", reason = "session_active" },
                    },
                },
                range = { to_seq = 3 },
                events = {
                    { type = SESSION_COMPLETED, body = { session_id = "session-1", reason = "idle_timeout" } },
                },
                component = {
                    set_meta = function()
                        return true, nil
                    end,
                },
            })

            test.is_nil(err)
            test.eq(out.body.session.state, "active")
            test.eq(out.body.session.session_id, "session-2")
            test.eq(out.body.response_gate.mode, "pass_through")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
