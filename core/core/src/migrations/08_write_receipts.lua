-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("08 write receipts", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_write_receipt (
                    "sink_id" text NOT NULL,
                    "idempotency_key" text NOT NULL,
                    "identity_key" text NOT NULL,
                    "payload_hash" text NOT NULL,
                    "status" text NOT NULL,
                    "dest_refs_json" text NOT NULL DEFAULT '{}'::text,
                    "outcome_json" text NOT NULL DEFAULT '{}'::text,
                    "created_at" text NOT NULL,
                    "completed_at" text,
                    CONSTRAINT "kickside_write_receipt_status_check" CHECK (status = ANY (ARRAY['pending'::text, 'committed'::text])),
                    CONSTRAINT "kickside_write_receipt_check" CHECK (status = 'pending'::text AND completed_at IS NULL OR status = 'committed'::text AND completed_at IS NOT NULL),
                    CONSTRAINT "kickside_write_receipt_pkey" PRIMARY KEY (sink_id, idempotency_key)
                    )
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_write_receipt_committed ON kickside_write_receipt USING btree (completed_at) WHERE (status = 'committed'::text)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_write_receipt_pending ON kickside_write_receipt USING btree (created_at) WHERE (status = 'pending'::text)
                ]=])
                if err then error(err) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_write_receipt")
                if err then error(err) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_write_receipt (
                    sink_id TEXT NOT NULL, idempotency_key TEXT NOT NULL,
                    identity_key TEXT NOT NULL, payload_hash TEXT NOT NULL,
                    status TEXT NOT NULL CHECK(status IN ('pending','committed')),
                    dest_refs_json TEXT NOT NULL DEFAULT '{}', outcome_json TEXT NOT NULL DEFAULT '{}',
                    created_at TEXT NOT NULL, completed_at TEXT,
                    CHECK((status='pending' AND completed_at IS NULL) OR (status='committed' AND completed_at IS NOT NULL)),
                    PRIMARY KEY(sink_id,idempotency_key))
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_write_receipt_committed ON kickside_write_receipt(completed_at) WHERE status='committed'
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_write_receipt_pending ON kickside_write_receipt(created_at) WHERE status='pending'
                ]=])
                if err then error(err) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_write_receipt")
                if err then error(err) end
            end)
        end)
    end)
end)
