-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Prepared output records the applied declaration hash it was prepared under.
-- Rows prepared before this column existed hold NULL: their declaration is unknown.
return require("migration").define(function()
    migration("16 prepared declaration", function()
        for _, dialect in ipairs({"postgres", "sqlite"}) do
            database(dialect, function()
                up(function(db)
                    local _, err = db:execute("ALTER TABLE kickside_automation_prepared ADD COLUMN declaration_hash TEXT")
                    if err then error(tostring(err)) end
                end)
            end)
        end
    end)
end)
