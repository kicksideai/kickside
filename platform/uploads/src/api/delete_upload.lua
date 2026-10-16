local http = require("http")
local security = require("security")
local component = require("component")
local types = require("types")
local http_errors = require("http_errors")
local pipeline = require("pipeline")

local upload_lib = require("upload_lib")
local upload_query_repo = require("upload_query_repo")

local function delete_handler()
    local req = http.request()
    local res = http.response()

    if not req or not res then
        return nil, "Failed to get HTTP context"
    end

    res:set_content_type(http.CONTENT.JSON)

    local actor = security.actor()
    if not actor then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({
            success = false,
            error = "Authentication required",
        })
        return
    end

    local actor_id = actor:id()
    if not actor_id or actor_id == "" then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({
            success = false,
            error = "Invalid actor ID",
        })
        return
    end

    local uuid = req:param("uuid")
    if not uuid or uuid == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({
            success = false,
            error = "Upload ID is required",
        })
        return
    end

    local upload, err = upload_query_repo.get(uuid)
    if err or not upload then
        res:set_status(http.STATUS.NOT_FOUND)
        res:write_json({
            success = false,
            error = "Upload not found",
            details = err,
        })
        return
    end

    local component_id = types.component_id_for_owner(upload.actor_id)
    if not component_id then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "Upload owner is invalid" })
        return
    end
    local _, access_err = component.validate_access(component_id, component.ACCESS.DELETE)
    if access_err then
        res:set_status(http_errors.classify(access_err))
        res:write_json({
            success = false,
            error = tostring(access_err),
        })
        return
    end

    local deleted, del_err
    if upload.actor_id == actor_id then
        deleted, del_err = upload_lib.delete_upload(uuid)
    else
        local executor, bind_err = pipeline.upload_stage_executor(upload, "delete:" .. uuid, {})
        if bind_err then
            res:set_status(http_errors.classify(bind_err))
            res:write_json({ success = false, error = tostring(bind_err) })
            return
        end
        deleted, del_err = executor:call("kickside.uploads:delete_owned", { upload_id = uuid })
    end
    if del_err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({
            success = false,
            error = "Failed to delete upload",
            details = del_err,
        })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
    })
end

return {
    delete_handler = delete_handler,
}
