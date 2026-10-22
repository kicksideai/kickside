-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local funcs = require("funcs")
local json = require("json")
local repo = require("models_repo")

local MIGRATION = "kickside.models.migrations:02_discovered_capabilities"
local function execute(db, statement, args)
    local result, err = db:execute(statement, args or {})
    if err then error(tostring(err)) end
    return result
end
local function rows(db)
    local result, err = db:query("SELECT * FROM kickside_model_cards WHERE name LIKE 'migration-capabilities/%' ORDER BY name")
    if err then error(tostring(err)) end
    return result
end
local function define_tests()
    test.describe("discovered metadata upgrade", function()
        test.it("corrects the previous published card shape without rewriting user settings", function()
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            local ok, err = pcall(function()
                local fixtures = {
                    { "reasoning", "gpt-6", "discovered", "wippy.llm.openai:provider", {}, { "generate" }, {} },
                    { "custom-options", "gpt-10", "discovered", "wippy.llm.openai:provider", { reasoning_model_request = false, temperature = 0.4, nested = { custom = 7 } }, { "generate", "vision" }, {} },
                    { "image", "gpt-image-2", "discovered", "wippy.llm.openai:provider", { custom = "kept" }, { "generate" }, {} },
                    { "audio", "gpt-4o-mini-tts", "discovered", "wippy.llm.openai:provider", {}, { "generate", "vision" }, {} },
                    { "explicit", "gpt-image-2", "discovered", "wippy.llm.openai:provider", {}, { "generate" }, { capabilities = { "generate" } } },
                    { "manual", "gpt-6", "manual", "wippy.llm.openai:provider", {}, { "generate" }, {} },
                    { "compatible", "gpt-image-2", "discovered", "wippy.llm.openai_compat:provider", {}, { "generate" }, {} },
                    { "chat", "gpt-6-chat-latest", "discovered", "wippy.llm.openai:provider", {}, { "generate" }, {} },
                }
                for _, f in ipairs(fixtures) do
                    execute(db, [[INSERT INTO kickside_model_cards
                        (name, title, provider_id, provider_profile_id, provider_model, capabilities_json,
                         classes_json, priority, max_tokens, output_tokens, options_json, source, enabled,
                         metadata_json, created_at, updated_at)
                        VALUES ($1, 'Saved title', $2, 'saved-profile', $3, $4, '["fast","balanced"]', 37,
                                32768, 4096, $5, $6, 0, $7, 1, 2)]], {
                        "migration-capabilities/" .. f[1], f[4], f[2], json.encode(f[6]), json.encode(f[5]), f[3],
                        json.encode({ discovered = f[7], discovery_provider = f[4], discovery_profile_id = "saved-profile", custom = "kept" }),
                    })
                end
                local before = rows(db)
                execute(db, [[INSERT INTO kickside_model_cards
                    (name, title, provider_id, provider_model, source, metadata_json, created_at, updated_at)
                    VALUES ('migration-capabilities/zz-invalid', 'Invalid JSON', 'wippy.llm.openai:provider',
                            'gpt-6', 'discovered', '{', 1, 2)]])
                local failed, failure_err = funcs.call(MIGRATION, { database_id = "app:db", id = "discovered-capabilities-upgrade", direction = "up", force = true })
                test.is_nil(failure_err)
                test.eq(failed.failed, 1)
                execute(db, "DELETE FROM kickside_model_cards WHERE name = 'migration-capabilities/zz-invalid'")
                local rolled_back = rows(db)
                for i, row in ipairs(rolled_back) do
                    for key, value in pairs(before[i]) do test.eq(row[key], value, row.name .. ":" .. key) end
                end
                local result, call_err = funcs.call(MIGRATION, { database_id = "app:db", id = "discovered-capabilities-upgrade", direction = "up", force = true })
                test.is_nil(call_err)
                if result.failed ~= 0 then error(json.encode(result)) end
                local after = rows(db)
                for i, row in ipairs(after) do
                    for key, value in pairs(before[i]) do
                        if key ~= "capabilities_json" and key ~= "options_json" then test.eq(row[key], value, row.name .. ":" .. key) end
                    end
                    local capabilities = json.decode(row.capabilities_json)
                    local options = json.decode(row.options_json)
                    if row.name == "migration-capabilities/reasoning" then
                        test.eq(table.concat(capabilities, ","), "generate,reasoning")
                        test.eq(options.reasoning_model_request, true)
                    elseif row.name == "migration-capabilities/custom-options" then
                        test.eq(table.concat(capabilities, ","), "generate,vision,reasoning")
                        test.eq(options.reasoning_model_request, false)
                        test.eq(options.temperature, 0.4)
                        test.eq(options.nested.custom, 7)
                    elseif row.name == "migration-capabilities/image" then
                        test.eq(#capabilities, 0)
                        test.eq(options.custom, "kept")
                    elseif row.name == "migration-capabilities/audio" then
                        test.eq(table.concat(capabilities, ","), "vision")
                    else
                        test.eq(row.capabilities_json, before[i].capabilities_json)
                        test.eq(row.options_json, before[i].options_json)
                    end
                end
                local repeated, repeat_err = funcs.call(MIGRATION, { database_id = "app:db", id = "discovered-capabilities-replay", direction = "up", force = true })
                test.is_nil(repeat_err)
                if repeated.failed ~= 0 then error(json.encode(repeated)) end
                local again = rows(db)
                for i, row in ipairs(again) do
                    for key, value in pairs(after[i]) do test.eq(row[key], value, row.name .. ":" .. key) end
                end
            end)
            execute(db, "DELETE FROM kickside_model_cards WHERE name LIKE 'migration-capabilities/%'")
            execute(db, "DELETE FROM _migrations WHERE id IN ($1, $2)", { "discovered-capabilities-upgrade", "discovered-capabilities-replay" })
            db:release()
            local _, reload_err = repo.reload()
            test.is_nil(reload_err)
            if not ok then error(err) end
        end)
    end)
end
return { run = test.run_cases(define_tests) }
