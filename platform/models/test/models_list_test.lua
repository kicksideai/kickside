local test = require("test")
local handler = require("list_fixture")
local state = require("list_fixture_state")
local native_handler = require("native_list_fixture")
local repo = require("models_repo")
local function define_tests()
    test.describe("Model list presentation", function()
        test.it("exposes the selected model output budget without embedding-only cards", function()
            local _, err = handler.handler()
            test.is_nil(err)
            local result = state.result()
            test.eq(result.success, true)
            test.eq(#result.models, 1)
            test.eq(result.models[1].name, "fixture/generate")
            test.eq(result.models[1].output_tokens, 8192)
        end)
        test.it("projects distinct profile badges without returning provider configuration", function()
            local adapter = "wippy.llm.openai_compat:provider"
            local first_id = "badge-test-first"
            local second_id = "badge-test-second"
            local builtin_name = "badge-test/native"
            local function profile(id, name, icon)
                local saved, err = repo.create_profile({
                    id = id, name = name, provider_id = adapter, icon = icon,
                    base_url = "https://fixture.invalid/v1", api_key = "private-fixture-value",
                })
                test.is_nil(err)
                test.eq(saved.icon, icon)
            end
            local function card(name, id, provider_id)
                local saved, err = repo.upsert_card({
                    name = name, title = name, capabilities = { "generate" },
                    provider_id = provider_id or adapter, provider_profile_id = id,
                    provider_model = "fixture-model",
                })
                test.is_nil(err)
                test.not_nil(saved)
            end
            local function listed()
                local _, err = native_handler.handler()
                test.is_nil(err)
                local by_name: { [string]: any } = {}
                for _, row in ipairs(state.result().models) do by_name[row.name] = row end
                return by_name
            end
            local ok, err = pcall(function()
                profile(first_id, "First endpoint", "tabler:cloud")
                profile(second_id, "Second endpoint", "tabler:server")
                card(first_id .. "/one", first_id)
                card(second_id .. "/two", second_id)
                card(builtin_name, nil, "wippy.llm.openai:provider")
                local rows = listed()
                local first = rows[first_id .. "/one"]
                local second = rows[second_id .. "/two"]
                test.eq(first.provider, "openai_compat")
                test.eq(first.provider_title, "First endpoint")
                test.eq(first.provider_icon, "tabler:cloud")
                test.eq(second.provider, first.provider)
                test.eq(second.provider_title, "Second endpoint")
                test.eq(second.provider_icon, "tabler:server")
                local builtin = assert(rows[builtin_name], "built-in model was omitted")
                test.eq(builtin.provider_title, "OpenAI")
                test.eq(builtin.provider_icon, "tabler:brand-openai")
                for _, row in ipairs({ first, second }) do
                    test.is_nil(row.config)
                    test.is_nil(row.context)
                    test.is_nil(row.api_key)
                    test.is_nil(row.base_url)
                    test.is_nil(row.provider_profile_id)
                end

                local changed, change_err = repo.update_profile(first_id, { name = "Renamed endpoint" })
                test.is_nil(change_err)
                test.eq(changed.icon, "tabler:cloud")
                local rejected, reject_err = repo.update_profile(first_id, { icon = "https://fixture.invalid/icon.svg" })
                test.is_nil(rejected)
                test.not_nil(reject_err)
                local report, import_err = repo.import({
                    version = 1, profiles = {{ id = first_id, icon = "tabler:rocket" }}, cards = {},
                })
                test.is_nil(import_err)
                test.eq(report.profiles.updated[1], first_id)
                local exported, export_err = repo.export()
                test.is_nil(export_err)
                for _, entry in ipairs(exported.profiles) do
                    if entry.id == first_id then test.eq(entry.icon, "tabler:rocket") end
                end
                rows = listed()
                test.eq(rows[first_id .. "/one"].provider_title, "Renamed endpoint")
                test.eq(rows[first_id .. "/one"].provider_icon, "tabler:rocket")
                local cleared, clear_err = repo.update_profile(first_id, { icon = "" })
                test.is_nil(clear_err)
                test.eq(cleared.icon, "")
                -- The adapter has multiple differently branded presets. Do not
                -- borrow an arbitrary preset's icon for a legacy/custom profile.
                test.is_nil(listed()[first_id .. "/one"].provider_icon)
                test.eq(listed()[second_id .. "/two"].provider_icon, "tabler:server")
            end)
            repo.delete_profile(first_id)
            repo.delete_profile(second_id)
            repo.delete_card(builtin_name)
            if not ok then error(err) end
        end)
    end)
end
return { run = test.run_cases(define_tests) }
