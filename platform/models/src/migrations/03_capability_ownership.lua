-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
return require("migration").define(function()
    migration("model card capability ownership", function()
        for _, engine in ipairs({ "sqlite", "postgres" }) do
            database(engine, function()
                up(function(db)
                    local columns, read_err = db:query(engine == "sqlite"
                        and "PRAGMA table_info(kickside_model_cards)"
                        or "SELECT column_name AS name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'kickside_model_cards'")
                    if read_err then error(tostring(read_err)) end
                    for _, column in ipairs(columns) do
                        if column.name == "capability_ownership_json" then return true end
                    end
                    local _, write_err = db:execute("ALTER TABLE kickside_model_cards ADD COLUMN capability_ownership_json TEXT")
                    if write_err then error(tostring(write_err)) end
                    return true
                end)
            end)
        end
    end)
end)
