-- kickside_settings: admin overrides only. Defaults live in registry-declared
-- kickside.settings:definition entries, so a row exists only when an admin has
-- changed a setting from its declared default; deleting the row reverts it.
-- (namespace, key) is the declaring module's namespace + the setting key.

return require("migration").define(function()
    migration("kickside settings overrides", function()
        database("postgres", function()
            up(function(db)
                db:execute([[
                    CREATE TABLE kickside_settings (
                        namespace   TEXT NOT NULL,
                        key         TEXT NOT NULL,
                        value       TEXT NOT NULL,
                        value_type  TEXT NOT NULL,
                        updated_by  TEXT NOT NULL,
                        updated_at  TEXT NOT NULL DEFAULT (to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')),
                        PRIMARY KEY (namespace, key)
                    )
                ]])
                db:execute([[CREATE INDEX idx_kickside_settings_ns ON kickside_settings (namespace)]])
            end)
            down(function(db)
                db:execute([[DROP TABLE IF EXISTS kickside_settings]])
            end)
        end)

        database("sqlite", function()
            up(function(db)
                db:execute([[
                    CREATE TABLE kickside_settings (
                        namespace   TEXT NOT NULL,
                        key         TEXT NOT NULL,
                        value       TEXT NOT NULL,
                        value_type  TEXT NOT NULL,
                        updated_by  TEXT NOT NULL,
                        updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
                        PRIMARY KEY (namespace, key)
                    )
                ]])
                db:execute([[CREATE INDEX idx_kickside_settings_ns ON kickside_settings (namespace)]])
            end)
            down(function(db)
                db:execute([[DROP TABLE IF EXISTS kickside_settings]])
            end)
        end)
    end)
end)
