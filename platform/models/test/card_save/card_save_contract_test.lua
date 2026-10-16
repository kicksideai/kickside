-- Contract: saving a model card through PUT /models/cards.
--
-- A registry card (kind: registry.entry, meta.type: llm.model) is overlaid by
-- the stored row. Saving must not lose what the registry declares for the
-- provider: its options and its route fields (wippy/llm reads `sampling` from
-- the resolved card's providers[1]). The handler and the admin list run from
-- their real source files; the tests drive them with request bodies only.
local test = require("test")
local json = require("json")
local fake_http = require("fake_http")
local save_handler = require("save_handler")
local admin_handler = require("admin_handler")
local registry_models = require("registry_models")
local models_repo = require("models_repo")
local model_catalog = require("model_catalog")

local REGISTRY_PROVIDER = "ckc.test:provider"
local REGISTRY_MODEL = "ckc-reg-model"

-- PUT /models/cards with a table (encoded) or a raw JSON string.
local function save(body: any): any
    local raw = body
    if type(body) == "table" then
        local encoded, err = json.encode(body)
        test.is_nil(err, "encode request body")
        raw = encoded
    end
    fake_http.prepare(raw)
    save_handler.handler()
    local payload = fake_http.payload()
    test.not_nil(payload, "save wrote no response")
    test.eq(payload.success, true, "save failed: " .. tostring(payload.error))
    return payload.model
end

-- GET /models/admin: the rows the settings surface lists.
local function list_row(name: string): any
    fake_http.prepare(nil)
    admin_handler.handler()
    local payload = fake_http.payload()
    test.not_nil(payload, "admin list wrote no response")
    test.eq(payload.success, true)
    for _, row in ipairs(payload.models or {}) do
        if row.name == name then return row end
    end
    return nil
end

local function resolved(name: string): any
    local card, err = model_catalog.get_by_name(name)
    test.is_nil(err, "get_by_name " .. name)
    test.not_nil(card, "card " .. name .. " not resolved")
    return card
end

local function in_class(class_name: string, name: string): any
    local cards = model_catalog.get_by_class(class_name)
    for _, card in ipairs(cards or {}) do
        if card.name == name then return card end
    end
    return nil
end

local function has(list: any, item: string): boolean
    for _, v in ipairs(list or {}) do
        if v == item then return true end
    end
    return false
end

-- Test-only registry llm.model cards, shaped like wippy.llm.discovery:models
-- builds them from `kind: registry.entry` declarations. Fresh tables on every
-- call, as the real discovery builds them.
local REGISTRY_CARD_NAMES = {
    "ckc-omit", "ckc-merge", "ckc-keep", "ckc-change", "ckc-change-id", "ckc-toggle", "ckc-profile",
}

local function registry_cards(): { any }
    local cards = {}
    for _, name in ipairs(REGISTRY_CARD_NAMES) do
        table.insert(cards, {
            id = "app:" .. name,
            name = name,
            title = "Card save " .. name,
            description = "Test-only registry card.",
            capabilities = { "generate" },
            class = { name .. "-class" },
            priority = 5,
            max_tokens = 1000,
            output_tokens = 100,
            pricing = {},
            providers = {
                {
                    id = REGISTRY_PROVIDER,
                    provider_model = REGISTRY_MODEL,
                    options = {
                        reasoning_effort = "low",
                        registry_only = "keep",
                        auth_token = "registry-secret",
                        nested = { depth = 2, api_key = "nested-secret" },
                    },
                    sampling = false,
                    route_tag = "reg-route",
                    route_meta = { tier = "t1" },
                },
            },
        })
    end
    table.sort(cards, function(a, b) return a.name < b.name end)
    return cards
end

-- Runs fn with the test registry cards installed, and always restores the
-- registry and removes the stored rows the scenario may have created.
local function scenario(names: { string }, fn: () -> ()): ()
    local original = registry_models.get_all
    registry_models.get_all = registry_cards
    local ok, err = pcall(fn)
    registry_models.get_all = original
    for _, name in ipairs(names) do
        models_repo.delete_card(name)
    end
    if not ok then error(err, 0) end
end

local function define_tests()
    test.describe("Saving a registry card keeps its provider options", function()
        test.it("keeps registry options when the body omits options (resolved by name and by class)", function()
            scenario({ "ckc-omit" }, function()
                save({ name = "ckc-omit", class = { "ckc-omit-new" }, priority = 77 })

                local by_name = resolved("ckc-omit")
                local opts = by_name.providers[1].options
                test.eq(opts.reasoning_effort, "low", "by name: registry reasoning_effort lost")
                test.eq(opts.registry_only, "keep", "by name: registry-only option lost")
                test.eq(opts.auth_token, "registry-secret", "by name: registry secret option lost")
                test.eq(opts.nested and opts.nested.depth, 2, "by name: registry nested option lost")

                local by_class = in_class("ckc-omit-new", "ckc-omit")
                test.not_nil(by_class, "card missing from its saved class")
                local copts = by_class.providers[1].options
                test.eq(copts.reasoning_effort, "low", "by class: registry reasoning_effort lost")
                test.eq(copts.registry_only, "keep", "by class: registry-only option lost")
            end)
        end)

        test.it("keeps registry options when the body is the exact row the admin list returns", function()
            scenario({ "ckc-omit" }, function()
                local row = list_row("ckc-omit")
                test.not_nil(row, "registry card not listed")
                row.class = { "ckc-omit-roundtrip" }
                row.priority = 41
                save(row)

                local card = resolved("ckc-omit")
                local opts = card.providers[1].options
                test.eq(opts.reasoning_effort, "low", "round trip: reasoning_effort lost")
                test.eq(opts.registry_only, "keep", "round trip: registry-only option lost")
                test.eq(opts.auth_token, "registry-secret", "round trip: scrubbed registry secret option lost")
                test.eq(card.providers[1].sampling, false, "round trip: sampling route field lost")
                test.eq(card.priority, 41)
                test.not_nil(in_class("ckc-omit-roundtrip", "ckc-omit"))
            end)
        end)

        test.it("keeps registry options across a second save that omits them again", function()
            scenario({ "ckc-omit" }, function()
                save({ name = "ckc-omit", priority = 12 })
                save({ name = "ckc-omit", priority = 13, class = { "ckc-omit-second" } })
                local card = resolved("ckc-omit")
                test.eq(card.providers[1].options.registry_only, "keep", "registry-only option lost on second save")
                test.eq(card.providers[1].sampling, false, "sampling lost on second save")
                test.eq(card.priority, 13)
            end)
        end)
    end)

    test.describe("Saving options on a registry card", function()
        test.it("layers saved options over the registry options, saved value winning per key", function()
            scenario({ "ckc-merge" }, function()
                save({ name = "ckc-merge", options = { reasoning_effort = "high", added_key = 5 } })

                local opts = resolved("ckc-merge").providers[1].options
                test.eq(opts.reasoning_effort, "high", "saved value must win")
                test.eq(opts.added_key, 5, "saved-only key missing")
                test.eq(opts.registry_only, "keep", "registry-only key must remain")
                test.eq(opts.auth_token, "registry-secret", "registry-only secret key must remain")

                local by_class = in_class("ckc-merge-class", "ckc-merge")
                test.not_nil(by_class, "card missing from its class")
                test.eq(by_class.providers[1].options.reasoning_effort, "high", "by class: saved value must win")
                test.eq(by_class.providers[1].options.registry_only, "keep", "by class: registry-only key must remain")
            end)
        end)

        test.it("does not let a second save without options drop the registry-only keys", function()
            scenario({ "ckc-merge" }, function()
                save({ name = "ckc-merge", options = { added_key = 5 } })
                save({ name = "ckc-merge", priority = 9 })
                local opts = resolved("ckc-merge").providers[1].options
                test.eq(opts.registry_only, "keep", "registry-only key lost on second save")
            end)
        end)
    end)

    test.describe("Registry provider route fields", function()
        test.it("keeps every registry provider field the save does not set (options saved)", function()
            scenario({ "ckc-keep" }, function()
                save({ name = "ckc-keep", options = { reasoning_effort = "mid" } })

                local provider = resolved("ckc-keep").providers[1]
                test.eq(provider.id, REGISTRY_PROVIDER)
                test.eq(provider.provider_model, REGISTRY_MODEL)
                test.eq(provider.sampling, false, "sampling = false lost")
                test.eq(provider.route_tag, "reg-route", "extra registry field route_tag lost")
                test.eq(provider.route_meta and provider.route_meta.tier, "t1", "extra registry table field lost")

                local by_class = in_class("ckc-keep-class", "ckc-keep")
                test.not_nil(by_class)
                test.eq(by_class.providers[1].sampling, false, "by class: sampling = false lost")
            end)
        end)

        test.it("keeps registry provider fields when the body also repeats the same provider id and model", function()
            scenario({ "ckc-keep" }, function()
                save({
                    name = "ckc-keep",
                    provider_id = REGISTRY_PROVIDER,
                    provider_model = REGISTRY_MODEL,
                    class = { "ckc-keep-new" },
                })
                local provider = resolved("ckc-keep").providers[1]
                test.eq(provider.sampling, false, "sampling = false lost")
                test.eq(provider.route_tag, "reg-route", "extra registry field route_tag lost")
                test.eq(provider.options.registry_only, "keep", "registry options lost")
                local by_class = in_class("ckc-keep-new", "ckc-keep")
                test.not_nil(by_class)
                test.eq(by_class.providers[1].sampling, false, "by class: sampling = false lost")
            end)
        end)

        test.it("uses the saved provider entry when the provider_model changes", function()
            scenario({ "ckc-change" }, function()
                save({
                    name = "ckc-change",
                    provider_model = "ckc-other-model",
                    options = { reasoning_effort = "z" },
                })
                local provider = resolved("ckc-change").providers[1]
                test.eq(provider.id, REGISTRY_PROVIDER)
                test.eq(provider.provider_model, "ckc-other-model")
                test.eq(provider.options.reasoning_effort, "z")
                test.is_nil(provider.sampling, "stale registry sampling leaked into the changed provider entry")
                test.is_nil(provider.route_tag, "stale registry route_tag leaked into the changed provider entry")
                test.is_nil(provider.route_meta, "stale registry route_meta leaked into the changed provider entry")
            end)
        end)

        test.it("uses the saved provider entry when the provider id changes", function()
            scenario({ "ckc-change-id" }, function()
                save({
                    name = "ckc-change-id",
                    provider_id = "ckc.other:provider",
                    options = { reasoning_effort = "z" },
                })
                local provider = resolved("ckc-change-id").providers[1]
                test.eq(provider.id, "ckc.other:provider")
                test.eq(provider.provider_model, REGISTRY_MODEL)
                test.is_nil(provider.sampling, "stale registry sampling leaked into the changed provider entry")
                test.is_nil(provider.route_tag, "stale registry route_tag leaked into the changed provider entry")
            end)
        end)
    end)

    test.describe("The save's own changes still apply", function()
        test.it("applies classes and priority", function()
            scenario({ "ckc-omit" }, function()
                save({ name = "ckc-omit", class = { "ckc-a", "ckc-b" }, priority = 88 })
                local card = resolved("ckc-omit")
                test.eq(card.priority, 88)
                test.is_true(has(card.class, "ckc-a") and has(card.class, "ckc-b"), "saved classes missing")
                test.is_false(has(card.class, "ckc-omit-class"), "registry class must not return after a save with classes")
                test.not_nil(in_class("ckc-a", "ckc-omit"))
                test.is_nil(in_class("ckc-omit-class", "ckc-omit"))
            end)
        end)

        test.it("lets an explicit empty class list stick", function()
            scenario({ "ckc-omit" }, function()
                save('{"name":"ckc-omit","class":[]}')
                local card = resolved("ckc-omit")
                test.eq(#card.class, 0, "explicit empty class list must stick")
                test.is_nil(in_class("ckc-omit-class", "ckc-omit"))
            end)
        end)

        test.it("keeps registry options when the save clears every class", function()
            scenario({ "ckc-omit" }, function()
                save('{"name":"ckc-omit","class":[]}')
                local opts = resolved("ckc-omit").providers[1].options
                test.eq(opts.registry_only, "keep", "registry options lost by the class save")
                test.eq(opts.reasoning_effort, "low", "registry options lost by the class save")
            end)
        end)

        test.it("keeps registry options and route fields through disable and enable", function()
            scenario({ "ckc-toggle" }, function()
                save({ name = "ckc-toggle", enabled = false })
                local none, err = model_catalog.get_by_name("ckc-toggle")
                test.is_nil(none)
                test.not_nil(err)
                local listed = list_row("ckc-toggle")
                test.not_nil(listed, "disabled card must stay listed")
                test.is_false(listed.enabled)

                save({ name = "ckc-toggle", enabled = true, priority = 31 })
                local card = resolved("ckc-toggle")
                test.eq(card.priority, 31)
                test.eq(card.providers[1].options.registry_only, "keep", "registry option lost after enable")
                test.eq(card.providers[1].options.reasoning_effort, "low", "registry option lost after enable")
                test.eq(card.providers[1].sampling, false, "sampling lost after enable")
            end)
        end)
    end)

    test.describe("The admin list shows provider options for registry cards", function()
        test.it("lists options and no profile for an unsaved registry card, scrubbed", function()
            scenario({}, function()
            local row = list_row("ckc-omit")
            test.not_nil(row, "registry card not listed")
            test.eq(row.source, "registry")
            test.not_nil(row.options, "options missing from registry card row")
            test.eq(row.options.reasoning_effort, "low")
            test.eq(row.options.registry_only, "keep")
            test.is_nil(row.options.auth_token, "sensitive key must be scrubbed")
            test.eq(row.options.nested and row.options.nested.depth, 2)
            test.is_nil(row.options.nested and row.options.nested.api_key, "nested sensitive key must be scrubbed")
            test.is_nil(row.provider_profile_id)
            test.eq(row.provider_id, REGISTRY_PROVIDER)
            test.eq(row.provider_model, REGISTRY_MODEL)
            end)
        end)

        test.it("still lists options and the profile after the card is saved", function()
            scenario({ "ckc-profile" }, function()
                local profile, perr = models_repo.create_profile({
                    id = "ckc-profile-link",
                    name = "Card Save Profile",
                    provider_id = "wippy.llm.openai_compat:provider",
                    base_url = "http://localhost:11434/v1",
                })
                test.is_nil(perr)
                test.not_nil(profile)
                local ok, err = pcall(function()
                    save({
                        name = "ckc-profile",
                        provider_profile_id = "ckc-profile-link",
                        class = { "ckc-profile-new" },
                        options = { api_key = "typed-secret", added_key = 7 },
                    })
                    local row = list_row("ckc-profile")
                    test.not_nil(row)
                    test.eq(row.provider_profile_id, "ckc-profile-link", "provider_profile_id missing from listed registry card")
                    test.not_nil(row.options, "options missing from listed registry card")
                    test.eq(row.options.added_key, 7)
                    test.eq(row.options.reasoning_effort, "low", "listed options must include the registry options")
                    test.is_nil(row.options.api_key, "sensitive key must be scrubbed from the listing")

                    -- A later save that omits the profile and options keeps both.
                    save({ name = "ckc-profile", priority = 3 })
                    local again = list_row("ckc-profile")
                    test.eq(again.provider_profile_id, "ckc-profile-link", "profile link lost on a later save")
                    test.eq(again.options.added_key, 7, "saved option lost on a later save")
                    test.eq(again.options.reasoning_effort, "low")
                end)
                models_repo.delete_card("ckc-profile")
                models_repo.delete_profile("ckc-profile-link")
                if not ok then error(err, 0) end
            end)
        end)

        test.it("scrubs sensitive keys that a save typed into the options", function()
            scenario({ "ckc-merge" }, function()
                save({ name = "ckc-merge", options = { api_key = "typed-secret", added_key = 1 } })
                local row = list_row("ckc-merge")
                test.not_nil(row)
                test.is_nil(row.options.api_key)
                test.is_nil(row.options.auth_token)
                test.eq(row.options.added_key, 1)
                test.is_nil(resolved("ckc-merge").providers[1].options.api_key, "typed secret must not be stored")
            end)
        end)
    end)

    test.describe("Saving a manual card", function()
        test.it("keeps its options when saved again without options, and replaces them when saved with options", function()
            scenario({ "ckc-manual" }, function()
                save({
                    name = "ckc-manual",
                    provider_id = "wippy.llm.openai:provider",
                    provider_model = "ckc-manual-model",
                    class = { "ckc-manual-class" },
                    max_tokens = 32768,
                    output_tokens = 4096,
                    options = { opt_a = 1, opt_b = "two" },
                    source = "manual",
                })
                test.eq(resolved("ckc-manual").providers[1].options.opt_a, 1)

                save({ name = "ckc-manual", priority = 50 })
                local kept = resolved("ckc-manual")
                test.eq(kept.priority, 50)
                test.eq(kept.providers[1].options.opt_a, 1, "manual card lost its options on a save without options")
                test.eq(kept.providers[1].options.opt_b, "two", "manual card lost its options on a save without options")
                local row = list_row("ckc-manual")
                test.eq(row.options.opt_a, 1, "listing lost the manual card options")

                save({ name = "ckc-manual", options = { opt_c = 3 } })
                local replaced = resolved("ckc-manual").providers[1].options
                test.eq(replaced.opt_c, 3)
                test.is_nil(replaced.opt_a, "saving options must replace the manual card options")
                test.is_nil(replaced.opt_b, "saving options must replace the manual card options")
            end)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
