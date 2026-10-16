local http = require("http")
local security = require("security")
local http_errors = require("http_errors")

local upload_response = require("upload_response")
local upload_types = require("types")
local upload_read_model = require("upload_read_model")

-- Handler to list actor uploads
local function list_handler()
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

    -- Get query parameters
    local limit = tonumber(req:query("limit") or "20")
    local offset = tonumber(req:query("offset") or "0")
    local opts = {
        q = req:query("q"),
        status = req:query("status"),
    }

    -- Get total count of uploads for pagination (same filters as the list).
    local total_count, count_err = upload_read_model.count_for_actor(actor_id, opts)
    if count_err then
        res:set_status((http_errors.classify(count_err :: error)))
        res:write_json({
            success = false,
            error = "Failed to count uploads",
            details = tostring(count_err),
        })
        return
    end

    -- Get uploads for the actor
    local uploads, err = upload_read_model.list_for_actor(actor_id, limit, offset, opts)
    if err then
        res:set_status((http_errors.classify(err :: error)))
        res:write_json({
            success = false,
            error = "Failed to list uploads",
            details = tostring(err)
        })
        return
    end

    -- Format the uploads for frontend use
    local formatted_uploads = {}
    for _, upload in ipairs(uploads) do
        formatted_uploads[#formatted_uploads + 1] = upload_response.format_list_upload(upload)
    end

    -- Return success with uploads
    res:set_status(http.STATUS.OK)
    local component_id = upload_types.component_id_for_owner(actor_id)
    res:write_json({
        success = true,
        uploads = formatted_uploads,
        component_id = component_id,
        meta = {
            limit = limit,
            offset = offset,
            total = total_count or #uploads,
        }
    })
end

return {
    list_handler = list_handler
}
