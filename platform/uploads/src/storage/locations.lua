-- Logical addresses belong to Uploads. A committed placement changes their
-- physical location without rewriting upload/artifact IDs, dedup keys, or KB events.
local sql = require("sql")
local time = require("time")
local uuid = require("uuid")
local storage_types = require("storage_types")
local M = {}

local function timestamp(): string
    return time.now():utc():format_rfc3339()
end

function M.get(db_id: string, storage_id: string, path: string, supplied_db: any?): (storage_types.Location?, any?)
    local db: any = supplied_db
    local owned = supplied_db == nil
    if owned then
        local err
        db, err = sql.get(db_id)
        if err then return nil, err end
    end
    local rows, query_err = db:query([[SELECT * FROM kickside_upload_storage_locations
        WHERE storage_id=$1 AND storage_path=$2]], { storage_id, path })
    if owned then db:release() end
    if query_err then return nil, query_err end
    return rows[1], nil
end

function M.claim(db_id: string, storage_id: string, path: string, resource_id: string, prefix: string): (storage_types.Location?, any?)
    local db, err = sql.get(db_id)
    if err then return nil, err end
    local key = prefix .. "/" .. uuid.v4()
    local _, insert_err = db:execute([[INSERT INTO kickside_upload_storage_locations
        (storage_id,storage_path,resource_id,object_key,state,updated_at)
        VALUES ($1,$2,$3,$4,'copying',$5) ON CONFLICT (storage_id,storage_path) DO NOTHING]],
        { storage_id, path, resource_id, key, timestamp() })
    db:release()
    if insert_err then return nil, insert_err end
    return M.get(db_id, storage_id, path)
end

function M.ready(db_id: string, location: storage_types.Location, size: number, digest: string, etag: string): (boolean?, any?)
    local db, err = sql.get(db_id)
    if err then return nil, err end
    local result, update_err = db:execute([[UPDATE kickside_upload_storage_locations
        SET state='ready',size=$1,verification_digest=$2,etag=$3,updated_at=$4
        WHERE storage_id=$5 AND storage_path=$6 AND object_key=$7 AND state='copying'
          AND (EXISTS (SELECT 1 FROM kickside_uploads u WHERE u.storage_id=$5 AND u.storage_path=$6)
            OR EXISTS (SELECT 1 FROM kickside_upload_artifact_blobs b WHERE b.storage_id=$5 AND b.storage_path=$6))]],
        { size, digest, etag, timestamp(), location.storage_id, location.storage_path, location.object_key })
    db:release()
    if update_err then return nil, update_err end
    return tonumber(result.rows_affected) == 1, nil
end

function M.objects(db_id: string, upload_id: string): ({ storage_types.Object }?, any?)
    local db, err = sql.get(db_id)
    if err then return nil, err end
    local rows, query_err = db:query([[SELECT storage_id,storage_path,mime_type FROM kickside_uploads WHERE uuid=$1
        UNION SELECT b.storage_id,b.storage_path,b.mime_type FROM kickside_upload_artifact_blobs b
        JOIN kickside_upload_artifacts a ON a.blob_id=b.blob_id WHERE a.upload_id=$1]], { upload_id })
    db:release()
    return rows :: { storage_types.Object }?, query_err
end

-- Retention repairs interruption after a delete or an abandoned copy. The grace
-- exceeds the maximum offload attempt, so no in-flight copy owns these objects.
function M.orphans(db_id: string, cutoff: string, limit: integer): ({ storage_types.Location }?, any?)
    local db, err = sql.get(db_id)
    if err then return nil, err end
    local rows, query_err = db:query([[SELECT l.* FROM kickside_upload_storage_locations l
        WHERE l.updated_at < $1
          AND NOT EXISTS (SELECT 1 FROM kickside_uploads u WHERE u.storage_id=l.storage_id AND u.storage_path=l.storage_path)
          AND NOT EXISTS (SELECT 1 FROM kickside_upload_artifact_blobs b WHERE b.storage_id=l.storage_id AND b.storage_path=l.storage_path)
        ORDER BY l.updated_at,l.object_key LIMIT $2]], { cutoff, limit })
    db:release()
    return rows :: { storage_types.Location }?, query_err
end

function M.forget(db_id: string, location: storage_types.Location): (any?, any?)
    local db, err = sql.get(db_id)
    if err then return nil, err end
    local result, delete_err = db:execute([[DELETE FROM kickside_upload_storage_locations
        WHERE storage_id=$1 AND storage_path=$2 AND object_key=$3]],
        { location.storage_id, location.storage_path, location.object_key })
    db:release()
    return result, delete_err
end

function M.remember_destination(db_id: string, resource_id: string, data: storage_types.NativeDestination): (any?, any?)
    local db, err = sql.get(db_id)
    if err then return nil, err end
    local result, save_err = db:execute([[INSERT INTO kickside_upload_storage_destinations
        (resource_id,config_id,bucket,endpoint) VALUES ($1,$2,$3,$4)
        ON CONFLICT (resource_id) DO NOTHING]], { resource_id, data.config, data.bucket, data.endpoint })
    db:release()
    return result, save_err
end

function M.destinations(db_id: string): ({ storage_types.Destination }?, any?)
    local db, err = sql.get(db_id)
    if err then return nil, err end
    local rows, query_err = db:query([[SELECT resource_id,config_id,bucket,endpoint
        FROM kickside_upload_storage_destinations ORDER BY resource_id]], {})
    db:release()
    return rows :: { storage_types.Destination }?, query_err
end

return M
