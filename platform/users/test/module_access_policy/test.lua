local test = require("test")
local registry = require("registry")
local security = require("security")
local function composed_scope(root)
    local policies, seen = {}, {}
    local function include(id)
        if seen[id] then return end
        seen[id] = true
        local entry, err = registry.get(id)
        assert(not err, tostring(err))
        assert(entry, id)
        policies[#policies + 1] = assert(security.policy(id))
        for _, child in ipairs(entry.meta.includes or {}) do include(child) end
    end
    include(root)
    return assert(security.new_scope(policies))
end
local function define_tests()
    test.describe("Module access composition", function()
        test.it("declares a compatible platform Members default for every member requirement", function()
            for _, id in ipairs({"kickside.users:user_security_scope"}) do
                local requirement, err = registry.get(id)
                test.is_nil(err, id)
                test.not_nil(requirement, id)
                test.eq(requirement.meta.value_kind, "security.scope", id)
                test.eq(requirement.data.default, "kickside.security.groups:members", id)
            end
        end)
        test.it("makes Users management selectable without granting it to default members", function()
            local declaration = registry.get("kickside.users.security:module_access")
            test.eq(declaration.meta.title, "Users management")
            test.eq(declaration.meta.intent, "module_management")
            test.is_true(declaration.meta.private ~= true)
            local policy, err = security.policy("kickside.users.security:module_access")
            test.is_nil(err)
            local actor = security.new_actor("sales-member", {})
            for _, id in ipairs({
                "kickside.users.api:list_users.endpoint", "kickside.users.api:create_user.endpoint",
                "kickside.users.api:update_user.endpoint", "kickside.users.api:delete_user.endpoint",
                "kickside.users.api:get_user_groups.endpoint", "kickside.users.api:set_user_groups.endpoint",
                "kickside.users.api:list_assignable_scopes.endpoint", "kickside.ui.api:list_settings_tabs.endpoint",
            }) do
                test.eq(policy:evaluate(actor, "access", id), "allow", id)
            end
            test.eq(policy:evaluate(actor, "access", "kickside.security.api:save_scope.endpoint"), "undefined")
            local member = security.policy("kickside.users.security:directory_access")
            test.not_nil(member)
            test.eq(member:evaluate(actor, "access", "kickside.users.api:list_users.endpoint"), "undefined")
            local management = composed_scope("kickside.users.security:module_access")
            for _, action in ipairs({"contract.get", "contract.open", "contract.call"}) do
                test.eq(management:evaluate(actor, action, "kickside.settings:settings"), "allow", action)
            end
            test.eq(management:evaluate(actor, "funcs.call", "kickside.security.binding:list_scopes_func"), "allow")
            test.eq(management:evaluate(actor, "registry.get", "kickside.security.api:scope_catalog"), "allow")
            local requirement = registry.get("kickside.users:user_security_scope")
            for _, target in ipairs(requirement.data.targets) do
                test.is_true(target.entry ~= "kickside.users.security:module_access")
            end
        end)
        test.it("admits owned member endpoints and rejects other modules", function()
            local policy, err = security.new_scope({assert(security.policy("kickside.users.security:users_endpoint_access")), assert(security.policy("kickside.users.profile:profile_endpoint_access")), assert(security.policy("kickside.users.directory:directory_endpoint_access"))})
            test.is_nil(err)
            test.not_nil(policy)
            local actor = security.new_actor("module-member", {})
            local bundle = composed_scope("kickside.users.security:directory_access")
            for _, id in ipairs({
                "kickside.users.api:me.endpoint",
                "kickside.users.api:update_me.endpoint",
                "kickside.users.api:logout.endpoint",
                "kickside.users.api:get_profile.endpoint",
                "kickside.users.api:put_profile.endpoint",
                "kickside.users.api:principals_search.endpoint",
                "kickside.users.api:principals_resolve.endpoint",
            }) do
                test.not_nil(registry.get(id), id)
                test.eq(policy:evaluate(actor, "access", id), "allow", id)
                test.eq(bundle:evaluate(actor, "access", id), "allow", id)
                test.eq(policy:evaluate(actor, "access", (id .. ".unlisted")), "undefined", id)
                test.eq(policy:evaluate(actor, "funcs.call", id), "undefined", id)
            end
            for _, id in ipairs({ "unrelated.module:list.endpoint", "kickside.users_extension:list.endpoint" }) do
                test.eq(policy:evaluate(actor, "access", id), "undefined", id)
            end
        end)
        test.it("covers every declared Users member endpoint through the directory capability", function()
            local scope = composed_scope("kickside.users.security:directory_access")
            local actor = security.new_actor("module-member", {})
            local entries, err = registry.find({[".kind"] = "http.endpoint"})
            test.is_nil(err)
            local count = 0
            local expected = {
                ["kickside.users.api:get_profile.endpoint"] = true,
                ["kickside.users.api:logout.endpoint"] = true,
                ["kickside.users.api:me.endpoint"] = true,
                ["kickside.users.api:principals_resolve.endpoint"] = true,
                ["kickside.users.api:principals_search.endpoint"] = true,
                ["kickside.users.api:put_profile.endpoint"] = true,
                ["kickside.users.api:run_as_candidates.endpoint"] = true,
                ["kickside.users.api:update_me.endpoint"] = true,
            }
            for _, entry in ipairs(entries) do
                local id = tostring(entry.id)
                if expected[id] then
                    count = count + 1
                    test.eq(scope:evaluate(actor, "access", id), "allow", id)
                    test.eq(scope:evaluate(actor, "access", (id .. ".unlisted")), "undefined", id)
                end
            end
            test.is_true(count >= 8, "Users member endpoint inventory is incomplete")
            for _, id in ipairs({"kickside.users.api:create_user.endpoint", "kickside.users.api:bot_accounts_create.endpoint",
                "kickside.users.api:list_users.endpoint", "unrelated.module:list.endpoint"}) do
                test.eq(scope:evaluate(actor, "access", id), "undefined", id)
            end
        end)
        test.it("includes module discovery without an application blanket grant", function()
            local declaration = registry.get("kickside.users.security:directory_access")
            test.is_true(type(declaration.meta.title) == "string" and declaration.meta.title ~= "")
            test.eq(declaration.meta.intent, "module_access")
            test.eq(declaration.meta.surface, "kickside.users")
            test.is_true(declaration.meta.private ~= true)
            local scope, scope_err = composed_scope("kickside.users.security:directory_access")
            test.is_nil(scope_err)
            local actor = security.new_actor("module-member", {})
            test.eq(scope:evaluate(actor, "registry.get", "kickside.users:default_memberships"), "allow")
            for _, action in ipairs({ "access", "registry.get", "funcs.call" }) do
                test.eq(scope:evaluate(actor, action, "unrelated.module:list.endpoint"), "undefined", action)
            end
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
