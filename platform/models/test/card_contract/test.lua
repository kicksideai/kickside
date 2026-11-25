-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Contract: registering and retiring model cards through
-- kickside.models.cards:cards. The contract shares its write path with
-- PUT /models/cards, so a card it saves is the card the admin save would store.
local test = require("test")
local funcs = require("funcs")
local security = require("security")
local contract = require("contract")
local registry = require("registry")
local models_repo = require("models_repo")
local model_catalog = require("model_catalog")
local card_service = require("card_service")
local models_cache = require("models_cache")
local sql = require("sql")
local json = require("json")

local UPSERT = "kickside.models.cards:upsert_card"
local DISABLE = "kickside.models.cards:disable_card"
local DELETE = "kickside.models.cards:delete_card"
local LIST = "kickside.models.cards:list_cards"
local SUMMARIES = "kickside.models.cards:list_card_summaries"
local GET = "kickside.models.cards:get_card"
local CONTRACT = "kickside.models.cards:cards"
local BINDING = "kickside.models.cards:cards_binding"
local NAME = "cc-trained-model"

local TRAIN = {
    weights_digest = "sha256:0123456789abcdef",
    manifest_sha256 = "fedcba9876543210",
    lineage = { parent = "base-model", run = "run-1" },
}

local function card_body(overrides: any?): any
    local body = {
        name = NAME,
        title = "Trained model",
        provider_id = "wippy.llm.openai:provider",
        provider_model = "cc-trained-model-v1",
        capabilities = { "generate" },
        class = { "cc-trained-class" },
        max_tokens = 32768,
        output_tokens = 4096,
        metadata = { train = TRAIN },
    }
    for k, v in pairs(overrides or {}) do body[k] = v end
    return body
end

local function call(id: string, args: any): any
    local result, err = funcs.new():call(id, args)
    test.is_nil(err, "call " .. id)
    test.not_nil(result, "no result from " .. id)
    return result
end

local function registrar(): any
    local scope = assert(security.new_scope({ assert(security.policy("kickside.models.security:card_registrar")) }))
    return assert(assert(contract.get(CONTRACT))
        :with_actor(security.new_actor("module-registrar", {})):with_scope(scope):open())
end

local function overlay_count(name: string): number
    local overlays, err = models_repo.list_card_overlays()
    test.is_nil(err)
    local n = 0
    for _, item in ipairs(overlays) do
        if item.name == name then n = n + 1 end
    end
    return n
end

local function in_class(class_name: string, name: string): boolean
    for _, card in ipairs(model_catalog.get_by_class(class_name) or {}) do
        if card.name == name then return true end
    end
    return false
end

local function cleanup()
    models_repo.delete_card(NAME)
end

local function stored_profile(id: string): any
    local db = assert(sql.get("app:db"))
    local rows, err = db:query("SELECT * FROM kickside_model_provider_profiles WHERE id = $1", { id })
    db:release()
    test.is_nil(err)
    return rows[1]
end

local function stored_card(name: string): any
    local db = assert(sql.get("app:db"))
    local rows, err = db:query("SELECT * FROM kickside_model_cards WHERE name = $1", { name })
    db:release()
    test.is_nil(err)
    return rows[1]
end

local function with_existing_provider(fn: (any) -> ())
    local profile = assert(models_repo.create_profile({
        id = "cc-existing-provider", name = "Existing provider",
        provider_id = "wippy.llm.openai:provider", api_key = "cc-existing-credential",
    }))
    local ok, err = pcall(function()
        assert(models_repo.upsert_card(card_body({
            name = "cc-existing-card", provider_profile_id = profile.id,
            class = { "cc-existing-class" },
        })))
        fn(profile)
    end)
    local deleted, delete_err = models_repo.delete_card(NAME)
    test.eq(deleted, true, tostring(delete_err))
    deleted, delete_err = models_repo.delete_profile(profile.id)
    test.eq(deleted, true, tostring(delete_err))
    if not ok then error(err, 0) end
end

local function define_tests()
    test.describe("cards contract: upsert_card", function()
        test.it("registers a card that resolves by name and class, with its train metadata", function()
            local result = call(UPSERT, card_body())
            test.eq(result.success, true, tostring(result.error))
            test.eq(result.model.name, NAME)
            test.eq(result.model.metadata.train.weights_digest, TRAIN.weights_digest)
            test.eq(result.model.metadata.train.manifest_sha256, TRAIN.manifest_sha256)
            test.eq(result.model.metadata.train.lineage.run, "run-1")

            local resolved, err = model_catalog.get_by_name(NAME)
            test.is_nil(err)
            test.eq(resolved.providers[1].provider_model, "cc-trained-model-v1")
            test.is_true(in_class("cc-trained-class", NAME))
            cleanup()
        end)

        test.it("is idempotent by card name and updates in place", function()
            call(UPSERT, card_body())
            local again = call(UPSERT, card_body({ priority = 33 }))
            test.eq(again.success, true, tostring(again.error))
            test.eq(overlay_count(NAME), 1)
            test.eq(model_catalog.get_by_name(NAME).priority, 33)
            test.eq(again.model.metadata.train.weights_digest, TRAIN.weights_digest)
            cleanup()
        end)

        test.it("stores the same card as the shared admin save path", function()
            local via_contract = call(UPSERT, card_body())
            cleanup()
            local via_service = card_service.save(card_body())
            test.eq(via_contract.model.provider_model, via_service.provider_model)
            test.eq(via_contract.model.max_tokens, via_service.max_tokens)
            test.eq(via_contract.model.metadata.train.manifest_sha256, via_service.metadata.train.manifest_sha256)
            cleanup()
        end)

        test.it("rejects a body without a name", function()
            local result = call(UPSERT, { provider_model = "x" })
            test.eq(result.success, false)
        end)

        test.it("rejects train metadata that lacks its digests", function()
            local result = call(UPSERT, card_body({ metadata = { train = { lineage = {} } } }))
            test.eq(result.success, false)
            test.eq(overlay_count(NAME), 0)
        end)

        test.it("keeps registrar credentials out of stored options and metadata", function()
            local credential = "synthetic-card-credential"
            local input = card_body({ options = { nested = { access_key = credential, token_limit = 5 } } })
            input.metadata = { train = TRAIN, vendor = { access_key = credential, enabled = true } }
            local cards = registrar()
            local result = assert(cards:upsert_card(input))
            test.eq(result.success, true)
            local row = assert(stored_card(NAME))
            local options = assert(json.decode(row.options_json))
            local metadata = assert(json.decode(row.metadata_json))
            test.is_nil(options.nested.access_key)
            test.is_nil(metadata.vendor.access_key)
            test.eq(options.nested.token_limit, 5)
            test.eq(metadata.vendor.enabled, true)
            test.eq(metadata.train.weights_digest, TRAIN.weights_digest)
            cleanup()
        end)

        test.it("rejects credential-bearing URLs before writing a card", function()
            local cards = registrar()
            local result = assert(cards:upsert_card(card_body({
                options = { links = { "https://example.invalid/path?%61pi_key=synthetic" } },
            })))
            test.eq(result.success, false)
            test.is_nil(stored_card(NAME))
        end)
    end)

    test.describe("cards contract: disable_card", function()
        test.it("retires a card from name and class resolution and keeps its row", function()
            call(UPSERT, card_body())
            local result = call(DISABLE, { name = NAME })
            test.eq(result.success, true, tostring(result.error))
            test.eq(result.model.enabled, false)
            test.eq(result.model.metadata.train.weights_digest, TRAIN.weights_digest)
            local resolved = model_catalog.get_by_name(NAME)
            test.is_nil(resolved)
            test.is_true(not in_class("cc-trained-class", NAME))
            test.eq(overlay_count(NAME), 1)
            cleanup()
        end)

        test.it("is idempotent", function()
            call(UPSERT, card_body())
            call(DISABLE, { name = NAME })
            -- A repeated disable must not rewrite a card which is already retired.
            local db = assert(sql.get("app:db"))
            assert(db:execute("UPDATE kickside_model_cards SET updated_at = 1 WHERE name = $1", { NAME }))
            db:release()
            local again = call(DISABLE, { name = NAME })
            db = assert(sql.get("app:db"))
            local rows = assert(db:query("SELECT updated_at FROM kickside_model_cards WHERE name = $1", { NAME }))
            db:release()
            test.eq(tonumber(rows[1].updated_at), 1)
            test.eq(again.success, true, tostring(again.error))
            test.eq(again.model.enabled, false)
            cleanup()
        end)

        test.it("re-enables through upsert_card", function()
            call(UPSERT, card_body())
            call(DISABLE, { name = NAME })
            local result = call(UPSERT, card_body({ enabled = true }))
            test.eq(result.success, true, tostring(result.error))
            test.not_nil(model_catalog.get_by_name(NAME))
            cleanup()
        end)

        test.it("fails for a card that is not stored", function()
            local result = call(DISABLE, { name = "cc-never-saved" })
            test.eq(result.success, false)
            test.eq(overlay_count("cc-never-saved"), 0)
        end)

        test.it("preserves a newer stored row when the cache has the previous values", function()
            call(UPSERT, card_body())
            local db = assert(sql.get("app:db"))
            assert(db:execute("UPDATE kickside_model_cards SET options_json = $1, priority = $2 WHERE name = $3",
                { '{"custom": { "enabled": true }}', 42, NAME }))
            db:release()
            local before = assert(stored_card(NAME))
            local result = assert(registrar():disable_card({ name = NAME }))
            test.eq(result.success, true)
            test.eq(result.model.priority, 42)
            local after = assert(stored_card(NAME))
            for key, value in pairs(before) do
                if key ~= "enabled" and key ~= "updated_at" then test.eq(after[key], value, key) end
            end
            test.eq(tonumber(after.enabled), 0)
            cleanup()
        end)

        test.it("does not recreate a deleted card present in the cache", function()
            call(UPSERT, card_body())
            local db = assert(sql.get("app:db"))
            assert(db:execute("DELETE FROM kickside_model_cards WHERE name = $1", { NAME }))
            db:release()
            local result = assert(registrar():disable_card({ name = NAME }))
            test.eq(result.success, false)
            test.is_nil(stored_card(NAME))
            test.eq(overlay_count(NAME), 0)
        end)
    end)

    test.describe("cards contract: delete_card", function()
        test.it("deletes a disabled card and its row", function()
            call(UPSERT, card_body())
            call(DISABLE, { name = NAME })
            local result = assert(registrar():delete_card({ name = NAME }))
            test.eq(result.success, true, tostring(result.error))
            test.is_nil(stored_card(NAME))
            test.eq(overlay_count(NAME), 0)
            test.is_nil(model_catalog.get_by_name(NAME))
            for _, card in ipairs(assert(model_catalog.get_all_public())) do test.neq(card.name, NAME) end
        end)

        test.it("refuses an enabled card, which stays stored and resolvable", function()
            call(UPSERT, card_body())
            local result = assert(registrar():delete_card({ name = NAME }))
            test.eq(result.success, false)
            test.not_nil(stored_card(NAME))
            test.eq(overlay_count(NAME), 1)
            test.not_nil(model_catalog.get_by_name(NAME))
            cleanup()
        end)

        test.it("fails for a card that is not stored", function()
            local result = assert(registrar():delete_card({ name = "cc-never-saved" }))
            test.eq(result.success, false)
            test.eq(overlay_count("cc-never-saved"), 0)
        end)

        test.it("refuses a card enabled in the store while the cache holds it disabled", function()
            call(UPSERT, card_body())
            call(DISABLE, { name = NAME })
            local db = assert(sql.get("app:db"))
            assert(db:execute("UPDATE kickside_model_cards SET enabled = 1 WHERE name = $1", { NAME }))
            db:release()
            local result = assert(registrar():delete_card({ name = NAME }))
            test.eq(result.success, false)
            test.eq(tonumber(assert(stored_card(NAME)).enabled), 1)
            cleanup()
        end)

        test.it("deletes a disabled card with a cold cache", function()
            call(UPSERT, card_body())
            call(DISABLE, { name = NAME })
            models_cache.clear()
            local result = assert(registrar():delete_card({ name = NAME }))
            test.eq(result.success, true, tostring(result.error))
            test.is_nil(stored_card(NAME))
            test.is_nil(model_catalog.get_by_name(NAME))
        end)
    end)

    test.describe("cards contract: list_cards and get_card", function()
        local function listed(result: any, name: string): any
            for _, card in ipairs(result.models) do
                if card.name == name then return card end
            end
            return nil
        end

        test.it("lists every catalog card, retired cards included", function()
            call(UPSERT, card_body())
            local enabled = assert(registrar():list_cards({}))
            test.eq(enabled.success, true, tostring(enabled.error))
            test.eq(listed(enabled, NAME).enabled, true)
            call(DISABLE, { name = NAME })
            local retired = assert(registrar():list_cards({}))
            local card = listed(retired, NAME)
            test.not_nil(card, "retired card missing from list_cards")
            test.eq(card.enabled, false)
            test.eq(card.metadata.train.weights_digest, TRAIN.weights_digest)
            test.eq(#retired.models, #assert(model_catalog.get_all_public()))
            cleanup()
        end)

        test.it("reads one card by name, retired cards included", function()
            call(UPSERT, card_body())
            local result = assert(registrar():get_card({ name = NAME }))
            test.eq(result.success, true, tostring(result.error))
            test.eq(result.model.name, NAME)
            test.eq(result.model.provider_model, "cc-trained-model-v1")
            test.eq(#result.model.routes, 1)
            test.eq(result.model.routes[1].provider_id, "wippy.llm.openai:provider")
            test.eq(result.model.routes[1].provider_model, "cc-trained-model-v1")
            call(DISABLE, { name = NAME })
            local retired = assert(registrar():get_card({ name = NAME }))
            test.eq(retired.success, true, tostring(retired.error))
            test.eq(retired.model.enabled, false)
            cleanup()
        end)

        test.it("answers every route of a card with its options", function()
            local entry_id = "app:cc_two_route"
            local changes = assert(registry.snapshot()):changes()
            changes:create({
                id = entry_id,
                kind = "registry.entry",
                meta = { type = "llm.model", name = "cc-two-route", capabilities = { "generate" }, class = { "cc-two-route-class" } },
                data = {
                    max_tokens = 100000,
                    pricing = { input = 1, output = 2 },
                    providers = {
                        {
                            id = "wippy.llm.openai:provider",
                            provider_model = "route-a-model",
                            provider_profile_id = "profile-a",
                            options = { thinking_effort = "low", api_key = "route-a-secret" },
                            pricing = { input = 1, output = 2 },
                            max_tokens = 100000,
                        },
                        {
                            id = "wippy.llm.anthropic:provider",
                            provider_model = "route-b-model",
                            provider_profile_id = "profile-b",
                            options = { thinking_effort = "high" },
                            pricing = { input = 3, output = 4 },
                            output_tokens = 8000,
                        },
                    },
                },
            })
            test.is_nil(select(2, changes:apply()))
            models_cache.clear()
            local ok, err = pcall(function()
                local result = assert(registrar():get_card({ name = "cc-two-route" }))
                test.eq(result.success, true, tostring(result.error))
                test.eq(result.model.provider_model, "route-a-model")
                local routes = result.model.routes
                test.not_nil(routes, "routes missing")
                test.eq(#routes, 2)
                test.eq(routes[1].provider_id, "wippy.llm.openai:provider")
                test.eq(routes[1].provider_model, "route-a-model")
                test.eq(routes[1].provider_profile_id, "profile-a")
                test.eq(routes[1].options.thinking_effort, "low")
                test.is_nil(routes[1].options.api_key)
                test.is_nil(routes[1].context)
                test.eq(routes[1].pricing.input, 1)
                test.eq(routes[1].max_tokens, 100000)
                test.eq(routes[2].provider_id, "wippy.llm.anthropic:provider")
                test.eq(routes[2].provider_model, "route-b-model")
                test.eq(routes[2].provider_profile_id, "profile-b")
                test.eq(routes[2].options.thinking_effort, "high")
                test.eq(routes[2].pricing.output, 4)
                test.eq(routes[2].output_tokens, 8000)
            end)
            local cleanup_changes = assert(registry.snapshot()):changes()
            cleanup_changes:delete(entry_id)
            test.is_nil(select(2, cleanup_changes:apply()))
            models_cache.clear()
            if not ok then error(err, 0) end
        end)

        test.it("fails for a name the catalog does not hold", function()
            local result = assert(registrar():get_card({ name = "cc-never-saved" }))
            test.eq(result.success, false)
            test.not_nil(result.error)
        end)

        test.it("reads a card with a cold cache", function()
            call(UPSERT, card_body())
            models_cache.clear()
            local result = assert(registrar():get_card({ name = NAME }))
            test.eq(result.success, true, tostring(result.error))
            test.eq(result.model.name, NAME)
            cleanup()
        end)

        test.it("reads cards whose provider profile reports an error", function()
            with_existing_provider(function(profile)
                local db = assert(sql.get("app:db"))
                assert(db:execute("UPDATE kickside_model_provider_profiles SET secret_json = $1 WHERE id = $2",
                    { "not-a-valid-encrypted-secret", profile.id }))
                db:release()
                models_cache.clear()

                local cards = registrar()
                local full = assert(cards:get_card({ name = "cc-existing-card" }))
                test.eq(full.success, true, tostring(full.error))
                test.eq(full.model.enabled, false)
                test.not_nil(full.model.error)

                local result = assert(cards:list_card_summaries({ q = "cc-existing-card" }))
                test.eq(result.success, true, tostring(result.error))
                test.eq(#result.cards, 1)
                test.eq(result.cards[1].enabled, false)
                test.eq(result.cards[1].error, full.model.error)
            end)
        end)

        test.it("redacts legacy credential URLs in read replies", function()
            call(UPSERT, card_body())
            local db = assert(sql.get("app:db"))
            assert(db:execute("UPDATE kickside_model_cards SET metadata_json = $1 WHERE name = $2",
                { assert(json.encode({ reference = "https://example.invalid/private?access_token=synthetic", count = 7 })), NAME }))
            db:release()
            assert(models_repo.reload())
            local one = assert(registrar():get_card({ name = NAME }))
            test.eq(one.model.metadata.reference, "[redacted]")
            test.eq(one.model.metadata.count, 7)
            local all = assert(registrar():list_cards({}))
            test.eq(listed(all, NAME).metadata.reference, "[redacted]")
            cleanup()
        end)

        test.it("filters compact summaries using redacted fields even with a cold cache", function()
            call(UPSERT, card_body())
            call(DISABLE, { name = NAME })
            local db = assert(sql.get("app:db"))
            assert(db:execute("UPDATE kickside_model_cards SET provider_model = $1 WHERE name = $2",
                { "https://example.invalid/private?access_token=cc-synthetic-url-value", NAME }))
            db:release()
            models_cache.clear()

            local cards = registrar()
            local hidden = assert(cards:list_card_summaries({ q = "cc-synthetic-url-value" }))
            test.eq(hidden.success, true, tostring(hidden.error))
            test.eq(#hidden.cards, 0)
            local redacted = assert(cards:list_card_summaries({ q = "[REDACTED]" }))
            test.eq(redacted.success, true, tostring(redacted.error))
            test.eq(#redacted.cards, 1)
            test.eq(redacted.cards[1].name, NAME)
            test.eq(redacted.cards[1].provider_model, "[redacted]")
            test.eq(redacted.cards[1].enabled, false)
            test.is_nil(redacted.cards[1].metadata)
            test.is_nil(redacted.next_cursor)
            cleanup()
        end)
    end)

    test.describe("card_registrar policy", function()
        test.it("persists retirement while the provider is paused", function()
            with_existing_provider(function(profile)
                assert(models_repo.update_profile(profile.id, { enabled = false }))
                local cards = registrar()
                local result, call_err = cards:disable_card({ name = "cc-existing-card" })
                test.is_nil(call_err, tostring(call_err))
                test.eq(result.success, true, tostring(result.error))

                assert(models_repo.update_profile(profile.id, { enabled = true }))
                test.is_true(model_catalog.get_by_name("cc-existing-card") == nil,
                    "retired card returned after re-enabling its provider")
                test.eq(overlay_count("cc-existing-card"), 1)
            end)
        end)

        for _, action in ipairs({ "upsert_card", "disable_card" }) do
            test.it(action .. " removes legacy pricing credentials from the reply", function()
                with_existing_provider(function()
                    local marker = "synthetic-legacy-pricing-credential"
                    local db = assert(sql.get("app:db"))
                    local _, write_err = db:execute("UPDATE kickside_model_cards SET pricing_json = $1 WHERE name = $2",
                        { assert(json.encode({ prompt = 1, vendor = { api_key = marker, token_count = 7 } })),
                            "cc-existing-card" })
                    db:release()
                    test.is_nil(write_err)
                    assert(models_repo.reload())

                    local cards = registrar()
                    local result, call_err
                    if action == "upsert_card" then
                        result, call_err = cards:upsert_card({ name = "cc-existing-card", priority = 42 })
                    else
                        result, call_err = cards:disable_card({ name = "cc-existing-card" })
                    end
                    test.is_nil(call_err, tostring(call_err))
                    test.eq(result.success, true, tostring(result.error))
                    test.is_nil((assert(json.encode(result)):find(marker, 1, true)), "legacy pricing credential returned")
                    test.eq(result.model.pricing.prompt, 1)
                    test.eq(result.model.pricing.vendor.token_count, 7)
                end)
            end)

            test.it(action .. " redacts legacy credential URLs and keeps adjacent public values", function()
                with_existing_provider(function()
                    local name = "cc-existing-card"
                    local public_url = "https://example.invalid/public?count=7"
                    local legacy = { links = { "https://user:synthetic@example.invalid/private", public_url } }
                    local pricing = { input = 2, reference = "https://example.invalid/private?api_key=synthetic" }
                    local metadata = { reference = "https://example.invalid/private?access_token=synthetic", count = 7 }
                    local db = assert(sql.get("app:db"))
                    assert(db:execute("UPDATE kickside_model_cards SET options_json = $1, pricing_json = $2, metadata_json = $3 WHERE name = $4",
                        { assert(json.encode(legacy)), assert(json.encode(pricing)), assert(json.encode(metadata)), name }))
                    db:release()
                    assert(models_repo.reload())

                    local cards = registrar()
                    local result = assert(cards[action](cards, { name = name }))
                    test.eq(result.success, true)
                    test.eq(result.model.options.links[1], "[redacted]")
                    test.eq(result.model.options.links[2], public_url)
                    test.eq(result.model.pricing.reference, "[redacted]")
                    test.eq(result.model.pricing.input, 2)
                    test.eq(result.model.metadata.reference, "[redacted]")
                    test.eq(result.model.metadata.count, 7)
                    if action == "disable_card" then
                        local retained = assert(stored_card(name))
                        test.eq(assert(json.decode(retained.options_json)).links[1], legacy.links[1])
                    end
                end)
            end)

            for _, cold in ipairs({ false, true }) do
                test.it(action .. " preserves existing encrypted providers with a " .. (cold and "cold" or "warm") .. " cache", function()
                    with_existing_provider(function(profile)
                        assert(card_service.save(card_body()))
                        local before = stored_profile(profile.id)
                        if cold then models_cache.clear() end
                        local cards = registrar()
                        local result, call_err
                        if action == "upsert_card" then
                            result, call_err = (cards :: any):upsert_card(card_body({ priority = 42 }))
                        else
                            result, call_err = (cards :: any):disable_card({ name = NAME })
                        end
                        test.is_nil(call_err, tostring(call_err))
                        test.eq(result.success, true, tostring(result.error))
                        local existing, read_err = models_repo.get_profile(profile.id)
                        test.is_nil(read_err, tostring(read_err))
                        test.eq(existing.enabled, true)
                        test.is_nil(existing.error)
                        test.eq(existing.secret_config.api_key, "cc-existing-credential")
                        for _, identifier in ipairs({ "cc-existing-card", "class:cc-existing-class" }) do
                            local resolved, resolve_err = model_catalog.resolve(identifier)
                            test.is_nil(resolve_err, tostring(resolve_err))
                            test.eq(resolved.providers[1].context.api_key, "cc-existing-credential")
                        end
                        local after = stored_profile(profile.id)
                        for key, value in pairs(before) do test.eq(after[key], value, key) end
                        test.is_nil((assert(json.encode(result)):find("cc-existing-credential", 1, true)))
                    end)
                end)
            end
        end

        test.it("admits the contract, its binding and its functions, and nothing else", function()
            local policy = assert(security.policy("kickside.models.security:card_registrar"))
            local actor = security.new_actor("module-registrar", {})
            for _, id in ipairs({
                "kickside.models.cards:cards",
                "kickside.models.cards:cards_binding",
            }) do
                test.not_nil(registry.get(id), id)
                test.eq(policy:evaluate(actor, "contract.open", id), "allow", id)
            end
            for _, id in ipairs({ UPSERT, DISABLE, DELETE, LIST, SUMMARIES, GET }) do
                test.not_nil(registry.get(id), id)
                test.eq(policy:evaluate(actor, "funcs.call", id), "allow", id)
            end
            test.eq(policy:evaluate(actor, "contract.call", "upsert_card"), "allow")
            test.eq(policy:evaluate(actor, "contract.call", "disable_card"), "allow")
            test.eq(policy:evaluate(actor, "contract.call", "delete_card"), "allow")
            test.eq(policy:evaluate(actor, "contract.call", "list_cards"), "allow")
            test.eq(policy:evaluate(actor, "contract.call", "list_card_summaries"), "allow")
            test.eq(policy:evaluate(actor, "contract.call", "get_card"), "allow")
            test.eq(policy:evaluate(actor, "funcs.call", "kickside.models.persist:repo"), "undefined")
            test.eq(policy:evaluate(actor, "access", "kickside.models.api.admin:upsert_card.endpoint"), "undefined")
            test.eq(policy:evaluate(actor, "db.get", "*"), "undefined")
            test.eq(policy:evaluate(actor, "env.get", "ENCRYPTION_KEY"), "undefined")
            local reload = "kickside.models.persist:reload_profiles"
            test.eq(policy:evaluate(actor, "funcs.call", reload), "undefined")
            local catalog_read = assert(security.policy("kickside.models.catalog:catalog_read"))
            test.eq(catalog_read:evaluate(actor, "env.get", "ENCRYPTION_KEY"), "undefined")
            test.eq(catalog_read:evaluate(actor, "store.get", "app:unrelated_store"), "undefined")
            test.eq(catalog_read:evaluate(actor, "store.key.set", "kickside.models:cache"), "undefined")
        end)

        test.it("opens the contract through its binding and saves and retires a card", function()
            local scope = assert(security.new_scope({ assert(security.policy("kickside.models.security:card_registrar")) }))
            local cards, open_err = assert(contract.get(CONTRACT))
                :with_actor(security.new_actor("module-registrar", {})):with_scope(scope):open()
            test.is_nil(open_err, tostring(open_err))
            local result, call_err = (cards :: any):upsert_card(card_body())
            test.is_nil(call_err, tostring(call_err))
            test.eq(result.success, true, tostring(result.error))
            test.eq(model_catalog.get_by_name(NAME).name, NAME)
            local disabled, disable_err = (cards :: any):disable_card({ name = NAME })
            test.is_nil(disable_err, tostring(disable_err))
            test.eq(disabled.model.enabled, false)
            local deleted, delete_err = (cards :: any):delete_card({ name = NAME })
            test.is_nil(delete_err, tostring(delete_err))
            test.eq(deleted.success, true, tostring(deleted.error))
            test.eq(overlay_count(NAME), 0)
        end)

        test.it("keeps the contract out of the member module grant", function()
            local runtime = assert(security.policy("kickside.models.security:module_runtime"))
            local actor = security.new_actor("module-member", {})
            for _, id in ipairs({ UPSERT, DISABLE, DELETE, LIST, SUMMARIES, GET }) do
                test.eq(runtime:evaluate(actor, "funcs.call", id), "undefined", id)
            end
            for _, id in ipairs({ CONTRACT, BINDING }) do
                test.eq(runtime:evaluate(actor, "contract.open", id), "undefined", id)
            end
        end)
    end)
end

return { run = test.run_cases(define_tests) }
