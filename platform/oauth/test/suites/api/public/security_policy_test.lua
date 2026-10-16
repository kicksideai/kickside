local test = require("test")
local security = require("security")
local callback_names = require("callback_names")

local function load_policy(id: string)
    local policy, err = security.policy(id)
    if not policy then
        error("missing policy " .. id .. ": " .. tostring(err))
    end
    return policy
end

local function decision(policy_id: string, action: string, resource: string): string
    local actor = security.new_actor("kickside.oauth.api.public:test", {})
    local result = load_policy(policy_id):evaluate(actor, action, resource, {})
    if result == "allow" or result == "deny" then
        return result
    end
    return "undefined"
end

local function define_tests()
    test.describe("kickside.oauth public callback security policies", function()
        test.it("grants only callback process primitives", function()
            test.eq(decision("kickside.oauth.api.public:callback_registry_runtime", "process.registry.lookup", callback_names.NEGOTIATOR_PREFIX .. "test-state"), "allow")
            test.eq(decision("kickside.oauth.api.public:callback_registry_runtime", "process.registry.register", callback_names.NEGOTIATOR_PREFIX .. "test-state"), "undefined")
            test.eq(decision("kickside.oauth.api.public:callback_registry_runtime", "process.registry.lookup", "session.test"), "undefined")

            test.eq(decision("kickside.oauth.api.public:callback_listen_runtime", "process.listen", "oauth_callback_response"), "allow")
            test.eq(decision("kickside.oauth.api.public:callback_listen_runtime", "process.listen", "keeper.logs"), "undefined")

            test.eq(decision("kickside.oauth.api.public:callback_send_runtime", "process.send", "{pid}"), "allow")
            test.eq(decision("kickside.oauth.api.public:callback_send_runtime", "db.get", "app:db"), "undefined")

            test.eq(decision("kickside.oauth.views:callback_page_runtime", "registry.get", "kickside.oauth.views:oauth_callback"), "allow")
            test.eq(decision("kickside.oauth.views:callback_page_runtime", "registry.get", "kickside.oauth.views:theme"), "allow")
            test.eq(decision("kickside.oauth.views:callback_page_runtime", "registry.get", "app.views:main"), "undefined")

            test.eq(decision("kickside.oauth.views:callback_template_runtime", "template.get", "kickside.oauth.views:templates"), "allow")
            test.eq(decision("kickside.oauth.views:callback_template_runtime", "template.get", "app.views.common:templates"), "undefined")
            test.eq(decision("kickside.oauth.views:callback_template_runtime", "registry.get", "kickside.oauth.views:templates"), "undefined")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
