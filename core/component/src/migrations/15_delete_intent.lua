-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
return require("migration").define(function()
    migration("15 deletion intent", function()
        for _, engine in ipairs({"postgres", "sqlite"}) do
            database(engine, function()
                up(function(db)
                    local columns, read_err = db:query(engine == "postgres"
                        and "SELECT column_name AS name FROM information_schema.columns WHERE table_schema=current_schema() AND table_name='kickside_components'"
                        or "PRAGMA table_info(kickside_components)")
                    if read_err then error(read_err) end
                    for _, column in ipairs(columns) do
                        if column.name == "delete_intent" then return end
                    end
                    local _, err = db:execute("ALTER TABLE kickside_components ADD COLUMN delete_intent TEXT")
                    if err then error(err) end
                end)
            end)
        end
    end)
end)
