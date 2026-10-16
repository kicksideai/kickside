local test = require("test")
local receive = require("receive")
local test_state = require("test_state")
local execution_ref = require("execution_ref")
local real_dm = require("real_dm")
local persist = require("persist")
local sql = require("sql")
local time = require("time")
local reply_sender_stub = require("reply_sender_stub")
local reply_admission = require("reply_admission")
local json = require("json")

local DB = "app:db"
local TABLE = "kickside_channel_sessions"
local HUB = "kickside.channel.session_hub"

local function truncate()
    local db = sql.get(DB)
    if not db then error("missing test db") end
    db:execute("DELETE FROM " .. TABLE)
    db:execute("DELETE FROM kickside_channel_admissions")
    db:execute("DELETE FROM kickside_channel_turns")
    db:execute("DELETE FROM kickside_channel_session_archives")
    db:execute("DELETE FROM kickside_channel_cleanup_counts")
    db:execute("DELETE FROM kickside_channel_session_owner")
    db:execute("DELETE FROM kickside_channel_conversation")
    db:release()
end

local function inbound(overrides)
    local args = {
        provider = "discord",
        reply_component_id = "conn-1",
        reply_resource_id = "chan-1",
        channel_id = "chan-1",
        external_user_id = "ext-1",
        external_username = "external-user",
        external_display_name = "External User",
        external_message_id = "msg-1",
        text = "hello",
    }
    if type(overrides) == "table" then
        for k, v in pairs(overrides) do args[k] = v end
    end
    return args
end

local function sent_route(index)
    local item = test_state.state.sent[index]
    test.not_nil(item)
    local ref = item.payload.turn_ref
    test.not_nil(ref)
    local route, err = execution_ref.load_turn(ref)
    test.is_nil(err)
    test.not_nil(route)
    return route
end

local function install_process_stub()
    return receive.new({
        hub = {
            send = function(payload)
                if type(payload) == "table" and payload.kind == "turn" then
                    table.insert(test_state.state.sent, { payload = payload })
                end
                if test_state.state.send_error then return false, test_state.state.send_error end
                return true, nil
            end,
        },
        publish = function(_key, ref, _method, _args)
            test_state.state.witness_turn_ref = ref
            local route, err = execution_ref.load_turn(ref)
            test.is_nil(err, tostring(err))
            test.eq(route.delivery, "witness")
            return { inserted = 1 }, nil
        end,
        trusted_ingress = function(_resource: string): boolean return true end,
    })
end

local function seed_responder(opts)
    opts = type(opts) == "table" and opts or {}
    test_state.add_responder("auto-1", {
        connection_id = "conn-1",
        channel_id = "chan-1",
        agent_id = "agent-1",
        traits = { "trait-1" },
        trait_contexts = { ["trait-1"] = { level = "brief" } },
        context = "channel context",
        response_policy = opts.response_policy or {},
        session_policy = opts.session_policy or {},
        system_prompt = opts.system_prompt,
        paused = opts.paused == true,
    })
    -- The routed agent must exist for the turn to run.
    if opts.agent_exists ~= false then
        test_state.add_component("agent-1", { title = "Agent One" })
    end
end

return {
    truncate = truncate,
    inbound = inbound,
    sent_route = sent_route,
    install_process_stub = install_process_stub,
    seed_responder = seed_responder,
}
