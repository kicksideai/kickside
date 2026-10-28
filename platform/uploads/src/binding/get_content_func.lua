local binding_errors = require("binding_errors")
local upload_query_repo = require("upload_query_repo")
local artifact_parts_repo = require("artifact_parts_repo")
local security = require("security")
local component = require("component")
local upload_types = require("types")
local ctx = require("ctx")
local metadata_sanitizer = require("metadata_sanitizer")
local uploads_resources = require("uploads_resources")

local MAX_EXTRACTED_BYTES = 24 * 1024

local function handle(args)
    args = args or {}

    local upload_id, err = ctx.get("upload_id")
    if err then
        return nil, binding_errors.new(errors.INVALID, "Failed to get upload_id from context: " .. tostring(err), "upload_id_required", false, err)
    end

    if type(upload_id) ~= "string" or upload_id == "" then
        return nil, binding_errors.new(errors.INVALID, "upload_id is required in context", "upload_id_required")
    end

    local upload, err = upload_query_repo.get(upload_id)
    if err then
        return nil, binding_errors.from(err, errors.UNAVAILABLE,
            errors.is(err, errors.NOT_FOUND) and "upload_not_found" or "upload_lookup_failed")
    end

    local actor = security.actor()
    if not actor then
        return nil, binding_errors.new(errors.PERMISSION_DENIED, "No authenticated actor found", "actor_required")
    end

    local component_id = upload_types.component_id_for_owner(upload.actor_id)
    if not component_id then
        return nil, binding_errors.new(errors.INTERNAL, "Upload owner is invalid", "upload_owner_invalid")
    end
    local _, access_err = component.validate_access(component_id, component.ACCESS.READ)
    if access_err then return nil, binding_errors.from(access_err, errors.PERMISSION_DENIED, "access_denied") end

    local artifact_content, artifact_err = artifact_parts_repo.read_primary_content(upload_id)
    if args.extracted_only == true then
        if artifact_err or not artifact_content or type(artifact_content.content) ~= "string" then
            return {
                success = false,
                state = "unreadable",
                filename = metadata_sanitizer.public(upload.metadata).filename or "attachment",
                error = binding_errors.from(artifact_err or binding_errors.new(errors.INTERNAL, "no primary artifact", "primary_artifact_missing"),
                    errors.UNAVAILABLE, "artifact_read_failed", "extracted text is not available"),
            }
        end
        local limit = math.max(1, math.min(math.floor(tonumber(args.limit) or MAX_EXTRACTED_BYTES), MAX_EXTRACTED_BYTES))
        local content = artifact_content.content
        local artifact = type(artifact_content.artifact) == "table" and artifact_content.artifact or {}
        return {
            success = true,
            state = "ready",
            content = content:sub(1, limit),
            content_truncated = #content > limit,
            total_size = #content,
            content_type = artifact_content.mime_type or "text/markdown",
            filename = metadata_sanitizer.public(upload.metadata).filename or "attachment",
            artifact_id = artifact.artifact_id,
            source_ref = { kind = "upload", upload_id = upload_id, artifact_id = artifact.artifact_id },
        }
    end
    if artifact_err or not artifact_content then
        local storage_path = tostring(upload.storage_path or "")
        if storage_path == "" then
            return { success = false, error = binding_errors.new(errors.INTERNAL,
                "Original upload storage path is missing", "upload_storage_path_missing") }
        end
        local storage, storage_err = uploads_resources.get_storage(upload.storage_id)
        if storage_err or not storage then
            return nil, binding_errors.from(storage_err, errors.UNAVAILABLE, "upload_storage_failed", "Failed to get upload storage")
        end
        local content, read_err = storage:readfile(storage_path)
        if type(content) ~= "string" then
            local source = read_err and binding_errors.from(read_err, errors.UNAVAILABLE, "upload_content_read_failed")
                or binding_errors.new(errors.INTERNAL, "Failed to read original upload content", "upload_content_read_failed")
            return { success = false, error = binding_errors.with_message(source, "Failed to read original upload content") }
        end
        return {
            success = true,
            content = content,
            content_type = upload.mime_type,
            size = #content,
            metadata = metadata_sanitizer.public(upload.metadata),
            artifact_id = nil,
            checksum = upload.content_sha256,
            source_ref = {
                kind = "upload",
                upload_id = upload_id,
                artifact_id = nil,
            },
        }
    end
    local content = artifact_content.content or ""
    local artifact = artifact_content.artifact or {}

    return {
        success = true,
        content = content,
        content_type = artifact_content.mime_type or upload.mime_type,
        size = #content,
        metadata = metadata_sanitizer.public(artifact_content.metadata),
        artifact_id = artifact.artifact_id,
        checksum = artifact.checksum,
        source_ref = {
            kind = "upload",
            upload_id = upload_id,
            artifact_id = artifact.artifact_id,
        },
    }
end

return { handle = handle }
