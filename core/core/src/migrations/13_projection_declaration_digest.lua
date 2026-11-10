-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- The canonical hash of the declaration a projection was registered with.
-- Convergence compares it with the current declaration; a row without one
-- converges once and records it.
return require("migration").define(function()
    migration("13 projection declaration digest", function()
        for _, dialect in ipairs({ "postgres", "sqlite" }) do
            database(dialect, function()
                up(function(db)
                    local _, err = db:execute("ALTER TABLE kickside_projection ADD COLUMN declaration_digest TEXT")
                    if err then error(err) end
                end)
                down(function(db)
                    local _, err = db:execute("ALTER TABLE kickside_projection DROP COLUMN declaration_digest")
                    if err then error(err) end
                end)
            end)
        end
    end)
end)
