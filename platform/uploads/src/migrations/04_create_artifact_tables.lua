-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("04 create artifact tables", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_upload_artifact_blobs (
                    "blob_id" text NOT NULL,
                    "checksum" text NOT NULL,
                    "mime_type" text NOT NULL,
                    "size" bigint NOT NULL,
                    "storage_id" text NOT NULL,
                    "storage_path" text NOT NULL,
                    "metadata" text,
                    "created_at" text NOT NULL DEFAULT to_char((now() AT TIME ZONE 'UTC'::text), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'::text),
                    "updated_at" text NOT NULL DEFAULT to_char((now() AT TIME ZONE 'UTC'::text), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'::text),
                    CONSTRAINT "kickside_upload_artifact_blobs_pkey" PRIMARY KEY (blob_id)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE UNIQUE INDEX idx_kickside_upload_artifact_blobs_storage_checksum ON kickside_upload_artifact_blobs USING btree (storage_id, checksum)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_upload_artifact_blob_orphan_retention ON kickside_upload_artifact_blobs USING btree (created_at, blob_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_upload_artifacts (
                    "artifact_id" text NOT NULL,
                    "upload_id" text NOT NULL,
                    "parent_artifact_id" text,
                    "blob_id" text,
                    "checksum" text,
                    "kind" text NOT NULL,
                    "role" text,
                    "mime_type" text NOT NULL,
                    "label" text,
                    "ordinal" integer NOT NULL DEFAULT 0,
                    "locator" text,
                    "metadata" text,
                    "created_at" text NOT NULL DEFAULT to_char((now() AT TIME ZONE 'UTC'::text), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'::text),
                    "updated_at" text NOT NULL DEFAULT to_char((now() AT TIME ZONE 'UTC'::text), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'::text),
                    CONSTRAINT "kickside_upload_artifacts_pkey" PRIMARY KEY (artifact_id),
                    CONSTRAINT "kickside_upload_artifacts_upload_id_fkey" FOREIGN KEY (upload_id) REFERENCES kickside_uploads(uuid) ON DELETE CASCADE,
                    CONSTRAINT "kickside_upload_artifacts_parent_artifact_id_fkey" FOREIGN KEY (parent_artifact_id) REFERENCES kickside_upload_artifacts(artifact_id) ON DELETE CASCADE,
                    CONSTRAINT "kickside_upload_artifacts_blob_id_fkey" FOREIGN KEY (blob_id) REFERENCES kickside_upload_artifact_blobs(blob_id) ON DELETE SET NULL
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_upload_artifacts_upload ON kickside_upload_artifacts USING btree (upload_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_upload_artifacts_upload_parent ON kickside_upload_artifacts USING btree (upload_id, parent_artifact_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_upload_artifacts_upload_role ON kickside_upload_artifacts USING btree (upload_id, role)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_upload_artifacts_blob ON kickside_upload_artifacts USING btree (blob_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_upload_artifacts_checksum ON kickside_upload_artifacts USING btree (checksum)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_upload_artifacts_kind ON kickside_upload_artifacts USING btree (kind)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_upload_chunks (
                    "chunk_id" text NOT NULL,
                    "upload_id" text NOT NULL,
                    "artifact_id" text,
                    "kind" text NOT NULL,
                    "content" text NOT NULL,
                    "ordinal" integer NOT NULL DEFAULT 0,
                    "token_count" integer,
                    "locator" text,
                    "metadata" text,
                    "created_at" text NOT NULL DEFAULT to_char((now() AT TIME ZONE 'UTC'::text), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'::text),
                    "updated_at" text NOT NULL DEFAULT to_char((now() AT TIME ZONE 'UTC'::text), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'::text),
                    CONSTRAINT "kickside_upload_chunks_pkey" PRIMARY KEY (chunk_id),
                    CONSTRAINT "kickside_upload_chunks_upload_id_fkey" FOREIGN KEY (upload_id) REFERENCES kickside_uploads(uuid) ON DELETE CASCADE,
                    CONSTRAINT "kickside_upload_chunks_artifact_id_fkey" FOREIGN KEY (artifact_id) REFERENCES kickside_upload_artifacts(artifact_id) ON DELETE CASCADE
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_upload_chunks_upload ON kickside_upload_chunks USING btree (upload_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_upload_chunks_artifact ON kickside_upload_chunks USING btree (artifact_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_upload_chunks_upload_ordinal ON kickside_upload_chunks USING btree (upload_id, ordinal)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_upload_chunks_artifact_kind ON kickside_upload_chunks USING btree (artifact_id, kind, ordinal)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_upload_chunks_kind ON kickside_upload_chunks USING btree (kind)
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_upload_chunks")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_upload_artifacts")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_upload_artifact_blobs")
                if err then error(tostring(err)) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_upload_artifact_blobs (
                    blob_id TEXT PRIMARY KEY,
                    checksum TEXT NOT NULL,
                    mime_type TEXT NOT NULL,
                    size INTEGER NOT NULL,
                    storage_id TEXT NOT NULL,
                    storage_path TEXT NOT NULL,
                    metadata TEXT,
                    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
                    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_upload_artifacts (
                    artifact_id TEXT PRIMARY KEY,
                    upload_id TEXT NOT NULL,
                    parent_artifact_id TEXT,
                    blob_id TEXT,
                    checksum TEXT,
                    kind TEXT NOT NULL,
                    role TEXT,
                    mime_type TEXT NOT NULL,
                    label TEXT,
                    ordinal INTEGER NOT NULL DEFAULT 0,
                    locator TEXT,
                    metadata TEXT,
                    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
                    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
                    FOREIGN KEY (upload_id) REFERENCES kickside_uploads(uuid) ON DELETE CASCADE,
                    FOREIGN KEY (parent_artifact_id) REFERENCES kickside_upload_artifacts(artifact_id) ON DELETE CASCADE,
                    FOREIGN KEY (blob_id) REFERENCES kickside_upload_artifact_blobs(blob_id) ON DELETE SET NULL
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_upload_chunks (
                    chunk_id TEXT PRIMARY KEY,
                    upload_id TEXT NOT NULL,
                    artifact_id TEXT,
                    kind TEXT NOT NULL,
                    content TEXT NOT NULL,
                    ordinal INTEGER NOT NULL DEFAULT 0,
                    token_count INTEGER,
                    locator TEXT,
                    metadata TEXT,
                    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
                    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
                    FOREIGN KEY (upload_id) REFERENCES kickside_uploads(uuid) ON DELETE CASCADE,
                    FOREIGN KEY (artifact_id) REFERENCES kickside_upload_artifacts(artifact_id) ON DELETE CASCADE
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_upload_artifacts_upload ON kickside_upload_artifacts(upload_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_upload_artifacts_upload_parent ON kickside_upload_artifacts(upload_id, parent_artifact_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_upload_artifacts_upload_role ON kickside_upload_artifacts(upload_id, role)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_upload_artifacts_blob ON kickside_upload_artifacts(blob_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_upload_artifacts_checksum ON kickside_upload_artifacts(checksum)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE UNIQUE INDEX idx_kickside_upload_artifact_blobs_storage_checksum ON kickside_upload_artifact_blobs(storage_id, checksum)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_upload_artifacts_kind ON kickside_upload_artifacts(kind)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_upload_chunks_upload ON kickside_upload_chunks(upload_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_upload_chunks_artifact ON kickside_upload_chunks(artifact_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_upload_chunks_upload_ordinal ON kickside_upload_chunks(upload_id, ordinal)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_upload_chunks_artifact_kind ON kickside_upload_chunks(artifact_id, kind, ordinal)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_upload_chunks_kind ON kickside_upload_chunks(kind)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_upload_artifact_blob_orphan_retention
                    ON kickside_upload_artifact_blobs (created_at,blob_id)
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_upload_chunks")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_upload_artifacts")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_upload_artifact_blobs")
                if err then error(tostring(err)) end
            end)
        end)
    end)
end)
