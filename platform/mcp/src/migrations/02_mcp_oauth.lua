-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("02 mcp oauth", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_mcp_oauth_clients (
                    "client_id" text NOT NULL,
                    "client_name" text NOT NULL DEFAULT ''::text,
                    "redirect_uris_json" text NOT NULL,
                    "created_at" bigint NOT NULL,
                    "last_used_at" bigint NOT NULL DEFAULT 0,
                    CONSTRAINT "kickside_mcp_oauth_clients_pkey" PRIMARY KEY (client_id)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_mcp_oauth_client_idle ON kickside_mcp_oauth_clients USING btree (last_used_at, client_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_mcp_oauth_codes (
                    "code_hash" text NOT NULL,
                    "client_id" text NOT NULL,
                    "actor_id" text NOT NULL,
                    "redirect_uri" text NOT NULL,
                    "code_challenge" text NOT NULL,
                    "grant_json" text NOT NULL,
                    "resource" text NOT NULL DEFAULT ''::text,
                    "used" integer NOT NULL DEFAULT 0,
                    "expires_at" bigint NOT NULL,
                    "created_at" bigint NOT NULL,
                    CONSTRAINT "kickside_mcp_oauth_codes_pkey" PRIMARY KEY (code_hash)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_mcp_oauth_codes_expiry ON kickside_mcp_oauth_codes USING btree (expires_at, code_hash)
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_mcp_oauth_codes")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_mcp_oauth_clients")
                if err then error(tostring(err)) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_mcp_oauth_clients (
                    client_id           TEXT PRIMARY KEY,
                    client_name         TEXT NOT NULL DEFAULT '',
                    redirect_uris_json  TEXT NOT NULL,
                    created_at          INTEGER NOT NULL
                    , last_used_at INTEGER NOT NULL DEFAULT 0)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE "kickside_mcp_oauth_codes" (
                    code_hash       TEXT PRIMARY KEY,
                    client_id       TEXT NOT NULL,
                    actor_id        TEXT NOT NULL,
                    redirect_uri    TEXT NOT NULL,
                    code_challenge  TEXT NOT NULL,
                    grant_json      TEXT NOT NULL,
                    resource        TEXT NOT NULL DEFAULT '',
                    used            INTEGER NOT NULL DEFAULT 0,
                    expires_at      INTEGER NOT NULL,
                    created_at      INTEGER NOT NULL
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_mcp_oauth_codes_expiry
                    ON "kickside_mcp_oauth_codes"(expires_at,code_hash)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_mcp_oauth_client_idle
                    ON kickside_mcp_oauth_clients(last_used_at,client_id)
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_mcp_oauth_codes")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_mcp_oauth_clients")
                if err then error(tostring(err)) end
            end)
        end)
    end)
end)
