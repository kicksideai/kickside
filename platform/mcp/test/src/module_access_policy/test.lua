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
        test.it("resolves credential owner authority without Users management access", function()
            local scope = composed_scope("kickside.mcp.security:module_access")
            local actor = security.new_actor("credential-owner", {})
            for _, pair in ipairs({
                {"contract.get", "kickside.contract:scope_resolver"},
                {"contract.open", "kickside.users:scope_resolver_binding"},
                {"contract.call", "resolve"},
                {"contract.security", "security"},
            }) do
                test.eq(scope:evaluate(actor, pair[1], pair[2]), "allow", pair[1] .. " " .. pair[2])
            end
            for _, pair in ipairs({
                {"access", "kickside.users.api:list_users.endpoint"},
                {"registry.get", "kickside.users.api:list_users.endpoint"},
                {"funcs.call", "kickside.users.binding:subject_lookup"},
                {"contract.open", "kickside.users:user_repo_binding"},
            }) do
                test.eq(scope:evaluate(actor, pair[1], pair[2]), "undefined", pair[1] .. " " .. pair[2])
            end
        end)
        test.it("admits owned member endpoints and rejects other modules", function()
            local policy, err = security.policy("kickside.mcp.security:mcp_endpoint_access")
            test.is_nil(err)
            test.not_nil(policy)
            local actor = security.new_actor("module-member", {})
            local bundle = composed_scope("kickside.mcp.security:module_access")
            local requirement = assert(registry.get("kickside.mcp.security:user_security_scope"))
            test.eq(requirement.meta.value_kind, "security.scope")
            test.eq(requirement.data.default, "kickside.security.groups:members")
            local original = assert(registry.get("kickside.mcp.security:mcp_endpoint_access"))
            local expected_resources = {
                ["kickside.mcp.api:create_credential.endpoint"] = true,
                ["kickside.mcp.api:delete_credential.endpoint"] = true,
                ["kickside.mcp.api:list_components.endpoint"] = true,
                ["kickside.mcp.api:list_credentials.endpoint"] = true,
                ["kickside.mcp.api:list_presets.endpoint"] = true,
                ["kickside.mcp.api:list_tools.endpoint"] = true,
                ["kickside.mcp.api:revoke_credential.endpoint"] = true,
                ["kickside.mcp.api:serve_mcp.delete.endpoint"] = true,
                ["kickside.mcp.api:serve_mcp.endpoint"] = true,
                ["kickside.mcp.api:serve_mcp.get.endpoint"] = true,
                ["kickside.mcp.api:update_credential.endpoint"] = true,
            }
            test.eq(#original.data.policy.resources, 11)
            for _, id in ipairs(original.data.policy.resources) do
                test.is_true(expected_resources[id] == true, id)
                test.not_nil(registry.get(id), id)
                expected_resources[id] = nil
            end
            test.is_nil(next(expected_resources))
            test.is_nil(original.data.policy.conditions)
            for _, id in ipairs({
                "kickside.mcp.api:create_credential.endpoint",
                "kickside.mcp.api:update_credential.endpoint",
                "kickside.mcp.api:list_credentials.endpoint",
                "kickside.mcp.api:revoke_credential.endpoint",
                "kickside.mcp.api:delete_credential.endpoint",
                "kickside.mcp.api:list_tools.endpoint",
                "kickside.mcp.api:list_components.endpoint",
                "kickside.mcp.api:list_presets.endpoint",
                "kickside.mcp.oauth:context.endpoint",
                "kickside.mcp.oauth:consent.endpoint",
            }) do
                test.not_nil(registry.get(id), id)
                local listed = {}
                for _, resource in ipairs(original.data.policy.resources) do listed[resource] = true end
                local expected = listed[id] and "allow" or "undefined"
                test.eq(policy:evaluate(actor, "access", id), expected, id)
                test.eq(bundle:evaluate(actor, "access", id), "allow", id)
                test.eq(policy:evaluate(actor, "funcs.call", id), "undefined", id)
            end
            test.eq(policy:evaluate(actor, "access", "kickside.mcp.api:read.endpoint"), "undefined")
            test.eq(policy:evaluate(actor, "access", "kickside.mcp.oauth:token.endpoint"), "undefined")
            for _, id in ipairs({ "unrelated.module:list.endpoint", "kickside.mcp_extension:list.endpoint" }) do
                test.eq(policy:evaluate(actor, "access", id), "undefined", id)
            end
        end)
        test.it("includes module discovery without an application blanket grant", function()
            local policies, seen = {}, {}
            local function include(id)
                if seen[id] then return end
                seen[id] = true
                local entry, entry_err = registry.get(id)
                test.is_nil(entry_err, id)
                test.not_nil(entry, id)
                local policy, policy_err = security.policy(id)
                test.is_nil(policy_err, id)
                policies[#policies + 1] = policy
                for _, child in ipairs(entry.meta.includes or {}) do include(child) end
            end
            include("kickside.mcp.security:module_access")
            local declaration = registry.get("kickside.mcp.security:module_access")
            test.is_true(type(declaration.meta.title) == "string" and declaration.meta.title ~= "")
            test.eq(declaration.meta.intent, "module_access")
            test.eq(declaration.meta.surface, "kickside.mcp")
            test.is_true(declaration.meta.private ~= true)
            local scope, scope_err = security.new_scope(policies)
            test.is_nil(scope_err)
            local actor = security.new_actor("module-member", {})
            test.eq(scope:evaluate(actor, "registry.get", "kickside.mcp:retention"), "allow")
            for _, action in ipairs({ "access", "registry.get", "funcs.call" }) do
                test.eq(scope:evaluate(actor, action, "unrelated.module:list.endpoint"), "undefined", action)
            end
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
