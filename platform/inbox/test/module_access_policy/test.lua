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
local function scope_for_policies(policy_ids)
    local policies = {}
    for _, id in ipairs(policy_ids) do policies[#policies + 1] = assert(security.policy(id)) end
    return assert(security.new_scope(policies))
end
local function has_policy(entry, policy_id)
    local policies = entry and entry.data and entry.data.security and entry.data.security.policies or {}
    for _, ref in ipairs(policies) do
        if ref == policy_id or (type(ref) == "table" and ref.id == policy_id) then return true end
    end
    return false
end
local function define_tests()
    test.describe("Module access composition", function()
        test.it("admits exactly the listed endpoint identities", function()
            local policy_id = "kickside.inbox.security:inbox_endpoint_access"
            local declaration, declaration_err = registry.get(policy_id)
            test.is_nil(declaration_err)
            test.not_nil(declaration)
            test.is_nil(declaration.data.policy.conditions)
            local expected = {
                ["kickside.inbox.api:create_item.endpoint"] = true,
                ["kickside.inbox.api:delete_item.endpoint"] = true,
                ["kickside.inbox.api:list_inbox.endpoint"] = true,
                ["kickside.inbox.api:list_item_types.endpoint"] = true,
                ["kickside.inbox.api:resolve_item.endpoint"] = true,
            }
            local listed = {}
            for _, id in ipairs(declaration.data.policy.resources) do
                test.is_true(expected[id] == true, id)
                test.is_nil(listed[id], id)
                listed[id] = true
                local entry, err = registry.get(id)
                test.is_nil(err, id)
                test.not_nil(entry, id)
                test.eq(entry.kind, "http.endpoint", id)
            end
            for id in pairs(expected) do test.is_true(listed[id] == true, id) end
            local policy, policy_err = security.policy(policy_id)
            test.is_nil(policy_err)
            local actor = security.new_actor("listed-endpoint-member", {})
            local endpoints, find_err = registry.find({[".kind"] = "http.endpoint"})
            test.is_nil(find_err)
            for _, entry in ipairs(endpoints) do
                local id = tostring(entry.id)
                test.eq(policy:evaluate(actor, "access", id), expected[id] and "allow" or "undefined", id)
            end
            for id in pairs(expected) do
                test.eq(policy:evaluate(actor, "access", id .. ".unlisted"), "undefined", id)
            end
        end)
        test.it("declares a compatible platform Members default for every member requirement", function()
            for _, id in ipairs({"kickside.inbox.security:user_security_scope"}) do
                local requirement, err = registry.get(id)
                test.is_nil(err, id)
                test.not_nil(requirement, id)
                test.eq(requirement.meta.value_kind, "security.scope", id)
                test.eq(requirement.data.default, "kickside.security.groups:members", id)
            end
        end)
        test.it("admits owned member endpoints and rejects other modules", function()
            local policy, err = security.policy("kickside.inbox.security:inbox_endpoint_access")
            test.is_nil(err)
            test.not_nil(policy)
            local actor = security.new_actor("module-member", {})
            local bundle = composed_scope("kickside.inbox.security:module_access")
            for _, id in ipairs({
                "kickside.inbox.api:list_inbox.endpoint",
                "kickside.inbox.api:list_item_types.endpoint",
                "kickside.inbox.api:create_item.endpoint",
                "kickside.inbox.api:resolve_item.endpoint",
                "kickside.inbox.api:delete_item.endpoint",
            }) do
                test.not_nil(registry.get(id), id)
                test.eq(policy:evaluate(actor, "access", id), "allow", id)
                test.eq(bundle:evaluate(actor, "access", id), "allow", id)
                test.eq(policy:evaluate(actor, "access", (id .. ".unlisted")), "undefined", id)
                test.eq(policy:evaluate(actor, "funcs.call", id), "undefined", id)
            end
            for _, id in ipairs({ "unrelated.module:list.endpoint", "kickside.inbox_extension:list.endpoint" }) do
                test.eq(policy:evaluate(actor, "access", id), "undefined", id)
            end
        end)
        test.it("includes module discovery without an application blanket grant", function()
            local declaration = registry.get("kickside.inbox.security:module_access")
            test.is_true(type(declaration.meta.title) == "string" and declaration.meta.title ~= "")
            test.eq(declaration.meta.intent, "module_access")
            test.eq(declaration.meta.surface, "kickside.inbox")
            test.is_true(declaration.meta.private ~= true)
            local scope, scope_err = composed_scope("kickside.inbox.security:module_access")
            test.is_nil(scope_err)
            local actor = security.new_actor("module-member", {})
            test.eq(scope:evaluate(actor, "registry.get", "kickside.inbox:inbox_view"), "allow")
            for _, action in ipairs({ "access", "registry.get", "funcs.call" }) do
                test.eq(scope:evaluate(actor, action, "unrelated.module:list.endpoint"), "undefined", action)
            end
        end)
        test.it("keeps the review assignee existence check on the arm, not the caller bundle", function()
            local policy_ids = {
                "kickside.inbox.security:review_assignee_directory_get",
                "kickside.inbox.security:review_assignee_directory_open",
                "kickside.inbox.security:review_assignee_directory_exists",
            }
            local actor = security.new_actor("review-arm", {})
            local arm_scope = scope_for_policies(policy_ids)

            test.eq(arm_scope:evaluate(actor, "contract.get", "kickside.contract:directory"), "allow")
            test.eq(arm_scope:evaluate(actor, "contract.open", "kickside.users.directory:directory_binding"), "allow")
            test.eq(arm_scope:evaluate(actor, "contract.call", "exists"), "allow")
            local granted = {
                ["contract.get|kickside.contract:directory"] = true,
                ["contract.open|kickside.users.directory:directory_binding"] = true,
                ["contract.call|exists"] = true,
            }
            for _, action in ipairs({ "contract.get", "contract.open", "contract.call" }) do
                for _, resource in ipairs({ "kickside.contract:directory", "kickside.users.directory:directory_binding", "exists" }) do
                    local key = action .. "|" .. resource
                    test.eq(arm_scope:evaluate(actor, action, resource), granted[key] and "allow" or "undefined", key)
                end
            end
            for _, method in ipairs({ "search", "resolve", "groups" }) do
                test.eq(arm_scope:evaluate(actor, "contract.call", method), "undefined", method)
            end
            for _, check in ipairs({
                { "contract.open", "kickside.contract:directory" },
                { "contract.get", "kickside.users.directory:directory_binding" },
                { "contract.call", "kickside.contract:directory" },
                { "contract.get", "unrelated:contract" },
                { "contract.open", "unrelated:binding" },
            }) do
                test.eq(arm_scope:evaluate(actor, check[1], check[2]), "undefined", check[1] .. " " .. check[2])
            end

            local arm = registry.get("kickside.inbox:arm_decision")
            test.not_nil(arm)
            for _, policy_id in ipairs(policy_ids) do test.is_true(has_policy(arm, policy_id), policy_id) end
            for _, id in ipairs({ "kickside.inbox:create_decision", "kickside.inbox:preview_decision" }) do
                local entry = registry.get(id)
                test.not_nil(entry, id)
                for _, policy_id in ipairs(policy_ids) do test.is_false(has_policy(entry, policy_id), id .. " " .. policy_id) end
            end

            local caller = composed_scope("kickside.inbox.security:module_access")
            for _, check in ipairs({
                { "contract.get", "kickside.contract:directory" },
                { "contract.open", "kickside.users.directory:directory_binding" },
                { "contract.call", "exists" },
            }) do
                test.eq(caller:evaluate(actor, check[1], check[2]), "undefined", check[1] .. " " .. check[2])
            end
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
