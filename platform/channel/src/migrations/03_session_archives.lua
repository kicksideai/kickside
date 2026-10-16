-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("03 session archives", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_channel_session_archives (
                    "old_session_id" text NOT NULL,
                    "new_session_id" text NOT NULL,
                    "provider" text NOT NULL,
                    "external_id" text NOT NULL,
                    "reason" text NOT NULL,
                    "rotated_at" text NOT NULL,
                    CONSTRAINT "kickside_channel_session_archives_pkey" PRIMARY KEY (old_session_id)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_channel_archive_retention ON kickside_channel_session_archives USING btree (rotated_at, old_session_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_channel_archive_conversation ON kickside_channel_session_archives USING btree (provider, external_id, old_session_id)
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_channel_session_archives")
                if err then error(tostring(err)) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_channel_session_archives (
                    old_session_id TEXT PRIMARY KEY,
                    new_session_id TEXT NOT NULL,
                    provider TEXT NOT NULL,
                    external_id TEXT NOT NULL,
                    reason TEXT NOT NULL,
                    rotated_at TEXT NOT NULL
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_channel_archive_retention
                    ON kickside_channel_session_archives (rotated_at, old_session_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_channel_archive_conversation
                    ON kickside_channel_session_archives(provider,external_id,old_session_id)
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_channel_session_archives")
                if err then error(tostring(err)) end
            end)
        end)
    end)
end)
