-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("07 job slots", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_wake_fanout (
                    "key" text NOT NULL,
                    "demand_generation" bigint NOT NULL DEFAULT 0,
                    "ack_generation" bigint NOT NULL DEFAULT 0,
                    CONSTRAINT "kickside_wake_fanout_check" CHECK (demand_generation >= ack_generation AND ack_generation >= 0),
                    CONSTRAINT "kickside_wake_fanout_pkey" PRIMARY KEY (key)
                    )
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_wake_fanout_ack ON kickside_wake_fanout USING btree (key) WHERE (ack_generation = demand_generation)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_job_worker (
                    "id" text NOT NULL,
                    "registry_version" text NOT NULL,
                    "current_job_id" uuid,
                    "started_at" timestamp with time zone NOT NULL DEFAULT now(),
                    "last_seen_at" timestamp with time zone NOT NULL DEFAULT now(),
                    CONSTRAINT "kickside_job_worker_pkey" PRIMARY KEY (id)
                    )
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_job_worker_seen ON kickside_job_worker USING btree (last_seen_at)
                ]=])
                if err then error(err) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_job_worker")
                if err then error(err) end
                local _, err = db:execute("DROP TABLE kickside_wake_fanout")
                if err then error(err) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_wake_fanout (
                    key TEXT PRIMARY KEY, demand_generation INTEGER NOT NULL DEFAULT 0,
                    ack_generation INTEGER NOT NULL DEFAULT 0,
                    CHECK (demand_generation >= ack_generation AND ack_generation >= 0))
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_job_worker (
                    id TEXT PRIMARY KEY, registry_version TEXT NOT NULL, current_job_id TEXT,
                    started_at TEXT NOT NULL DEFAULT (datetime('now')),
                    last_seen_at TEXT NOT NULL DEFAULT (datetime('now')))
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_job_worker_seen
                    ON kickside_job_worker (last_seen_at)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_wake_fanout_ack ON kickside_wake_fanout(key)
                    WHERE ack_generation = demand_generation
                ]=])
                if err then error(err) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_job_worker")
                if err then error(err) end
                local _, err = db:execute("DROP TABLE kickside_wake_fanout")
                if err then error(err) end
            end)
        end)
    end)
end)
