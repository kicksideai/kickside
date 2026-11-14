local test = require("test")
local sql = require("sql")
local json = require("json")
local funcs = require("funcs")
local fake_http = require("fake_http")
local save_handler = require("save_handler")

local function save(input)
    fake_http.prepare(json.encode(input))
    save_handler.handler()
    test.eq(fake_http.status(), 200, json.encode(fake_http.payload()))
    return fake_http.payload().model
end
local repo = require("models_repo")
local discovery = require("model_discovery")
local reference_registry = require("reference_registry")
local card_policy = require("card_policy")

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
        test.it("keeps administrator additions on rediscovery and infers new cards", function()
            local profile, perr = repo.create_profile({
                name = "Capability retention",
                provider_id = "wippy.llm.openai_compat:provider",
                config = { base_url = "https://example.invalid/v1" },
            })
            test.is_nil(perr)
            local original_adapter, original_lookup = discovery.adapter_for, reference_registry.lookup
            local rows = { { id = "example-model", context_length = 8192 } }
            discovery.adapter_for = function() return {
                fetch = function() return rows, nil end,
            } end
            reference_registry.lookup = function() return nil end
            local ok, err = pcall(function()
                local first, first_err = discovery.discover(profile.id)
                test.is_nil(first_err)
                local name = first.models[1].name
                test.eq(table.concat(first.models[1].capabilities, ","), "generate")
                local _, save_err = repo.upsert_card({ name = name, capabilities = { "generate", "structured_output" } }, first.models[1])
                test.is_nil(save_err)

                rows = { { id = "example-model", context_length = 8192 }, { id = "example-model-2", context_length = 8192 } }
                local again, again_err = discovery.discover(profile.id)
                test.is_nil(again_err)
                test.eq(again.count, 2)
                for _, card in ipairs(again.models) do
                    if card.name == name then
                        test.eq(table.concat(card.capabilities, ","), "generate,structured_output")
                    else
                        test.eq(table.concat(card.capabilities, ","), "generate")
                    end
                end
            end)
            discovery.adapter_for, reference_registry.lookup = original_adapter, original_lookup
            local _, delete_err = repo.delete_profile(profile.id)
            test.is_nil(delete_err)
            if not ok then error(err, 0) end
        end)

        local function capability_case(check)
            local profile, profile_err = repo.create_profile({
                name = "Capability ownership", provider_id = "wippy.llm.openai_compat:provider",
                config = { base_url = "https://example.invalid/v1" },
            })
            test.is_nil(profile_err)
            local original_adapter = discovery.adapter_for
            local inferred = { "generate" }
            discovery.adapter_for = function() return {
                fetch = function() return { { id = "mutable-model", context_length = 8192,
                    max_output_tokens = 1024, pricing = { prompt = "0" } } }, nil end,
                capabilities = function() return inferred end,
            } end
            local function discover(capabilities)
                inferred = capabilities
                local result, err = discovery.discover(profile.id)
                test.is_nil(err)
                return result.models[1]
            end
            local ok, err = pcall(function() check(discover) end)
            discovery.adapter_for = original_adapter
            local _, delete_err = repo.delete_profile(profile.id)
            test.is_nil(delete_err)
            if not ok then error(err, 0) end
        end

        test.it("refreshes discovery-owned additions, removals and reused identities", function()
            capability_case(function(discover)
                local card = discover({ "generate" })
                local name = card.name
                card = discover({ "generate", "vision" })
                test.eq(table.concat(card.capabilities, ","), "generate,vision")
                card = discover({ "generate" })
                test.eq(table.concat(card.capabilities, ","), "generate")
                card = discover({ "embed" })
                test.eq(card.name, name)
                test.eq(table.concat(card.capabilities, ","), "embed")
            end)
        end)

        test.it("keeps explicit additions and removals until each override resets", function()
            capability_case(function(discover)
                local card = discover({ "generate", "vision" })
                local saved = save({ name = card.name,
                    capabilities = { "generate", "structured_output" } })
                card = discover({ "generate", "vision", "tool_use" })
                test.eq(table.concat(card.capabilities, ","), "generate,tool_use,structured_output")
                -- Matching upstream values do not erase administrator ownership.
                discover({ "generate", "structured_output" })
                card = discover({ "generate", "vision" })
                test.eq(table.concat(card.capabilities, ","), "generate,structured_output")
                saved = save({ name = card.name, reset_capabilities = { "vision" } })
                test.eq(table.concat(saved.capabilities, ","), "generate,vision,structured_output")
                saved = save({ name = card.name, reset_capabilities = { "structured_output" } })
                test.eq(table.concat(saved.capabilities, ","), "generate,vision")
                card = discover({ "generate", "structured_output" })
                test.eq(table.concat(card.capabilities, ","), "generate,structured_output")
            end)
        end)

        test.it("converts every stored card to ownership that resolves to its stored capabilities", function()
            local db, db_err = sql.get("app:ownership_upgrade_db")
            test.is_nil(db_err)
            local function migrate(entry)
                local result, err = funcs.call("kickside.models.migrations:" .. entry, {
                    database_id = "app:ownership_upgrade_db", id = entry, direction = "up", force = true,
                })
                test.is_nil(err)
                test.eq(result.failed, 0, json.encode(result))
            end
            local ok, err = pcall(function()
                migrate("01_models_schema")
                migrate("02_discovered_capabilities")
                local _, insert_err = db:execute([[INSERT INTO kickside_model_cards
                    (name, title, provider_id, provider_model, capabilities_json, source, metadata_json, created_at, updated_at)
                    VALUES ('upgrade/discovered', 'Discovered', 'wippy.llm.openai_compat:provider', 'vision-model',
                            '["generate","structured_output"]', 'discovered',
                            '{"discovered":{"id":"vision-model","capabilities":["generate","vision"]}}', 1, 2),
                           ('upgrade/manual', 'Manual', 'wippy.llm.openai_compat:provider', 'embed-model',
                            '["embed"]', 'manual', '{}', 1, 2)]])
                test.is_nil(insert_err)
                migrate("03_capability_ownership")
                local rows, read_err = db:query("SELECT * FROM kickside_model_cards ORDER BY name")
                test.is_nil(read_err)

                local discovered = card_policy.build_card(rows[1])
                test.eq(table.concat(discovered.capabilities, ","), "generate,structured_output")
                test.eq(table.concat(discovered.capability_ownership.inferred, ","), "generate,vision")
                local rediscovered = card_policy.clean_card_input({ name = discovered.name }, discovered, { "generate", "vision" })
                test.eq(table.concat(rediscovered.capabilities, ","), "generate,structured_output")
                local reset = card_policy.clean_card_input({ name = discovered.name, reset_capabilities = { "vision" } }, discovered)
                test.eq(table.concat(reset.capabilities, ","), "generate,vision,structured_output")

                local manual = card_policy.build_card(rows[2])
                test.eq(table.concat(manual.capabilities, ","), "embed")
                test.eq(#manual.capability_ownership.inferred, 0)
                local edited = card_policy.clean_card_input({ name = manual.name, title = "Edited" }, manual)
                test.eq(table.concat(edited.capabilities, ","), "embed")
            end)
            db:release()
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
