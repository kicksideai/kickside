-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Historical migration 06 used the same ledger ID as the fresh-install schema.
-- Retain its rows, delivery identities and dependency holds during the upgrade.
local STATES = "('retrying','dependency_blocked','waiting','uncertain','parked','dead','resolved')"
local COLUMNS = [[owner_id,source_port,item_key,source_version,dedup_key,identity_key,
    envelope_json,payload_hash,state,attempts,first_failed_at,last_failed_at,next_attempt_at,
    error_code,error_message,retriable,dependency_key,terminal,replay_generation,replay_requested_at,
    resolved_at,expires_at,created_at,updated_at,execution_identity_json,identity_parked]]

local function execute(db: any, statement: string)
    local _, err = db:execute(statement)
    if err then error(tostring(err)) end
end

local function query(db: any, statement: string): { any }
    local rows, err = db:query(statement)
    if err then error(tostring(err)) end
    return rows
end

local function ensure_order_indexes(db: any)
    execute(db, [[CREATE INDEX IF NOT EXISTS idx_trigger_ledger_orphan_retention
        ON kickside_trigger_item_ledger (updated_at,owner_id,source_port,item_key,identity_key)]])
    execute(db, [[CREATE INDEX IF NOT EXISTS idx_trigger_ledger_order
        ON kickside_trigger_item_ledger (owner_id,source_port,item_key,delivery_order)]])
end

local function upgrade_postgres(db: any)
    local columns = query(db, [[SELECT attname AS name FROM pg_attribute
        WHERE attrelid = 'kickside_trigger_item_ledger'::regclass AND attnum > 0 AND NOT attisdropped]])
    for _, column in ipairs(columns) do
        if column.name == "delivery_order" then return end
    end
    execute(db, [[ALTER TABLE kickside_trigger_item_ledger
        ADD COLUMN delivery_order BIGINT NOT NULL DEFAULT 0,
        DROP CONSTRAINT kickside_trigger_item_ledger_state_check,
        ADD CONSTRAINT kickside_trigger_item_ledger_state_check CHECK (state IN ]] .. STATES .. ")")
    ensure_order_indexes(db)
end

local function upgrade_sqlite(db: any)
    for _, column in ipairs(query(db, "PRAGMA table_info(kickside_trigger_item_ledger)")) do
        if column.name == "delivery_order" then return end
    end
    -- SQLite cannot widen a CHECK in place. Rebuild only the historical table
    -- and reinstate its existing indexes and triggers after copying the rows.
    local schema = query(db, [[SELECT sql FROM sqlite_master
        WHERE tbl_name = 'kickside_trigger_item_ledger'
          AND type IN ('index','trigger') AND sql IS NOT NULL ORDER BY type,name]])
    execute(db, [[ALTER TABLE kickside_trigger_item_ledger RENAME TO kickside_trigger_item_ledger_legacy_17]])
    execute(db, [[CREATE TABLE kickside_trigger_item_ledger (
        owner_id TEXT NOT NULL, source_port TEXT NOT NULL, item_key TEXT NOT NULL,
        source_version TEXT NOT NULL DEFAULT '', dedup_key TEXT NOT NULL DEFAULT '', identity_key TEXT NOT NULL,
        envelope_json TEXT NOT NULL DEFAULT '', payload_hash TEXT NOT NULL DEFAULT '',
        state TEXT NOT NULL CHECK (state IN ]] .. STATES .. [[),
        attempts INTEGER NOT NULL DEFAULT 0, first_failed_at TEXT NOT NULL, last_failed_at TEXT NOT NULL,
        next_attempt_at TEXT, error_code TEXT NOT NULL DEFAULT 'unknown', error_message TEXT,
        retriable BOOLEAN NOT NULL DEFAULT true, dependency_key TEXT, terminal BOOLEAN NOT NULL DEFAULT false,
        replay_generation INTEGER NOT NULL DEFAULT 0, replay_requested_at TEXT, resolved_at TEXT, expires_at TEXT,
        created_at TEXT NOT NULL, updated_at TEXT NOT NULL, execution_identity_json TEXT,
        identity_parked BOOLEAN NOT NULL DEFAULT false, delivery_order BIGINT NOT NULL DEFAULT 0,
        PRIMARY KEY (owner_id,source_port,item_key,identity_key))]])
    execute(db, "INSERT INTO kickside_trigger_item_ledger (" .. COLUMNS .. ") SELECT " .. COLUMNS
        .. " FROM kickside_trigger_item_ledger_legacy_17")
    execute(db, "DROP TABLE kickside_trigger_item_ledger_legacy_17")
    for _, entry in ipairs(schema) do execute(db, entry.sql) end
    ensure_order_indexes(db)
end

return require("migration").define(function()
    migration("17 legacy trigger item ledger", function()
        database("postgres", function() up(upgrade_postgres) end)
        database("sqlite", function() up(upgrade_sqlite) end)
    end)
end)
