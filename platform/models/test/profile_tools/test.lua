-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Agent tools over kickside.models.profiles:profiles: ModelProfilesRead lists and
-- reads provider profiles, ModelProfilesManage creates, updates and deletes them.
-- Both run under the scope composed from the kickside.models.security:profile_tools
-- policy. Replies carry the names of stored secrets, never their values.
local test = require("test")
local funcs = require("funcs")
local security = require("security")
local registry = require("registry")
local json = require("json")
local models_repo = require("models_repo")

local TRAIT = "kickside.models.traits:profile_manager"
local READ = "kickside.models.traits:profiles_read"
local MANAGE = "kickside.models.traits:profiles_manage"
local POLICY = "kickside.models.security:profile_tools"
local ID = "pt-tool-profile"
local HELD = "pt-held-profile"
local SYNTHETIC_KEY = "synthetic-key-0123456789"
local SYNTHETIC_HEADER = "synthetic-header-value-9876"

local function composed_scope(root: string): any
    local policies, seen = {}, {}
    local function include(id: string)
        if seen[id] then return end
        seen[id] = true
        local entry = assert(registry.get(id), id)
        policies[#policies + 1] = assert(security.policy(id))
        for _, child in ipairs(entry.meta.includes or {}) do include(child) end
    end
    include(root)
    return assert(security.new_scope(policies))
end

local function profile_body(overrides: any?): any
    local body = {
        id = ID,
        name = "Tool profile",
        provider_id = "wippy.llm.openai:provider",
        base_url = "https://example.invalid/v1",
        api_key = SYNTHETIC_KEY,
        headers = { ["X-Synthetic"] = SYNTHETIC_HEADER },
    }
    for k, v in pairs(overrides or {}) do body[k] = v end
    return body
end

local function invoke(id: string, args: any): (any, any)
    return funcs.new()
        :with_actor(security.new_actor("profile-tools-operator", {}))
        :with_scope(composed_scope(POLICY))
        :call(id, args)
end

local function ok(id: string, args: any): any
    local result, err = invoke(id, args)
    test.is_nil(err, tostring(err))
    test.not_nil(result, "no result from " .. id)
    return result
end

local function leaks(value: any): boolean
    local text = json.encode(value)
    return text:find(SYNTHETIC_KEY, 1, true) ~= nil or text:find(SYNTHETIC_HEADER, 1, true) ~= nil
end

local function cleanup()
    models_repo.delete_profile(ID)
    models_repo.delete_profile(ID .. "-b")
end

local function define_tests()
    test.describe("profile tools: declarations", function()
        test.it("declares a trait carrying the read and manage tools", function()
            local trait = assert(registry.get(TRAIT))
            test.eq(trait.meta.type, "agent.trait")
            test.is_true(type(trait.data.prompt) == "string" and trait.data.prompt ~= "")
            local tools = {}
            for _, id in ipairs(trait.data.tools) do tools[id] = true end
            test.is_true(tools[READ] == true, READ)
            test.is_true(tools[MANAGE] == true, MANAGE)
        end)

        test.it("splits MCP scopes between reading and managing", function()
            for id, scope in pairs({ [READ] = "state.read", [MANAGE] = "state.write" }) do
                local entry = assert(registry.get(id), id)
                test.eq(entry.meta.type, "tool", id)
                test.is_true(type(entry.meta.llm_alias) == "string" and entry.meta.llm_alias ~= "", id)
                test.not_nil(entry.meta.input_schema, id)
                test.not_nil(entry.meta.output_schema, id)
                test.eq(entry.meta.mcp.required_scopes[1], scope, id)
            end
        end)
    end)

    test.describe("profile tools: profile_tools policy", function()
        test.it("is an assignable tool capability outside the member grant", function()
            local declaration = assert(registry.get(POLICY))
            test.eq(declaration.meta.intent, "tool_access")
            test.eq(declaration.meta.surface, "kickside.models")
            test.eq(#(declaration.data.groups or {}), 0)
        end)

        test.it("admits the trait and both tools, and no repository or database access", function()
            local scope = composed_scope(POLICY)
            local actor = security.new_actor("profile-tools-operator", {})
            for _, id in ipairs({ TRAIT, READ, MANAGE }) do
                test.eq(scope:evaluate(actor, "registry.get", id), "allow", id)
            end
            for _, id in ipairs({ READ, MANAGE }) do
                test.eq(scope:evaluate(actor, "funcs.call", id), "allow", id)
            end
            test.eq(scope:evaluate(actor, "funcs.call", "kickside.models.persist:repo"), "undefined")
            test.eq(scope:evaluate(actor, "db.get", "*"), "undefined")
        end)

        test.it("keeps the trait and tools out of the member module grant", function()
            local scope = composed_scope("kickside.models.security:module_access")
            local actor = security.new_actor("module-member", {})
            for _, id in ipairs({ TRAIT, READ, MANAGE }) do
                test.eq(scope:evaluate(actor, "registry.get", id), "undefined", id)
            end
        end)

        test.it("refuses a member caller", function()
            local result, err = funcs.new()
                :with_actor(security.new_actor("module-member", {}))
                :with_scope(composed_scope("kickside.models.security:module_access"))
                :call(READ, { action = "list" })
            test.is_nil(result)
            test.not_nil(err)
        end)
    end)

    test.describe("profile tools: ModelProfilesManage", function()
        test.it("creates a profile and returns only the names of its secrets", function()
            local created = ok(MANAGE, { action = "create", profile = profile_body() })
            test.eq(created.success, true, tostring(created.error))
            test.eq(created.profile.id, ID)
            test.eq(created.profile.has_api_key, true)
            test.is_true(#created.profile.secret_fields >= 2)
            test.eq(created.profile.status, "unhealthy", "an enabled profile is tested at creation")
            test.is_false(leaks(created))
            local stored = models_repo.get_profile(ID)
            test.eq(stored.secret_config.api_key, SYNTHETIC_KEY)
            cleanup()
        end)

        test.it("leaves a disabled profile untested", function()
            local created = ok(MANAGE, { action = "create", profile = profile_body({ enabled = false }) })
            test.eq(created.success, true, tostring(created.error))
            test.eq(created.profile.status, "unknown")
            test.eq(created.profile.message, "")
            cleanup()
        end)

        test.it("accepts an environment reference in place of a stored secret", function()
            local created = ok(MANAGE, { action = "create", profile = {
                id = ID, name = "Env profile", provider_id = "wippy.llm.openai:provider", api_key_env = "PT_SYNTHETIC_KEY",
            } })
            test.eq(created.success, true, tostring(created.error))
            test.eq(created.profile.has_api_key, false)
            test.eq(created.profile.has_api_key_env, true)
            test.eq(created.profile.config.api_key_env, "PT_SYNTHETIC_KEY")
            cleanup()
        end)

        test.it("updates settings and keeps stored secrets the patch omits", function()
            ok(MANAGE, { action = "create", profile = profile_body() })
            local updated = ok(MANAGE, { action = "update", id = ID, profile = { name = "Renamed", enabled = false } })
            test.eq(updated.success, true, tostring(updated.error))
            test.eq(updated.profile.name, "Renamed")
            test.eq(updated.profile.enabled, false)
            test.eq(updated.profile.has_api_key, true)
            test.is_false(leaks(updated))
            test.eq(models_repo.get_profile(ID).secret_config.api_key, SYNTHETIC_KEY)
            cleanup()
        end)

        test.it("replaces a secret on update without returning either value", function()
            ok(MANAGE, { action = "create", profile = profile_body() })
            local updated = ok(MANAGE, { action = "update", id = ID, profile = { api_key = "synthetic-rotated-key" } })
            test.eq(updated.success, true, tostring(updated.error))
            test.is_false(json.encode(updated):find("synthetic-rotated-key", 1, true) ~= nil)
            test.eq(models_repo.get_profile(ID).secret_config.api_key, "synthetic-rotated-key")
            cleanup()
        end)

        test.it("deletes a profile", function()
            ok(MANAGE, { action = "create", profile = profile_body() })
            local deleted = ok(MANAGE, { action = "delete", id = ID })
            test.eq(deleted.success, true, tostring(deleted.error))
            test.eq(deleted.id, ID)
            test.is_nil(models_repo.get_profile(ID))
        end)

        test.it("tests a profile whose environment reference does not resolve unhealthy, naming the variable", function()
            ok(MANAGE, { action = "create", profile = {
                id = ID, name = "Unbound env profile", provider_id = "wippy.llm.openai:provider",
                base_url = "https://example.invalid/v1", api_key_env = "PT_UNDECLARED_KEY",
            } })
            local tested = ok(MANAGE, { action = "test", id = ID })
            test.eq(tested.success, false)
            test.eq(tested.code, "profile_unhealthy")
            test.contains(tostring(tested.error), "api_key_env PT_UNDECLARED_KEY")
            local read = ok(READ, { action = "get", id = ID })
            test.eq(read.profile.status, "unhealthy", "the test records the profile status")
            test.contains(tostring(read.profile.message), "PT_UNDECLARED_KEY")
            cleanup()
        end)

        test.it("tests an enabled profile it creates, so it carries a tested status", function()
            local created = ok(MANAGE, { action = "create", profile = {
                id = ID, name = "Created untested", provider_id = "wippy.llm.openai:provider",
                base_url = "https://example.invalid/v1", api_key_env = "PT_UNDECLARED_KEY",
            } })
            test.eq(created.success, true, tostring(created.error))
            test.eq(created.profile.status, "unhealthy", "a created enabled profile is tested")
            test.contains(tostring(created.profile.message), "PT_UNDECLARED_KEY")
            cleanup()
        end)

        test.it("tests a profile against the model a card routes when one is given, leaving the profile status as it was", function()
            ok(MANAGE, { action = "create", profile = {
                id = ID, name = "Scoped test profile", provider_id = "wippy.llm.openai:provider",
                base_url = "https://example.invalid/v1", api_key_env = "PT_UNDECLARED_KEY",
            } })
            local before = ok(READ, { action = "get", id = ID }).profile
            local tested = ok(MANAGE, { action = "test", id = ID, model = "card-model" })
            test.eq(tested.success, false)
            test.eq(tested.code, "profile_unhealthy")
            local after = ok(READ, { action = "get", id = ID }).profile
            test.eq(after.status, before.status)
            test.eq(after.message, before.message, "a test scoped to a card's model records no profile status")
            cleanup()
        end)

        test.it("refuses to delete a profile a declared holder holds, naming each holder", function()
            ok(MANAGE, { action = "create", profile = profile_body({ id = HELD }) })
            local refused = ok(MANAGE, { action = "delete", id = HELD })
            test.eq(refused.success, false)
            test.eq(refused.code, "profile_in_use")
            test.contains(tostring(refused.error), "fixture driver fx-driver")
            test.eq(#refused.holders, 1)
            test.eq(refused.holders[1].kind, "fixture driver")
            test.eq(refused.holders[1].id, "fx-driver")
            test.not_nil(models_repo.get_profile(HELD), "a held profile stays stored")
            models_repo.delete_profile(HELD)
        end)

        test.it("answers a refusal for an invalid profile", function()
            local result = ok(MANAGE, { action = "create", profile = profile_body({ provider_id = "no.such:provider" }) })
            test.eq(result.success, false)
            test.not_nil(result.error)
            test.is_nil(models_repo.get_profile(ID))
        end)

        test.it("answers a refusal for updating an unknown profile", function()
            local result = ok(MANAGE, { action = "update", id = "pt-never-saved", profile = { name = "x" } })
            test.eq(result.success, false)
        end)

        test.it("rejects fields another action owns", function()
            local result, err = invoke(MANAGE, { action = "delete", id = ID, profile = profile_body() })
            test.is_nil(result)
            test.eq(err:kind(), errors.INVALID)
        end)

        test.it("rejects read actions", function()
            local result, err = invoke(MANAGE, { action = "list" })
            test.is_nil(result)
            test.eq(err:kind(), errors.INVALID)
        end)
    end)

    test.describe("profile tools: ModelProfilesRead", function()
        test.it("lists profiles without secret values", function()
            ok(MANAGE, { action = "create", profile = profile_body() })
            ok(MANAGE, { action = "create", profile = profile_body({ id = ID .. "-b", name = "Tool profile b" }) })
            local listed = ok(READ, { action = "list" })
            test.eq(listed.success, true)
            local found = 0
            for _, profile in ipairs(listed.profiles) do
                if profile.id == ID or profile.id == ID .. "-b" then found = found + 1 end
            end
            test.eq(found, 2)
            test.eq(listed.count, #listed.profiles)
            test.is_false(leaks(listed))
            cleanup()
        end)

        test.it("reads one profile and the names of its secrets", function()
            ok(MANAGE, { action = "create", profile = profile_body() })
            local result = ok(READ, { action = "get", id = ID })
            test.eq(result.success, true)
            test.eq(result.profile.id, ID)
            test.eq(result.profile.has_api_key, true)
            test.is_false(leaks(result))
            cleanup()
        end)

        test.it("answers a refusal for a profile the store does not hold", function()
            local result = ok(READ, { action = "get", id = "pt-never-saved" })
            test.eq(result.success, false)
            test.not_nil(result.error)
        end)

        test.it("rejects mutating actions", function()
            local result, err = invoke(READ, { action = "delete", id = ID })
            test.is_nil(result)
            test.eq(err:kind(), errors.INVALID)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
