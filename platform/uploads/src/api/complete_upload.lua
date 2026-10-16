local http = require("http")
local http_errors = require("http_errors")
local security = require("security")
local json = require("json")

local upload_lib = require("upload_lib")
local metadata_sanitizer = require("metadata_sanitizer")
local upload_types = require("types")

local function new(dependencies: any?): any
    local deps = dependencies or {}
    local http = deps.http or http
    local security = deps.security or security
    local upload_lib = deps.upload_lib or upload_lib

-- Complete S3 direct upload handler
local function handler()
    local req, err = http.request()
    local res = http.response()

    if err then
        -- Handle request creation error
        if res then
            res:set_status((http_errors.classify(err)))
            res:write_json({
                success = false,
                error = "Failed to create request context",
                details = err
            })
        end
        return
    end

    if not req or not res then
        return nil, "Failed to get HTTP context"
    end

    -- Set JSON content type for response
    res:set_content_type(http.CONTENT.JSON)

    -- Check for proper JSON content
    if not req:is_content_type(http.CONTENT.JSON) then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({
            success = false,
            error = "Request must be application/json"
        })
        return
    end

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

    -- Parse JSON request body
    local body, err = req:body_json()
    if err then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({
            success = false,
            error = "Failed to parse JSON body",
            details = err
        })
        return
    end

    -- Validate required fields
    if not body.upload_id then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({
            success = false,
            error = "Missing required field: upload_id"
        })
        return
    end

    local upload_id = body.upload_id
    local etag = body.etag -- Optional ETag from S3 response

    -- Additional metadata to update (optional)
    local metadata_updates = body.metadata or {}
    local metadata_err = metadata_sanitizer.validate_client(metadata_updates)
    if metadata_err then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = tostring(metadata_err) })
        return
    end

    -- Pass through upload token into metadata
    if body.upload_token then
        metadata_updates.__upload_token = body.upload_token
    end

    local upload, err = upload_lib.complete_presigned_url(actor_id, upload_id, etag, metadata_updates)

    if err then
        res:set_status((http_errors.classify(err)))
        res:write_json({
            success = false,
            error = "Failed to complete upload",
            details = tostring(err)
        })
        return
    end

    -- Return success with upload record
    local component_id = upload_types.component_id_for_owner(actor_id)
    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        component_id = component_id,
        uuid = upload.uuid,
        size = upload.size,
        mime_type = upload.mime_type,
        created_at = upload.created_at
    })
end

return {
    handler = handler
}
end

local default = new()
default.new = new
return default
