local json = require("json")
local time = require("time")
local uuid = require("uuid")
local sql = require("sql")
local errors = require("errors")

local resources = require("uploads_resources")
local artifact_schema = require("artifact_schema")
local artifact_content_repo = require("artifact_content_repo")

local artifact_parts_repo = {}

local function typed(kind: any, message: string): any
    return errors.new({ message = message, kind = kind })
end

local function now()
    return time.now():utc():format_rfc3339()
end

local function encode_json(value, fallback)
    value = value or fallback or {}
    if type(value) ~= "table" then return value end
    local encoded, err = json.encode(value)
    if err then return nil, "failed to encode json: " .. err end
    return encoded
end


local function nullable(value)
    if value == nil or value == "" then return sql.as.null() end
    return value
end


local function load_artifact_by_id(db, artifact_id)
    local rows, err = sql.builder.select(
            "a.artifact_id", "a.upload_id", "a.parent_artifact_id", "a.blob_id", "a.checksum", "a.kind",
            "a.role", "a.mime_type", "a.label", "a.ordinal", "a.locator", "a.metadata",
            "a.created_at", "a.updated_at", "b.storage_id", "b.storage_path", "b.size"
        )
        :from("kickside_upload_artifacts a")
        :left_join("kickside_upload_artifact_blobs b ON a.blob_id = b.blob_id")
        :where("a.artifact_id = ?", artifact_id)
        :limit(1)
        :run_with(db)
        :query()
    if err then return nil, "failed to load artifact: " .. err end
    if #rows == 0 then return nil, typed(errors.NOT_FOUND, "artifact not found") end
    return artifact_content_repo.normalize_artifact_row(rows[1])
end

local function is_primary_text_artifact(artifact)
    if not artifact or artifact.role ~= "primary" then return false end
    local kind = tostring(artifact.kind or "")
    local mime_type = tostring(artifact.mime_type or ""):lower()
    if kind == "markdown" or kind == "text" then return true end
    if mime_type == "text/markdown" or mime_type:match("^text/") then return true end
    return mime_type == "application/json"
        or mime_type == "application/xml"
        or mime_type == "application/javascript"
        or mime_type == "application/sql"
        or mime_type == "application/xhtml+xml"
end

local function prefix_upper_bound(prefix)
    if type(prefix) ~= "string" or prefix == "" then return nil end
    local last = prefix:byte(#prefix)
    if not last or last >= 255 then return nil end
    return prefix:sub(1, #prefix - 1) .. string.char(last + 1)
end

local function artifact_part_key(row)
    if not row then return "" end
    if type(row.blob_id) == "string" and row.blob_id ~= "" then return "blob:" .. row.blob_id end
    if type(row.checksum) == "string" and row.checksum ~= "" then return "sha256:" .. row.checksum end
    return "artifact:" .. tostring(row.artifact_id or "")
end

local function add_occurrence_sample(row, occurrence)
    local label = occurrence and occurrence.label
    if type(label) ~= "string" or label == "" then return end
    row.occurrence_labels = row.occurrence_labels or {}
    if #row.occurrence_labels >= 8 then return end
    for _, existing in ipairs(row.occurrence_labels) do
        if existing == label then return end
    end
    row.occurrence_labels[#row.occurrence_labels + 1] = label
end

local function dedupe_artifact_part_rows(rows)
    local unique = {}
    local by_key = {}
    for _, row in ipairs(rows or {}) do
        local key = artifact_part_key(row)
        local representative = by_key[key]
        if representative then
            local occurrence_count = (tonumber(representative.occurrence_count) or 1) + 1
            representative.occurrence_count = occurrence_count
            representative.duplicate_count = occurrence_count - 1
            add_occurrence_sample(representative, row)
        else
            row.dedupe_key = key
            row.representative_artifact_id = row.artifact_id
            row.occurrence_count = 1
            row.duplicate_count = 0
            add_occurrence_sample(row, row)
            by_key[key] = row
            unique[#unique + 1] = row
        end
    end
    return unique
end

local function slice_rows(rows, limit, offset)
    rows = rows or {}
    offset = math.max(0, math.floor(tonumber(offset) or 0))
    limit = tonumber(limit)
    if not limit or limit <= 0 then
        limit = #rows
    else
        limit = math.floor(limit)
    end

    local out = {}
    local first = offset + 1
    local last = math.min(#rows, offset + limit)
    for i = first, last do
        out[#out + 1] = rows[i]
    end
    return out
end

function artifact_parts_repo.create_chunk(args)
    args = args or {}
    local schema_ok, schema_err = artifact_schema.validate_chunk_args(args)
    if not schema_ok then return nil, schema_err end

    local metadata_json, metadata_err = encode_json(args.metadata or {})
    if metadata_err then return nil, metadata_err end
    local locator_json, locator_err = encode_json(args.locator or {})
    if locator_err then return nil, locator_err end

    local db, err = resources.get_db()
    if err then return nil, err end

    if args.artifact_id ~= nil and args.artifact_id ~= "" then
        local artifact, artifact_err = load_artifact_by_id(db, args.artifact_id)
        if artifact_err then
            db:release()
            return nil, artifact_err
        end
        if artifact.upload_id ~= args.upload_id then
            db:release()
            return nil, "artifact_id belongs to a different upload"
        end
    end

    local chunk_id = args.chunk_id or uuid.v4()
    local timestamp = now()
    local query = sql.builder.insert("kickside_upload_chunks")
        :set_map({
            chunk_id = chunk_id,
            upload_id = args.upload_id,
            artifact_id = nullable(args.artifact_id),
            kind = args.kind,
            content = args.content,
            ordinal = sql.as.int(tonumber(args.ordinal) or 0),
            token_count = args.token_count and sql.as.int(args.token_count) or sql.as.null(),
            locator = locator_json,
            metadata = metadata_json,
            created_at = timestamp,
            updated_at = timestamp,
        })

    local _, insert_err = query:run_with(db):exec()
    db:release()
    if insert_err then return nil, "failed to create chunk: " .. insert_err end

    return {
        chunk_id = chunk_id,
        upload_id = args.upload_id,
        artifact_id = args.artifact_id,
        kind = args.kind,
        content = args.content,
        ordinal = tonumber(args.ordinal) or 0,
        token_count = args.token_count,
        locator = args.locator or {},
        metadata = args.metadata or {},
        created_at = timestamp,
        updated_at = timestamp,
    }
end

function artifact_parts_repo.list_artifacts(upload_id)
    if not upload_id or upload_id == "" then return nil, "upload_id is required" end
    local db, err = resources.get_db()
    if err then return nil, err end

    local rows, query_err = sql.builder.select(
            "a.artifact_id", "a.upload_id", "a.parent_artifact_id", "a.blob_id", "a.checksum", "a.kind",
            "a.role", "a.mime_type", "a.label", "a.ordinal", "a.locator", "a.metadata",
            "a.created_at", "a.updated_at", "b.storage_id", "b.storage_path", "b.size"
        )
        :from("kickside_upload_artifacts a")
        :left_join("kickside_upload_artifact_blobs b ON a.blob_id = b.blob_id")
        :where("a.upload_id = ?", upload_id)
        :order_by("a.ordinal ASC, a.created_at ASC")
        :run_with(db)
        :query()

    db:release()
    if query_err then return nil, "failed to list artifacts: " .. query_err end
    for _, row in ipairs(rows) do
        local _, decode_err = artifact_content_repo.normalize_artifact_row(row)
        if decode_err then return nil, decode_err end
    end
    return rows
end

-- Extracted parts are every artifact except the original source and the primary
-- content: the images and other pieces a single upload can fan out into (hundreds
-- for a large document), surfaced as a paginated list rather than loaded at once.
local PARTS_WHERE = "a.role NOT IN ('source', 'primary')"

local function artifact_part_rows(upload_id, opts)
    if not upload_id or upload_id == "" then return nil, "upload_id is required" end
    opts = opts or {}
    local db, err = resources.get_db()
    if err then return nil, err end

    -- The prefix range trick requires byte-order comparison. SQLite's default
    -- BINARY collation gives that; postgres locale collations sort "page20_"
    -- inside the ["page2_", "page2`") range, so pin the C collation there.
    local label_expr = "a.label"
    if db:type() == sql.type.POSTGRES then
        label_expr = "a.label COLLATE \"C\""
    end

    local query = sql.builder.select(
            "a.artifact_id", "a.upload_id", "a.parent_artifact_id", "a.blob_id", "a.checksum", "a.kind",
            "a.role", "a.mime_type", "a.label", "a.ordinal", "a.locator", "a.metadata",
            "a.created_at", "a.updated_at", "b.storage_id", "b.storage_path", "b.size"
        )
        :from("kickside_upload_artifacts a")
        :left_join("kickside_upload_artifact_blobs b ON a.blob_id = b.blob_id")
        :where("a.upload_id = ?", upload_id)
        :where(PARTS_WHERE)

    local label = type(opts.label) == "string" and opts.label or ""
    if label ~= "" then
        query = query:where("(a.label = ? OR a.metadata LIKE ?)", label, "%" .. label .. "%")
    end

    local page = tonumber(opts.page)
    if page and page >= 0 then
        local prefix = "page" .. tostring(math.floor(page)) .. "_"
        local upper = prefix_upper_bound(prefix)
        if upper then
            query = query:where(label_expr .. " >= ? AND " .. label_expr .. " < ?", prefix, upper)
        else
            query = query:where("a.label LIKE ?", prefix .. "%")
        end
    end

    local prefix = type(opts.prefix) == "string" and opts.prefix or ""
    if prefix ~= "" then
        local upper = prefix_upper_bound(prefix)
        if upper then
            query = query:where(label_expr .. " >= ? AND " .. label_expr .. " < ?", prefix, upper)
        else
            query = query:where("a.label LIKE ?", prefix .. "%")
        end
    end

    if opts.images_only == true then
        query = query:where("(a.kind = 'image' OR a.mime_type LIKE 'image/%')")
    end

    local rows, query_err = query
        :order_by("a.ordinal ASC, a.created_at ASC, a.artifact_id ASC")
        :run_with(db)
        :query()
    db:release()
    if query_err then return nil, "failed to list artifact parts: " .. query_err end

    for _, row in ipairs(rows) do
        local _, decode_err = artifact_content_repo.normalize_artifact_row(row)
        if decode_err then return nil, decode_err end
    end
    if opts.include_duplicates == true then
        return rows
    end
    return dedupe_artifact_part_rows(rows)
end

function artifact_parts_repo.count_artifact_parts(upload_id, opts)
    local rows, err = artifact_part_rows(upload_id, opts)
    if err then return nil, err end
    return #rows
end

function artifact_parts_repo.list_artifact_parts(upload_id, limit, offset, opts)
    local rows, err = artifact_part_rows(upload_id, opts)
    if err then return nil, err end
    return slice_rows(rows, limit, offset)
end

function artifact_parts_repo.find_artifact_parts(upload_id, opts)
    if not upload_id or upload_id == "" then return nil, "upload_id is required" end
    opts = opts or {}
    if opts.images_only == nil then opts.images_only = true end
    local limit = tonumber(opts.limit) or 10
    if limit < 1 then limit = 1 end
    if limit > 100 then limit = 100 end

    local rows, err = artifact_part_rows(upload_id, opts)
    if err then return nil, "failed to find artifact parts: " .. err end
    return slice_rows(rows, limit, 0)
end

function artifact_parts_repo.get_primary_content_artifact(upload_id)
    if not upload_id or upload_id == "" then return nil, "upload_id is required" end
    local db, err = resources.get_db()
    if err then return nil, err end

    local rows, query_err = sql.builder.select(
            "a.artifact_id", "a.upload_id", "a.parent_artifact_id", "a.blob_id", "a.checksum", "a.kind",
            "a.role", "a.mime_type", "a.label", "a.ordinal", "a.locator", "a.metadata",
            "a.created_at", "a.updated_at", "b.storage_id", "b.storage_path", "b.size"
        )
        :from("kickside_upload_artifacts a")
        :left_join("kickside_upload_artifact_blobs b ON a.blob_id = b.blob_id")
        :where("a.upload_id = ?", upload_id)
        :where("a.role = 'primary'")
        :order_by("a.ordinal ASC, a.created_at ASC")
        :run_with(db)
        :query()

    db:release()
    if query_err then return nil, "failed to get primary content artifact: " .. query_err end
    for _, row in ipairs(rows) do
        local _, decode_err = artifact_content_repo.normalize_artifact_row(row)
        if decode_err then return nil, decode_err end
    end
    for _, artifact in ipairs(rows) do
        if is_primary_text_artifact(artifact) then
            return artifact
        end
    end
    return nil, typed(errors.NOT_FOUND, "primary content artifact not found")
end

function artifact_parts_repo.read_primary_content(upload_id)
    local artifact, artifact_err = artifact_parts_repo.get_primary_content_artifact(upload_id)
    if artifact_err then return nil, artifact_err end

    local content, content_err, blob = artifact_content_repo.read_artifact_content(upload_id, artifact.artifact_id)
    if content_err then return nil, content_err end
    return {
        content = content,
        mime_type = artifact.mime_type,
        metadata = artifact.metadata or {},
        artifact = artifact,
        blob = blob,
    }
end

function artifact_parts_repo.list_chunks(upload_id)
    if not upload_id or upload_id == "" then return nil, "upload_id is required" end
    local db, err = resources.get_db()
    if err then return nil, err end

    local rows, query_err = sql.builder.select(
            "chunk_id", "upload_id", "artifact_id", "kind", "content", "ordinal",
            "token_count", "locator", "metadata", "created_at", "updated_at"
        )
        :from("kickside_upload_chunks")
        :where("upload_id = ?", upload_id)
        :order_by("ordinal ASC, created_at ASC")
        :run_with(db)
        :query()

    db:release()
    if query_err then return nil, "failed to list chunks: " .. query_err end
    for _, row in ipairs(rows) do
        local _, decode_err = artifact_content_repo.normalize_artifact_row(row)
        if decode_err then return nil, decode_err end
    end
    return rows
end

function artifact_parts_repo.list_chunk_summaries(upload_id)
    if not upload_id or upload_id == "" then return nil, "upload_id is required" end
    local db, err = resources.get_db()
    if err then return nil, err end

    local rows, query_err = sql.builder.select(
            "chunk_id", "upload_id", "artifact_id", "kind", "ordinal",
            "token_count", "length(content) AS content_length", "locator", "metadata",
            "created_at", "updated_at"
        )
        :from("kickside_upload_chunks")
        :where("upload_id = ?", upload_id)
        :order_by("ordinal ASC, created_at ASC")
        :run_with(db)
        :query()

    db:release()
    if query_err then return nil, "failed to list chunk summaries: " .. query_err end
    for _, row in ipairs(rows) do
        local _, decode_err = artifact_content_repo.normalize_artifact_row(row)
        if decode_err then return nil, decode_err end
    end
    return rows
end

return artifact_parts_repo
