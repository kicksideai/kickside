-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("01 create oauth connections table", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_oauth_connections (
                    "id" uuid NOT NULL,
                    "component_id" uuid NOT NULL,
                    "provider" character varying(100) NOT NULL,
                    "connection_name" character varying(255) NOT NULL,
                    "connection_description" text,
                    "schedule_id" uuid,
                    "scopes_granted" text,
                    "connection_state" character varying(50) DEFAULT 'connected'::character varying,
                    "token_type" character varying(50) DEFAULT 'Bearer'::character varying,
                    "expires_at" bigint,
                    "refresh_expires_at" bigint,
                    "access_token_encrypted" text,
                    "oauth_data_encrypted" text NOT NULL,
                    "created_at" text NOT NULL DEFAULT to_char((now() AT TIME ZONE 'UTC'::text), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'::text),
                    "updated_at" text NOT NULL DEFAULT to_char((now() AT TIME ZONE 'UTC'::text), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'::text),
                    "last_token_refresh" text,
                    "refresh_issued_at" text,
                    "refresh_enabled" boolean NOT NULL DEFAULT true,
                    "refresh_wake_generation" bigint NOT NULL DEFAULT 1,
                    "refresh_wake_applied_generation" bigint NOT NULL DEFAULT 0,
                    "refresh_retry_at" text,
                    CONSTRAINT "kickside_oauth_connections_pkey" PRIMARY KEY (id),
                    CONSTRAINT "kickside_oauth_connections_component_id_key" UNIQUE (component_id)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_oauth_connections_component_id ON kickside_oauth_connections USING btree (component_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_oauth_connections_provider ON kickside_oauth_connections USING btree (provider)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_oauth_connections_schedule_id ON kickside_oauth_connections USING btree (schedule_id) WHERE (schedule_id IS NOT NULL)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_oauth_connections_expires_at ON kickside_oauth_connections USING btree (expires_at) WHERE (expires_at IS NOT NULL)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_oauth_refresh_demand ON kickside_oauth_connections USING btree (refresh_retry_at, component_id)
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_oauth_connections")
                if err then error(tostring(err)) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_oauth_connections (
                    id TEXT PRIMARY KEY,
                    component_id TEXT NOT NULL UNIQUE,
                    provider TEXT NOT NULL,
                    connection_name TEXT NOT NULL,
                    connection_description TEXT,
                    schedule_id TEXT,

                    -- OAuth metadata (unencrypted for querying)
                    scopes_granted TEXT,
                    connection_state TEXT DEFAULT 'connected',
                    token_type TEXT DEFAULT 'Bearer',
                    expires_at INTEGER,
                    refresh_expires_at INTEGER,

                    -- Optimized access token storage (encrypted)
                    access_token_encrypted TEXT,

                    -- All sensitive OAuth data (encrypted JSON blob)
                    oauth_data_encrypted TEXT NOT NULL,

                    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
                    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
                    last_token_refresh TEXT
                    , refresh_issued_at TEXT, refresh_enabled BOOLEAN NOT NULL DEFAULT true, refresh_wake_generation BIGINT NOT NULL DEFAULT 1, refresh_wake_applied_generation BIGINT NOT NULL DEFAULT 0, refresh_retry_at TEXT)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_oauth_connections_component_id ON kickside_oauth_connections(component_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_oauth_connections_provider ON kickside_oauth_connections(provider)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_oauth_connections_schedule_id ON kickside_oauth_connections(schedule_id) WHERE schedule_id IS NOT NULL
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_oauth_connections_expires_at ON kickside_oauth_connections(expires_at) WHERE expires_at IS NOT NULL
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_oauth_refresh_demand ON kickside_oauth_connections(refresh_retry_at,component_id)
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_oauth_connections")
                if err then error(tostring(err)) end
            end)
        end)
    end)
end)
