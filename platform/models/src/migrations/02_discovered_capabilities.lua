-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local json = require("json")
local adapter = require("provider_openai_like")
local common = require("discovery_common")

local function decode(value)
    local result, err = json.decode(value)
    if err then error(tostring(err)) end
    if type(result) ~= "table" then error("discovered card metadata must be an object or array") end
    return result
end

return require("migration").define(function()
    migration("correct first-party discovered model capabilities", function()
        for _, engine in ipairs({ "sqlite", "postgres" }) do
            database(engine, function()
                up(function(db)
                    local rows, read_err = db:query([[
                        SELECT name, provider_model, capabilities_json, options_json, metadata_json
                        FROM kickside_model_cards
                        WHERE source = 'discovered' AND provider_id = $1
                        ORDER BY name
                    ]], { common.PROVIDERS.OPENAI })
                    if read_err then error(tostring(read_err)) end
                    for _, row in ipairs(rows) do
                        local metadata = decode(row.metadata_json)
                        local item = metadata.discovered
                        if type(item) == "table" then
                            local inferred = adapter.capabilities(row.provider_model, item, { provider_id = common.PROVIDERS.OPENAI })
                            local saved = decode(row.capabilities_json)
                            local options = decode(row.options_json)
                            local capabilities = {}
                            local changed = false
                            local options_json = row.options_json
                            for _, capability in ipairs(saved) do
                                if capability == "generate" and not common.table_has(inferred, "generate") then
                                    changed = true
                                else
                                    table.insert(capabilities, capability)
                                end
                            end
                            if common.table_has(saved, "generate") and common.table_has(inferred, "reasoning") then
                                if not common.table_has(capabilities, "reasoning") then
                                    table.insert(capabilities, "reasoning")
                                    changed = true
                                end
                                -- A supplied value belongs to the administrator, including false.
                                if options.reasoning_model_request == nil then
                                    options.reasoning_model_request = true
                                    options_json = json.encode(options)
                                    changed = true
                                end
                            end
                            if changed then
                                local _, write_err = db:execute([[
                                    UPDATE kickside_model_cards
                                    SET capabilities_json = $1, options_json = $2 WHERE name = $3
                                ]], { json.encode(capabilities), options_json, row.name })
                                if write_err then error(tostring(write_err)) end
                            end
                        end
                    end
                    return true
                end)
            end)
        end
    end)
end)
