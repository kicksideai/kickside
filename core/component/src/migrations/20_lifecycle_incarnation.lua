-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
return require("migration").define(function()
    migration("20 lifecycle incarnation", function()
        for _, engine in ipairs({"postgres", "sqlite"}) do
            database(engine, function()
                up(function(db)
                    local _, err = db:execute("ALTER TABLE kickside_components ADD COLUMN lifecycle_incarnation TEXT")
                    if err then error(err) end
                end)
            end)
        end
    end)
end)
