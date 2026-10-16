-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("01 channel", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_channel_sessions (
                    "provider" text NOT NULL,
                    "external_id" text NOT NULL,
                    "session_id" text NOT NULL,
                    "updated_at" text NOT NULL DEFAULT to_char((now() AT TIME ZONE 'UTC'::text), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'::text),
                    CONSTRAINT "kickside_channel_sessions_pkey" PRIMARY KEY (provider, external_id)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_channel_session_idle ON kickside_channel_sessions USING btree (updated_at, provider, external_id)
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_channel_sessions")
                if err then error(tostring(err)) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_channel_sessions (
                    provider    TEXT NOT NULL,
                    external_id TEXT NOT NULL,
                    session_id  TEXT NOT NULL,
                    updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
                    PRIMARY KEY (provider, external_id)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_channel_session_idle
                    ON kickside_channel_sessions (updated_at, provider, external_id)
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_channel_sessions")
                if err then error(tostring(err)) end
            end)
        end)
    end)
end)
