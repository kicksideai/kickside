-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("04 create user sessions", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_user_sessions (
                    "token_key" text NOT NULL,
                    "user_id" text NOT NULL,
                    "auth_generation" integer NOT NULL,
                    "created_at" text NOT NULL DEFAULT to_char((now() AT TIME ZONE 'UTC'::text), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'::text),
                    "expires_at" text,
                    CONSTRAINT "kickside_user_sessions_pkey" PRIMARY KEY (token_key),
                    CONSTRAINT "kickside_user_sessions_token_key_fkey" FOREIGN KEY (token_key) REFERENCES kickside_user_auth_tokens(token_key) ON DELETE CASCADE,
                    CONSTRAINT "kickside_user_sessions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES app_users(user_id) ON DELETE CASCADE
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_user_sessions_user_id ON kickside_user_sessions USING btree (user_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_user_sessions_expires_at ON kickside_user_sessions USING btree (expires_at)
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_user_sessions")
                if err then error(tostring(err)) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_user_sessions (
                    token_key TEXT PRIMARY KEY REFERENCES kickside_user_auth_tokens(token_key) ON DELETE CASCADE,
                    user_id TEXT NOT NULL REFERENCES app_users(user_id) ON DELETE CASCADE,
                    auth_generation INTEGER NOT NULL,
                    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
                    expires_at TEXT
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_user_sessions_user_id ON kickside_user_sessions(user_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_user_sessions_expires_at ON kickside_user_sessions(expires_at)
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_user_sessions")
                if err then error(tostring(err)) end
            end)
        end)
    end)
end)
