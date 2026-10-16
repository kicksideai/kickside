-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("06 trigger item ledger", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_trigger_item_ledger (
                    "owner_id" text NOT NULL,
                    "source_port" text NOT NULL,
                    "item_key" text NOT NULL,
                    "source_version" text NOT NULL DEFAULT ''::text,
                    "dedup_key" text NOT NULL DEFAULT '',
                    "envelope_json" text NOT NULL DEFAULT ''::text,
                    "payload_hash" text NOT NULL DEFAULT ''::text,
                    "state" text NOT NULL,
                    "attempts" integer NOT NULL DEFAULT 0,
                    "first_failed_at" text NOT NULL,
                    "last_failed_at" text NOT NULL,
                    "next_attempt_at" text,
                    "error_code" text NOT NULL DEFAULT 'unknown'::text,
                    "error_message" text,
                    "retriable" boolean NOT NULL DEFAULT true,
                    "terminal" boolean NOT NULL DEFAULT false,
                    "replay_generation" integer NOT NULL DEFAULT 0,
                    "replay_requested_at" text,
                    "resolved_at" text,
                    "expires_at" text,
                    "created_at" text NOT NULL,
                    "updated_at" text NOT NULL,
                    "identity_key" text NOT NULL,
                    "delivery_order" bigint NOT NULL DEFAULT 0,
                    CONSTRAINT "kickside_trigger_item_ledger_pkey" PRIMARY KEY (owner_id, source_port, item_key, identity_key),
                    CONSTRAINT "kickside_trigger_item_ledger_state_check" CHECK (state = ANY (ARRAY['retrying'::text, 'waiting'::text, 'uncertain'::text, 'parked'::text, 'dead'::text, 'resolved'::text]))
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_trigger_ledger_due ON kickside_trigger_item_ledger USING btree (owner_id, state, next_attempt_at)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_trigger_ledger_expiry ON kickside_trigger_item_ledger USING btree (owner_id, expires_at)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_trigger_ledger_due_source ON kickside_trigger_item_ledger USING btree (owner_id, source_port, state, next_attempt_at)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_trigger_ledger_gc ON kickside_trigger_item_ledger USING btree (state, expires_at)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_trigger_ledger_orphan_retention ON kickside_trigger_item_ledger USING btree (updated_at, owner_id, source_port, item_key, identity_key)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_trigger_ledger_order ON kickside_trigger_item_ledger USING btree (owner_id, source_port, item_key, delivery_order)
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_trigger_item_ledger")
                if err then error(tostring(err)) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_trigger_item_ledger (
                    owner_id TEXT NOT NULL, source_port TEXT NOT NULL, item_key TEXT NOT NULL,
                    source_version TEXT NOT NULL DEFAULT '', dedup_key TEXT NOT NULL DEFAULT '', identity_key TEXT NOT NULL,
                    envelope_json TEXT NOT NULL DEFAULT '', payload_hash TEXT NOT NULL DEFAULT '',
                    state TEXT NOT NULL CHECK (state IN ('retrying', 'waiting', 'uncertain', 'parked', 'dead', 'resolved')),
                    attempts INTEGER NOT NULL DEFAULT 0, first_failed_at TEXT NOT NULL, last_failed_at TEXT NOT NULL,
                    next_attempt_at TEXT, error_code TEXT NOT NULL DEFAULT 'unknown', error_message TEXT,
                    retriable BOOLEAN NOT NULL DEFAULT true, terminal BOOLEAN NOT NULL DEFAULT false,
                    replay_generation INTEGER NOT NULL DEFAULT 0, replay_requested_at TEXT, resolved_at TEXT, expires_at TEXT,
                    created_at TEXT NOT NULL, updated_at TEXT NOT NULL, delivery_order BIGINT NOT NULL DEFAULT 0,
                    PRIMARY KEY (owner_id, source_port, item_key, identity_key))
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_trigger_ledger_due ON kickside_trigger_item_ledger (owner_id, state, next_attempt_at)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_trigger_ledger_expiry ON kickside_trigger_item_ledger (owner_id, expires_at)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_trigger_ledger_due_source ON kickside_trigger_item_ledger (owner_id, source_port, state, next_attempt_at)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_trigger_ledger_gc ON kickside_trigger_item_ledger (state, expires_at)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_trigger_ledger_orphan_retention
                    ON kickside_trigger_item_ledger(updated_at,owner_id,source_port,item_key,identity_key)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_trigger_ledger_order ON kickside_trigger_item_ledger(owner_id,source_port,item_key,delivery_order)
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_trigger_item_ledger")
                if err then error(tostring(err)) end
            end)
        end)
    end)
end)
