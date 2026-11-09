-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local model_catalog = require("model_catalog")
local registry_models = require("registry_models")
local models_repo = require("models_repo")

local function scenario(fn)
    local registry_get, overlays_get = registry_models.get_all, models_repo.list_card_overlays
    registry_models.get_all = function() return {} end
    models_repo.list_card_overlays = function()
        return {
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
