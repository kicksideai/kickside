local autoinit = require("autoinit")

type UploadReadRef = {uuid: string, actor_id: string}
type PageUpload = { uuid: string, actor_id: string, mime_type: string?, content_sha256: string?,
    storage_id: string, storage_path: string, metadata: {[string]: unknown}? }
type PageArtifact = { artifact_id: string, upload_id: string, parent_artifact_id: string?, checksum: string?,
    role: string, kind: string, mime_type: string?, size: number?, blob_id: string?,
    locator: {[string]: unknown}?, metadata: {[string]: unknown}? }
type PageLimits = { max_bytes: integer, max_width: integer, max_height: integer, max_pages: integer,
    formats: {string} }
type PageInfoRequest = { upload_id: string, cursor: integer?, revision: string? }
type PageLimitRequest = { max_bytes: number?, max_width: number?, max_height: number? }
type PageReadRequest = PageLimitRequest & { upload_id: string, page: integer, revision: string }
type PageText = { artifact_id: string, checksum: string }
type PageEntry = { page: integer, state: string }
type PageInfo = { state: string, page_count: integer?, revision: string?, text: PageText?, text_bound: boolean?,
    pages: {PageEntry}?, next_cursor: integer?, limits: PageLimits }
type PageImage = { page: integer, revision: string, image_checksum: string, mime_type: string,
    width: integer, height: integer, size: integer, bytes: string }
type PageSnapshot = { upload: PageUpload, source: PageArtifact?, text: PageText?,
    artifacts: {PageArtifact}, location: PageLocation?, revision: string?, renderer: PageRenderer?, state: string }
type RasterizerSpec = {processor_func: string?, input_mime_types: {string}?, priority: number | string?}
type RasterizerEntry = RasterizerSpec & {id: string?, data: RasterizerSpec?, meta: {priority: number | string?}?}
type PageRenderer = { processor_func: string, id: string?, input_mime_types: {string}?, priority: number? }
type PageRenderRequest = { ref: {storage_id: string, storage_path: string, bytes: string}, count_only: boolean?,
    pages: {integer}?, dpi: integer?, format: string?, quality: integer? }
type PageRenderResult = { ok: {total: integer, pages: {{page: integer, bytes: string, format: string}}?}?,
    err: error | string | {message: string, kind: string?, retryable: boolean?, code: string?}? }
type PageLocation = { storage_id: string, storage_path: string, size: number? }

local M = {}

M.NON_PAGED_MIME_TYPES = {
    ["application/json"] = true, ["application/xml"] = true, ["application/javascript"] = true,
    ["application/zip"] = true, ["application/x-zip-compressed"] = true,
    ["application/gzip"] = true, ["application/x-tar"] = true, ["application/x-7z-compressed"] = true,
    ["application/vnd.rar"] = true, ["application/x-rar-compressed"] = true,
    ["application/x-bzip2"] = true, ["application/x-xz"] = true,
}

M.CLASS = "kickside.uploads"
M.IMPL = "kickside.uploads:uploads_component"
M.EVENT_SOURCE = "uploads"

-- Default lifetime of a presigned S3 upload URL (15 minutes).
M.DEFAULT_PRESIGN_EXPIRES_SECONDS = 900

M.EVENT = {
    QUEUED = "kickside.uploads.events:upload.queued",
    COMPLETED = "kickside.uploads.events:upload.completed",
    FAILED = "kickside.uploads.events:upload.failed",
    DELETED = "kickside.uploads.events:upload.deleted",
}

function M.component_id_for_owner(actor_id: string?): string?
    if not actor_id or actor_id == "" then return nil end
    return autoinit.component_id(actor_id, M.CLASS) :: string
end

function M.component_topic(component_id: string): string
    return "component." .. tostring(component_id)
end

return M
