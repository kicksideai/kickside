local upload_query_repo = require("upload_query_repo")
local artifact_parts_repo = require("artifact_parts_repo")
local security = require("security")
local component = require("component")
local upload_types = require("types")
local ctx = require("ctx")
local metadata_sanitizer = require("metadata_sanitizer")
local upload_response = require("upload_response")

local function handle()
    local upload_id, err = ctx.get("upload_id")
    if err then
        return nil, "Failed to get upload_id from context: " .. err
    end

    if not upload_id or upload_id == "" then
        return nil, "upload_id is required in context"
    end

    local upload, err = upload_query_repo.get(upload_id)
    if err then
        return nil, err
    end

    local actor = security.actor()
    if not actor then
        return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "No authenticated actor found" })
    end

    local component_id = upload_types.component_id_for_owner(upload.actor_id)
    if not component_id then
        return nil, errors.new({ kind = errors.INTERNAL, message = "Upload owner is invalid" })
    end
    local _, access_err = component.validate_access(component_id, component.ACCESS.READ)
    if access_err then return nil, access_err end

    local content_type = upload.mime_type
    local size = upload.size
    local metadata = upload.metadata or {}
    local artifact_id = nil
    local checksum = nil

    local artifact, artifact_err = artifact_parts_repo.get_primary_content_artifact(upload_id)
    if not artifact_err and artifact then
        local artifact_meta = artifact.metadata or {}
        content_type = artifact.mime_type or content_type
        size = artifact.size or artifact_meta.size or artifact_meta.original_size or artifact_meta.file_size or size
        metadata = artifact_meta
        artifact_id = artifact.artifact_id
        checksum = artifact.checksum
    end

    metadata = metadata_sanitizer.public(metadata)

    -- Extract filename from upload metadata
    local filename = metadata.filename or metadata.original_filename or "unknown"

    return {
        success = true,
        content_type = content_type,
        size = size,
        filename = filename,
        view_url = upload_response.format_get_upload(upload).view_url,
        created_at = upload.created_at,
        metadata = metadata,
        artifact_id = artifact_id,
        checksum = checksum,
        source_ref = {
            kind = "upload",
            upload_id = upload_id,
            artifact_id = artifact_id,
        },
    }
end

return { handle = handle }
