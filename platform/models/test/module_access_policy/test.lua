local test = require("test")
local registry = require("registry")
local security = require("security")
local funcs = require("funcs")
local models_repo = require("models_repo")
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
        test.it("grants only the resolver action and resource pairs", function()
            local scope = composed_scope("kickside.models.security:module_access")
            local actor = security.new_actor("resolver-policy-member", {})
            for _, resource in ipairs({"wippy.llm:model_resolver", "resolve"}) do
                for _, action in ipairs({"registry.get", "contract.get", "contract.open", "contract.call", "contract.implementations"}) do
                    local expected = (resource == "wippy.llm:model_resolver" and action == "contract.get")
                        or (resource == "resolve" and action == "contract.call")
                    test.eq(scope:evaluate(actor, action, resource), expected and "allow" or "undefined", action .. " " .. resource)
                end
            end
        end)
        test.it("keeps saved provider credentials inside provider execution", function()
            local profile_id = "member-credential-profile"
            local name = "member-credential-model"
            local profile, profile_err = models_repo.create_profile({
                id = profile_id, name = "Member credential profile",
                provider_id = "wippy.llm.openai_compat:provider",
                base_url = "https://provider.example.test/v1", api_key = "fixture-provider-secret",
            })
            test.is_nil(profile_err, tostring(profile_err))
            test.not_nil(profile)
            local card, save_err = models_repo.upsert_card({
                name = name, title = "Member credential model", provider_profile_id = profile_id,
                provider_id = "wippy.llm.openai_compat:provider", provider_model = "fixture",
                capabilities = {"embed"}, dimensions = 512, max_tokens = 8192, enabled = true,
            })
            test.is_nil(save_err, tostring(save_err))
            test.not_nil(card)
            local actor = security.new_actor("credential-member", {})
            local scope = assert(security.named_scope("app:selected_model_members"))
            local caller = funcs.new():with_actor(actor):with_scope(scope)
            local resolved, err = caller:call("kickside.models.test.module_access:resolve_probe", {model = name})
            local readable, read_err = caller:call("kickside.models.test.module_access:store_probe", {})
            local outside_scope = assert(security.named_scope("app:other_members"))
            local outside, outside_err = funcs.new():with_actor(actor):with_scope(outside_scope)
                :call("kickside.models.test.module_access:resolve_probe", {model = name})
            local _, delete_err = models_repo.delete_profile(profile_id)
            test.is_nil(delete_err, tostring(delete_err))
            test.is_nil(err, tostring(err))
            test.not_nil(resolved)
            test.eq(resolved.name, name)
            test.is_nil(readable, "Member reads the private model snapshot")
            test.not_nil(read_err, "Private store read is denied by the runtime")
            test.not_nil(tostring(read_err):find("not allowed to access store: kickside.models:cache", 1, true), tostring(read_err))
            test.is_nil(outside, "Unselected members resolve configured models")
            test.not_nil(outside_err, "The selected host group excludes other members at runtime")
            test.is_true(errors.is(outside_err, errors.PERMISSION_DENIED), tostring(outside_err))
            local serialized = require("json").encode(resolved)
            test.is_nil(serialized:find("fixture-provider-secret", 1, true), "Resolution discloses a saved provider credential")
        end)
        test.it("resolves saved models under the member execution scope", function()
            local name = "member-resolver-model"
            local card, save_err = models_repo.upsert_card({name = name, title = "Member model",
                provider_id = "wippy.llm.openai_compat:provider", provider_model = "fixture",
                capabilities = {"embed"}, dimensions = 512, max_tokens = 8192, output_tokens = 0, enabled = true})
            test.is_nil(save_err, tostring(save_err))
            test.not_nil(card)
            local actor = security.new_actor("model-member", {})
            local scope = composed_scope("kickside.models.security:module_access")
            test.eq(scope:evaluate(actor, "store.get", "kickside.models:cache"), "undefined")
            test.eq(scope:evaluate(actor, "db.get", "app:db"), "undefined")
            local resolved, err = funcs.new():with_actor(actor):with_scope(scope)
                :call("kickside.models.catalog:model_resolver_func", {model = name})
            local through_llm, llm_err = funcs.new():with_actor(actor):with_scope(scope)
                :call("kickside.models.test.module_access:resolve_probe", {model = name})
            local _, delete_err = models_repo.delete_card(name)
            test.is_nil(delete_err, tostring(delete_err))
            test.is_nil(err, tostring(err))
            test.not_nil(resolved, "Member resolution loses a configured model")
            test.eq(resolved.name, name)
            test.is_nil(llm_err, tostring(llm_err))
            test.not_nil(through_llm)
            test.eq(through_llm.name, name)
        end)
        test.it("admits exactly the listed endpoint identities", function()
            local policy_id = "kickside.models.security:models_endpoint_access"
            local declaration, declaration_err = registry.get(policy_id)
            test.is_nil(declaration_err)
            test.not_nil(declaration)
            test.is_nil(declaration.data.policy.conditions)
            local expected = {
                ["kickside.models.api:list_model_classes.endpoint"] = true,
                ["kickside.models.api:list_models.endpoint"] = true,
                ["kickside.models.api:models_by_name.endpoint"] = true,
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
            for _, id in ipairs({"kickside.models.security:user_security_scope"}) do
                local requirement, err = registry.get(id)
                test.is_nil(err, id)
                test.not_nil(requirement, id)
                test.eq(requirement.meta.value_kind, "security.scope", id)
                test.eq(requirement.data.default, "kickside.security.groups:members", id)
            end
        end)
        test.it("admits owned member endpoints and rejects other modules", function()
            local policy, err = security.policy("kickside.models.security:models_endpoint_access")
            test.is_nil(err)
            test.not_nil(policy)
            local actor = security.new_actor("module-member", {})
            local bundle = composed_scope("kickside.models.security:module_access")
            for _, id in ipairs({
                "kickside.models.api:list_models.endpoint",
                "kickside.models.api:list_model_classes.endpoint",
                "kickside.models.api:models_by_name.endpoint",
            }) do
                test.not_nil(registry.get(id), id)
                test.eq(policy:evaluate(actor, "access", id), "allow", id)
                test.eq(bundle:evaluate(actor, "access", id), "allow", id)
                test.eq(policy:evaluate(actor, "access", (id .. ".unlisted")), "undefined", id)
                test.eq(policy:evaluate(actor, "funcs.call", id), "undefined", id)
            end
            for _, id in ipairs({ "unrelated.module:list.endpoint", "kickside.models_extension:list.endpoint" }) do
                test.eq(policy:evaluate(actor, "access", id), "undefined", id)
            end
        end)
        test.it("includes module discovery without an application blanket grant", function()
            local declaration = registry.get("kickside.models.security:module_access")
            test.is_true(type(declaration.meta.title) == "string" and declaration.meta.title ~= "")
            test.eq(declaration.meta.intent, "module_access")
            test.eq(declaration.meta.surface, "kickside.models")
            test.is_true(declaration.meta.private ~= true)
            local scope, scope_err = composed_scope("kickside.models.security:module_access")
            test.is_nil(scope_err)
            local actor = security.new_actor("module-member", {})
            test.eq(scope:evaluate(actor, "registry.get", "kickside.models:db_config"), "allow")
            for _, action in ipairs({ "access", "registry.get", "funcs.call" }) do
                test.eq(scope:evaluate(actor, action, "unrelated.module:list.endpoint"), "undefined", action)
            end
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return {
    run = function(options) return run_cases(options) end,
    store_probe = function()
        local snapshot, err = require("store").get("kickside.models:cache")
        if err then return nil, err end
        local value, read_err = snapshot:get("snapshot")
        snapshot:release()
        return value, read_err
    end,
    resolve_probe = function(input)
        local definition, err = require("contract").get("wippy.llm:model_resolver")
        if err then return nil, err end
        local _, open_err = definition:open()
        if open_err then return nil, open_err end
        return require("llm").resolve_model(input.model)
    end,
}
