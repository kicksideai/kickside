-- kickside_security_scopes: DB-backed custom scopes (admin-created roles).
--
-- Built-in roles (app.security:admin/user) and registry security.scope entries
-- are NOT stored here. This table holds only admin-authored custom scopes; a
-- projection service writes each enabled row out as a `security.scope` registry
-- entry (id = CUSTOM_SCOPE_NS:slug) so the runtime resolves it via
-- security.named_scope. policies is the JSON array of policy ids the scope grants.

return require("migration").define(function()
    migration("kickside security custom scopes", function()
        database("postgres", function()
            up(function(db)
                db:execute([[
                    CREATE TABLE kickside_security_scopes (
                        slug         TEXT PRIMARY KEY,
                        target       TEXT NOT NULL DEFAULT '',
                        label        TEXT NOT NULL DEFAULT '',
                        description  TEXT NOT NULL DEFAULT '',
                        policies     TEXT NOT NULL DEFAULT '[]',
                        internal     BOOLEAN NOT NULL DEFAULT FALSE,
                        enabled      BOOLEAN NOT NULL DEFAULT TRUE,
                        created_at   TEXT NOT NULL DEFAULT (to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')),
                        updated_at   TEXT NOT NULL DEFAULT (to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'))
                    )
                ]])
            end)
            down(function(db)
                db:execute([[DROP TABLE IF EXISTS kickside_security_scopes]])
            end)
        end)

        database("sqlite", function()
            up(function(db)
                db:execute([[
                    CREATE TABLE kickside_security_scopes (
                        slug         TEXT PRIMARY KEY,
                        target       TEXT NOT NULL DEFAULT '',
                        label        TEXT NOT NULL DEFAULT '',
                        description  TEXT NOT NULL DEFAULT '',
                        policies     TEXT NOT NULL DEFAULT '[]',
                        internal     INTEGER NOT NULL DEFAULT 0,
                        enabled      INTEGER NOT NULL DEFAULT 1,
                        created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
                        updated_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
                    )
                ]])
            end)
            down(function(db)
                db:execute([[DROP TABLE IF EXISTS kickside_security_scopes]])
            end)
        end)
    end)
end)
