-- Profile changes reach the registered profile.changed subscriber from a
-- principal without process messaging authority (a group principal holds no
-- members-only process grant).

local test = require("test")
local security = require("security")
local funcs = require("funcs")
local registry = require("registry")
local models_types = require("models_types")

local SUPERVISOR_SERVICE_ENTRY = "kickside.models.providers.google_vertex:vertex_token_supervisor.service"

local function define_tests()
    test.describe("profile change signal", function()
        test.it("delivers a profile change without caller process messaging authority", function()
            local policy = assert(security.policy("app:profile_change_constrained"))
            local sent, err = funcs.new():with_actor(security.new_actor("principal:group:models", {}))
                :with_scope(security.new_scope({ policy }))
                :call("app:profile_change_signal_probe", { profile_id = "signal-profile", provider_id = "google_vertex" })
            test.is_nil(err, tostring(err))
            test.is_true(sent, "the registered profile.changed subscriber never received the change")
        end)

        test.it("registers the supervisor under its service entry id and keeps the topic distinct", function()
            local entry, err = registry.get(SUPERVISOR_SERVICE_ENTRY)
            test.is_nil(err, tostring(err))
            test.not_nil(entry)
            test.eq(models_types.VERTEX_TOKEN_SUPERVISOR_PROCESS, SUPERVISOR_SERVICE_ENTRY)
            test.neq(models_types.VERTEX_TOKEN_SUPERVISOR_PROCESS, models_types.PROFILE_CHANGED_TOPIC)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
