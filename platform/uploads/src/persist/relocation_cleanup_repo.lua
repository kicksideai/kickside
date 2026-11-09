-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local json = require("json")
local resources = require("uploads_resources")
local storage_catalog = require("storage_catalog")
local persisted_json = require("persisted_json")

local M = {}
local KEY = "__relocation_cleanup"
type Location = { storage_id: string, storage_path: string }

local function unavailable(message: string): error
    return errors.new({message = message, kind = errors.UNAVAILABLE, retryable = true})
end

local function pending(metadata: any): ({ Location }?, error?)
    local value = metadata[KEY]
    if value == nil then return {}, nil end
    if type(value) ~= "table" then
        return nil, errors.new({message = "Invalid relocation cleanup state", kind = errors.INVALID, retryable = false})
    end
    local count, maximum = 0, 0
    for index, location in pairs(value) do
        if type(index) ~= "number" or index < 1 or index ~= math.floor(index)
            or type(location) ~= "table" or type(location.storage_id) ~= "string" or location.storage_id == ""
            or type(location.storage_path) ~= "string" or location.storage_path == "" then
            return nil, errors.new({message = "Invalid relocation cleanup location", kind = errors.INVALID, retryable = false})
        end
        count = count + 1
        maximum = math.max(maximum, index)
    end
    if count ~= maximum then
        return nil, errors.new({message = "Relocation cleanup state must be a dense array", kind = errors.INVALID, retryable = false})
    end
    return value, nil
end

local function metadata_row(db: any, upload_id: string): (any?, any?, error?)
    local rows, err = db:query("SELECT metadata FROM kickside_uploads WHERE uuid=$1", {upload_id})
    if err then return nil, nil, err end
    if not rows or not rows[1] then
        return nil, nil, errors.new({message = "Upload not found", kind = errors.NOT_FOUND, retryable = false})
    end
    local metadata, decode_err = persisted_json.decode_table(rows[1].metadata, "kickside_uploads.metadata")
    if decode_err then return nil, nil, decode_err end
    return metadata, rows[1].metadata, nil
end

-- The caller commits this intent in the same transaction as the new locations.
-- The private key is rejected in client metadata and omitted from public views.
function M.enqueue_tx(tx: any, upload_id: string, locations: { Location }): (any?, error?)
    if #locations == 0 then return nil, nil end
    local metadata, _, read_err = metadata_row(tx, upload_id)
    if read_err then return nil, read_err end
    local queue, queue_err = pending(metadata)
    if queue_err then return nil, queue_err end
    local seen = {}
    for _, location in ipairs(queue) do
        seen[location.storage_id .. "\0" .. location.storage_path] = true
    end
    for _, location in ipairs(locations) do
        local key = location.storage_id .. "\0" .. location.storage_path
        if not seen[key] then
            queue[#queue + 1] = {storage_id = location.storage_id, storage_path = location.storage_path}
            seen[key] = true
        end
    end
    metadata[KEY] = queue
    local encoded, encode_err = json.encode(metadata)
    if encode_err then return nil, encode_err end
    local result, write_err = tx:execute("UPDATE kickside_uploads SET metadata=$1 WHERE uuid=$2", {encoded, upload_id})
    if write_err then return nil, write_err end
    if not result or tonumber(result.rows_affected) ~= 1 then return nil, unavailable("Relocation cleanup intent was not saved") end
    return metadata, nil
end

local function missing(err: any): boolean
    return (type(err) == "userdata" and errors.is(err, errors.NOT_FOUND))
        or tostring(err):find("no such file or directory", 1, true) ~= nil
end

-- A failed removal or crash leaves the intent intact. Successful removals may
-- repeat; a live physical reference always wins over an old cleanup intent.
function M.flush(upload: any): (any?, error?)
    if type(upload) ~= "table" or type(upload.metadata) ~= "table" or upload.metadata[KEY] == nil then
        return upload, nil
    end
    local db, db_err = resources.get_db()
    if db_err or not db then return nil, db_err or unavailable("Upload cleanup database unavailable") end
    local metadata, original, read_err = metadata_row(db, upload.uuid)
    if read_err then db:release(); return nil, read_err end
    local queue, queue_err = pending(metadata)
    if queue_err then db:release(); return nil, queue_err end
    for _, location in ipairs(queue) do
        local referenced, reference_err = storage_catalog.contains(db, location.storage_id, location.storage_path)
        if reference_err then db:release(); return nil, reference_err end
        if not referenced then
            local storage, storage_err = resources.get_storage(location.storage_id)
            if storage_err or not storage then db:release(); return nil, storage_err or unavailable("Upload cleanup storage unavailable") end
            local _, remove_err = storage:remove(location.storage_path)
            if remove_err and not missing(remove_err) then db:release(); return nil, remove_err end
        end
    end
    metadata[KEY] = nil
    local encoded, encode_err = json.encode(metadata)
    if encode_err then db:release(); return nil, encode_err end
    if type(original) ~= "string" then
        original, encode_err = json.encode(original)
        if encode_err then db:release(); return nil, encode_err end
    end
    -- Do not overwrite a concurrent metadata edit or change public recency for
    -- internal housekeeping. A failed compare keeps the durable retry target.
    local result, write_err = db:execute(
        "UPDATE kickside_uploads SET metadata=$1 WHERE uuid=$2 AND metadata=$3", {encoded, upload.uuid, original})
    db:release()
    if write_err then return nil, write_err end
    if not result or tonumber(result.rows_affected) ~= 1 then return nil, unavailable("Upload changed during relocation cleanup") end
    upload.metadata = metadata
    return upload, nil
end

return M
