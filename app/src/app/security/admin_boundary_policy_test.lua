local test = require("test")
local security = require("security")
local projection = require("scope_projection")

local USER_SCOPE = "app.security:members"
local ADMIN_SCOPE = "app.security:admin"
local HUB_TRAIT = "keeper.agents.traits.hub:operator"
local HUB_CATALOG = "keeper.hub.tools:catalog"
local HUB_DEPENDENCIES = "keeper.hub.tools:dependencies"
local HUB_MIGRATIONS = "keeper.hub.tools:migrations"
local EVENTS_BUS = "keeper.events:bus"
local KNOWLEDGE_TRAIT = "kickside.knowledge.traits:knowledge_manager"
local KNOWLEDGE_TOOL = "kickside.knowledge.traits:knowledge_manager_tool"
local SYSTEM_ONBOARDING = "kickside.ui:system_onboarding"
local INSTRUMENT_RECOMMENDER = "kickside.hub.instruments:recommender"
local INSTRUMENT_RECOMMENDATIONS_ENDPOINT = "kickside.hub.instruments:recommendations.endpoint"
local REQUIREMENT_RESOLVER = "kickside.hub.instruments:requirement_resolver"
local REQUIREMENT_RESOLUTION_ENDPOINT = "kickside.hub.instruments:requirement_resolution.endpoint"
local DOCUMENTATION = "app:documentation"
local DOCUMENTATION_HOME = "app:documentation.home"
local NON_DOCUMENTATION_ENTRY = "app:gateway"
local DEFINITION = "app:definition"

local function decision(scope_id: string, action: string, resource: string): string
    local scope, err = security.named_scope(scope_id)
    test.is_nil(err, "load scope " .. scope_id .. ": " .. tostring(err))
    test.not_nil(scope)
    local actor = security.new_actor("keeper-policy-test", {})
    return scope:evaluate(actor, action, resource, {})
end

local function define_tests()
    test.describe("Application admin boundary", function()
        test.before_all(function() test.not_nil((projection.reconcile())) end)
        test.it("lets the signed-in baseline open the canonical live identity resolver", function()
            test.eq(decision("app.security:user", "contract.open", "kickside.users:scope_resolver_binding"), "allow")
            test.eq(decision("app.security:user", "funcs.call", "kickside.users.binding:scope_resolver_func"), "allow")
        end)

        test.it("keeps the live identity capability separate from Users directory and identity construction", function()
            for _, resource in ipairs({"kickside.users.binding:subject_lookup", "kickside.users.binding:credential_subject_lookup",
                "kickside.users.binding:group_members_func", "kickside.users.binding:credential_eligibility"}) do
                test.eq(decision("app.security:user", "funcs.call", resource), "undefined", resource)
            end
            test.eq(decision("app.security:user", "contract.open", "kickside.users:group_members_binding"), "undefined")
            test.eq(decision("app.security:user", "access", "kickside.users.api:list_users.endpoint"), "undefined")
            test.eq(decision("app.security:user", "registry.apply", "*"), "undefined")
            test.eq(decision("app.security:user", "security.actor.create", "arbitrary.actor"), "undefined")
            test.eq(decision("app.security:user", "security.scope.create", "*"), "undefined")
        end)

        test.it("lets the Dataflow view read its public host origin without reading credentials", function()
            test.eq(decision(USER_SCOPE, "env.get", "userspace.dataflow.env:web_host_origin"), "allow")
        end)

        test.it("lets members render their Dataflow artifact without opening other secure pages", function()
            test.eq(decision(USER_SCOPE, "view", "page:userspace.dataflow.session.views:state"), "allow")
            test.eq(decision(USER_SCOPE, "template.get", "userspace.dataflow.session.views:templates"), "allow")
            test.eq(decision(USER_SCOPE, "view", "page:keeper.admin:dashboard"), "undefined")
            test.eq(decision(USER_SCOPE, "view", "page:userspace.dataflow.session.views:other"), "undefined")
            test.eq(decision(USER_SCOPE, "template.get", "keeper.admin:templates"), "undefined")
            test.eq(decision(USER_SCOPE, "template.get", "userspace.dataflow.session.views:other"), "undefined")
        end)

        test.it("lets user workflows claim Dataflow ownership without claiming service names", function()
            for _, action in ipairs({ "process.registry.register", "process.registry.unregister" }) do
                test.eq(decision(USER_SCOPE, action, "dataflow.01a109cd-f100-7766-8702-ae3263a368f2"), "allow")
                test.eq(decision(USER_SCOPE, action, "keeper.gov"), "undefined")
                test.eq(decision(USER_SCOPE, action, "dataflow.overseer"), "undefined")
                test.eq(decision(USER_SCOPE, action, "arbitrary.owner"), "undefined")
            end
        end)

        test.it("lets code assistance spawn its Dataflow cycle without spawning service processes", function()
            for _, action in ipairs({ "process.spawn", "process.spawn.monitored", "process.spawn.linked" }) do
                test.eq(decision(USER_SCOPE, action, "userspace.dataflow.node.cycle:cycle"), "allow")
            end
            test.eq(decision(USER_SCOPE, "process.spawn", "userspace.dataflow.runner:overseer"), "undefined")
        end)

        test.it("lets members spawn every declared Dataflow node process", function()
            local nodes = {
                "userspace.dataflow.node.agent:node",
                "userspace.dataflow.node.cycle:cycle",
                "userspace.dataflow.node.func:node",
                "userspace.dataflow.node.parallel:parallel",
                "userspace.dataflow.node.signal:node",
                "userspace.dataflow.node.state:state",
            }
            for _, action in ipairs({ "process.spawn", "process.spawn.monitored", "process.spawn.linked" }) do
                for _, node in ipairs(nodes) do
                    test.eq(decision(USER_SCOPE, action, node), "allow", action .. " " .. node)
                end
            end
        end)

        test.it("keeps Dataflow spawn permission inside node process namespaces", function()
            local unrelated = {
                "userspace.dataflow.runner:orchestrator",
                "userspace.dataflow.runner:overseer",
                "userspace.dataflow.node:service",
                "userspace.dataflow.node.agent.extra:node",
                "userspace.dataflow.node.agent:node:extra",
                "userspace.dataflow.node.agent:node/extra",
                "userspace.dataflow.node.agent:node\n",
                "userspace.dataflow.node.evil:../../service",
                "userspace.dataflow.node.unlisted:node",
                "userspace.other.node.agent:node",
                "kickside.core.jobs:worker",
                "keeper.gov:service",
            }
            for _, action in ipairs({ "process.spawn", "process.spawn.monitored", "process.spawn.linked" }) do
                for _, resource in ipairs(unrelated) do
                    test.eq(decision(USER_SCOPE, action, resource), "undefined", action .. " " .. resource)
                end
            end
            test.eq(decision(USER_SCOPE, "process.registry.register", "userspace.dataflow.node.func:node"), "undefined")
        end)

        test.it("lets owners reach MCP credential reconnect without exposing control-plane endpoints", function()
            test.eq(decision(USER_SCOPE, "access", "kickside.mcp_client.api:reconnect.endpoint"), "allow")
            test.eq(decision(USER_SCOPE, "access", "keeper.hub.api:list_dependencies.endpoint"), "undefined")
        end)

        test.it("lets wiki readers discover renderers while settings stay administrative", function()
            test.eq(decision(USER_SCOPE, "access", "kickside.renderers.api:list_renderers.endpoint"), "allow")
            test.eq(decision(USER_SCOPE, "access", "kickside.settings.api:list_settings.endpoint"), "undefined")
        end)

        test.it("keeps arbitrary actor and scope construction unavailable to users", function()
            test.eq(decision(USER_SCOPE, "security.scope.create", "*"), "undefined")
            test.eq(decision(USER_SCOPE, "security.actor.create", "arbitrary.actor"), "undefined")
        end)

        test.it("does not let an ordinary user discover Keeper traits or tools", function()
            test.eq(decision(USER_SCOPE, "registry.get", HUB_TRAIT), "undefined")
            test.eq(decision(USER_SCOPE, "registry.get", HUB_CATALOG), "undefined")
            test.eq(decision(USER_SCOPE, "registry.get", HUB_DEPENDENCIES), "undefined")
            test.eq(decision(USER_SCOPE, "registry.get", HUB_MIGRATIONS), "undefined")
            test.eq(decision(USER_SCOPE, "registry.find", HUB_TRAIT), "undefined")
            test.eq(decision(USER_SCOPE, "registry.find", HUB_CATALOG), "undefined")
        end)

        test.it("does not let an ordinary user invoke Keeper Hub tools", function()
            test.eq(decision(USER_SCOPE, "funcs.call", HUB_CATALOG), "undefined")
            test.eq(decision(USER_SCOPE, "funcs.call", HUB_DEPENDENCIES), "undefined")
            test.eq(decision(USER_SCOPE, "funcs.call", HUB_MIGRATIONS), "undefined")
            test.eq(decision(USER_SCOPE, "access", HUB_CATALOG), "undefined")
            test.eq(decision(USER_SCOPE, "access", HUB_DEPENDENCIES), "undefined")
            test.eq(decision(USER_SCOPE, "access", HUB_MIGRATIONS), "undefined")
        end)

        test.it("keeps Keeper discovery and invocation available to administrators", function()
            test.eq(decision(ADMIN_SCOPE, "registry.get", HUB_TRAIT), "allow")
            test.eq(decision(ADMIN_SCOPE, "registry.get", HUB_CATALOG), "allow")
            test.eq(decision(ADMIN_SCOPE, "registry.get", HUB_DEPENDENCIES), "allow")
            test.eq(decision(ADMIN_SCOPE, "registry.find", HUB_TRAIT), "allow")
            test.eq(decision(ADMIN_SCOPE, "registry.find", HUB_CATALOG), "allow")
            test.eq(decision(ADMIN_SCOPE, "funcs.call", HUB_CATALOG), "allow")
            test.eq(decision(ADMIN_SCOPE, "funcs.call", HUB_DEPENDENCIES), "allow")
            test.eq(decision(ADMIN_SCOPE, "funcs.call", HUB_MIGRATIONS), "allow")
            test.eq(decision(ADMIN_SCOPE, "access", HUB_CATALOG), "allow")
            test.eq(decision(ADMIN_SCOPE, "access", HUB_DEPENDENCIES), "allow")
            test.eq(decision(ADMIN_SCOPE, "access", HUB_MIGRATIONS), "allow")
        end)

        test.it("keeps the ordinary Knowledge agent surface available", function()
            test.eq(decision(USER_SCOPE, "registry.get", KNOWLEDGE_TRAIT), "allow")
            test.eq(decision(USER_SCOPE, "registry.get", KNOWLEDGE_TOOL), "allow")
            test.eq(decision(USER_SCOPE, "registry.find", KNOWLEDGE_TRAIT), "allow")
            test.eq(decision(USER_SCOPE, "funcs.call", KNOWLEDGE_TOOL), "allow")
        end)

        test.it("reserves thread output publication for module service identities", function()
            local outputs = {
                "kickside.dm.events:message.inbound",
                "kickside.channel.events:message.inbound",
                "kickside.inbox.events:item.created",
                "kickside.workflows.events:run.completed",
            }
            for _, scope_id in ipairs({ USER_SCOPE, ADMIN_SCOPE }) do
                for _, output in ipairs(outputs) do
                    test.eq(decision(scope_id, "threads.output.publish", output), "undefined", scope_id .. " " .. output)
                end
            end
            for _, output in ipairs(outputs) do
                test.eq(decision(ADMIN_SCOPE, "registry.get", output), "allow", "administrator reads " .. output)
            end
        end)

        test.it("reserves system onboarding for administrators", function()
            test.eq(decision(USER_SCOPE, "access", SYSTEM_ONBOARDING), "undefined")
            test.eq(decision(ADMIN_SCOPE, "access", SYSTEM_ONBOARDING), "allow")
        end)

        test.it("keeps the onboarding recommender out of user discovery and start resolution", function()
            -- list_agents uses registry.find under the caller scope; the resolver
            -- then uses registry.get. Ordinary users have no app.* registry grant.
            test.eq(decision(USER_SCOPE, "registry.find", INSTRUMENT_RECOMMENDER), "undefined")
            test.eq(decision(USER_SCOPE, "registry.get", INSTRUMENT_RECOMMENDER), "undefined")
            test.eq(decision(ADMIN_SCOPE, "registry.find", INSTRUMENT_RECOMMENDER), "allow")
            test.eq(decision(ADMIN_SCOPE, "registry.get", INSTRUMENT_RECOMMENDER), "allow")
        end)

        test.it("keeps the install requirement resolver and endpoint admin-only", function()
            test.eq(decision(USER_SCOPE, "registry.find", REQUIREMENT_RESOLVER), "undefined")
            test.eq(decision(USER_SCOPE, "registry.get", REQUIREMENT_RESOLVER), "undefined")
            test.eq(decision(USER_SCOPE, "access", REQUIREMENT_RESOLUTION_ENDPOINT), "undefined")
            test.eq(decision(ADMIN_SCOPE, "registry.find", REQUIREMENT_RESOLVER), "allow")
            test.eq(decision(ADMIN_SCOPE, "registry.get", REQUIREMENT_RESOLVER), "allow")
            test.eq(decision(ADMIN_SCOPE, "access", REQUIREMENT_RESOLUTION_ENDPOINT), "allow")
        end)

        test.it("reserves the one-shot onboarding recommendation endpoint for administrators", function()
            test.eq(decision(USER_SCOPE, "access", INSTRUMENT_RECOMMENDATIONS_ENDPOINT), "undefined")
            test.eq(decision(ADMIN_SCOPE, "access", INSTRUMENT_RECOMMENDATIONS_ENDPOINT), "allow")
        end)

        test.it("preserves the exact ordinary-user Keeper event bus capability", function()
            test.eq(decision(USER_SCOPE, "pg.open", EVENTS_BUS), "allow")
            test.eq(decision(USER_SCOPE, "registry.get", EVENTS_BUS), "undefined")
            test.eq(decision(USER_SCOPE, "funcs.call", EVENTS_BUS), "undefined")
        end)

        test.it("exposes only the public application documentation slice", function()
            test.eq(decision(USER_SCOPE, "registry.get", DEFINITION), "allow")
            test.eq(decision(USER_SCOPE, "registry.get", DOCUMENTATION), "allow")
            test.eq(decision(USER_SCOPE, "registry.find", DOCUMENTATION), "allow")
            test.eq(decision(USER_SCOPE, "registry.get", DOCUMENTATION_HOME), "allow")
            test.eq(decision(USER_SCOPE, "registry.find", DOCUMENTATION_HOME), "allow")
            test.eq(decision(USER_SCOPE, "registry.get", NON_DOCUMENTATION_ENTRY), "undefined")
            test.eq(decision(USER_SCOPE, "registry.find", NON_DOCUMENTATION_ENTRY), "undefined")
            test.eq(decision(USER_SCOPE, "funcs.call", DOCUMENTATION), "allow")
            test.eq(decision(USER_SCOPE, "funcs.call", DEFINITION), "undefined")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
