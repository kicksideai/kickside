-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Owner history pages seek by their complete timestamp/id order on populated installs.
return require("migration").define(function()
    migration("26 owner job listing order", function()
        for _, dialect in ipairs({"postgres", "sqlite"}) do
            database(dialect, function()
                up(function(db)
                    local _, err = db:execute([[CREATE INDEX IF NOT EXISTS idx_job_owner_created
                        ON kickside_job(owner_kind,owner_id,created_at DESC,id DESC)]])
                    if err then error(err) end
                end)
                down(function(db)
                    local _, err = db:execute("DROP INDEX IF EXISTS idx_job_owner_created")
                    if err then error(err) end
                end)
            end)
        end
    end)
end)
