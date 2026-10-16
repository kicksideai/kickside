-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("12 thread reap", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_component_thread_reap (
                    "component_id" text NOT NULL,
                    "created_at" text NOT NULL,
                    "last_attempt_at" text NOT NULL DEFAULT ''::text,
                    CONSTRAINT "kickside_component_thread_reap_pkey" PRIMARY KEY (component_id)
                    )
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_component_thread_reap_created ON kickside_component_thread_reap USING btree (last_attempt_at, created_at, component_id)
                ]=])
                if err then error(err) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_component_thread_reap")
                if err then error(err) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_component_thread_reap (
                    component_id TEXT PRIMARY KEY,
                    created_at TEXT NOT NULL,
                    last_attempt_at TEXT NOT NULL DEFAULT ''
                    )
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_component_thread_reap_created
                    ON kickside_component_thread_reap (last_attempt_at, created_at, component_id)
                ]=])
                if err then error(err) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_component_thread_reap")
                if err then error(err) end
            end)
        end)
    end)
end)
