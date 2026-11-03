-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Each claim persists the execution policy it started with, so later policy
-- changes never shorten a running execution's lease or time limit.
return require("migration").define(function()
    migration("24 Jobs execution policy snapshots", function()
        for _, dialect in ipairs({ "postgres", "sqlite" }) do
            database(dialect, function()
                up(function(db)
                    local _, err = db:execute("ALTER TABLE kickside_job ADD COLUMN lease_policy TEXT")
                    if err then error(err) end
                end)
                down(function(db)
                    local _, err = db:execute("ALTER TABLE kickside_job DROP COLUMN lease_policy")
                    if err then error(err) end
                end)
            end)
        end
    end)
end)
