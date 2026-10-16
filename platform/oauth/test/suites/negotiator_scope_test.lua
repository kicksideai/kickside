-- The OAuth negotiator answers the callback request from a principal without
-- process messaging authority (a group principal holds no members-only process
-- grant).

local test = require("test")
local security = require("security")
local uuid = require("uuid")
local channel = require("channel")
local time = require("time")
local callback_names = require("callback_names")

local NEGOTIATOR = "kickside.oauth.service:connection_negotiator"

local function define_tests()
    test.describe("OAuth negotiator under a constrained principal", function()
        test.it("answers the callback without the negotiator principal's process messaging authority", function()
            local state = "scope-" .. uuid.v4()
            local policy = assert(security.policy("app:negotiator_constrained"))
            local spawner = assert(process.with_context({}))
                :with_actor(security.new_actor("principal:group:oauth", {}))
                :with_scope(security.new_scope({ policy }))
            local pid, spawn_err = spawner:spawn_monitored(NEGOTIATOR, "app:processes", {
                state_token = state, connection_data = { provider_name = "fixture" }, connector_info = {} })
            test.is_nil(spawn_err, tostring(spawn_err))
            test.not_nil(pid)

            local negotiator_pid = nil
            local deadline = time.now():add(5 * time.SECOND)
            while not negotiator_pid and time.now():before(deadline) do
                negotiator_pid = process.registry.lookup(callback_names.NEGOTIATOR_PREFIX .. state, process.registry.CONSISTENT)
                if not negotiator_pid then time.sleep("20ms") end
            end
            test.not_nil(negotiator_pid, "the negotiator never registered its callback name")

            local replies = process.listen("oauth_callback_response")
            local sent = process.send(tostring(negotiator_pid), "oauth_callback",
                { code = "authorization-code", state = state, error = "access_denied" })
            test.is_true(sent)
            local selected = channel.select({ replies:case_receive(), time.after("5s"):case_receive() })
            process.unlisten(replies)
            test.eq(selected.channel, replies, "the negotiator never answered the callback")
            test.is_false(selected.value.success)
            test.is_true(selected.value.oauth_error)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
