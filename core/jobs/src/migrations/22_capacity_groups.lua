-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

return require("migration").define(function()
    migration("22 job capacity groups", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute("ALTER TABLE kickside_job ADD COLUMN IF NOT EXISTS capacity_group text")
                if err then error(err) end
                _, err = db:execute("DROP INDEX IF EXISTS uq_kickside_job_running_concurrency")
                if err then error(err) end
                _, err = db:execute([[CREATE UNIQUE INDEX IF NOT EXISTS uq_kickside_job_running_legacy_concurrency
                    ON kickside_job USING btree (concurrency_key)
                    WHERE concurrency_key IS NOT NULL AND capacity_group IS NULL AND status='running']])
                if err then error(err) end
                _, err = db:execute([[CREATE INDEX IF NOT EXISTS idx_kickside_job_running_capacity
                    ON kickside_job USING btree (capacity_group, concurrency_key)
                    WHERE capacity_group IS NOT NULL AND status='running']])
                if err then error(err) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local columns, columns_err = db:query("PRAGMA table_info(kickside_job)")
                if columns_err then error(columns_err) end
                local has_capacity_group = false
                for _, column in ipairs(columns or {}) do
                    if column.name == "capacity_group" then has_capacity_group = true; break end
                end
                if not has_capacity_group then
                    local _, alter_err = db:execute("ALTER TABLE kickside_job ADD COLUMN capacity_group TEXT")
                    if alter_err then error(alter_err) end
                end
                local _, err = db:execute("DROP INDEX IF EXISTS uq_kickside_job_running_concurrency")
                if err then error(err) end
                _, err = db:execute([[CREATE UNIQUE INDEX IF NOT EXISTS uq_kickside_job_running_legacy_concurrency
                    ON kickside_job(concurrency_key)
                    WHERE concurrency_key IS NOT NULL AND capacity_group IS NULL AND status='running']])
                if err then error(err) end
                _, err = db:execute([[CREATE INDEX IF NOT EXISTS idx_kickside_job_running_capacity
                    ON kickside_job(capacity_group, concurrency_key)
                    WHERE capacity_group IS NOT NULL AND status='running']])
                if err then error(err) end
            end)
        end)
    end)
end)
