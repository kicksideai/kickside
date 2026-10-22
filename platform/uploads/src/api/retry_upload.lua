local http = require("http")
local security = require("security")
local http_errors = require("http_errors")
local upload_lib = require("upload_lib")
local upload_query_repo = require("upload_query_repo")

local function retry_handler()
    local req = http.request()
    local res = http.response()

    if not req or not res then
        return nil, "Failed to get HTTP context"
    end

    res:set_content_type(http.CONTENT.JSON)

    local actor = security.actor()
    local actor_id = actor and actor:id() or nil
    if not actor_id or actor_id == "" then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "Authentication required" })
        return
    end

    local uuid = req:param("uuid")
    if not uuid or uuid == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "Upload ID is required" })
        return
    end

    local upload, err = upload_query_repo.get(uuid)
    if err or not upload or upload.actor_id ~= actor_id then
        res:set_status(http.STATUS.NOT_FOUND)
        res:write_json({ success = false, error = "Upload not found" })
        return
    end

    local _, retry_err = upload_lib.retry_upload(uuid)
    if retry_err then
        res:set_status((http_errors.classify(retry_err)))
        res:write_json({ success = false, error = "Failed to retry upload" })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, upload_id = uuid })
end

return {
    retry_handler = retry_handler,
}
