local test = require("test")
local registry = require("registry")
local security = require("security")
local execution = require("execution_identity")
local projection = require("scope_projection")

local function decision(group, action, id)
    if group == "app.security:stranger" then
        return security.new_scope({}):evaluate(security.new_actor("stranger", {}), action, id, nil)
    end
    local scope, err
    if group == "app.security:members" then
        scope, err = execution.scope_from_groups({"app.security:user", group})
    else
        scope, err = security.named_scope(group)
    end
    test.is_nil(err, group)
    return scope:evaluate(security.new_actor("endpoint-policy-test", {}), action, id, nil)
end
local function has(list, name)
    for _, value in ipairs(list or {}) do
        if value == name then return true end
    end
    return false
end

local function define_tests()
    test.describe("Composed member HTTP endpoints", function()
        test.before_all(function() test.not_nil((projection.reconcile())) end)
        test.it("allows the canonical usage tracker without registry mutation or unrelated functions", function()
            for _, id in ipairs({"wippy.usage:usage_tracker_binding", "wippy.usage:usage_tracker",
                "wippy.usage:token_usage_repo", "wippy.usage:target_db"}) do
                test.eq(decision("app.security:user", "registry.get", id), "allow", id)
                test.eq(decision("app.security:user", "registry.update", id), "undefined", id)
                test.eq(decision("app.security:stranger", "registry.get", id), "undefined", id)
            end
            for _, id in ipairs({"wippy.usage:usage_tracker_binding", "wippy.usage:usage_tracker"}) do
                test.eq(decision("app.security:user", "contract.open", id), "allow", id)
            end
            test.eq(decision("app.security:user", "funcs.call", "wippy.usage:usage_tracker"), "allow")
            test.eq(decision("app.security:user", "funcs.call", "wippy.usage:unrelated"), "undefined")
        end)
        test.it("requires listed module authority and retains the Core baseline and retains the Core baseline", function()
            test.eq(decision("app.security:members", "access", "unrelated.catalog:list.endpoint"), "undefined")
            test.eq(decision("app.security:user", "access", "unrelated.catalog:list.endpoint"), "undefined")
            test.eq(decision("app.security:stranger", "access", "unrelated.catalog:list.endpoint"), "undefined")
            -- sol-lanes/identity-guard/answer-decision.md item B: the shared policy
            -- retains its identity and admits only Core member endpoints.
            local baseline = security.new_scope({assert(security.policy("kickside.contract.http:user_endpoint_access"))})
            local actor = security.new_actor("baseline-member", {})
            for _, id in ipairs({"kickside.core.threads.api:list_threads.endpoint", "kickside.core.retention.api:get_thread_retention.endpoint"}) do
                test.eq(baseline:evaluate(actor, "access", id), "allow", id)
            end
            for _, id in ipairs({"unrelated.catalog:list.endpoint", "kickside.core.jobs.api:list.endpoint", "kickside.agents.api:list.endpoint"}) do
                test.eq(baseline:evaluate(actor, "access", id), "undefined", id)
            end
        end)
        test.it("evaluates every composed declaration as member, admin, and stranger", function()
            local member_endpoints = {}
            local policies, policy_err = registry.find({[".kind"] = "security.policy"})
            test.is_nil(policy_err)
            local included = {}
            local function include(id)
                if included[id] then return end
                included[id] = true
                local declaration, err = registry.get(id)
                test.is_nil(err, id)
                local policy = (declaration.data or declaration).policy
                local actions = type(policy.actions) == "string" and {policy.actions} or policy.actions
                if policy.effect == "allow" and has(actions, "access") then
                    local resources = type(policy.resources) == "string" and {policy.resources} or policy.resources
                    for _, resource in ipairs(resources) do member_endpoints[resource] = true end
                end
                for _, child in ipairs((declaration.meta or {}).includes or {}) do include(child) end
            end
            for _, declaration in ipairs(policies) do
                local data = declaration.data or declaration
                if (declaration.meta or {}).intent == "module_access" or has(data.groups, "app.security:user") then
                    include(tostring(declaration.id))
                end
            end
            local entries, err = registry.find({[".kind"] = "http.endpoint"})
            test.is_nil(err)
            local count = 0
            local routes = {}
            for _, entry in ipairs(entries) do
                local id = tostring(entry.id)
                local data = entry.data or entry
                local meta = entry.meta or data.meta or {}
                local product = id:match("^kickside%.") or id:match("^chestor%.") or id:match("^app%.")
                local listed = member_endpoints[id] == true
                local router_data = {}
                if product or listed then
                    local router, router_err = registry.get(meta.router)
                    test.is_nil(router_err, id)
                    test.not_nil(router, id)
                    router_data = router and (router.data or router) or {}
                end
                local authenticated = has(router_data.middleware, "token_auth")
                local member = listed and authenticated
                local firewall = has(router_data.post_middleware, "endpoint_firewall")
                if product then
                    test.eq(firewall, authenticated, "authenticated route without endpoint firewall " .. id)
                    if authenticated and not member then
                        test.eq(decision("app.security:members", "access", id), "undefined", id)
                        test.eq(decision("app.security:admin", "access", id), "allow", id)
                        test.eq(decision("app.security:stranger", "access", id), "undefined", id)
                    end
                end
                if member then
                    count = count + 1
                    test.is_true(firewall, id)
                    test.is_true(authenticated, id)
                    local handler_id = tostring(data.func)
                    if not handler_id:find(":", 1, true) then
                        handler_id = id:match("^(.-):") .. ":" .. handler_id
                    end
                    local handler, handler_err = registry.get(handler_id)
                    test.is_nil(handler_err, id)
                    test.not_nil(handler, id)
                    test.eq(handler.kind, "function.lua", id)
                    local key = tostring(meta.router) .. " " .. data.method .. " " .. data.path
                    test.is_nil(routes[key], key)
                    routes[key] = id
                    test.eq(decision("app.security:members", "access", id), "allow", id)
                    test.eq(decision("app.security:admin", "access", id), "allow", id)
                    test.eq(decision("app.security:stranger", "access", id), "undefined", id)
                end
            end
            local contract, contract_err = registry.get("kickside.contract.http:user_endpoint_access")
            test.is_nil(contract_err)
            test.not_nil(contract)
        end)
        test.it("shows System navigation through its declared settings capability", function()
            local system = assert(registry.get("app.ui:system"))
            local gate = (system.data or system).access
            test.eq(gate, "kickside.ui.api:list_settings_tabs.endpoint")
            for _, group in ipairs({"app.security:user", "app.security:members", "app.security:admin"}) do
                test.eq(decision(group, "registry.get", "app.ui:system"), "allow", group)
            end
            test.eq(decision("app.security:stranger", "registry.get", "app.ui:system"), "undefined")
            test.eq(decision("app.security:user", "access", gate), "undefined")
            test.eq(decision("app.security:members", "access", gate), "undefined")
            test.eq(decision("app.security:admin", "access", gate), "allow")
            local management = security.new_scope({assert(security.policy("kickside.users.security:module_access"))})
            test.eq(management:evaluate(security.new_actor("users-manager", {}), "access", gate, nil), "allow")
        end)
        test.it("lets account creators discover the declared new-account memberships", function()
            for _, id in ipairs({"app.composition:default_member_enrollment", "app.composition:core_member_enrollment"}) do
                test.eq(decision("app.security:user", "registry.get", id), "allow", id)
            end
            test.eq(decision("app.security:user", "registry.get", "app.composition:core_access"), "undefined")
        end)
        test.it("keeps host administration outside member admission", function()
            for _, id in ipairs({"kickside.ui.api:set_config.endpoint", "kickside.users.api:list_users.endpoint", "kickside.core.projections.api:register_projection.endpoint", "kickside.security.api:list_roles.endpoint", "kickside.settings.api:list_settings.endpoint", "kickside.hub.instruments:recommendations.endpoint", "kickside.sso.api:list_admin_providers.endpoint", "kickside.crm.api:create.endpoint", "kickside.crm.api:schema.apply.endpoint"}) do
                test.eq(decision("app.security:members", "access", id), "undefined", id)
                test.eq(decision("app.security:admin", "access", id), "allow", id)
                test.eq(decision("app.security:stranger", "access", id), "undefined", id)
            end
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return {run = function(options) return run_cases(options) end}
