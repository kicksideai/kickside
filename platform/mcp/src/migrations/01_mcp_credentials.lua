-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("01 mcp credentials", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_mcp_credentials (
                    "credential_id" text NOT NULL,
                    "token_hash" text NOT NULL,
                    "token_prefix" text NOT NULL,
                    "actor_id" text NOT NULL,
                    "whitelist_json" text NOT NULL DEFAULT '[]'::text,
                    "label" text NOT NULL DEFAULT ''::text,
                    "status" text NOT NULL DEFAULT 'active'::text,
                    "policy_json" text NOT NULL DEFAULT '{}'::text,
                    "context_json" text NOT NULL DEFAULT '{}'::text,
                    "expires_at" bigint,
                    "created_at" bigint NOT NULL,
                    "updated_at" bigint NOT NULL,
                    "last_used_at" bigint,
                    "revoked_at" bigint,
                    "revoked_by" text,
                    "execution_identity_json" text,
                    CONSTRAINT "kickside_mcp_credentials_status_check" CHECK (status = ANY (ARRAY['active'::text, 'revoked'::text])),
                    CONSTRAINT "kickside_mcp_credentials_pkey" PRIMARY KEY (credential_id),
                    CONSTRAINT "kickside_mcp_credentials_token_hash_key" UNIQUE (token_hash)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_mcp_cred_actor ON kickside_mcp_credentials USING btree (actor_id, status)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_mcp_credential_revoked_retention ON kickside_mcp_credentials USING btree (revoked_at, credential_id) WHERE ((status = 'revoked'::text) AND (revoked_at IS NOT NULL))
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_mcp_credential_expired_retention ON kickside_mcp_credentials USING btree (expires_at, credential_id) WHERE (expires_at IS NOT NULL)
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_mcp_credentials")
                if err then error(tostring(err)) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_mcp_credentials (
                    credential_id   TEXT PRIMARY KEY,
                    token_hash      TEXT NOT NULL UNIQUE,
                    token_prefix    TEXT NOT NULL,
                    actor_id        TEXT NOT NULL,
                    whitelist_json  TEXT NOT NULL DEFAULT '[]',
                    label           TEXT NOT NULL DEFAULT '',
                    status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
                    policy_json     TEXT NOT NULL DEFAULT '{}',
                    context_json    TEXT NOT NULL DEFAULT '{}',
                    expires_at      INTEGER,
                    created_at      INTEGER NOT NULL,
                    updated_at      INTEGER NOT NULL,
                    last_used_at    INTEGER,
                    revoked_at      INTEGER,
                    revoked_by      TEXT
                    , execution_identity_json TEXT)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_mcp_cred_actor ON kickside_mcp_credentials (actor_id, status)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_mcp_credential_revoked_retention
                    ON kickside_mcp_credentials(revoked_at,credential_id)
                    WHERE status='revoked' AND revoked_at IS NOT NULL
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_mcp_credential_expired_retention
                    ON kickside_mcp_credentials(expires_at,credential_id)
                    WHERE expires_at IS NOT NULL
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_mcp_credentials")
                if err then error(tostring(err)) end
            end)
        end)
    end)
end)
