-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("01 create app user tables", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE app_users (
                    "user_id" text NOT NULL,
                    "email" text NOT NULL,
                    "full_name" text,
                    "password_hash" text NOT NULL,
                    "status" text NOT NULL DEFAULT 'active'::text,
                    "created_at" text NOT NULL DEFAULT to_char((now() AT TIME ZONE 'UTC'::text), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'::text),
                    "updated_at" text NOT NULL DEFAULT to_char((now() AT TIME ZONE 'UTC'::text), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'::text),
                    "auth_generation" integer NOT NULL DEFAULT 0,
                    CONSTRAINT "app_users_pkey" PRIMARY KEY (user_id),
                    CONSTRAINT "app_users_email_key" UNIQUE (email)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_app_users_email ON app_users USING btree (email)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_app_users_status ON app_users USING btree (status)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_app_users_created_at ON app_users USING btree (created_at DESC)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE app_user_groups (
                    "user_id" text NOT NULL,
                    "group_id" text NOT NULL,
                    "source" text NOT NULL DEFAULT 'manual'::text,
                    "created_at" text NOT NULL DEFAULT to_char((now() AT TIME ZONE 'UTC'::text), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'::text),
                    CONSTRAINT "app_user_groups_pkey" PRIMARY KEY (user_id, group_id),
                    CONSTRAINT "app_user_groups_user_id_fkey" FOREIGN KEY (user_id) REFERENCES app_users(user_id) ON DELETE CASCADE
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_app_user_groups_user_id ON app_user_groups USING btree (user_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_app_user_groups_group_id ON app_user_groups USING btree (group_id)
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE app_user_groups")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE app_users")
                if err then error(tostring(err)) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE app_users (
                    user_id TEXT PRIMARY KEY,
                    email TEXT UNIQUE NOT NULL,
                    full_name TEXT,
                    password_hash TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'active',
                    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
                    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
                    , auth_generation INTEGER NOT NULL DEFAULT 0)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_app_users_email ON app_users(email)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_app_users_status ON app_users(status)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_app_users_created_at ON app_users(created_at DESC)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE app_user_groups (
                    user_id TEXT NOT NULL,
                    group_id TEXT NOT NULL,
                    source TEXT NOT NULL DEFAULT 'manual',
                    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
                    PRIMARY KEY (user_id, group_id),
                    FOREIGN KEY (user_id) REFERENCES app_users(user_id) ON DELETE CASCADE
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_app_user_groups_user_id ON app_user_groups(user_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_app_user_groups_group_id ON app_user_groups(group_id)
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE app_user_groups")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE app_users")
                if err then error(tostring(err)) end
            end)
        end)
    end)
end)
