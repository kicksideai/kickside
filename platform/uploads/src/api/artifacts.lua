local http = require("http")
local upload_response = require("upload_response")
local security = require("security")

local upload_query_repo = require("upload_query_repo")
local artifact_content_repo = require("artifact_content_repo")
local artifact_parts_repo = require("artifact_parts_repo")
local metadata_sanitizer = require("metadata_sanitizer")
local upload_tokens = require("upload_tokens")
local component = require("component")
local types = require("types")
local http_errors = require("http_errors")

local function json_error(res: any, status: any, message: string, details: any?)
    res:set_status(status)
    res:set_content_type(http.CONTENT.JSON)
    local body: { [string]: any } = { success = false, error = message }
    if details then body.details = tostring(details) end
    res:write_json(body)
end

local function require_owned_upload(req: any, res: any): (any?, string?)
    local actor = security.actor()
    if not actor then
        json_error(res, http.STATUS.UNAUTHORIZED, "Authentication required")
        return nil, "unauthorized"
    end

    local actor_id = actor:id()
    if not actor_id or actor_id == "" then
        json_error(res, http.STATUS.UNAUTHORIZED, "Invalid actor ID")
        return nil, "unauthorized"
    end

    local upload_id = req:param("uuid")
    if not upload_id or upload_id == "" then
        json_error(res, http.STATUS.BAD_REQUEST, "Upload ID is required")
        return nil, "bad_request"
    end

    local upload, err = upload_query_repo.get(upload_id)
    if err or not upload then
        json_error(res, http.STATUS.NOT_FOUND, "Upload not found", err)
        return nil, "not_found"
    end
    local component_id = types.component_id_for_owner(upload.actor_id)
    if not component_id then
        json_error(res, http.STATUS.INTERNAL_ERROR, "Upload owner is invalid")
        return nil, "invalid_owner"
    end
    local _, access_err = component.validate_access(component_id, component.ACCESS.READ)
    if access_err then
        json_error(res, http_errors.classify(access_err), tostring(access_err))
        return nil, "forbidden"
    end
    return upload, nil
end

local function require_readable_upload(req: any, res: any, artifact_id: string?): (any?, string?)
    local upload_id = req:param("uuid")
    if not upload_id or upload_id == "" then
        json_error(res, http.STATUS.BAD_REQUEST, "Upload ID is required")
        return nil, "bad_request"
    end

    local upload, err = upload_query_repo.get(upload_id)
    if err or not upload then
        json_error(res, http.STATUS.NOT_FOUND, "Upload not found", err)
        return nil, "not_found"
    end

    local token = req:query("token")
    if type(token) == "string" and token ~= "" then
        local cap = upload_tokens.unpack_read(token, { upload_id = upload_id, artifact_id = artifact_id })
        if cap then return upload, nil end
    end

    local actor = security.actor()
    if not actor then
        json_error(res, http.STATUS.UNAUTHORIZED, "Authentication required")
        return nil, "unauthorized"
    end

    local actor_id = actor:id()
    if not actor_id or actor_id == "" then
        json_error(res, http.STATUS.UNAUTHORIZED, "Invalid actor ID")
        return nil, "unauthorized"
    end
    local component_id = types.component_id_for_owner(upload.actor_id)
    if not component_id then
        json_error(res, http.STATUS.INTERNAL_ERROR, "Upload owner is invalid")
        return nil, "invalid_owner"
    end
    local _, access_err = component.validate_access(component_id, component.ACCESS.READ)
    if access_err then
        json_error(res, http_errors.classify(access_err), tostring(access_err))
        return nil, "forbidden"
    end
    return upload, nil
end

local function has_readable_bytes(artifact: any): boolean
    if type(artifact.blob_id) == "string" and artifact.blob_id ~= "" then return true end
    local locator = type(artifact.locator) == "table" and artifact.locator or {}
    return type(locator.storage_id) == "string"
        and locator.storage_id ~= ""
        and type(locator.storage_path) == "string"
        and locator.storage_path ~= ""
end

local function raw_url(upload_id: string, artifact: any): (string?, any?)
    if not has_readable_bytes(artifact) then return nil, nil end
    local location, location_err = artifact_content_repo.resolve_storage(artifact)
    if location_err then return nil, location_err end
    return upload_response.delivery_url(location.storage_id, location.storage_path,
        upload_response.raw_path(upload_id, tostring(artifact.artifact_id)))
end

local function public_artifact(upload_id: string, artifact: any): (any?, any?)
    local artifact_id = tostring(artifact.artifact_id or "")
    local url, url_err = raw_url(upload_id, artifact)
    if url_err then return nil, url_err end
    local metadata = metadata_sanitizer.public(artifact.metadata)
    return {
        artifact_id = artifact_id,
        upload_id = artifact.upload_id,
        parent_artifact_id = artifact.parent_artifact_id,
        kind = artifact.kind,
        role = artifact.role,
        mime_type = artifact.mime_type,
        label = artifact.label,
        ordinal = artifact.ordinal,
        checksum = artifact.checksum,
        size = artifact.size or metadata.size or metadata.original_size,
        occurrence_count = artifact.occurrence_count,
        duplicate_count = artifact.duplicate_count,
        occurrence_labels = artifact.occurrence_labels,
        locator = metadata_sanitizer.public_locator(artifact.locator),
        metadata = metadata,
        raw_url = url,
        created_at = artifact.created_at,
        updated_at = artifact.updated_at,
    }
end

local DEFAULT_PARTS_LIMIT = 30
local MAX_PARTS_LIMIT = 100

local function clamp_int(value: any, fallback: number, min: number, max: number): number
    local n = tonumber(value)
    if not n then return fallback end
    n = math.floor(n)
    if n < min then return min end
    if n > max then return max end
    return n
end

-- An upload can fan out into hundreds of extracted parts (page images), so the
-- parts are paginated. The primary content artifact (the converted markdown) is
-- returned separately and in full, since it is the panel's default view.
local function artifacts_handler()
    local req = http.request()
    local res = http.response()
    if not req or not res then
        return nil, "Failed to get HTTP context"
    end
    res:set_content_type(http.CONTENT.JSON)

    local upload = require_owned_upload(req, res)
    if not upload then return end
    local upload_id = tostring(upload.uuid or "")

    local limit = clamp_int(req:query("limit"), DEFAULT_PARTS_LIMIT, 1, MAX_PARTS_LIMIT)
    local offset = clamp_int(req:query("offset"), 0, 0, 1000000000)

    local total, count_err = artifact_parts_repo.count_artifact_parts(upload.uuid)
    if count_err then
        json_error(res, http.STATUS.INTERNAL_ERROR, "Failed to count artifacts", count_err)
        return
    end

    local parts, parts_err = artifact_parts_repo.list_artifact_parts(upload.uuid, limit, offset)
    if parts_err then
        json_error(res, http.STATUS.INTERNAL_ERROR, "Failed to list artifacts", parts_err)
        return
    end

    local public_artifacts = {}
    for i, artifact in ipairs(parts or {}) do
        local public, delivery_err = public_artifact(upload_id, artifact)
        if delivery_err then
            json_error(res, http_errors.classify(delivery_err), "Failed to obtain artifact delivery URL")
            return
        end
        public_artifacts[i] = public
    end

    -- The primary content artifact is optional (raw-renderable uploads have none).
    local primary_public: { [string]: any }? = nil
    local primary = artifact_parts_repo.get_primary_content_artifact(upload.uuid)
    if primary then
        local delivery_err
        primary_public, delivery_err = public_artifact(upload_id, primary)
        if delivery_err then
            json_error(res, http_errors.classify(delivery_err), "Failed to obtain artifact delivery URL")
            return
        end
    end

    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        upload_id = upload.uuid,
        primary = primary_public,
        artifacts = public_artifacts,
        meta = {
            total = total,
            limit = limit,
            offset = offset,
        },
    })
end

local function safe_filename(value: any): string
    local name = tostring(value or "artifact")
    name = name:gsub("[\r\n\"]", "_")
    if name == "" then return "artifact" end
    return name
end

local function artifact_raw_handler()
    local req = http.request()
    local res = http.response()
    if not req or not res then
        return nil, "Failed to get HTTP context"
    end

    local artifact_id = req:param("artifact_id")
    if not artifact_id or artifact_id == "" then
        json_error(res, http.STATUS.BAD_REQUEST, "Artifact ID is required")
        return
    end

    local upload = require_readable_upload(req, res, artifact_id)
    if not upload then return end

    local artifact, artifact_err = artifact_content_repo.get_artifact(upload.uuid, artifact_id)
    if artifact_err or not artifact then
        json_error(res, http.STATUS.NOT_FOUND, "Artifact not found", artifact_err)
        return
    end
    local content, content_err, blob = artifact_content_repo.read_artifact_content(upload.uuid, artifact_id)
    if content_err or type(content) ~= "string" then
        json_error(res, http.STATUS.NOT_FOUND, "Artifact bytes not found", content_err)
        return
    end

    res:set_content_type(artifact.mime_type or (blob and blob.mime_type) or "application/octet-stream")
    res:set_header("Content-Disposition", 'inline; filename="' .. safe_filename(artifact.label or artifact.artifact_id) .. '"')
    res:set_header("X-Content-Type-Options", "nosniff")
    res:set_status(http.STATUS.OK)
    res:write(content)
end

return {
    artifacts_handler = artifacts_handler,
    artifact_raw_handler = artifact_raw_handler,
}
