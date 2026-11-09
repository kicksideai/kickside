local uploads_resources = require("uploads_resources")
local env = require("env")
local hash = require("hash")
local contract = require("contract")
local artifact_content_repo = require("artifact_content_repo")
local doc2md = require("doc2md")

local ENV_DOCUMENT_IMAGE_ARTIFACTS_ENABLED = "kickside.uploads.documents:env.document_image_artifacts_enabled"
local SETTINGS_CONTRACT = "kickside.settings:settings"
local SETTINGS_NS = "kickside.uploads.documents"
local SETTING_MAX_UPLOAD_BYTES = "max_upload_bytes"

-- The converter's hard input ceiling: the runtime upload limit can never exceed it.
local CONVERTER_CEILING = doc2md.limits.max_input_bytes :: integer

-- The effective upload limit: the admin-tunable kickside.settings value (served
-- from the warmed cache), clamped to the converter ceiling. A settings outage
-- degrades to the converter ceiling rather than blocking uploads.
local function max_file_size(): integer
    local configured: number? = nil
    local def = contract.get(SETTINGS_CONTRACT)
    if def then
        local inst = def:open()
        if inst then
            local r = inst:get({ namespace = SETTINGS_NS, key = SETTING_MAX_UPLOAD_BYTES })
            if r and r.success and tonumber(r.value) then
                configured = tonumber(r.value)
            end
        end
    end
    if not configured then return CONVERTER_CEILING end
    return math.min(math.floor(configured :: number), CONVERTER_CEILING) :: integer
end

local CANONICAL_METADATA_FIELDS = {
    "source",
    "source_url",
    "source_mime",
    "external_id",
    "external_version",
    "source_ref",
    "title",
    "reference_component_id",
    "reference_context",
}

local function put_if_present(target: { [string]: any }, key: string, value: any): ()
    if value == nil then return end
    if type(value) == "string" and value == "" then return end
    target[key] = value
end

local function document_metadata(params: any): { [string]: any }
    local upload_meta = type(params.metadata) == "table" and params.metadata or {}
    local out = {}
    for _, key in ipairs(CANONICAL_METADATA_FIELDS) do
        put_if_present(out, key, upload_meta[key])
    end
    put_if_present(out, "filename", upload_meta.filename)
    put_if_present(out, "source_url", upload_meta.source_url)
    put_if_present(out, "source_mime", "text/markdown")
    put_if_present(out, "original_mime_type", params.mime_type)
    put_if_present(out, "original_filename", upload_meta.original_filename or upload_meta.filename)
    put_if_present(out, "original_upload_id", params.upload_id)
    put_if_present(out, "original_storage_id", params.storage_id)
    put_if_present(out, "original_storage_path", params.storage_path)
    put_if_present(out, "original_size", params.size)
    put_if_present(out, "converter", "doc2md")
    out.conversion = true
    return out
end

local function enabled_value(value: any, default: boolean): boolean
    if value == nil or value == "" then return default end
    return value == true or tostring(value):lower() == "true"
end

local function extract_images_enabled(params: any): boolean
    local options = type(params.options) == "table" and params.options or {}
    local explicit = options.extract_images
    if explicit == nil then explicit = options["extract-images"] end
    if explicit ~= nil then
        return enabled_value(explicit, false)
    end

    -- env.get returns a non-string payload for an unset key, which enabled_value
    -- would read as "not true" and disable extraction; coerce it so an unset flag
    -- falls to the documented default (true) and only an explicit "false" disables.
    local env_raw = env.get(ENV_DOCUMENT_IMAGE_ARTIFACTS_ENABLED)
    local env_value = type(env_raw) == "string" and env_raw or nil
    return enabled_value(env_value, true)
end

local function checksum_for(bytes: string): string
    local checksum, checksum_err = hash.sha256(bytes)
    if checksum_err or not checksum or checksum == "" then
        error("failed to hash upload bytes: " .. tostring(checksum_err))
    end
    return checksum
end

local function create_source_artifact(upload_id: string, params: any, checksum: string, metadata: any): (any, string?)
    local storage_id = params.storage_id :: string
    local storage_path = params.storage_path :: string
    local label = metadata.original_filename or metadata.filename or storage_path
    local mime_type = params.mime_type or "application/octet-stream"

    return artifact_content_repo.create_artifact({
        upload_id = upload_id,
        kind = "file",
        role = "source",
        mime_type = mime_type,
        label = label,
        ordinal = 0,
        checksum = checksum,
        locator = {
            type = "upload.original",
            upload_id = upload_id,
            storage_id = storage_id,
            storage_path = storage_path,
            checksum = checksum,
        },
        metadata = {
            source = "upload",
            original_upload_id = upload_id,
            original_mime_type = mime_type,
            original_filename = metadata.original_filename,
            original_storage_id = storage_id,
            original_storage_path = storage_path,
            original_size = params.size,
            original_checksum = checksum,
        },
    })
end

-- doc2md returns extracted images by name + bytes without a mime type, so the
-- artifact would store application/octet-stream and the raw proxy would serve it
-- as a download instead of an inline-renderable image. Derive the mime from the
-- image's name extension (its real format) so an auth user can render it.
local IMAGE_MIME_BY_EXT: { [string]: string } = {
    png = "image/png", jpg = "image/jpeg", jpeg = "image/jpeg", gif = "image/gif",
    bmp = "image/bmp", webp = "image/webp", tif = "image/tiff", tiff = "image/tiff",
    svg = "image/svg+xml", emf = "image/emf", wmf = "image/wmf",
}

local function image_mime(image: any): string
    local explicit = image.mime_type
    if type(explicit) == "string" and (explicit :: string) ~= "" then return explicit :: string end
    local name = type(image.name) == "string" and (image.name :: string) or ""
    local ext = name:match("%.([%a%d]+)$")
    if ext then
        local m = IMAGE_MIME_BY_EXT[(ext :: string):lower()]
        if m then return m end
    end
    return "application/octet-stream"
end

local function image_metadata(upload_id: string, index: number, image: any, source_artifact_id: string, markdown_artifact_id: string): { [string]: any }
    local metadata = {
        source = "doc2md",
        alias = "doc2md:image:" .. tostring(index),
        name = image.name,
        mime_type = image_mime(image),
        size = image.size,
        original_upload_id = upload_id,
        parent_artifact_id = source_artifact_id,
        source_artifact_id = source_artifact_id,
        markdown_artifact_id = markdown_artifact_id,
    }
    put_if_present(metadata, "width", image.width)
    put_if_present(metadata, "height", image.height)
    return metadata
end

local function process(params: any): any
    if not params.upload_id or not params.storage_id or not params.storage_path then
        error("missing required parameters")
    end

    local upload_id = params.upload_id :: string
    local storage_id = params.storage_id :: string
    local storage_path = params.storage_path :: string

    local max_size = max_file_size()
    if params.size and tonumber(params.size) and tonumber(params.size) > max_size then
        error("file too large: " .. tostring(params.size) .. " bytes (max " .. tostring(max_size) .. ")")
    end

    local storage = uploads_resources.get_storage(storage_id)
    if not storage then
        error("failed to get storage")
    end
    if not storage:exists(storage_path) then
        error("file does not exist in storage")
    end

    local bytes = storage:readfile(storage_path)
    if type(bytes) ~= "string" or bytes == "" then
        error("failed to read file")
    end
    if #bytes > max_size then
        error("file too large after read: " .. tostring(#bytes) .. " bytes")
    end

    -- Convert options are the second argument. Page markers are hidden comments
    -- that let readers cite the PDF page or PPTX slide a passage comes from.
    local document, convert_err = doc2md.convert(
        { bytes = bytes },
        { extract_images = extract_images_enabled(params), page_markers = true }
    )
    if convert_err ~= nil then
        error("document conversion failed: " .. tostring(convert_err))
    end
    if type(document) ~= "table" or type(document.markdown) ~= "string" then
        error("document conversion returned invalid markdown")
    end

    local metadata = document_metadata(params)

    local source_checksum = checksum_for(bytes)
    local source_artifact, source_err = create_source_artifact(upload_id, params, source_checksum, metadata)
    if source_err or not source_artifact then
        error("failed to store source artifact: " .. tostring(source_err))
    end
    local source_artifact_id = source_artifact.artifact_id :: string

    local markdown_artifact, artifact_err = artifact_content_repo.create_artifact({
        upload_id = upload_id,
        parent_artifact_id = source_artifact_id,
        kind = "markdown",
        role = "primary",
        mime_type = "text/markdown",
        label = metadata.filename or metadata.original_filename or "converted.md",
        ordinal = 1,
        content = document.markdown,
        storage_id = storage_id,
        blob_metadata = {
            source = "doc2md",
            original_upload_id = upload_id,
            original_mime_type = params.mime_type,
            source_artifact_id = source_artifact_id,
        },
        locator = {
            type = "document.markdown",
            source_artifact_id = source_artifact_id,
        },
        metadata = metadata,
    })
    if artifact_err or not markdown_artifact then
        error("failed to store markdown artifact: " .. tostring(artifact_err))
    end
    local markdown_artifact_id = markdown_artifact.artifact_id :: string

    local image_count = 0
    for index, image in ipairs(document.images or {}) do
        local metadata = image_metadata(upload_id, index, image, source_artifact_id, markdown_artifact_id)
        local artifact, image_err = artifact_content_repo.create_artifact({
            upload_id = upload_id,
            parent_artifact_id = source_artifact_id,
            kind = "image",
            role = "extracted-image",
            mime_type = image_mime(image),
            label = image.name,
            ordinal = 1000 + index,
            content = image.data,
            storage_id = storage_id,
            blob_metadata = {
                source = "doc2md",
                original_upload_id = upload_id,
                image_name = image.name,
                mime_type = image_mime(image),
                size = image.size,
                width = image.width,
                height = image.height,
                source_artifact_id = source_artifact_id,
                markdown_artifact_id = markdown_artifact_id,
            },
            locator = {
                type = "doc2md.image",
                index = index,
                name = image.name,
                source_artifact_id = source_artifact_id,
                markdown_artifact_id = markdown_artifact_id,
            },
            metadata = metadata,
        })
        if image_err or not artifact then
            error("failed to store image artifact: " .. tostring(image_err))
        end
        image_count = image_count + 1
    end

    return {
        success = true,
        metadata = {
            source_artifact_id = source_artifact_id,
            markdown_artifact_id = markdown_artifact_id,
            primary_artifact_id = markdown_artifact_id,
            artifact_count = 2 + image_count,
            image_artifact_count = image_count,
        },
    }
end

return { process = process, document_metadata = document_metadata, image_mime = image_mime }
