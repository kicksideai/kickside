-- Read-only access to any upload for a trusted caller module.
--
-- The functions here do NOT check who is calling. A module that imports this
-- library must authorize the read itself (for example by its own access rule
-- and by checking the upload's provenance metadata) before it calls them, the
-- same rule as uploads.delivery_url.

local upload_query_repo = require("upload_query_repo")
local artifact_parts_repo = require("artifact_parts_repo")
local artifact_content_repo = require("artifact_content_repo")

local M = {}

M.deps = { query = upload_query_repo, parts = artifact_parts_repo, content = artifact_content_repo }

M.DEFAULT_MAX_CHARS = 200000

type Info = { upload_id: string, status: string, filename: string?, mime_type: string?, size: number?, created_at: string? }
type Provenance = { source: unknown?, crm_files: unknown? }
type PrimaryText = { text: string, chars: integer, truncated: boolean, content_type: string?, artifact_id: string, metadata: unknown? }
type SourceImage = { artifact_id: string, content_type: string, size: number? }
type ImageBytes = { bytes: string, content_type: string, size: integer }

local function status_of(storage_state: unknown): string
    if storage_state == "completed" then return "completed" end
    if storage_state == "failed" then return "failed" end
    return "processing"
end

-- cut_utf8(text, limit) -> at most limit bytes, never ending inside a
-- multi-byte UTF-8 character.
local function cut_utf8(text: string, limit: integer): string
    local cut = limit
    while cut > 0 do
        local byte = text:byte(cut + 1)
        if not byte or byte < 0x80 or byte >= 0xC0 then break end
        cut = cut - 1
    end
    return text:sub(1, cut)
end

local function metadata_of(upload: any): { [string]: unknown }
    return type(upload.metadata) == "table" and upload.metadata or {}
end

-- info(upload_id) -> upload facts, or (nil, NOT_FOUND).
function M.info(upload_id: string): (Info?, error?)
    local upload, err = M.deps.query.get(upload_id)
    if err or not upload then return nil, err end
    local metadata = metadata_of(upload)
    return {
        upload_id = upload.uuid,
        status = status_of(upload.storage_state),
        filename = type(metadata.filename) == "string" and metadata.filename :: string or nil,
        mime_type = upload.mime_type,
        size = tonumber(upload.size),
        created_at = upload.created_at,
    }, nil
end

-- provenance(upload_id) -> { source, crm_files } as written by the uploader.
function M.provenance(upload_id: string): (Provenance?, error?)
    local upload, err = M.deps.query.get(upload_id)
    if err or not upload then return nil, err end
    local metadata = metadata_of(upload)
    return { source = metadata.source, crm_files = metadata.crm_files }, nil
end

-- primary_text(upload_id, max_chars?) -> the converted text (markdown for a
-- document, OCR for an image), cut at max_chars bytes (UTF-8 safe); chars is
-- the full length in bytes. (nil, NOT_FOUND) when there is no text.
function M.primary_text(upload_id: string, max_chars: number?): (PrimaryText?, any?)
    local primary, err = M.deps.parts.read_primary_content(upload_id)
    if err or not primary then return nil, err end
    local text = type(primary.content) == "string" and primary.content or ""
    local limit = math.floor(tonumber(max_chars) or M.DEFAULT_MAX_CHARS)
    local chars = #text
    local truncated = chars > limit
    if truncated then text = cut_utf8(text, limit) end
    return {
        text = text,
        chars = chars,
        truncated = truncated,
        content_type = primary.mime_type,
        artifact_id = primary.artifact.artifact_id,
        metadata = primary.metadata,
    }, nil
end

-- source_image(upload_id) -> the original image artifact of an image upload,
-- or nil for a document (documents are read as text only).
function M.source_image(upload_id: string): (SourceImage?, any?)
    local artifacts, err = M.deps.parts.list_artifacts(upload_id)
    if err then return nil, err end
    for _, artifact in ipairs(artifacts or {}) do
        local mime = tostring(artifact.mime_type or ""):lower()
        if artifact.role == "source" and mime:sub(1, 6) == "image/" then
            return { artifact_id = artifact.artifact_id, content_type = mime, size = tonumber(artifact.size) }, nil
        end
    end
    return nil, nil
end

-- image_bytes(upload_id, artifact_id, max_bytes?) -> the bytes of one image
-- artifact of this upload; another upload's artifact is NOT_FOUND.
function M.image_bytes(upload_id: string, artifact_id: string, max_bytes: number?): (ImageBytes?, any?)
    local artifact, artifact_err = M.deps.content.get_artifact(upload_id, artifact_id)
    if artifact_err or not artifact then return nil, artifact_err end
    local mime = tostring(artifact.mime_type or ""):lower()
    if mime:sub(1, 6) ~= "image/" then
        return nil, errors.new({ kind = errors.INVALID, message = "artifact is not an image", details = { code = "not_an_image" } })
    end
    local content, err = M.deps.content.read_artifact_content(upload_id, artifact_id)
    if err or type(content) ~= "string" then return nil, err end
    local limit = tonumber(max_bytes)
    if limit and #content > limit then
        return nil, errors.new({ kind = errors.INVALID, message = "image is too large", details = { code = "too_large" } })
    end
    return { bytes = content, content_type = mime, size = #content }, nil
end

return M
