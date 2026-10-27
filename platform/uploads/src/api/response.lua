local registry = require("registry")
local time = require("time")
local resources = require("uploads_resources")
local metadata_sanitizer = require("metadata_sanitizer")

-- Normalize old numeric timestamps and current RFC3339 strings for frontend use.
local function format_date(timestamp)
    if timestamp == nil then return nil end
    if type(timestamp) == "string" then
        if timestamp == "" then return nil end
        if tonumber(timestamp) == nil then return timestamp end
    end

    if type(timestamp) ~= "number" then
        timestamp = tonumber(timestamp)
    end

    if not timestamp then return nil end

    local date = time.unix(timestamp, 0)
    return date:format_rfc3339()
end

local function public_error(value: any): string?
    if value == nil or value == "" then return nil end
    return "Upload processing failed. Check the file and try again."
end

-- The list carries only the transcription codes, so the preview can name a failure.
local function transcription_meta(metadata: any): any?
    local out = nil
    for _, key in ipairs(metadata_sanitizer.TRANSCRIPTION_ERROR_KEYS) do
        if metadata[key] ~= nil then
            out = out or {}
            out[key] = metadata[key]
        end
    end
    return out
end

local function raw_path(upload_id: string, artifact_id: string?): string
    local path = "/api/v1/uploads/" .. upload_id
    if artifact_id then path = path .. "/artifacts/" .. artifact_id end
    return path .. "/raw"
end

local function view_base(): (string?, any?)
    local nav, err = registry.get("kickside.uploads:nav_item")
    if err then return nil, err end
    local path = nav and nav.meta and nav.meta.path
    if type(path) ~= "string" or path == "" then
        return nil, errors.new({kind = errors.INTERNAL, message = "Upload navigation path is unavailable"})
    end
    return path, nil
end

local function delivery_url(storage_id: string, storage_path: string, raw_url: string?, options: any?): (string?, any?)
    local storage, storage_err = resources.get_storage(storage_id)
    if storage_err then return nil, storage_err end
    if storage.signed_url then
        local url, _, sign_err = storage:signed_url(storage_path, options)
        if sign_err then return nil, sign_err end
        if url then return url, nil end
    end
    return raw_url, nil
end

local function format_list_upload(upload: any, base: string?): any
    local metadata = metadata_sanitizer.public(upload.metadata)
    return {
        uuid = upload.uuid,
        raw_url = upload.uuid and raw_path(upload.uuid) or nil,
        view_url = upload.uuid and base and (base .. "/" .. upload.uuid) or nil,
        size = upload.size,
        mime_type = upload.mime_type,
        status = upload.status,
        error = public_error(upload.error),
        created_at = upload.created_at,
        updated_at = upload.updated_at,
        filename = metadata.filename,
        meta = transcription_meta(metadata),
    }
end

local function format_get_upload(upload: any, base: string?): any
    local metadata = metadata_sanitizer.public(upload.metadata)
    return {
        uuid = upload.uuid,
        raw_url = upload.uuid and raw_path(upload.uuid) or nil,
        view_url = upload.uuid and base and (base .. "/" .. upload.uuid) or nil,
        size = upload.size,
        mime_type = upload.mime_type,
        status = upload.status,
        error = public_error(upload.error),
        created_at = format_date(upload.created_at),
        updated_at = format_date(upload.updated_at),
        meta = metadata,
    }
end

return {
    format_date = format_date,
    raw_path = raw_path,
    view_base = view_base,
    delivery_url = delivery_url,
    format_list_upload = format_list_upload,
    format_get_upload = format_get_upload,
}
