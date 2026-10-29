local binding_errors = require("binding_errors")
local sql = require("sql")

local resources = require("uploads_resources")
local persisted_json = require("persisted_json")

local upload_query_repo = {}

local function select_upload_columns()
    return sql.builder.select(
        "uuid", "actor_id", "size", "mime_type",
        "storage_state", "storage_id", "storage_path", "type_id", "created_at",
        "updated_at", "metadata", "trace_context", "content_sha256",
        "processing_intent_state", "processing_job_id", "processing_max_execution_ms"
    )
end

local function parse_upload_row(upload)
    local metadata, metadata_err = persisted_json.decode_table(upload.metadata, "kickside_uploads.metadata")
    if metadata_err then return nil, metadata_err end
    local trace, trace_err = persisted_json.decode_table(upload.trace_context,
        "kickside_uploads.trace_context", true)
    if trace_err then return nil, trace_err end
    upload.metadata, upload.trace_context = metadata, trace
    return upload, nil
end

-- Look up a live upload for an account by content hash. Hard deletes remove the row,
-- so a returned record is always a live, non-deleted upload. Takes an open db handle
-- so the dedup check and a racing insert can observe the same connection state.
local function find_by_content_hash(db, actor_id, content_sha256, dedup_scope)
    local query = select_upload_columns()
        :from("kickside_uploads")
        :where("actor_id = ? AND content_sha256 = ?", actor_id, content_sha256)
        :limit(1)
    if dedup_scope ~= nil then query = query:where("dedup_scope = ?", dedup_scope) end

    local rows, query_err = query:run_with(db):query()
    if query_err then return nil, query_err end
    if #rows == 0 then return nil, nil end

    local upload = rows[1]
    return parse_upload_row(upload)
end

-- Resolve an existing upload for an account by content hash, opening its own db handle.
function upload_query_repo.find_by_content_hash(actor_id, content_sha256, dedup_scope)
    if not actor_id or actor_id == "" then
        return nil, "Actor ID is required"
    end
    if not content_sha256 or content_sha256 == "" then
        return nil, "Content hash is required"
    end

    local db, err = resources.get_db()
    if err then
        return nil, err
    end

    local upload, read_err = find_by_content_hash(db, actor_id, content_sha256, dedup_scope)
    db:release()
    return upload, read_err
end

-- Get an upload by ID
function upload_query_repo.get(uuid)
    if not uuid or uuid == "" then
        return nil, errors.new({kind = errors.INVALID, message = "Upload ID is required",
            retryable = false, details = {code = "upload_id_required"}})
    end

    local db, err = resources.get_db()
    if err then
        return nil, err
    end

    -- Build the SELECT query
    local query = select_upload_columns()
        :from("kickside_uploads")
        :where("uuid = ?", uuid)
        :limit(1)

    -- Execute the query
    local executor = query:run_with(db)
    local uploads, err = executor:query()

    db:release()

    if err then
        return nil, binding_errors.from(err, errors.UNAVAILABLE, "upload_lookup_failed", "Failed to get upload")
    end

    if #uploads == 0 then
        return nil, errors.new({ kind = errors.NOT_FOUND, message = "Upload not found",
            retryable = false, details = {code = "upload_not_found"} })
    end

    local upload = uploads[1]

    return parse_upload_row(upload)
end

-- Intent is committed on the upload record before enqueue. The jobs enqueue
-- response decides whether an active job already exists.
function upload_query_repo.list_processing_enqueue_intents(limit)
    if type(limit) ~= "number" or limit ~= math.floor(limit) or limit < 1 or limit > 500 then
        return nil, errors.new({ message = "intent batch must be an integer in [1, 500]", kind = errors.INVALID })
    end

    local db, err = resources.get_db()
    if err then
        return nil, err
    end

    local rows, query_err = db:query([[
        SELECT
            u.uuid, u.actor_id, u.size, u.mime_type,
            u.storage_state, u.storage_id, u.storage_path, u.type_id, u.created_at,
            u.updated_at, u.metadata, u.trace_context, u.content_sha256,
            u.processing_intent_state, u.processing_job_id, u.processing_max_execution_ms
        FROM kickside_uploads u
        WHERE u.storage_state = 'uploaded'
            AND u.processing_intent_state = 'pending'
        ORDER BY u.created_at ASC, u.uuid ASC
        LIMIT $1
    ]], { limit })
    db:release()
    if query_err then return nil, query_err end

    for _, row in ipairs(rows or {}) do
        local _, decode_err = parse_upload_row(row)
        if decode_err then return nil, decode_err end
    end
    return rows or {}, nil
end

-- List uploads by actor ID
-- Apply optional list filters to a user-scoped query. `storage_state` is the row's
-- byte-reservation state (pending/uploaded), not lifecycle status. Lifecycle
-- filtering is handled by the uploads read model.
local function apply_list_filters(query, opts)
    opts = type(opts) == "table" and opts or {}
    local ids = opts.ids
    if type(ids) == "table" then
        if #ids == 0 then
            query = query:where("1 = 0")
        else
            local marks: { string } = {}
            local values: { any } = {}
            for _, id in ipairs(ids) do
                if type(id) == "string" and id ~= "" then
                    marks[#marks + 1] = "?"
                    values[#values + 1] = id
                end
            end
            if #values == 0 then
                query = query:where("1 = 0")
            else
                query = query:where("uuid IN (" .. table.concat(marks, ", ") .. ")", table.unpack(values))
            end
        end
    end

    local storage_state = opts.storage_state
    if type(storage_state) == "string" and storage_state ~= "" and storage_state ~= "all" then
        query = query:where("storage_state = ?", storage_state)
    end
    local q = opts.q
    if type(q) == "string" then
        q = q:gsub("^%s*(.-)%s*$", "%1")
        if q ~= "" then
            local like = "%" .. q .. "%"
            query = query:where("(mime_type LIKE ? OR metadata LIKE ?)", like, like)
        end
    end
    return query
end

function upload_query_repo.list_by_actor(actor_id, limit, offset, opts)
    if not actor_id or actor_id == "" then
        return nil, "Actor ID is required"
    end

    local db, err = resources.get_db()
    if err then
        return nil, err
    end

    limit = limit or 100
    offset = offset or 0

    -- Build the SELECT query
    local query = select_upload_columns()
        :from("kickside_uploads")
        :where("actor_id = ?", actor_id)
    query = apply_list_filters(query, opts)
    query = query
        :order_by("created_at DESC")
        :limit(limit)
        :offset(offset)

    -- Execute the query
    local executor = query:run_with(db)
    local uploads, err = executor:query()

    db:release()

    if err then
        return nil, binding_errors.from(err, errors.UNAVAILABLE, "upload_list_failed", "Failed to list uploads")
    end

    for _, upload in ipairs(uploads) do
        local _, decode_err = parse_upload_row(upload)
        if decode_err then return nil, decode_err end
    end

    return uploads
end

-- List uploads by type ID
function upload_query_repo.list_by_type(type_id, limit, offset)
    if not type_id or type_id == "" then
        return nil, "Type ID is required"
    end

    local db, err = resources.get_db()
    if err then
        return nil, err
    end

    limit = limit or 100
    offset = offset or 0

    -- Build the SELECT query
    local query = select_upload_columns()
        :from("kickside_uploads")
        :where("type_id = ?", type_id)
        :order_by("created_at DESC")
        :limit(limit)
        :offset(offset)

    -- Execute the query
    local executor = query:run_with(db)
    local uploads, err = executor:query()

    db:release()

    if err then
        return nil, "Failed to list uploads by type: " .. err
    end

    for _, upload in ipairs(uploads) do
        local _, decode_err = parse_upload_row(upload)
        if decode_err then return nil, decode_err end
    end

    return uploads
end

-- Count total uploads for a user (matching the same optional row filters as the
-- list, so pagination totals stay consistent with a search/storage query).
function upload_query_repo.count_by_actor(actor_id, opts)
    if not actor_id or actor_id == "" then
        return nil, "Actor ID is required"
    end

    local db, err = resources.get_db()
    if err then
        return nil, err
    end

    -- Build the COUNT query
    local query = sql.builder.select("COUNT(*) as count")
        :from("kickside_uploads")
        :where("actor_id = ?", actor_id)
    query = apply_list_filters(query, opts)

    -- Execute the query
    local executor = query:run_with(db)
    local result, err = executor:query()

    db:release()

    if err then
        return nil, "Failed to count uploads: " .. err
    end

    return result[1].count
end

function upload_query_repo.list_with_filters(options)
    options = options or {}

    local db, err = resources.get_db()
    if err then
        return nil, err
    end

    local query = select_upload_columns()
        :from("kickside_uploads")

    if options.actor_id then
        query = query:where("actor_id = ?", options.actor_id)
    end

    if options.filters and options.filters.content_types and #options.filters.content_types > 0 then
        local content_conditions = {}
        for _, content_type in ipairs(options.filters.content_types) do
            if string.find(tostring(content_type), "*") then
                local pattern = string.gsub(tostring(content_type), "%*", "%%")
                query = query:where("mime_type LIKE ?", pattern)
            else
                table.insert(content_conditions, sql.builder.eq({ mime_type = content_type }))
            end
        end

        if #content_conditions > 0 then
            if #content_conditions == 1 then
                query = query:where(content_conditions[1])
            else
                query = query:where(sql.builder.or_(content_conditions))
            end
        end
    end

    if options.filters and options.filters.created_after then
        query = query:where("created_at >= ?", options.filters.created_after)
    end

    if options.filters and options.filters.created_before then
        query = query:where("created_at <= ?", options.filters.created_before)
    end

    local sort_column = "created_at"
    if options.sort == "size" then
        sort_column = "size"
    end

    local order = "DESC"
    if options.sort_order == "asc" then
        order = "ASC"
    end

    if options.after_id then
        -- The cursor must use the same compound order as the result. Its
        -- timestamp/size comes from the stored row, within the caller's scope.
        local anchor = "(SELECT " .. sort_column .. " FROM kickside_uploads WHERE uuid = ?"
        local anchor_params = { options.after_id }
        if options.actor_id then
            anchor = anchor .. " AND actor_id = ?"
            anchor_params[#anchor_params + 1] = options.actor_id
        end
        anchor = anchor .. ")"
        local cursor_params = {}
        for _ = 1, 2 do
            for _, value in ipairs(anchor_params) do cursor_params[#cursor_params + 1] = value end
        end
        cursor_params[#cursor_params + 1] = options.after_id
        local comparison = order == "ASC" and ">" or "<"
        query = query:where("(" .. sort_column .. " " .. comparison .. " " .. anchor
            .. " OR (" .. sort_column .. " = " .. anchor .. " AND uuid > ?))",
            table.unpack(cursor_params))
    end

    query = query:order_by(sort_column .. " " .. order .. ", uuid ASC")

    if options.limit then
        query = query:limit(options.limit)
    end

    local executor = query:run_with(db)
    local uploads, err = executor:query()

    db:release()

    if err then
        return nil, binding_errors.from(err, errors.UNAVAILABLE, "upload_list_failed", "Failed to list uploads")
    end

    for _, upload in ipairs(uploads) do
        local _, decode_err = parse_upload_row(upload)
        if decode_err then return nil, decode_err end
    end

    return uploads
end

function upload_query_repo.count_with_filters(options)
    options = options or {}

    local db, err = resources.get_db()
    if err then
        return nil, err
    end

    local query = sql.builder.select("COUNT(*) as count")
        :from("kickside_uploads")

    if options.actor_id then
        query = query:where("actor_id = ?", options.actor_id)
    end

    if options.filters and options.filters.content_types and #options.filters.content_types > 0 then
        local content_conditions = {}
        for _, content_type in ipairs(options.filters.content_types) do
            if string.find(tostring(content_type), "*") then
                local pattern = string.gsub(tostring(content_type), "%*", "%%")
                query = query:where("mime_type LIKE ?", pattern)
            else
                table.insert(content_conditions, sql.builder.eq({ mime_type = content_type }))
            end
        end

        if #content_conditions > 0 then
            if #content_conditions == 1 then
                query = query:where(content_conditions[1])
            else
                query = query:where(sql.builder.or_(content_conditions))
            end
        end
    end

    if options.filters and options.filters.created_after then
        query = query:where("created_at >= ?", options.filters.created_after)
    end

    if options.filters and options.filters.created_before then
        query = query:where("created_at <= ?", options.filters.created_before)
    end

    local executor = query:run_with(db)
    local result, err = executor:query()

    db:release()

    if err then
        return nil, binding_errors.from(err, errors.UNAVAILABLE, "upload_count_failed", "Failed to count uploads")
    end

    return result[1].count
end

return upload_query_repo
