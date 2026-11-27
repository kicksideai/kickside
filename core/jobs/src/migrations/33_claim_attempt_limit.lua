-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local migrations = require("migration")
local runtime_policy = require("runtime_policy")

return function(options)
    local attempt_limit
    if options and options.direction == "down" then
        -- Resolve before the migration takes SQLite's writer. The old schema
        -- requires pending jobs to have their attempt limit materialized.
        local policy, err = runtime_policy.resolve()
        if err then error(err) end
        attempt_limit = policy.retry_max_attempts
    end
    return migrations.run(function()
        migration("33 claim-time attempt limit", function()
            for _, dialect in ipairs({"postgres", "sqlite"}) do
                database(dialect, function()
                    up(function(db)
                        local _, err = db:execute("ALTER TABLE kickside_job ALTER COLUMN max_attempts DROP NOT NULL")
                        if err then error(err) end
                    end)
                    down(function(db)
                        local _, err = db:execute("UPDATE kickside_job SET max_attempts=$1 WHERE max_attempts IS NULL", {attempt_limit})
                        if err then error(err) end
                        _, err = db:execute("ALTER TABLE kickside_job ALTER COLUMN max_attempts SET NOT NULL")
                        if err then error(err) end
                    end)
                end)
            end
        end)
    end, options)
end
