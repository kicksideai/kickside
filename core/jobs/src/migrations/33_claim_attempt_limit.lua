-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
return require("migration").define(function()
    migration("33 claim-time attempt limit", function()
        for _, dialect in ipairs({"postgres", "sqlite"}) do
            database(dialect, function()
                up(function(db)
                    local _, err = db:execute("ALTER TABLE kickside_job ALTER COLUMN max_attempts DROP NOT NULL")
                    if err then error(err) end
                end)
            end)
        end
    end)
end)
