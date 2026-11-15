-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local json = require("json")

return require("migration").define(function()
    migration("model card capability ownership", function()
        for _, engine in ipairs({ "sqlite", "postgres" }) do
            database(engine, function()
                up(function(db)
                    local columns, columns_err = db:query(engine == "sqlite"
                        and "PRAGMA table_info(kickside_model_cards)"
                        or "SELECT column_name AS name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'kickside_model_cards'")
                    if columns_err then error(tostring(columns_err)) end
                    local exists = false
                    for _, column in ipairs(columns) do
                        if column.name == "capability_ownership_json" then exists = true end
                    end
                    if not exists then
                        local _, alter_err = db:execute("ALTER TABLE kickside_model_cards ADD COLUMN capability_ownership_json TEXT")
                        if alter_err then error(tostring(alter_err)) end
                    end
                    local after = nil
                    while true do
                        local rows, read_err = db:query([[
                            SELECT name, capabilities_json FROM kickside_model_cards
                            WHERE capability_ownership_json IS NULL AND ]] .. (after ~= nil and "name > $1" or "1 = 1") .. [[
                            ORDER BY name LIMIT 200
                        ]], after ~= nil and { after } or {})
                        if read_err then error(tostring(read_err)) end
                        if #rows == 0 then break end
                        local cases, names, args = {}, {}, {}
                        for _, row in ipairs(rows) do
                            -- Old metadata omits inference inputs. The first complete
                            -- discovery establishes exclusions against this saved set.
                            local capabilities, decode_err = json.decode(row.capabilities_json)
                            if decode_err then error(tostring(decode_err)) end
                            local overrides = {}
                            for _, capability in ipairs(capabilities) do overrides[capability] = true end
                            table.insert(args, row.name)
                            local name_arg = "$" .. #args
                            local encoded, encode_err = json.encode({ overrides = overrides })
                            if encode_err then error(tostring(encode_err)) end
                            table.insert(args, encoded)
                            table.insert(cases, "WHEN " .. name_arg .. " THEN $" .. #args)
                            table.insert(names, name_arg)
                        end
                        local _, write_err = db:execute(
                            "UPDATE kickside_model_cards SET capability_ownership_json = CASE name "
                                .. table.concat(cases, " ") .. " END WHERE capability_ownership_json IS NULL AND name IN ("
                                .. table.concat(names, ",") .. ")", args)
                        if write_err then error(tostring(write_err)) end
                        after = rows[#rows].name
                    end
                    return true
                end)
            end)
        end
    end)
end)
