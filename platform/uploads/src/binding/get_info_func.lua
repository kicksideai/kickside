local upload_query_repo = require("upload_query_repo")
local artifact_parts_repo = require("artifact_parts_repo")
local security = require("security")
local ctx = require("ctx")
local metadata_sanitizer = require("metadata_sanitizer")

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
        return nil, "Failed to get upload information: " .. err
    end

    local actor = security.actor()
    if not actor then
        return nil, "No authenticated actor found"
    end

    local actor_id = actor:id()
    local can_view_all = security.can("view_all", "uploads")

    if upload.actor_id ~= actor_id and not can_view_all then
        return nil, "Not authorized to access this content"
    end

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
