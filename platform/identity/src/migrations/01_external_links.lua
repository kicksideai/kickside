-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("01 external links", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_external_links (
                    "provider" text NOT NULL,
                    "external_id" text NOT NULL,
                    "user_id" text NOT NULL,
                    "display_name" text DEFAULT ''::text,
                    "default_agent_id" text DEFAULT ''::text,
                    "created_at" text NOT NULL DEFAULT to_char((now() AT TIME ZONE 'UTC'::text), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'::text),
                    "link_id" uuid NOT NULL,
                    CONSTRAINT "kickside_external_links_pkey" PRIMARY KEY (provider, external_id)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_external_links_user ON kickside_external_links USING btree (user_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE UNIQUE INDEX idx_external_links_link_id ON kickside_external_links USING btree (link_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_link_codes (
                    "code" text NOT NULL,
                    "user_id" text NOT NULL,
                    "agent_id" text DEFAULT ''::text,
                    "expires_at" bigint NOT NULL,
                    "used" integer NOT NULL DEFAULT 0,
                    "created_at" text NOT NULL DEFAULT to_char((now() AT TIME ZONE 'UTC'::text), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'::text),
                    CONSTRAINT "kickside_link_codes_pkey" PRIMARY KEY (code)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_link_codes_user ON kickside_link_codes USING btree (user_id)
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_link_codes")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_external_links")
                if err then error(tostring(err)) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_external_links (
                    provider TEXT NOT NULL,
                    external_id TEXT NOT NULL,
                    user_id TEXT NOT NULL,
                    display_name TEXT DEFAULT '',
                    default_agent_id TEXT DEFAULT '',
                    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')), link_id TEXT NOT NULL,
                    PRIMARY KEY (provider, external_id)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_external_links_user ON kickside_external_links (user_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_link_codes (
                    code TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    agent_id TEXT DEFAULT '',
                    expires_at INTEGER NOT NULL,
                    used INTEGER NOT NULL DEFAULT 0,
                    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_link_codes_user ON kickside_link_codes (user_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE UNIQUE INDEX idx_external_links_link_id ON kickside_external_links(link_id)
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_link_codes")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_external_links")
                if err then error(tostring(err)) end
            end)
        end)
    end)
end)
