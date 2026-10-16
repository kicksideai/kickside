-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("02 create upload read model", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_upload_read_model (
                    "upload_id" text NOT NULL,
                    "component_id" text NOT NULL,
                    "status" text NOT NULL,
                    "filename" text,
                    "mime_type" text,
                    "type_id" text,
                    "size" bigint NOT NULL DEFAULT 0,
                    "error" text,
                    "queued_at" text,
                    "completed_at" text,
                    "failed_at" text,
                    "deleted_at" text,
                    "last_event_id" text,
                    "last_event_seq" bigint NOT NULL DEFAULT 0,
                    "trace_context" text,
                    "updated_at" text NOT NULL DEFAULT to_char((now() AT TIME ZONE 'UTC'::text), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'::text),
                    CONSTRAINT "kickside_upload_read_model_status_check" CHECK (status = ANY (ARRAY['processing'::text, 'completed'::text, 'error'::text, 'deleted'::text])),
                    CONSTRAINT "kickside_upload_read_model_pkey" PRIMARY KEY (upload_id)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_upload_rm_component_status ON kickside_upload_read_model USING btree (component_id, status)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_upload_rm_component_completed ON kickside_upload_read_model USING btree (component_id, completed_at DESC)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_upload_read_model_deleted_retention ON kickside_upload_read_model USING btree (deleted_at, upload_id) WHERE ((status = 'deleted'::text) AND (deleted_at IS NOT NULL))
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_upload_read_model")
                if err then error(tostring(err)) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_upload_read_model (
                    upload_id TEXT PRIMARY KEY,
                    component_id TEXT NOT NULL,
                    status TEXT NOT NULL CHECK (status IN ('processing', 'completed', 'error', 'deleted')),
                    filename TEXT,
                    mime_type TEXT,
                    type_id TEXT,
                    size INTEGER NOT NULL DEFAULT 0,
                    error TEXT,
                    queued_at TEXT,
                    completed_at TEXT,
                    failed_at TEXT,
                    deleted_at TEXT,
                    last_event_id TEXT,
                    last_event_seq INTEGER NOT NULL DEFAULT 0,
                    trace_context TEXT,
                    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_upload_rm_component_status ON kickside_upload_read_model(component_id, status)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_upload_rm_component_completed ON kickside_upload_read_model(component_id, completed_at DESC)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_upload_read_model_deleted_retention ON kickside_upload_read_model(deleted_at, upload_id)
                    WHERE status='deleted' AND deleted_at IS NOT NULL
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_upload_read_model")
                if err then error(tostring(err)) end
            end)
        end)
    end)
end)
