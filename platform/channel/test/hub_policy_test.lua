local test = require("test")
local policy = require("hub_policy")
local real_hub = require("real_hub")

local function drive_upgrade()
    local inbox, events = {}, {}
    inbox.case_receive = function() return inbox end
    events.case_receive = function() return events end
    local options: any = nil
    local handover: any = nil
    local spawns, sends, recoveries = 0, 0, 0
    local ref = { owner_id = "channel.turn", record_id = "turn-a", generation = 1 }
    local queue = { "turn", "outdated" }
    local cursor = 0
    local builder = {}
    builder.with_actor = function() return builder, nil end
    builder.with_scope = function() return builder, nil end
    builder.spawn_linked_monitored = function() spawns = spawns + 1; return "bridge-a", nil end
    local fixture = real_hub.new({
        process = {
            registry = { register = function() return true, nil end },
            event = { CANCEL = "cancel", EXIT = "exit", LINK_DOWN = "link_down", OUTDATED = "outdated" },
            set_options = function(value) options = value end,
            events = function() return events end, inbox = function() return inbox end,
            with_context = function() return builder, nil end,
            cancel = function() return true, nil end,
            send = function() sends = sends + 1; return true, nil end,
            upgrade = function(id, state) test.is_nil(id); handover = state end,
        },
        channel = { select = function()
            cursor = cursor + 1
            local kind = queue[cursor]
            if not kind then error("hub selects after upgrade") end
            if kind ~= "turn" then return { channel = events, value = { kind = kind } } end
            return { channel = inbox, value = {
                topic = function() return "hub-topic" end,
                payload = function() return { data = function()
                    return { kind = "turn", turn_ref = ref, origin = "receiver" }
                end } end,
            } }
        end },
        consts = { HUB_NAME = "test:hub", HUB_TOPIC = "hub-topic", process_host = function() return "test:processes", nil end },
        execution_ref = {
            load_turn = function(turn_ref)
                return { key = "a", session_id = "session-a", start = { agent_id = "agent" },
                    inbound = { external_message_id = turn_ref.record_id },
                    execution_ref = { owner_id = "owner", record_id = "a", generation = 1 } }, nil
            end,
            resolve = function() return { actor = {}, scope = {}, principal = {}, scope_name = "scope", meta = {} }, nil end,
        },
        turn_supervisor = { new = function(_, _, state)
            local preserved = state or { retry_due_by_turn = { retry = { retry_at = 123 } } }
            return {
                track = function(turn_ref) return turn_ref.record_id end,
                recover = function() recoveries = recoveries + 1; return true, nil end,
                timer = function() return nil end,
                snapshot = function() return preserved end,
            }
        end },
    })
    fixture.main({})
    test.is_true(options.upgradable)
    test.not_nil(handover)
    test.eq(handover.bridges.a.pid, "bridge-a")
    test.eq(handover.supervisor.retry_due_by_turn.retry.retry_at, 123)
    queue, cursor = { "turn", "turn", "outdated" }, 0
    local first_handover = handover
    fixture.main(first_handover)
    test.eq(spawns, 1)
    test.eq(sends, 0)
    test.eq(recoveries, 1)
end

local function drive_health_failure(mode)
    local inbox, events = {}, {}
    inbox.case_receive = function() return inbox end
    events.case_receive = function() return events end
    local attempts, cancelled, retries = {}, {}, {}
    local function ref(key) return { record_id = key } end
    local function turn(key) return { kind = "turn", turn_ref = ref(key) } end
    local tokens = {}
    local queue = { { data = turn("a"), sender = "receiver" } }
    if mode == "notification" then
        queue[#queue + 1] = { data = function()
            return { kind = "health", key = "a", reason = "reply_sent", bridge_token = tokens.a }
        end, sender = "pid:a" }
    end
    if mode ~= "spawn" then
        queue[#queue + 1] = { event = { kind = "exit", from = "pid:a", result = { error = "bridge failure" } } }
    end
    queue[#queue + 1] = { data = turn("b"), sender = "receiver" }
    queue[#queue + 1] = { event = { kind = "cancel" } }
    local cursor = 0
    local builder = {}
    builder.with_actor = function() return builder, nil end
    builder.with_scope = function() return builder, nil end
    builder.spawn_linked_monitored = function(_, _, _, args)
        local key = args.route.key
        attempts[key] = (attempts[key] or 0) + 1
        tokens[key] = args.route.bridge_token
        if key == "a" and mode == "spawn" then return nil, "host unavailable" end
        return "pid:" .. key, nil
    end
    local fixture = real_hub.new({
        process = {
            registry = { register = function() return true, nil end },
            event = { CANCEL = "cancel", EXIT = "exit", LINK_DOWN = "link_down" },
            set_options = function() end,
            events = function() return events end,
            inbox = function() return inbox end,
            with_context = function() return builder, nil end,
            cancel = function(pid) cancelled[#cancelled + 1] = pid; return true, nil end,
        },
        channel = { select = function()
            cursor = cursor + 1
            local item = queue[cursor]
            if item.event then return { channel = events, value = item.event } end
            -- The hub signal stamps each message with its origin process.
            local data = type(item.data) == "function" and item.data() or item.data
            data.origin = item.sender
            return { channel = inbox, value = {
                topic = function() return "hub-topic" end,
                from = function() return "kickside.channel.service:hub_signal_deliver" end,
                payload = function() return { data = function() return data end } end,
            } }
        end },
        consts = { HUB_NAME = "test:hub", HUB_TOPIC = "hub-topic", process_host = function() return "test:processes", nil end },
        execution_ref = {
            load_turn = function(turn_ref)
                local key = turn_ref.record_id
                return { key = key, session_id = "session:" .. key,
                    start = { component_id = "responder:" .. key, agent_id = "agent" },
                    inbound = { external_message_id = "message:" .. key },
                    execution_ref = { owner_id = "owner", record_id = key, generation = 1 } }, nil
            end,
            resolve = function() return { actor = {}, scope = {}, principal = {}, scope_name = "scope", meta = {} }, nil end,
        },
        responder_health = {
            report = function() return false, errors.new({ kind = errors.UNAVAILABLE, message = "metadata unavailable" }) end,
            report_bridge = function() return false, errors.new({ kind = errors.UNAVAILABLE, message = "metadata unavailable" }) end,
        },
        turn_supervisor = { new = function()
            return {
                track = function(turn_ref) return turn_ref.record_id end,
                schedule_retry = function(turn_ref) retries[#retries + 1] = turn_ref.record_id end,
                recover = function() return true, nil end,
                timer = function() return nil end,
            }
        end },
    })
    fixture.main({})
    return attempts, cancelled, retries
end

local function define_tests()
    test.describe("channel hub module", function()
        test.it("upgrades with live bridges, dedup and turn ownership intact", drive_upgrade)
        test.it("loads the live execution-ref hub", function()
            test.eq(type(real_hub.main), "function")
        end)
    end)
    test.describe("channel hub health supervision", function()
        for _, mode in ipairs({ "notification", "spawn", "exit" }) do
            test.it("recovers the affected route after " .. mode .. " health failure", function()
                local attempts, cancelled, retries = drive_health_failure(mode)
                test.eq(attempts.b, 1)
                test.eq(retries[1], "a")
                if mode == "notification" then test.eq(cancelled[1], "pid:a") end
            end)
        end
    end)
    test.describe("channel hub bridge-lifecycle policy", function()
        test.it("spawns when no bridge is recorded", function()
            test.eq(policy.decide_route(nil, "s1", "a1"), "spawn")
        end)

        test.it("routes to a live bridge on the same session and agent", function()
            test.eq(policy.decide_route({ session_id = "s1", agent_id = "a1" }, "s1", "a1"), "route")
        end)

        test.it("supersedes on a session change", function()
            test.eq(policy.decide_route({ session_id = "s1", agent_id = "a1" }, "s2", "a1"), "supersede")
        end)

        test.it("supersedes on an agent change", function()
            test.eq(policy.decide_route({ session_id = "s1", agent_id = "a1" }, "s1", "a2"), "supersede")
        end)

        -- The invariant that fixes the duplicate: while a bridge is draining, every
        -- turn -- whether a change or the same session -- is held, never routed and
        -- never used to spawn a second concurrent bridge.
        test.it("holds a superseding turn while the bridge is draining", function()
            test.eq(policy.decide_route({ session_id = "s1", agent_id = "a1", draining = true }, "s2", "a1"), "hold")
        end)

        test.it("holds a same-session turn while the bridge is draining", function()
            test.eq(policy.decide_route({ session_id = "s1", agent_id = "a1", draining = true }, "s1", "a1"), "hold")
        end)

        test.it("respawns on exit only when a turn was held for the successor", function()
            test.eq(policy.decide_exit({ pending = { key = "k" } }), "respawn")
        end)

        test.it("drops on exit when nothing was held", function()
            test.eq(policy.decide_exit({}), "drop")
            test.eq(policy.decide_exit(nil), "drop")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
