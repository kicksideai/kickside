local http = require("http")
local security = require("security")

local upload_response = require("upload_response")
local upload_types = require("types")
local upload_read_model = require("upload_read_model")
local upload_query_repo = require("upload_query_repo")
local component = require("component")
local http_errors = require("http_errors")

-- Handler to get a single upload by ID
local function get_handler()
    local req = http.request()
    local res = http.response()

    if not req or not res then
        return nil, "Failed to get HTTP context"
    end

    -- Set JSON content type for response
    res:set_content_type(http.CONTENT.JSON)

    -- Get current actor from security context
    local actor = security.actor()
    if not actor then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({
            success = false,
            error = "Authentication required"
        })
        return
    end

    -- Get actor ID from actor
    local actor_id = actor:id()
    if not actor_id or actor_id == "" then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({
            success = false,
            error = "Invalid actor ID"
        })
        return
    end

    -- Get upload ID from path parameter
    local uuid = req:param("uuid")
    if not uuid or uuid == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({
            success = false,
            error = "Upload ID is required"
        })
        return
    end

    -- Get upload by ID from the storage row joined with its projected lifecycle row.
    local stored, stored_err = upload_query_repo.get(uuid)
    if stored_err or not stored then
        res:set_status(http.STATUS.NOT_FOUND)
        res:write_json({ success = false, error = "Upload not found", details = tostring(stored_err) })
        return
    end
    local component_id = upload_types.component_id_for_owner(stored.actor_id)
    if not component_id then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "Upload owner is invalid" })
        return
    end
    local _, access_err = component.validate_access(component_id, component.ACCESS.READ)
    if access_err then
        res:set_status(http_errors.classify(access_err))
        res:write_json({ success = false, error = tostring(access_err) })
        return
    end
    local upload, err = upload_read_model.get_for_actor(stored.actor_id, uuid)
    if err then
        res:set_status(http.STATUS.NOT_FOUND)
        res:write_json({
            success = false,
            error = "Upload not found",
            details = err
        })
        return
    end

    -- Navigation is optional presentation metadata. A host without this page
    -- can still use the authorized file API and its delivery URLs.
    local base = upload_response.view_base()
    local public = upload_response.format_get_upload(upload, base)
    local url, delivery_err = upload_response.delivery_url(upload.storage_id, upload.storage_path, public.raw_url)
    if delivery_err then
        res:set_status(http_errors.classify(delivery_err))
        res:write_json({success = false, error = "Failed to obtain upload delivery URL"})
        return
    end
    public.raw_url = url

    -- Return success with upload
    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        component_id = component_id,
        upload = public
    })
end

return {
    get_handler = get_handler
}
