local http = require("http")
local uploads_resources = require("uploads_resources")

local upload_query_repo = require("upload_query_repo")
local upload_tokens = require("upload_tokens")
local http_errors = require("http_errors")
local original_read = require("original_read")
local types = require("types")

-- Stream original bytes after verifying upload access or an authorized reference.
local function raw_handler()
    local req = http.request()
    local res = http.response()
    if not req or not res then
        return nil, "Failed to get HTTP context"
    end

    local uuid = req:param("uuid")
    if not uuid or uuid == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:set_content_type(http.CONTENT.JSON)
        res:write_json({ success = false, error = "Upload ID is required" })
        return
    end

    local upload, err = upload_query_repo.get(uuid)
    if err and not errors.is(err, errors.NOT_FOUND) then
        res:set_status(http_errors.classify(err))
        res:set_content_type(http.CONTENT.JSON)
        res:write_json({success = false, error = tostring(err)})
        return
    end
    if not upload then
        res:set_status(http.STATUS.NOT_FOUND)
        res:set_content_type(http.CONTENT.JSON)
        res:write_json({ success = false, error = "Upload not found" })
        return
    end

    local bearer_ok = false
    local token = req:query("token")
    if type(token) == "string" and token ~= "" then
        local cap = upload_tokens.unpack_read(token, { upload_id = uuid, artifact_id = false })
        bearer_ok = cap ~= nil
    end
    if not bearer_ok then
        local _, access_err = original_read.authorize(upload :: types.UploadReadRef)
        if access_err then
            local details = access_err:details() or {}
            res:set_status(details.code == "authentication_required" and http.STATUS.UNAUTHORIZED or http_errors.classify(access_err))
            res:set_content_type(http.CONTENT.JSON)
            res:write_json({success = false, error = tostring(access_err)})
            return
        end
    end

    local storage = uploads_resources.get_storage(upload.storage_id :: string)
    if not storage or not storage:exists(upload.storage_path) then
        res:set_status(http.STATUS.NOT_FOUND)
        res:set_content_type(http.CONTENT.JSON)
        res:write_json({ success = false, error = "File not in storage" })
        return
    end
    local file, open_err = storage:open(upload.storage_path :: string, "r")
    if open_err or not file then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:set_content_type(http.CONTENT.JSON)
        res:write_json({ success = false, error = "Failed to read file" })
        return
    end

    res:set_content_type(upload.mime_type or "application/octet-stream")
    res:set_status(http.STATUS.OK)
    while true do
        local chunk, read_err = file:read(1024 * 1024)
        if read_err then
            if errors.is(read_err, errors.NOT_FOUND) then break end
            file:close(); return nil, read_err
        end
        if not chunk or #chunk == 0 then break end
        local _, write_err = res:write(chunk)
        if write_err then file:close(); return nil, write_err end
    end
    local _, close_err = file:close()
    if close_err then return nil, close_err end
end

return {
    raw_handler = raw_handler
}
