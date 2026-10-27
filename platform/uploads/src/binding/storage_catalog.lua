-- Uploads owns the SQL for its logical content catalog. Storage implementations
-- use this native library interface so a caller transaction can be reused.
local sql = require("sql")
local env = require("env")
local storage_location = require("storage_location")
type Object = { storage_id: string, storage_path: string, mime_type: string? }
type Upload = { uuid: string, actor_id: string, storage_state: string }
local M = {}
function M.get_upload(id: string): (Upload?, any?)
    local db_id = env.get("kickside.uploads.env:database_resource")
    local db, err = sql.get(db_id :: string)
    if err then return nil, err end
    local rows, query_err = db:query("SELECT uuid,actor_id,storage_state FROM kickside_uploads WHERE uuid=$1", {id})
    db:release()
    if query_err then return nil, query_err end
    if #rows == 0 then return nil, errors.new({message="Upload not found",kind=errors.NOT_FOUND,retryable=false}) end
    return rows[1] :: Upload, nil
end
function M.objects(db_id: string, upload_id: string): ({ Object }?, any?)
    if db_id ~= env.get("kickside.uploads.env:database_resource") then return nil, errors.new({message="Storage catalog database mismatch",kind=errors.INVALID}) end
    local db, err = sql.get(db_id)
    if err then return nil, err end
    local rows, query_err = db:query([[SELECT storage_id,storage_path,mime_type FROM kickside_uploads WHERE uuid=$1
        UNION SELECT b.storage_id,b.storage_path,b.mime_type FROM kickside_upload_artifact_blobs b
        JOIN kickside_upload_artifacts a ON a.blob_id=b.blob_id WHERE a.upload_id=$1]], {upload_id})
    db:release()
    return rows :: { Object }?, query_err
end
function M.contains(db: any, storage_id: string, path: string): (boolean?, any?)
    local location, location_err = storage_location.parse(storage_id, path)
    if location_err or not location then return nil, location_err end
    local predicate, params
    if location.scheme == "fs" then
        predicate = "(storage_id=$1 AND storage_path=$2) OR storage_path=$3"
        params = { location.authority, location.key, storage_location.packed(location) }
    else
        predicate = "storage_path=$1"
        params = { storage_location.packed(location) }
    end
    local rows, err = db:query("SELECT 1 AS present FROM kickside_uploads WHERE " .. predicate
        .. " UNION SELECT 1 AS present FROM kickside_upload_artifact_blobs WHERE " .. predicate .. " LIMIT 1", params)
    if err then return nil, err end
    return #rows > 0, nil
end
return M
