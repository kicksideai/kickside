-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("14 worker pulse", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_job_worker_pulse (
                    "worker_id" text NOT NULL,
                    "registry_version" text NOT NULL,
                    "last_seen_at" timestamp with time zone NOT NULL,
                    CONSTRAINT "kickside_job_worker_pulse_pkey" PRIMARY KEY (worker_id)
                    )
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_job_worker_pulse_seen ON kickside_job_worker_pulse USING btree (last_seen_at)
                ]=])
                if err then error(err) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_job_worker_pulse")
                if err then error(err) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_job_worker_pulse (
                    worker_id TEXT PRIMARY KEY,
                    registry_version TEXT NOT NULL,
                    last_seen_at TEXT NOT NULL)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_job_worker_pulse_seen
                    ON kickside_job_worker_pulse(last_seen_at)
                ]=])
                if err then error(err) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_job_worker_pulse")
                if err then error(err) end
            end)
        end)
    end)
end)
