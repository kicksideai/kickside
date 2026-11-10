-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local model_catalog = require("model_catalog")
local registry_models = require("registry_models")
local models_repo = require("models_repo")

local function scenario(fn, cards)
    local registry_get, overlays_get = registry_models.get_all, models_repo.list_card_overlays
    registry_models.get_all = function() return {} end
    models_repo.list_card_overlays = function()
        return cards or {
            { name = "low", class = { "ranked" }, priority = 10, providers = { { id = "provider.low" } } },
            { name = "disabled", class = { "ranked" }, priority = 100, enabled = false },
            { name = "high", class = { "ranked" }, priority = 90, providers = { { id = "provider.high" } } },
        }
    end
    local ok, err = pcall(fn)
    registry_models.get_all, models_repo.list_card_overlays = registry_get, overlays_get
    if not ok then error(err, 0) end
end

local function define_tests()
    test.describe("Resolved class candidates", function()
        test.it("retains every enabled member in admin priority order", function()
            scenario(function()
                for _, identifier in ipairs({ "class:ranked", "ranked" }) do
                    local card, err = model_catalog.resolve(identifier)
                    test.is_nil(err)
                    test.eq(card.name, "high")
                    test.not_nil(card.candidates)
                    test.eq(#card.candidates, 2)
                    test.eq(card.candidates[1].name, "high")
                    test.eq(card.candidates[2].name, "low")
                    test.is_nil(card.candidates[1].candidates)
                end
            end)
        end)
        test.it("orders equal numeric priorities by model name", function()
            local cards = {
                { name = "a-low", class = { "ranked" }, priority = 0 },
                { name = "z-high", class = { "ranked" }, priority = 90 },
            }
            for _, name in ipairs({ "foxtrot", "echo", "delta", "charlie", "bravo", "alpha" }) do
                table.insert(cards, { name = name, class = { "ranked" }, priority = "20" })
            end
            scenario(function()
                local card, err = model_catalog.resolve("class:ranked")
                test.is_nil(err)
                test.eq(card.name, "z-high")
                local listed, list_err = model_catalog.get_by_class("ranked")
                test.is_nil(list_err)
                for index, name in ipairs({ "z-high", "alpha", "bravo", "charlie", "delta", "echo", "foxtrot", "a-low" }) do
                    test.eq(card.candidates[index].name, name)
                    test.eq(listed[index].name, name)
                end
            end, cards)
        end)
        test.it("keeps a singleton candidate separate from the selected card", function()
            scenario(function()
                local card, err = model_catalog.resolve("class:ranked")
                test.is_nil(err)
                test.eq(card.name, "only")
                test.eq(#card.candidates, 1)
                test.eq(card.candidates[1].name, "only")
                test.is_nil(card.candidates[1].candidates)
            end, { { name = "only", class = { "ranked" } } })
        end)
        test.it("retains empty class errors and lists", function()
            scenario(function()
                local card, err = model_catalog.resolve("class:ranked")
                test.is_nil(card)
                test.eq(err, "No models found for class: ranked")
                local implicit, implicit_err = model_catalog.resolve("ranked")
                test.is_nil(implicit)
                test.eq(implicit_err, "Model or class not found: ranked")
                local listed, list_err = model_catalog.get_by_class("ranked")
                test.is_nil(list_err)
                test.eq(#listed, 0)
            end, {})
        end)
        test.it("excludes disabled provider profiles from primary and fallback selection", function()
            local profiles = { "ranked-provider-high", "ranked-provider-low" }
            local names = { "ranked-profile-high", "ranked-profile-low" }
            local ok, err = pcall(function()
                for index, id in ipairs(profiles) do
                    local profile, perr = models_repo.create_profile({
                        id = id, name = id, provider_id = "wippy.llm.openai_compat:provider",
                        base_url = "http://localhost:11434/v1",
                    })
                    test.is_nil(perr)
                    test.eq(profile.id, id)
                    local card, cerr = models_repo.upsert_card({
                        name = names[index], provider_id = profile.provider_id, provider_profile_id = id,
                        provider_model = names[index], classes = { "profile-ranked" },
                        capabilities = { "generate" }, max_tokens = 32768, output_tokens = 512,
                        priority = index == 1 and 90 or 10, enabled = true,
                    })
                    test.is_nil(cerr)
                    test.not_nil(card)
                end
                for disabled, id in ipairs(profiles) do
                    local profile, perr = models_repo.update_profile(id, { enabled = false })
                    test.is_nil(perr)
                    test.is_false(profile.enabled)
                    local selected, serr = model_catalog.resolve("class:profile-ranked")
                    test.is_nil(serr)
                    test.eq(selected.name, names[3 - disabled])
                    test.eq(#selected.candidates, 1)
                    test.eq(selected.candidates[1].name, names[3 - disabled])
                    local listed, lerr = model_catalog.get_by_class("profile-ranked")
                    test.is_nil(lerr)
                    test.eq(#listed, 1)
                    test.eq(listed[1].name, names[3 - disabled])
                    local disabled_name = assert(names[disabled], "Disabled provider has a model name")
                    local direct, derr = model_catalog.resolve(disabled_name)
                    test.is_nil(direct)
                    test.eq(derr, "Model or class not found: " .. disabled_name)
                    local restored, rerr = models_repo.update_profile(id, { enabled = true })
                    test.is_nil(rerr)
                    test.is_true(restored.enabled)
                    local ranked, ranked_err = model_catalog.resolve("class:profile-ranked")
                    test.is_nil(ranked_err)
                    test.eq(ranked.name, names[1])
                    test.eq(#ranked.candidates, 2)
                end
            end)
            for _, id in ipairs(profiles) do
                local deleted, derr = models_repo.delete_profile(id)
                test.is_nil(derr)
                test.is_true(deleted)
            end
            if not ok then error(err, 0) end
        end)
        test.it("keeps a concrete model selection singular", function()
            scenario(function()
                local card, err = model_catalog.resolve("low")
                test.is_nil(err)
                test.eq(card.name, "low")
                test.is_nil(card.candidates)
            end)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
