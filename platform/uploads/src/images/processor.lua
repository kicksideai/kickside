local uploads_resources = require("uploads_resources")
local hash = require("hash")
local artifact_content_repo = require("artifact_content_repo")

local MAX_IMAGE_SIZE = 25 * 1024 * 1024 -- 25 MB cap for images

-- Simple image processor that just validates the upload and marks it as processed
-- Images don't need content extraction - they're stored as-is for agent viewing
local function process(params)
    -- Validate required parameters
    if not params.upload_id or not params.storage_id or not params.storage_path then
        error("Missing required parameters")
    end

    -- Get the file storage to verify file exists
    local storage = uploads_resources.get_storage(params.storage_id :: string)
    if not storage then
        error("Failed to get storage")
    end

    -- Check if the file exists
    if not storage:exists(params.storage_path) then
        error("Image file does not exist in storage")
    end

    -- Get basic file info
    local file_info = storage:stat(params.storage_path :: string)
    if not file_info then
        error("Failed to get image file information")
    end

    if file_info.size and tonumber(file_info.size) and tonumber(file_info.size) > MAX_IMAGE_SIZE then
        error("image too large: " .. tostring(file_info.size) .. " bytes (max " .. tostring(MAX_IMAGE_SIZE) .. ")")
    end

    local bytes = storage:readfile(params.storage_path :: string)
    if type(bytes) ~= "string" or bytes == "" then
        error("Failed to read image file")
    end
    local checksum, checksum_err = hash.sha256(bytes)
    if checksum_err or not checksum or checksum == "" then
        error("failed to hash image upload: " .. tostring(checksum_err))
    end

    -- Create metadata with image-specific information
    local image_metadata = {
        file_size = file_info.size,
        ready_for_viewing = true,
        processing_complete = true,
        original_upload_id = params.upload_id,
        original_mime_type = params.mime_type,
        original_storage_id = params.storage_id,
        original_storage_path = params.storage_path,
        original_size = file_info.size,
    }

    -- Add original filename if available
    if params.metadata and params.metadata.filename then
        image_metadata.original_filename = params.metadata.filename
    end

    local artifact, artifact_err = artifact_content_repo.create_artifact({
        upload_id = params.upload_id,
        kind = "image",
        role = "primary",
        mime_type = params.mime_type or "application/octet-stream",
        label = image_metadata.original_filename or params.storage_path,
        ordinal = 0,
        checksum = checksum,
        locator = {
            type = "upload.original",
            upload_id = params.upload_id,
            storage_id = params.storage_id,
            storage_path = params.storage_path,
            checksum = checksum,
        },
        metadata = image_metadata,
    })
    if artifact_err or not artifact then
        error("Failed to create image artifact: " .. tostring(artifact_err))
    end

    -- Return success - no content extraction needed for images
    return {
        success = true,
        metadata = {
            primary_artifact_id = artifact.artifact_id,
            artifact_count = 1,
        }
    }
end

return { process = process }
