-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local json = require("json")
local mapper = require("discovery_mapper")
local providers = require("provider_registry")

local function decode(value)
    local result, err = json.decode(value)
    if err then error(tostring(err)) end
    return result
end

return require("migration").define(function()
    migration("model card capability ownership", function()
        for _, engine in ipairs({ "sqlite", "postgres" }) do
            database(engine, function()
                up(function(db)
                    local _, alter_err = db:execute("ALTER TABLE kickside_model_cards ADD COLUMN capability_ownership_json TEXT")
                    if alter_err then error(tostring(alter_err)) end
                    local rows, read_err = db:query([[
                        SELECT name, provider_id, provider_model, source, capabilities_json, metadata_json
                        FROM kickside_model_cards
                    ]])
                    if read_err then error(tostring(read_err)) end
                    for _, row in ipairs(rows) do
                        -- Every stored capability is an administrator choice; every
                        -- capability discovery infers beyond them stays off.
                        local item = decode(row.metadata_json).discovered
                        local inferred = row.source == "discovered" and type(item) == "table"
                            and mapper.capabilities(providers.adapter_for(row.provider_id), row.provider_model,
                                item, { provider_id = row.provider_id })
                            or {}
                        local overrides = {}
                        for _, capability in ipairs(decode(row.capabilities_json)) do overrides[capability] = true end
                        for _, capability in ipairs(inferred) do
                            if overrides[capability] == nil then overrides[capability] = false end
                        end
                        local _, write_err = db:execute(
                            "UPDATE kickside_model_cards SET capability_ownership_json = $1 WHERE name = $2",
                            { json.encode({ inferred = inferred, overrides = overrides }), row.name })
                        if write_err then error(tostring(write_err)) end
                    end
                    return true
                end)
            end)
        end
    end)
end)
