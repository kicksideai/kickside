-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("05 retention", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_retention_policy (
                    "id" uuid NOT NULL,
                    "thread_id" uuid NOT NULL,
                    "event_hot_retention_days" integer NOT NULL DEFAULT 90,
                    "archive_mode" text NOT NULL DEFAULT 'tombstone_only'::text,
                    "enabled" boolean NOT NULL DEFAULT true,
                    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
                    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
                    CONSTRAINT "kickside_retention_policy_archive_mode_check" CHECK (archive_mode = ANY (ARRAY['tombstone_only'::text, 'hard_delete'::text])),
                    CONSTRAINT "kickside_retention_policy_pkey" PRIMARY KEY (id),
                    CONSTRAINT "kickside_retention_policy_thread_id_fkey" FOREIGN KEY (thread_id) REFERENCES kickside_thread(id) ON DELETE CASCADE
                    )
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_retention_policy_enabled ON kickside_retention_policy USING btree (enabled)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_retention_policy_thread ON kickside_retention_policy USING btree (thread_id, enabled)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE UNIQUE INDEX uq_kickside_retention_policy_thread ON kickside_retention_policy USING btree (thread_id)
                ]=])
                if err then error(err) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_retention_policy")
                if err then error(err) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_retention_policy (
                    id                          TEXT PRIMARY KEY,
                    thread_id                   TEXT NOT NULL REFERENCES kickside_thread(id) ON DELETE CASCADE,
                    event_hot_retention_days    INTEGER NOT NULL DEFAULT 90,
                    archive_mode                TEXT NOT NULL DEFAULT 'tombstone_only' CHECK (archive_mode IN ('tombstone_only', 'hard_delete')),
                    enabled                     INTEGER NOT NULL DEFAULT 1,
                    created_at                  TEXT NOT NULL DEFAULT (datetime('now')),
                    updated_at                  TEXT NOT NULL DEFAULT (datetime('now'))
                    )
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_retention_policy_enabled ON kickside_retention_policy (enabled)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_retention_policy_thread ON kickside_retention_policy (thread_id, enabled)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE UNIQUE INDEX uq_kickside_retention_policy_thread ON kickside_retention_policy (thread_id)
                ]=])
                if err then error(err) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_retention_policy")
                if err then error(err) end
            end)
        end)
    end)
end)
