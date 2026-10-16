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

-- Generate presigned S3 upload URL handler
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
    if not body.filename then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({
            success = false,
            error = "Missing required field: filename"
        })
        return
    end

    if not body.size or type(body.size) ~= "number" or body.size <= 0 then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({
            success = false,
            error = "Invalid or missing file size"
        })
        return
    end

    -- Get content type or default to octet-stream
    local mime_type = body.content_type or "application/octet-stream"

    -- Set expiration for presigned URL (default: 15 minutes)
    local expires_in = body.expires_in or upload_types.DEFAULT_PRESIGN_EXPIRES_SECONDS

    -- Get optional metadata
    local metadata = body.metadata or {}
    local metadata_err = metadata_sanitizer.validate_client(metadata)
    if metadata_err then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = tostring(metadata_err) })
        return
    end

    -- Pass through upload token into metadata
    if body.upload_token then
        metadata.__upload_token = body.upload_token
    end

    -- Generate presigned URL
    local presigned_data: any, err = upload_lib.generate_presigned_url(
        actor_id,
        body.filename,
        body.size,
        mime_type,
        expires_in,
        metadata
    )

    if err then
        res:set_status((http_errors.classify(err)))
        res:write_json({
            success = false,
            error = "Failed to generate presigned URL",
            details = tostring(err)
        })
        return
    end

    -- Return success with presigned URL data
    local component_id = upload_types.component_id_for_owner(actor_id)
    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        component_id = component_id,
        presigned_url = presigned_data.url,
        upload_id = presigned_data.upload_id,
        fields = presigned_data.fields or {},
        expires_at = presigned_data.expires_at
    })
end

return {
    handler = handler
}
end

local default = new()
default.new = new
return default
