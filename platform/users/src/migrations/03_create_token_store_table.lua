-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("03 create token store table", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_user_auth_tokens (
                    "token_key" text NOT NULL,
                    "token_value" bytea NOT NULL,
                    "expires_at" timestamp without time zone,
                    "created_at" text NOT NULL DEFAULT to_char((now() AT TIME ZONE 'UTC'::text), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'::text),
                    "updated_at" text NOT NULL DEFAULT to_char((now() AT TIME ZONE 'UTC'::text), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'::text),
                    CONSTRAINT "kickside_user_auth_tokens_pkey" PRIMARY KEY (token_key)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_user_auth_tokens_expires_at ON kickside_user_auth_tokens USING btree (expires_at)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_user_auth_tokens_created_at ON kickside_user_auth_tokens USING btree (created_at DESC)
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_user_auth_tokens")
                if err then error(tostring(err)) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_user_auth_tokens (
                    token_key TEXT PRIMARY KEY,
                    token_value BLOB NOT NULL,
                    expires_at INTEGER,
                    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
                    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_user_auth_tokens_expires_at ON kickside_user_auth_tokens(expires_at)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_user_auth_tokens_created_at ON kickside_user_auth_tokens(created_at DESC)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TRIGGER trg_kickside_user_auth_token_session_cleanup
                    AFTER DELETE ON kickside_user_auth_tokens
                    FOR EACH ROW
                    BEGIN
                    DELETE FROM kickside_user_sessions WHERE token_key = OLD.token_key;
                    END
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_user_auth_tokens")
                if err then error(tostring(err)) end
            end)
        end)
    end)
end)
