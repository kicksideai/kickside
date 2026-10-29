local test = require("test")
local security = require("security")
local funcs = require("funcs")
local json = require("json")

local function probe()
    require("subject").handler()
    return json.decode(require("context").headers["X-WS-Relay"])
end

local function run()
    test.describe("WebSocket authenticated scope", function()
        test.it("forwards every authenticated policy id in relay metadata", function()
            local actor = security.new_actor("member", {scope_id = "app:user"})
            local scope = security.new_scope({security.policy("app:ws_scope_call"),
                security.policy("app:composed_module_access")})
            local config, err = funcs.new():with_actor(actor):with_scope(scope):call("app:ws_scope_probe", {})
            test.is_nil(err, tostring(err))
            test.not_nil(config.metadata.scope_policy_ids)
            local found = {}
            for _, id in ipairs(config.metadata.scope_policy_ids) do found[id] = true end
            test.is_true(found["app:composed_module_access"])
            test.is_true(found["app:ws_scope_call"])
            test.eq(config.metadata.scope_id, "app:user")
        end)
    end)
end
return {run = test.run_cases(run), probe = probe}
