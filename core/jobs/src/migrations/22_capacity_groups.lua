-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

return require("migration").define(function()
    migration("22 job capacity groups", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute("ALTER TABLE kickside_job ADD COLUMN capacity_group text")
                if err then error(err) end
                _, err = db:execute("DROP INDEX IF EXISTS uq_kickside_job_running_concurrency")
                if err then error(err) end
                _, err = db:execute([[CREATE UNIQUE INDEX uq_kickside_job_running_legacy_concurrency
                    ON kickside_job USING btree (concurrency_key)
                    WHERE concurrency_key IS NOT NULL AND capacity_group IS NULL AND status='running']])
                if err then error(err) end
                _, err = db:execute([[CREATE INDEX idx_kickside_job_running_capacity
                    ON kickside_job USING btree (capacity_group, concurrency_key)
                    WHERE capacity_group IS NOT NULL AND status='running']])
                if err then error(err) end
            end)
            down(function(db)
                local _, err = db:execute("DROP INDEX IF EXISTS idx_kickside_job_running_capacity")
                if err then error(err) end
                _, err = db:execute("DROP INDEX IF EXISTS uq_kickside_job_running_legacy_concurrency")
                if err then error(err) end
                _, err = db:execute("CREATE UNIQUE INDEX uq_kickside_job_running_concurrency ON kickside_job USING btree (concurrency_key) WHERE concurrency_key IS NOT NULL AND status='running'")
                if err then error(err) end
                _, err = db:execute("ALTER TABLE kickside_job DROP COLUMN capacity_group")
                if err then error(err) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute("ALTER TABLE kickside_job ADD COLUMN capacity_group TEXT")
                if err then error(err) end
                _, err = db:execute("DROP INDEX IF EXISTS uq_kickside_job_running_concurrency")
                if err then error(err) end
                _, err = db:execute([[CREATE UNIQUE INDEX uq_kickside_job_running_legacy_concurrency
                    ON kickside_job(concurrency_key)
                    WHERE concurrency_key IS NOT NULL AND capacity_group IS NULL AND status='running']])
                if err then error(err) end
                _, err = db:execute([[CREATE INDEX idx_kickside_job_running_capacity
                    ON kickside_job(capacity_group, concurrency_key)
                    WHERE capacity_group IS NOT NULL AND status='running']])
                if err then error(err) end
            end)
            down(function(db)
                local _, err = db:execute("DROP INDEX IF EXISTS idx_kickside_job_running_capacity")
                if err then error(err) end
                _, err = db:execute("DROP INDEX IF EXISTS uq_kickside_job_running_legacy_concurrency")
                if err then error(err) end
                _, err = db:execute("CREATE UNIQUE INDEX uq_kickside_job_running_concurrency ON kickside_job(concurrency_key) WHERE concurrency_key IS NOT NULL AND status='running'")
                if err then error(err) end
            end)
        end)
    end)
end)
