local component = require("component")
local artifact_parts_repo = require("artifact_parts_repo")
local contract = require("contract")
local security = require("security")
local errors = require("errors")
local upload_query_repo = require("upload_query_repo")
local engines = require("engines")

-- Shared "ingest an upload into a KB" core. One path turns a processed upload
-- (its primary artifact + original-file provenance) into a KB content event,
-- reused by the upload pipeline callback (on_upload_complete, a fresh upload),
-- the ingest-upload endpoint (re-ingesting an existing upload the user picked),
-- and the agent EmbedToKB tool (ingesting a file the user dropped into chat).
-- Callers authorize WRITE access and resolve the upload's file facts; this only
-- reads the already-processed content and queues it.
local M = {}

local function typed(kind: any, message: string): any
    return errors.new({ message = message, kind = kind })
end

local function first_value(...): any
    for i = 1, select("#", ...) do
        local value = select(i, ...)
        if value ~= nil and not (type(value) == "string" and value == "") then return value end
    end
    return nil
end

local function url_external_id(source_url: any): string?
    if source_url == nil or source_url == "" then return nil end
    return "url:" .. tostring(source_url)
end

local function put_if_present(target: { [string]: any }, key: string, value: any): ()
    if value == nil then return end
    if type(value) == "string" and value == "" then return end
    target[key] = value
end

local TEXT_CONTENT_TYPES: { [string]: boolean } = {
    ["application/json"] = true, ["application/xml"] = true,
    ["application/javascript"] = true, ["application/sql"] = true,
}

local function is_text_content(content_type: string): boolean
    local base = (content_type:lower():match("^[^;]+") or ""):gsub("^%s+", ""):gsub("%s+$", "")
    if base:sub(1, 5) == "text/" then return true end
    if base:sub(1, 12) == "application/" and (base:match(".+%+json$") or base:match(".+%+xml$")) then return true end
    return TEXT_CONTENT_TYPES[base] == true
end

local function put_default(target: { [string]: any }, key: string, value: any): ()
    if target[key] == nil or (type(target[key]) == "string" and target[key] == "") then target[key] = value end
end

local function shallow_copy(input: any): { [string]: any }
    local out: { [string]: any } = {}
    if type(input) == "table" then
        for key, value in pairs(input) do out[key] = value end
    end
    return out
end

local PRIVATE_UPLOAD_LOCATOR_KEYS = {
    storage_id = true,
    storage_path = true,
    original_storage_id = true,
    original_storage_path = true,
}

local function strip_upload_locators(target: any): ()
    if type(target) ~= "table" then return end
    for key in pairs(PRIVATE_UPLOAD_LOCATOR_KEYS) do
        target[key] = nil
    end
end

local function archive_child_ids(upload_id: string, file: any): { string }?
    local meta = type(file) == "table" and type(file.metadata) == "table" and file.metadata or {}
    local raw = type(meta) == "table" and meta.child_upload_ids or nil

    if type(raw) ~= "table" then
        local rec, rec_err = upload_query_repo.get(upload_id)
        if rec_err or not rec then return nil end
        meta = type(rec.metadata) == "table" and rec.metadata or {}
        raw = meta.child_upload_ids
    end

    if type(raw) ~= "table" then return nil end

    local ids: { string } = {}
    local seen: { [string]: boolean } = {}
    for _, value in ipairs(raw :: { any }) do
        if type(value) == "string" and value ~= "" and not seen[value] then
            seen[value] = true
            ids[#ids + 1] = value
        end
    end
    if #ids == 0 then return nil end
    return ids
end

local function upload_file_record(upload_id: string): (any, string?)
    local rec, err = upload_query_repo.get(upload_id)
    if err or not rec then return nil, tostring(err or "upload not found") end
    return {
        mime_type = rec.mime_type,
        size = rec.size,
        metadata = rec.metadata,
    }, nil
end

local function read_upload_content(upload_id: string): (any?, any)
    local actor = security.actor()
    local scope = security.scope()
    if not actor or not scope then return nil, typed(errors.UNAUTHENTICATED, "authentication required") end

    local content_contract, contract_err = contract.get("kickside.contract:content_provider")
    if contract_err or not content_contract then
        return nil, typed(errors.UNAVAILABLE, "content provider unavailable: " .. tostring(contract_err or "not found"))
    end

    local provider, open_err = (content_contract :: any)
        :with_actor(actor)
        :with_scope(scope)
        :with_context({ upload_id = upload_id })
        :open("kickside.uploads:content_provider")
    if open_err or not provider then
        return nil, typed(errors.UNAVAILABLE, "upload content unavailable: " .. tostring(open_err or "not found"))
    end

    local content, content_err = provider:get_content({})
    if content_err or not content then
        if content_err then return nil, typed(errors.INVALID, tostring(content_err)) end
        return nil, typed(errors.INVALID, "failed to get primary upload artifact")
    end
    if content.success == false then
        return nil, content.error or typed(errors.INVALID, "failed to get primary upload artifact")
    end
    return content, nil
end

local ingest_impl

local function ensure_kb_exists(kb_id: string): (any, any?)
    local service, svc_err = component.get_service()
    if svc_err or not service then
        return typed(errors.UNAVAILABLE, "component service unavailable: " .. tostring(svc_err))
    end
    local comp, comp_err = service:get({ component_id = kb_id })
    if not comp or not comp.impl_id then
        return typed(errors.NOT_FOUND, "knowledge base not found: " .. tostring(comp_err))
    end
    return nil, comp
end

local function ingest_archive_children(kb_id: string, upload_id: string, file: any, seen: { [string]: boolean }): (any, any)
    local child_ids = archive_child_ids(upload_id, file)
    if not child_ids then return nil, nil end

    local results: { any } = {}
    local queued = 0
    local first_err: string? = nil
    for _, child_id in ipairs(child_ids) do
        local child_file, rec_err = upload_file_record(child_id)
        if rec_err or not child_file then
            first_err = first_err or rec_err or "upload not found"
            results[#results + 1] = { upload_id = child_id, success = false, error = rec_err or "upload not found" }
        else
            local result, ingest_err = ingest_impl(kb_id, child_id, child_file, seen)
            if ingest_err or not result then
                first_err = first_err or tostring(ingest_err)
                results[#results + 1] = { upload_id = child_id, success = false, error = tostring(ingest_err) }
            else
                queued = queued + 1
                results[#results + 1] = {
                    upload_id = child_id,
                    success = true,
                    external_id = result.external_id,
                    thread_id = result.thread_id,
                    projection_id = result.projection_id,
                }
            end
        end
    end

    if queued == 0 then
        local err = "archive has no processed members to ingest"
        if first_err and first_err ~= "" then err = err .. ": " .. tostring(first_err) end
        return nil, err
    end

    return {
        success = true,
        archive = true,
        upload_id = upload_id,
        queued = queued,
        total = #child_ids,
        results = results,
        external_id = "upload:" .. upload_id,
    }, nil
end

-- doc2md extracts source images into image artifacts (kind=image,
-- role=extracted-image) parented to the upload. Carry a reference to each on the
-- content event so the materializer can fetch the bytes from the upload artifact
-- store and embed them as image nodes. The materializer's embed_images gate
-- decides whether these references are materialized; off by default they are
-- ignored (only artifacts are stored).
local function image_artifact_refs(upload_id: string): {any}?
    local artifacts, list_err = artifact_parts_repo.list_artifacts(upload_id)
    if list_err or type(artifacts) ~= "table" then return nil end
    local refs: { { [string]: any } } = {}
    for _, artifact in ipairs(artifacts) do
        local kind = type(artifact.kind) == "string" and artifact.kind or ""
        local role = type(artifact.role) == "string" and artifact.role or ""
        local mime = type(artifact.mime_type) == "string" and artifact.mime_type or ""
        local is_image = kind == "image" or role == "extracted-image" or mime:sub(1, 6) == "image/"
        if is_image and type(artifact.artifact_id) == "string" and artifact.artifact_id ~= "" then
            local meta = type(artifact.metadata) == "table" and artifact.metadata or {}
            refs[#refs + 1] = {
                artifact_id = artifact.artifact_id,
                upload_id = upload_id,
                -- Content/blob hash: the upload store refcounts blobs by hash, so
                -- the same bytes (a repeated diagram/logo) share one checksum. The
                -- materializer dedups image nodes on it.
                checksum = type(artifact.checksum) == "string" and artifact.checksum or nil,
                content_type = mime ~= "" and mime or (type(meta.mime_type) == "string" and meta.mime_type or nil),
                name = type(meta.name) == "string" and meta.name or artifact.label,
                -- role distinguishes a rendered page (rasterized from an empty
                -- document) from a doc2md extracted image; the materializer embeds
                -- rendered pages even when embed_images is off, since they carry the
                -- document's only content.
                role = role ~= "" and role or nil,
                source_artifact_id = meta.source_artifact_id,
                markdown_artifact_id = meta.markdown_artifact_id,
                ordinal = artifact.ordinal,
            }
        end
    end
    if #refs == 0 then return nil end
    return refs :: {any}
end

-- ingest(kb_id, upload_id, file) -> (result, err).
-- file (optional) carries caller-side file facts: { mime_type, size, metadata,
-- trace_context }. Upload storage locators never cross into KB events.
function ingest_impl(kb_id: any, upload_id: any, file: any, seen: { [string]: boolean }): (any, any)
    if type(kb_id) ~= "string" or kb_id == "" then return nil, "kb_id is required" end
    if type(upload_id) ~= "string" or upload_id == "" then return nil, "upload_id is required" end
    file = type(file) == "table" and file or {}
    if seen[upload_id] then return nil, "archive recursion cycle at upload " .. upload_id end
    seen[upload_id] = true

    local kb_err, comp = ensure_kb_exists(kb_id)
    if kb_err then return nil, kb_err end

    local primary, content_err = read_upload_content(upload_id)
    if content_err or not primary then
        local archive_result, archive_err = ingest_archive_children(kb_id, upload_id, file, seen)
        if archive_result or archive_err then return archive_result, archive_err end

        return nil, content_err or typed(errors.INVALID, "failed to get upload content")
    end

    local content = primary.content or ""
    local artifact = primary.artifact or { artifact_id = primary.artifact_id, checksum = primary.checksum }
    local content_type = primary.content_type or primary.mime_type or "text/plain"
    if content == "" or not is_text_content(content_type) then
        local engine, engine_err = engines.by_impl(comp.impl_id)
        if engine_err then return nil, engine_err end
        if not engine or not engine.accepts_files then
            if content == "" then
                return nil, typed(errors.INVALID, "primary upload artifact is empty")
            end
            return nil, typed(errors.INVALID,
                "cannot ingest " .. tostring(content_type) .. " as document content: no text was extracted from this upload")
        end
        content = nil
    end
    local metadata = shallow_copy(primary.metadata)
    strip_upload_locators(metadata)
    metadata.upload_id = upload_id
    metadata.artifact_id = artifact.artifact_id
    put_default(metadata, "source", "upload")

    local image_refs = image_artifact_refs(upload_id)
    if image_refs then metadata.image_artifacts = image_refs end

    local upload_meta = type(file.metadata) == "table" and file.metadata or {}
    local filename = first_value(metadata.filename, upload_meta.filename)
    local original_filename = first_value(metadata.original_filename, upload_meta.filename, filename)

    put_if_present(metadata, "filename", filename)
    put_if_present(metadata, "source_url", first_value(metadata.source_url, upload_meta.source_url))
    put_if_present(metadata, "source_mime", first_value(metadata.source_mime, content_type))
    put_if_present(metadata, "original_mime_type", first_value(metadata.original_mime_type, file.mime_type))
    put_if_present(metadata, "original_filename", original_filename)
    put_if_present(metadata, "original_upload_id", first_value(metadata.original_upload_id, upload_id))
    put_if_present(metadata, "original_size", first_value(metadata.original_size, file.size))
    put_if_present(metadata, "relative_path", first_value(metadata.relative_path, upload_meta.relative_path))

    local source_ref = shallow_copy(metadata.source_ref)
    strip_upload_locators(source_ref)
    put_default(source_ref, "kind", "upload")
    put_default(source_ref, "origin", "api.ingest_upload")
    source_ref.upload_id = upload_id
    source_ref.artifact_id = artifact.artifact_id
    put_default(source_ref, "filename", metadata.filename)
    put_default(source_ref, "original_filename", metadata.original_filename)
    put_default(source_ref, "source_url", metadata.source_url)
    put_default(source_ref, "content_type", content_type)

    local external_id = first_value(
        metadata.external_id,
        source_ref.external_id,
        url_external_id(metadata.source_url),
        "upload:" .. upload_id
    )
    local external_version = first_value(metadata.external_version, source_ref.external_version)
    if content == nil then put_default(metadata, "content_hash", artifact.checksum) end
    metadata.external_id = external_id
    source_ref.external_id = external_id
    put_if_present(metadata, "external_version", external_version)
    put_if_present(source_ref, "external_version", external_version)

    local engine, open_err = component.open(kb_id, component.ACCESS.WRITE, "kickside.contract:embeddable")
    if open_err then return nil, open_err end
    assert(engine, "embeddable binding required")
    local result, ingest_err = engine:embed_content({
        content = content,
        content_type = content_type,
        metadata = metadata,
        title = metadata.filename,
        external_id = external_id,
        external_version = external_version,
        source_ref = source_ref,
        trace_context = file.trace_context,
    })

    if ingest_err or not result or result.success ~= true then
        ingest_err = ingest_err or (result and result.error)
        return nil, "failed to queue upload artifact: " .. tostring(ingest_err)
    end

    return result, nil
end

function M.ingest(kb_id: any, upload_id: any, file: any): (any, any)
    return ingest_impl(kb_id, upload_id, file, {})
end

return M
