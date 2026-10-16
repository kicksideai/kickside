local fs = require("fs")
local hash = require("hash")
local artifact_content_repo = require("artifact_content_repo")

-- Memory cap for formats that must be read whole to extract text (plain text,
-- markdown, code, json). Tabular files (csv/tsv) are handled by a bounded streaming
-- path instead, so this cap never applies to them.
local MAX_FILE_SIZE = 10 * 1024 * 1024 -- 10 MB

-- Bounded tabular reading. The preview is a small head of the file kept in memory;
-- row counting streams the whole file in chunks (bounded memory) up to a ceiling
-- beyond which the count is reported as approximate rather than pinning the worker.
local READ_CHUNK = 256 * 1024
local PREVIEW_MAX_BYTES = 64 * 1024
local PREVIEW_MAX_ROWS = 50
local STREAM_MAX_BYTES = 512 * 1024 * 1024 -- 512 MB streaming ceiling for row count
local MAX_COLUMNS = 1024

local TABULAR_MIME: { [string]: boolean } = {
    ["text/csv"] = true,
    ["application/csv"] = true,
    ["text/tab-separated-values"] = true,
    ["text/tsv"] = true,
}

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

local function content_metadata(params: any): { [string]: any }
    local upload_meta = type(params.metadata) == "table" and params.metadata or {}
    local out = {}
    for _, key in ipairs(CANONICAL_METADATA_FIELDS) do
        put_if_present(out, key, upload_meta[key])
    end
    put_if_present(out, "filename", upload_meta.filename)
    put_if_present(out, "original_filename", upload_meta.original_filename or upload_meta.filename)
    put_if_present(out, "original_mime_type", params.mime_type)
    put_if_present(out, "source_mime", out.source_mime or params.mime_type)
    put_if_present(out, "original_upload_id", params.upload_id)
    put_if_present(out, "original_storage_id", params.storage_id)
    put_if_present(out, "original_storage_path", params.storage_path)
    put_if_present(out, "original_size", params.size)
    return out
end

local function checksum_for(content: string): string
    local checksum, err = hash.sha256(content)
    if err or not checksum or checksum == "" then
        error("failed to hash text upload: " .. tostring(err))
    end
    return checksum
end

local function artifact_kind(mime_type: string?): string
    if mime_type == "text/markdown" or mime_type == "text/x-markdown" then
        return "markdown"
    end
    return "text"
end

local function trim(value: string): string
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function human_mb(bytes: number): string
    return string.format("%.1f MB", bytes / (1024 * 1024))
end

-- A permanent, input-shaped failure: retrying the identical bytes never succeeds, so
-- it must not loop through the job's retry budget. The pipeline reads retriable=false
-- and finalizes the upload terminally on the first attempt.
local function permanent_failure(message: string): any
    return { success = false, retriable = false, error = message }
end

local function extension_of(name: any): string?
    if type(name) ~= "string" then return nil end
    return name:lower():match("%.([%a%d]+)$")
end

local function is_tabular(mime_type: any, filename: any, storage_path: any): boolean
    if type(mime_type) == "string" and TABULAR_MIME[mime_type:lower()] then return true end
    local ext = extension_of(filename) or extension_of(storage_path)
    return ext == "csv" or ext == "tsv"
end

local function count_char(s: string, ch: string): integer
    local n = 0
    local i = 0
    while true do
        local f = string.find(s, ch, i + 1, true)
        if not f then break end
        n = n + 1
        i = f
    end
    return n
end

-- Pick the delimiter with the most occurrences in the header line. A file with none
-- of the candidates is a single-column table (comma reported, one column).
local function detect_delimiter(header: string): (string, string)
    local candidates = { { name = "tab", ch = "\t" }, { name = "comma", ch = "," }, { name = "semicolon", ch = ";" }, { name = "pipe", ch = "|" } }
    local best_name, best_ch, best_n = "comma", ",", -1
    for _, d in ipairs(candidates) do
        local n = count_char(header, d.ch)
        if n > best_n then
            best_n, best_name, best_ch = n, d.name, d.ch
        end
    end
    return best_name, best_ch
end

-- Naive delimiter split: it does not honor RFC-4180 quoting (a quoted delimiter is
-- counted as a separator), so column_count is the header's field count under simple
-- splitting -- truthful for the common case and bounded, not a full CSV parser.
local function split_columns(header: string, delim: string): { string }
    local cols: { string } = {}
    local start = 1
    while true do
        local f = string.find(header, delim, start, true)
        if not f or #cols + 1 >= MAX_COLUMNS then
            cols[#cols + 1] = header:sub(start)
            break
        end
        cols[#cols + 1] = header:sub(start, f - 1)
        start = f + 1
    end
    for i, c in ipairs(cols) do
        cols[i] = trim((c:gsub("\r$", "")))
    end
    return cols
end

type TabularShape = {
    preview: string,
    preview_truncated: boolean,
    line_count: integer,
    line_count_exact: boolean,
    bytes_streamed: integer,
}

-- Single streaming pass: accumulate a bounded preview head while counting newlines
-- across the whole file. Memory is bounded by READ_CHUNK + PREVIEW_MAX_BYTES; the
-- file bytes themselves are never all held at once.
local function stream_tabular(storage: any, path: string): (TabularShape?, string?)
    local f = storage:open(path, "r")
    if not f then return nil, "failed to open file for streaming" end

    local preview_parts: { string } = {}
    local preview_len = 0
    local preview_full = false
    local line_count = 0
    local bytes_streamed = 0
    local last_char = ""
    local line_count_exact = true

    while true do
        local chunk = f:read(READ_CHUNK)
        if type(chunk) ~= "string" or chunk == "" then break end
        bytes_streamed = bytes_streamed + #chunk
        line_count = line_count + count_char(chunk, "\n")
        last_char = chunk:sub(#chunk, #chunk)
        if not preview_full then
            local room = PREVIEW_MAX_BYTES - preview_len
            local take = #chunk <= room and chunk or chunk:sub(1, room)
            preview_parts[#preview_parts + 1] = take
            preview_len = preview_len + #take
            if preview_len >= PREVIEW_MAX_BYTES then preview_full = true end
        end
        if bytes_streamed >= STREAM_MAX_BYTES then
            line_count_exact = false
            break
        end
    end
    f:close()

    -- A final line with no trailing newline still counts as a row.
    if line_count_exact and bytes_streamed > 0 and last_char ~= "\n" then
        line_count = line_count + 1
    end

    local preview = table.concat(preview_parts)
    -- Cap the preview to whole rows as well as bytes.
    local rows_kept = 0
    local cut = nil
    local scan = 0
    while rows_kept < PREVIEW_MAX_ROWS do
        local nl = string.find(preview, "\n", scan + 1, true)
        if not nl then break end
        rows_kept = rows_kept + 1
        scan = nl
        cut = nl
    end
    local row_capped = false
    if rows_kept >= PREVIEW_MAX_ROWS and cut then
        preview = preview:sub(1, cut)
        row_capped = true
    end

    return {
        preview = preview,
        preview_truncated = preview_full or row_capped or (bytes_streamed > preview_len),
        line_count = line_count,
        line_count_exact = line_count_exact,
        bytes_streamed = bytes_streamed,
    }, nil
end

-- Bounded processing for tabular files: a capped preview + shape metadata instead of
-- reading the whole file into memory for text extraction. The primary artifact still
-- references the stored original, so the file remains downloadable; only the in-memory
-- extraction is bounded.
local function process_tabular(params: any, storage: any): any
    local shape, shape_err = stream_tabular(storage, params.storage_path :: string)
    if shape_err or not shape then
        return permanent_failure("failed to read tabular file: " .. tostring(shape_err))
    end

    local header = shape.preview:match("^[^\r\n]*") or ""
    local delimiter_name, delimiter_ch = detect_delimiter(header)
    local columns = split_columns(header, delimiter_ch)
    -- line_count includes the header row; data rows are the remainder.
    local data_rows = shape.line_count > 0 and (shape.line_count - 1) or 0

    local metadata = content_metadata(params)
    metadata.tabular = true
    metadata.delimiter = delimiter_name
    metadata.column_count = #columns
    metadata.columns = columns
    metadata.row_count = data_rows
    metadata.row_count_exact = shape.line_count_exact
    metadata.preview_truncated = shape.preview_truncated
    metadata.text_preview = shape.preview

    local checksum = checksum_for(shape.preview .. "|" .. tostring(params.size or shape.bytes_streamed))
    local artifact, artifact_err = artifact_content_repo.create_artifact({
        upload_id = params.upload_id,
        kind = "table",
        role = "primary",
        mime_type = params.mime_type or "text/csv",
        label = metadata.filename or metadata.original_filename or params.storage_path,
        ordinal = 0,
        checksum = checksum,
        locator = {
            type = "upload.original",
            upload_id = params.upload_id,
            storage_id = params.storage_id,
            storage_path = params.storage_path,
            checksum = checksum,
        },
        metadata = metadata,
    })
    if artifact_err or not artifact then
        error("Failed to create tabular artifact: " .. tostring(artifact_err))
    end

    return {
        success = true,
        metadata = {
            primary_artifact_id = artifact.artifact_id,
            artifact_count = 1,
            tabular = true,
            delimiter = delimiter_name,
            column_count = #columns,
            row_count = data_rows,
            row_count_exact = shape.line_count_exact,
            preview_truncated = shape.preview_truncated,
        },
    }
end

-- Whole-file processing for non-tabular text (plain text, markdown, code, json). The
-- file is read into memory for extraction, so an oversize file is a permanent,
-- non-retriable failure with a truthful reason rather than a looping error.
local function process_text(params: any, storage: any): any
    if params.size and tonumber(params.size) and (tonumber(params.size) :: number) > MAX_FILE_SIZE then
        return permanent_failure("File too large for text extraction (" .. human_mb(tonumber(params.size) :: number)
            .. " > " .. human_mb(MAX_FILE_SIZE) .. " limit); no preview stored.")
    end

    local content = storage:readfile(params.storage_path :: string) :: string
    if not content or content == "" then
        error("Failed to read file")
    end
    if #content > MAX_FILE_SIZE then
        return permanent_failure("File too large for text extraction (" .. human_mb(#content)
            .. " > " .. human_mb(MAX_FILE_SIZE) .. " limit); no preview stored.")
    end

    local metadata = content_metadata(params)
    local checksum = checksum_for(content)
    local artifact, artifact_err = artifact_content_repo.create_artifact({
        upload_id = params.upload_id,
        kind = artifact_kind(params.mime_type),
        role = "primary",
        mime_type = params.mime_type or "text/plain",
        label = metadata.filename or metadata.original_filename or params.storage_path,
        ordinal = 0,
        checksum = checksum,
        locator = {
            type = "upload.original",
            upload_id = params.upload_id,
            storage_id = params.storage_id,
            storage_path = params.storage_path,
            checksum = checksum,
        },
        metadata = metadata,
    })
    if artifact_err or not artifact then
        error("Failed to create text artifact: " .. tostring(artifact_err))
    end

    return {
        success = true,
        metadata = {
            primary_artifact_id = artifact.artifact_id,
            artifact_count = 1,
        }
    }
end

-- Text/tabular upload processor.
-- @param params Table containing upload information:
--   - upload_id: The UUID of the upload
--   - mime_type: The MIME type of the file
--   - storage_id: The storage identifier
--   - storage_path: The path in the storage
--   - size: The file size in bytes
--   - metadata: Upload metadata
-- @return Table with processing result ({ success = true, metadata } on success;
--   { success = false, retriable = false, error } for a permanent input failure).
local function process(params)
    if not params.upload_id or not params.storage_id or not params.storage_path then
        error("Missing required parameters")
    end

    local storage = fs.get(params.storage_id :: string)
    if not storage then
        error("Failed to get storage")
    end
    if not storage:exists(params.storage_path) then
        error("File does not exist in storage")
    end

    local filename = type(params.metadata) == "table" and params.metadata.filename or nil
    if is_tabular(params.mime_type, filename, params.storage_path) then
        return process_tabular(params, storage)
    end
    return process_text(params, storage)
end

return { process = process, content_metadata = content_metadata, is_tabular = is_tabular }
