-- The webhooks side table. A webhook is a thread-backed component (class
-- kickside.webhooks); this row holds its hashed secret and declared input schema,
-- keyed by the thread/component id so the public endpoint resolves it without an
-- actor. The secret is hashed at rest; the raw value is shown once at mint.

return require("migration").define(function()
    migration("kickside webhooks", function()
        database("postgres", function()
            up(function(db)
                db:execute([[
                    CREATE TABLE IF NOT EXISTS kickside_webhooks (
                        webhook_id      TEXT PRIMARY KEY,
                        secret_hash     TEXT NOT NULL,
                        secret_prefix   TEXT NOT NULL,
                        actor_id        TEXT NOT NULL,
                        schema_json     TEXT NOT NULL DEFAULT '{}',
                        label           TEXT NOT NULL DEFAULT '',
                        status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
                        created_at      BIGINT NOT NULL,
                        updated_at      BIGINT NOT NULL,
                        last_used_at    BIGINT
                    )
                ]])
                db:execute([[CREATE INDEX IF NOT EXISTS idx_kickside_webhooks_actor ON kickside_webhooks (actor_id, status)]])
            end)
            down(function(db)
                db:execute([[DROP TABLE IF EXISTS kickside_webhooks]])
            end)
        end)

        database("sqlite", function()
            up(function(db)
                db:execute([[
                    CREATE TABLE IF NOT EXISTS kickside_webhooks (
                        webhook_id      TEXT PRIMARY KEY,
                        secret_hash     TEXT NOT NULL,
                        secret_prefix   TEXT NOT NULL,
                        actor_id        TEXT NOT NULL,
                        schema_json     TEXT NOT NULL DEFAULT '{}',
                        label           TEXT NOT NULL DEFAULT '',
                        status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
                        created_at      INTEGER NOT NULL,
                        updated_at      INTEGER NOT NULL,
                        last_used_at    INTEGER
                    )
                ]])
                db:execute([[CREATE INDEX IF NOT EXISTS idx_kickside_webhooks_actor ON kickside_webhooks (actor_id, status)]])
            end)
            down(function(db)
                db:execute([[DROP TABLE IF EXISTS kickside_webhooks]])
            end)
        end)
    end)
end)
