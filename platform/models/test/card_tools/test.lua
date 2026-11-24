-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Agent tools over kickside.models.cards:cards: ModelCardsRead lists and reads
-- catalog cards, ModelCardsManage saves, retires and deletes them. Both run under
-- the scope composed from the kickside.models.security:card_tools policy.
local test = require("test")
local funcs = require("funcs")
local security = require("security")
local registry = require("registry")
local models_repo = require("models_repo")
local model_catalog = require("model_catalog")

local TRAIT = "kickside.models.traits:card_manager"
local READ = "kickside.models.traits:cards_read"
local MANAGE = "kickside.models.traits:cards_manage"
local POLICY = "kickside.models.security:card_tools"
local NAME = "ct-tool-card"

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

local function card_body(overrides: any?): any
    local body = {
        name = NAME,
        title = "Tool card",
        provider_id = "wippy.llm.openai:provider",
        provider_model = "ct-tool-card-v1",
        capabilities = { "generate" },
        class = { "ct-tool-class" },
        max_tokens = 16384,
        output_tokens = 2048,
        metadata = { train = { weights_digest = "sha256:abc", manifest_sha256 = "def" } },
    }
    for k, v in pairs(overrides or {}) do body[k] = v end
    return body
end

local function invoke(id: string, args: any): (any, any)
    return funcs.new()
        :with_actor(security.new_actor("card-tools-operator", {}))
        :with_scope(composed_scope(POLICY))
        :call(id, args)
end

local function ok(id: string, args: any): any
    local result, err = invoke(id, args)
    test.is_nil(err, tostring(err))
    test.not_nil(result, "no result from " .. id)
    return result
end

local function cleanup()
    models_repo.delete_card(NAME)
    models_repo.delete_card(NAME .. "-b")
end

local function define_tests()
    test.describe("card tools: declarations", function()
        test.it("declares a trait carrying the read and manage tools", function()
            local trait = assert(registry.get(TRAIT))
            test.eq(trait.meta.type, "agent.trait")
            test.is_true(type(trait.meta.title) == "string" and trait.meta.title ~= "")
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
                test.eq(#entry.meta.mcp.required_scopes, 1, id)
                test.eq(entry.meta.mcp.required_scopes[1], scope, id)
            end
        end)
    end)

    test.describe("card tools: card_tools policy", function()
        test.it("is an assignable tool capability outside the member grant", function()
            local declaration = assert(registry.get(POLICY))
            test.eq(declaration.meta.intent, "tool_access")
            test.eq(declaration.meta.surface, "kickside.models")
            test.is_true(type(declaration.meta.title) == "string" and declaration.meta.title ~= "")
            test.is_true(declaration.meta.private ~= true)
            test.eq(#(declaration.data.groups or {}), 0)
        end)

        test.it("admits the trait and both tools", function()
            local scope = composed_scope(POLICY)
            local actor = security.new_actor("card-tools-operator", {})
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
            for _, id in ipairs({ READ, MANAGE }) do
                test.eq(scope:evaluate(actor, "funcs.call", id), "undefined", id)
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

    test.describe("card tools: ModelCardsRead", function()
        test.it("lists compact card summaries in pages", function()
            ok(MANAGE, { action = "upsert", card = card_body() })
            ok(MANAGE, { action = "upsert", card = card_body({ name = NAME .. "-b" }) })
            ok(MANAGE, { action = "disable", name = NAME .. "-b" })
            local first = ok(READ, { action = "list", q = "CT-TOOL-CARD", limit = 1 })
            test.eq(first.success, true)
            test.eq(first.count, 1)
            test.eq(first.cards[1].name, NAME)
            test.eq(first.cards[1].enabled, true)
            test.eq(first.cards[1].provider_model, "ct-tool-card-v1")
            test.is_nil(first.cards[1].metadata)
            test.eq(first.next_cursor, NAME)
            local second = ok(READ, { action = "list", q = "ct-tool-card", limit = 1, cursor = first.next_cursor })
            test.eq(second.count, 1)
            test.eq(second.cards[1].name, NAME .. "-b")
            test.eq(second.cards[1].enabled, false)
            test.is_nil(second.next_cursor)
            cleanup()
        end)

        test.it("reads one full card, retired cards included", function()
            ok(MANAGE, { action = "upsert", card = card_body() })
            ok(MANAGE, { action = "disable", name = NAME })
            local result = ok(READ, { action = "get", name = NAME })
            test.eq(result.success, true)
            test.eq(result.card.name, NAME)
            test.eq(result.card.enabled, false)
            test.eq(result.card.metadata.train.weights_digest, "sha256:abc")
            cleanup()
        end)

        test.it("answers a domain error for a card the catalog does not hold", function()
            local result = ok(READ, { action = "get", name = "ct-never-saved" })
            test.eq(result.success, false)
            test.not_nil(result.error)
        end)

        test.it("rejects an action without its required field", function()
            local result, err = invoke(READ, { action = "get" })
            test.is_nil(result)
            test.not_nil(err)
            test.eq(err:kind(), errors.INVALID)
        end)

        test.it("rejects mutating actions", function()
            local result, err = invoke(READ, { action = "delete", name = NAME })
            test.is_nil(result)
            test.eq(err:kind(), errors.INVALID)
        end)
    end)

    test.describe("card tools: ModelCardsManage", function()
        test.it("saves, retires and deletes a card through the cards contract", function()
            local saved = ok(MANAGE, { action = "upsert", card = card_body() })
            test.eq(saved.success, true, tostring(saved.error))
            test.eq(saved.card.name, NAME)
            test.eq(model_catalog.get_by_name(NAME).name, NAME)

            local refused = ok(MANAGE, { action = "delete", name = NAME })
            test.eq(refused.success, false)
            test.eq(refused.code, "card_enabled", "an enabled card is refused with a code")
            test.contains(tostring(refused.error), "action disable")
            test.not_nil(model_catalog.get_by_name(NAME))

            local retired = ok(MANAGE, { action = "disable", name = NAME })
            test.eq(retired.success, true, tostring(retired.error))
            test.eq(retired.card.enabled, false)
            test.is_nil(model_catalog.get_by_name(NAME))

            local deleted = ok(MANAGE, { action = "delete", name = NAME })
            test.eq(deleted.success, true, tostring(deleted.error))
            test.eq(deleted.name, NAME)
            for _, card in ipairs(assert(model_catalog.get_all_public())) do test.neq(card.name, NAME) end
        end)

        test.it("answers the contract refusal of a credential-bearing card", function()
            local result = ok(MANAGE, { action = "upsert", card = card_body({
                options = { links = { "https://user:synthetic@example.invalid/private" } },
            }) })
            test.eq(result.success, false)
            test.not_nil(result.error)
            test.is_nil(model_catalog.get_by_name(NAME))
        end)

        test.it("rejects fields another action owns", function()
            local result, err = invoke(MANAGE, { action = "disable", name = NAME, card = card_body() })
            test.is_nil(result)
            test.eq(err:kind(), errors.INVALID)
        end)

        test.it("rejects read actions", function()
            local result, err = invoke(MANAGE, { action = "list" })
            test.is_nil(result)
            test.eq(err:kind(), errors.INVALID)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
