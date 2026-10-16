-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("09 profile", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_profile (
                    "user_id" text NOT NULL,
                    "namespace" text NOT NULL,
                    "key" text NOT NULL,
                    "value" text NOT NULL,
                    "value_type" text NOT NULL,
                    "updated_at" text NOT NULL DEFAULT to_char((now() AT TIME ZONE 'UTC'::text), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'::text),
                    CONSTRAINT "kickside_profile_pkey" PRIMARY KEY (user_id, namespace, key)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_profile_user ON kickside_profile USING btree (user_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_profile_field ON kickside_profile USING btree (namespace, key)
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_profile")
                if err then error(tostring(err)) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE "kickside_profile" (
                    user_id     TEXT NOT NULL,
                    namespace   TEXT NOT NULL,
                    key         TEXT NOT NULL,
                    value       TEXT NOT NULL,
                    value_type  TEXT NOT NULL,
                    updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
                    PRIMARY KEY (user_id, namespace, key)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_profile_user ON "kickside_profile" (user_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_profile_field ON "kickside_profile" (namespace, key)
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_profile")
                if err then error(tostring(err)) end
            end)
        end)
    end)
end)
