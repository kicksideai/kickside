local sql = require("sql")
local errors = require("errors")

local persisted_json = require("persisted_json")
local resources = require("uploads_resources")

local artifact_cleanup_repo = {}

local function typed(kind: any, message: string): any
    return errors.new({ message = message, kind = kind })
end


local function load_blob_by_id(db, blob_id)
    local query = sql.builder.select(
            "blob_id", "checksum", "mime_type", "size", "storage_id",
            "storage_path", "metadata", "created_at", "updated_at"
        )
        :from("kickside_upload_artifact_blobs")
        :where("blob_id = ?", blob_id)
        :limit(1)

    local rows, err = query:run_with(db):query()
    if err then return nil, "failed to load artifact blob: " .. err end
    if #rows == 0 then return nil, typed(errors.NOT_FOUND, "artifact blob not found") end
    local row = rows[1]
    local metadata, metadata_err = persisted_json.decode_table(row.metadata, "artifact.metadata", true)
    if metadata_err then return nil, metadata_err end
    row.metadata = metadata or {}
    return row
end

-- Reclaim every blob in candidate_ids that no surviving artifact still references, and
-- remove its storage bytes.
--
-- Blobs are content-addressed and shared across artifacts (deduplicated by storage_id +
-- checksum). A blob is reclaimed only when no kickside_upload_artifacts row points at it,
-- so a blob shared with a still-living artifact is kept; the candidate set bounds the
-- check to blobs that just lost a referencing artifact. Caller supplies an open db so the
-- reference check and the row delete observe the same post-delete state.
--
-- Storage bytes are removed before the blob row. If byte removal fails, the row stays
-- as a durable retry target for the next orphan collection pass.
function artifact_cleanup_repo.collect_orphan_blobs(db, candidate_ids)
    local seen = {}
    local removed = 0
    for _, blob_id in ipairs(candidate_ids or {}) do
        if type(blob_id) == "string" and blob_id ~= "" and not seen[blob_id] then
            seen[blob_id] = true

            local refs, refs_err = sql.builder.select("a.artifact_id")
                :from("kickside_upload_artifacts a")
                :where("a.blob_id = ?", blob_id)
                :limit(1)
                :run_with(db)
                :query()
            if refs_err or type(refs) ~= "table" then
                return nil, "failed to check artifact blob references: " .. tostring(refs_err or "no rows result")
            end
            if #refs == 0 then
                local blob, blob_err = load_blob_by_id(db, blob_id)
                if blob_err and not errors.is(blob_err, errors.NOT_FOUND) then return nil, blob_err end
                if not blob_err and blob then
                    local storage, storage_err = resources.get_storage(blob.storage_id)
                    if storage_err or not storage then
                        return nil, "failed to get storage for orphan blob cleanup: " .. tostring(storage_err)
                    end
                    local _, remove_err = storage:remove(blob.storage_path :: string)
                    if remove_err ~= nil then
                        if tostring(remove_err):find("no such file or directory", 1, true) then
                            remove_err = nil
                        end
                    end
                    if remove_err ~= nil then
                        return nil, "failed to remove orphan blob bytes: " .. tostring(remove_err)
                    end

                    local _, delete_err = sql.builder.delete("kickside_upload_artifact_blobs")
                        :where("blob_id = ?", blob_id)
                        :run_with(db)
                        :exec()
                    if delete_err then return nil, "failed to delete orphan artifact blob: " .. delete_err end
                    removed = removed + 1
                end
            end
        end
    end
    return removed
end

-- Delete an upload's artifacts and chunks, then reclaim any blob those artifacts held that
-- no other artifact still references.
--
-- The schema declares ON DELETE CASCADE/SET NULL, but SQLite does not enforce foreign keys
-- unless PRAGMA foreign_keys is enabled, so this removes the dependent rows explicitly
-- rather than relying on the upload-row cascade. Order matters: gather the candidate
-- blob_ids first, delete the artifacts (which drops the references), then collect the
-- blobs that are now orphaned.
function artifact_cleanup_repo.delete_for_upload(upload_id)
    if not upload_id or upload_id == "" then return nil, "upload_id is required" end
    local db, err = resources.get_db()
    if err then return nil, err end

    local artifacts, artifacts_err = sql.builder.select("artifact_id", "blob_id")
        :from("kickside_upload_artifacts")
        :where("upload_id = ?", upload_id)
        :run_with(db)
        :query()
    if artifacts_err then
        db:release()
        return nil, "failed to list artifacts for delete: " .. artifacts_err
    end

    local candidate_ids = {}
    for _, row in ipairs(artifacts) do
        if type(row.blob_id) == "string" and row.blob_id ~= "" then
            candidate_ids[#candidate_ids + 1] = row.blob_id
        end
    end

    local _, chunks_err = sql.builder.delete("kickside_upload_chunks")
        :where("upload_id = ?", upload_id)
        :run_with(db)
        :exec()
    if chunks_err then
        db:release()
        return nil, "failed to delete upload chunks: " .. chunks_err
    end

    local _, delete_err = sql.builder.delete("kickside_upload_artifacts")
        :where("upload_id = ?", upload_id)
        :run_with(db)
        :exec()
    if delete_err then
        db:release()
        return nil, "failed to delete upload artifacts: " .. delete_err
    end

    local removed, collect_err = artifact_cleanup_repo.collect_orphan_blobs(db, candidate_ids)
    db:release()
    if collect_err then return nil, collect_err end
    return { removed = removed }
end

local function retention_error(message: string, kind: any): any
    return errors.new({ message = message, kind = kind, retryable = kind ~= errors.INVALID })
end

-- The upload owner's existing retention callback repairs a crash between
-- deleting artifact references and collecting their blob. Lock each blob before
-- rechecking references: PostgreSQL's FOR UPDATE excludes a concurrent FK
-- insert, while SQLite's no-op UPDATE takes its writer lock even when foreign
-- keys are disabled on that connection.
function artifact_cleanup_repo.prune_orphan_blobs(cutoff: string, limit: integer): (integer?, any?)
    if type(cutoff) ~= "string" or cutoff == "" or type(limit) ~= "number"
        or limit ~= math.floor(limit) or limit < 1 or limit > 500 then
        return nil, retention_error("orphan blob cutoff and limit 1..500 required", errors.INVALID)
    end
    local db, open_err = resources.get_db()
    if open_err or not db then
        return nil, retention_error("orphan blob database unavailable: " .. tostring(open_err), errors.UNAVAILABLE)
    end
    local candidates, list_err = db:query([[SELECT b.blob_id
        FROM kickside_upload_artifact_blobs b
        WHERE b.created_at <= $1
          AND NOT EXISTS (SELECT 1 FROM kickside_upload_artifacts a WHERE a.blob_id=b.blob_id)
        ORDER BY b.created_at,b.blob_id LIMIT $2]], { cutoff, limit })
    if list_err or type(candidates) ~= "table" then
        db:release()
        return nil, retention_error("orphan blob scan failed: " .. tostring(list_err), errors.INTERNAL)
    end
    local dbtype, type_err = db:type()
    if type_err or (dbtype ~= sql.type.POSTGRES and dbtype ~= sql.type.SQLITE) then
        db:release()
        return nil, retention_error("orphan blob database type unavailable: " .. tostring(type_err or dbtype), errors.INTERNAL)
    end
    local removed = 0
    for _, candidate in ipairs(candidates) do
        local id = tostring(candidate.blob_id)
        local tx, begin_err = db:begin()
        if begin_err or not tx then
            db:release()
            return nil, retention_error("orphan blob transaction failed: " .. tostring(begin_err), errors.INTERNAL)
        end
        local locked: boolean
        if dbtype == sql.type.POSTGRES then
            local rows, lock_err = tx:query([[SELECT blob_id FROM kickside_upload_artifact_blobs
                WHERE blob_id=$1 AND created_at <= $2 FOR UPDATE]], { id, cutoff })
            if lock_err or type(rows) ~= "table" then
                tx:rollback(); db:release()
                return nil, retention_error("orphan blob lock failed: " .. tostring(lock_err or "no rows result"), errors.INTERNAL)
            end
            locked = #rows == 1
        else
            local result, lock_err = tx:execute([[UPDATE kickside_upload_artifact_blobs
                SET updated_at=updated_at WHERE blob_id=$1 AND created_at <= $2]], { id, cutoff })
            if lock_err or not result or tonumber(result.rows_affected) == nil then
                tx:rollback(); db:release()
                return nil, retention_error("orphan blob lock failed: " .. tostring(lock_err), errors.INTERNAL)
            end
            locked = tonumber(result.rows_affected) == 1
        end
        if locked then
            local count, collect_err = artifact_cleanup_repo.collect_orphan_blobs(tx, { id })
            if collect_err or count == nil then
                tx:rollback(); db:release()
                return nil, retention_error("orphan blob collection failed: " .. tostring(collect_err), errors.INTERNAL)
            end
            removed = removed + count
        end
        local _, commit_err = tx:commit()
        if commit_err then
            db:release()
            return nil, retention_error("orphan blob commit failed: " .. tostring(commit_err), errors.INTERNAL)
        end
    end
    db:release()
    return removed, nil
end

return artifact_cleanup_repo
