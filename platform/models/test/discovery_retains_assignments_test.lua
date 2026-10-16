local test = require("test")
local repo = require("models_repo")
local discovery = require("model_discovery")
local reference_registry = require("reference_registry")

local function define_tests()
    test.describe("provider rediscovery", function()
        test.it("leaves an unknown generate model disabled until its limits are supplied", function()
            local profile, profile_err = repo.create_profile({
                name = "Unknown limits",
                provider_id = "wippy.llm.openai_compat:provider",
                config = { base_url = "https://example.invalid/v1" },
            })
            test.is_nil(profile_err)
            local original_adapter, original_lookup = discovery.adapter_for, reference_registry.lookup
            discovery.adapter_for = function() return {
                fetch = function() return { { id = "unknown-limits", capabilities = { "generate" } } }, nil end,
            } end
            reference_registry.lookup = function() return nil end
            local ok, err = pcall(function()
                local result, discovery_err = discovery.discover(profile.id)
                test.is_nil(discovery_err)
                test.eq(result.count, 1)
                local discovered = result.models[1]
                test.eq(discovered.max_tokens, 0)
                test.eq(discovered.output_tokens, 0)
                test.is_false(discovered.enabled)

                local enabled, enable_err = repo.upsert_card({ name = discovered.name, enabled = true }, discovered)
                test.is_nil(enabled)
                test.not_nil(enable_err)

                local configured, configure_err = repo.upsert_card({
                    name = discovered.name,
                    max_tokens = 32768,
                    output_tokens = 4096,
                    capabilities = discovered.capabilities,
                    enabled = true,
                }, discovered)
                test.is_nil(configure_err, "configure model limits")
                test.is_true(configured.enabled)
                local overlays = repo.list_card_overlays()
                test.eq(overlays[1].name, discovered.name)
                test.eq(overlays[1].max_tokens, 32768)
                test.eq(overlays[1].output_tokens, 4096)
                local rediscovered, rediscovery_err = discovery.discover(profile.id)
                test.is_nil(rediscovery_err, "rediscover configured model")
                test.eq(rediscovered.models[1].max_tokens, 32768)
                test.eq(rediscovered.models[1].output_tokens, 4096)
                test.is_true(rediscovered.models[1].enabled)
                repo.delete_card(discovered.name)
            end)
            discovery.adapter_for, reference_registry.lookup = original_adapter, original_lookup
            local _, delete_err = repo.delete_profile(profile.id)
            test.is_nil(delete_err)
            if not ok then error(err, 0) end
        end)

        test.it("returns a reference source failure instead of saving an incomplete discovery", function()
            local profile, profile_err = repo.create_profile({
                name = "Reference source failure",
                provider_id = "wippy.llm.openai_compat:provider",
                config = { base_url = "https://example.invalid/v1" },
            })
            test.is_nil(profile_err)
            local original_adapter, original_lookup = discovery.adapter_for, reference_registry.lookup
            discovery.adapter_for = function() return {
                fetch = function() return { { id = "reference-error-model" } }, nil end,
            } end
            reference_registry.lookup = function() return nil, "reference source unavailable" end
            local ok, err = pcall(function()
                local result, discovery_err = discovery.discover(profile.id)
                test.is_nil(result)
                test.eq(discovery_err, "reference source unavailable")
                test.eq(repo.get_profile(profile.id).status, "unknown")
            end)
            discovery.adapter_for, reference_registry.lookup = original_adapter, original_lookup
            local _, delete_err = repo.delete_profile(profile.id)
            test.is_nil(delete_err)
            if not ok then error(err, 0) end
        end)

        test.it("returns a persistence failure instead of marking incomplete discovery healthy", function()
            local profile, profile_err = repo.create_profile({
                name = "Discovery persistence failure",
                provider_id = "wippy.llm.openai_compat:provider",
                config = { base_url = "https://example.invalid/v1" },
            })
            test.is_nil(profile_err)
            local original_adapter, original_save = discovery.adapter_for, repo.upsert_card
            discovery.adapter_for = function() return {
                fetch = function() return { { id = "fixture-model", context_length = 8192, pricing = { prompt = "0" } } }, nil end,
            } end
            repo.upsert_card = function() return nil, "fixture storage failure" end
            local ok, err = pcall(function()
                local result, discovery_err = discovery.discover(profile.id)
                test.is_nil(result)
                test.eq(discovery_err, "fixture storage failure")
                test.eq(repo.get_profile(profile.id).status, "unknown")
            end)
            discovery.adapter_for, repo.upsert_card = original_adapter, original_save
            local _, delete_err = repo.delete_profile(profile.id)
            test.is_nil(delete_err)
            if not ok then error(err, 0) end
        end)
        test.it("retains administrator classes and enabled state while refreshing provider metadata", function()
            local profile, perr = repo.create_profile({
                name = "Northwind discovery regression",
                provider_id = "wippy.llm.openai_compat:provider",
                config = { base_url = "https://example.invalid/v1" },
            })
            test.is_nil(perr)
            local original_adapter, original_lookup = discovery.adapter_for, reference_registry.lookup
            discovery.adapter_for = function() return {
                fetch = function() return { { id = "gemma-4-26b", context_length = 8192 } }, nil end,
            } end
            reference_registry.lookup = function() return nil end
            local ok, err = pcall(function()
                local first, first_err = discovery.discover(profile.id)
                test.is_nil(first_err)
                test.eq(first.count, 1)
                local name = first.models[1].name
                local card, save_err = repo.upsert_card({ name = name, classes = { "nano", "fast", "balanced", "premium" }, enabled = false }, first.models[1])
                test.is_nil(save_err)
                local again, again_err = discovery.discover(profile.id)
                test.is_nil(again_err)
                test.eq(again.count, 1)
                test.eq(table.concat(again.models[1].class, ","), "nano,fast,balanced,premium")
                test.is_false(again.models[1].enabled)
                test.eq(again.models[1].max_tokens, 8192)
            end)
            discovery.adapter_for, reference_registry.lookup = original_adapter, original_lookup
            local _, delete_err = repo.delete_profile(profile.id)
            test.is_nil(delete_err)
            if not ok then error(err) end
        end)
    end)
end

return { run = test.run_cases(define_tests) }
