-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("01 create uploads table", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_uploads (
                    "uuid" text NOT NULL,
                    "actor_id" text NOT NULL,
                    "size" bigint NOT NULL,
                    "mime_type" text NOT NULL,
                    "storage_state" text NOT NULL DEFAULT 'uploaded'::text,
                    "storage_id" text NOT NULL,
                    "storage_path" text NOT NULL,
                    "type_id" text,
                    "content_sha256" text,
                    "created_at" text NOT NULL DEFAULT to_char((now() AT TIME ZONE 'UTC'::text), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'::text),
                    "updated_at" text NOT NULL DEFAULT to_char((now() AT TIME ZONE 'UTC'::text), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'::text),
                    "metadata" text,
                    "trace_context" text,
                    "processing_intent_state" text,
                    "processing_job_id" text,
                    "processing_max_execution_ms" bigint,
                    CONSTRAINT "kickside_uploads_pkey" PRIMARY KEY (uuid),
                    CONSTRAINT "kickside_uploads_processing_intent_state_check" CHECK (processing_intent_state = ANY (ARRAY['pending'::text, 'acknowledged'::text]))
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_uploads_actor ON kickside_uploads USING btree (actor_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_uploads_storage_state ON kickside_uploads USING btree (storage_state)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_uploads_created ON kickside_uploads USING btree (created_at)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_uploads_type ON kickside_uploads USING btree (type_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_uploads_actor_created ON kickside_uploads USING btree (actor_id, created_at DESC)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE UNIQUE INDEX idx_kickside_uploads_actor_content ON kickside_uploads USING btree (actor_id, content_sha256)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_uploads_processing_intent ON kickside_uploads USING btree (created_at, uuid) WHERE ((storage_state = 'uploaded'::text) AND (processing_intent_state = 'pending'::text))
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_uploads")
                if err then error(tostring(err)) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_uploads (
                    uuid TEXT PRIMARY KEY,
                    actor_id TEXT NOT NULL,
                    size INTEGER NOT NULL,
                    mime_type TEXT NOT NULL,
                    storage_state TEXT NOT NULL DEFAULT 'uploaded',
                    storage_id TEXT NOT NULL,
                    storage_path TEXT NOT NULL,
                    type_id TEXT,
                    content_sha256 TEXT,
                    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
                    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
                    metadata TEXT,
                    trace_context TEXT
                    , processing_intent_state TEXT
                    CHECK (processing_intent_state IN ('pending', 'acknowledged')), processing_job_id TEXT, processing_max_execution_ms INTEGER)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_uploads_actor ON kickside_uploads(actor_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_uploads_storage_state ON kickside_uploads(storage_state)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_uploads_created ON kickside_uploads(created_at)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_uploads_type ON kickside_uploads(type_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_uploads_actor_created ON kickside_uploads(actor_id, created_at DESC)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE UNIQUE INDEX idx_kickside_uploads_actor_content ON kickside_uploads(actor_id, content_sha256)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_uploads_processing_intent
                    ON kickside_uploads(created_at, uuid)
                    WHERE storage_state = 'uploaded' AND processing_intent_state = 'pending'
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_uploads")
                if err then error(tostring(err)) end
            end)
        end)
    end)
end)
