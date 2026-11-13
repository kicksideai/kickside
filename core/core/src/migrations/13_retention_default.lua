-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local consts = require("ret_consts")

return require("migration").define(function()
    migration("13 retention default", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute("ALTER TABLE kickside_retention_policy ALTER COLUMN event_hot_retention_days SET DEFAULT "
                    .. tostring(consts.DEFAULTS.event_hot_retention_days))
                if err then error(err) end
                local _, nullable_err = db:execute("ALTER TABLE kickside_retention_policy ALTER COLUMN event_hot_retention_days DROP NOT NULL")
                if nullable_err then error(nullable_err) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                -- SQLite changes a column default by rebuilding the table. The
                -- migration transaction preserves rows and commits the DDL together.
                local statements = {
                    [[CREATE TABLE kickside_retention_policy_updated (
                        id TEXT PRIMARY KEY,
                        thread_id TEXT NOT NULL REFERENCES kickside_thread(id) ON DELETE CASCADE,
                        event_hot_retention_days INTEGER DEFAULT ]] .. tostring(consts.DEFAULTS.event_hot_retention_days) .. [[,
                        archive_mode TEXT NOT NULL DEFAULT 'tombstone_only' CHECK (archive_mode IN ('tombstone_only','hard_delete')),
                        enabled INTEGER NOT NULL DEFAULT 1,
                        created_at TEXT NOT NULL DEFAULT (datetime('now')),
                        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
                    )]],
                    [[INSERT INTO kickside_retention_policy_updated
                        (id,thread_id,event_hot_retention_days,archive_mode,enabled,created_at,updated_at)
                        SELECT id,thread_id,event_hot_retention_days,archive_mode,enabled,created_at,updated_at
                        FROM kickside_retention_policy]],
                    "DROP TABLE kickside_retention_policy",
                    "ALTER TABLE kickside_retention_policy_updated RENAME TO kickside_retention_policy",
                    "CREATE INDEX idx_kickside_retention_policy_enabled ON kickside_retention_policy(enabled)",
                    "CREATE INDEX idx_kickside_retention_policy_thread ON kickside_retention_policy(thread_id,enabled)",
                    "CREATE UNIQUE INDEX uq_kickside_retention_policy_thread ON kickside_retention_policy(thread_id)",
                }
                for _, statement in ipairs(statements) do
                    local _, err = db:execute(statement)
                    if err then error(err) end
                end
            end)
        end)
    end)
end)
