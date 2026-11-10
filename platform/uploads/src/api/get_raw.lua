local http = require("http")
local uploads_resources = require("uploads_resources")

local upload_query_repo = require("upload_query_repo")
local read_access = require("read_access")
local http_errors = require("http_errors")

-- Stream the original stored bytes of an upload, with its real mime type, so the
-- frontend viewer can render images, PDFs, and text inline, under the upload
-- read rule.
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
    if err or not upload then
        res:set_status(http.STATUS.NOT_FOUND)
        res:set_content_type(http.CONTENT.JSON)
        res:write_json({ success = false, error = "Upload not found" })
        return
    end

    local denial, access_err = read_access.check(upload, { token = req:query("token"), artifact_id = false })
    if access_err then
        res:set_status(http_errors.classify(access_err))
        res:set_content_type(http.CONTENT.JSON)
        res:write_json({ success = false, error = tostring(access_err) })
        return
    end
    if denial == read_access.UNAUTHENTICATED then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:set_content_type(http.CONTENT.JSON)
        res:write_json({ success = false, error = "Authentication required" })
        return
    end
    if denial then
        res:set_status(http.STATUS.FORBIDDEN)
        res:set_content_type(http.CONTENT.JSON)
        res:write_json({ success = false, error = "Access denied" })
        return
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
