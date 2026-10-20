local json = require("json")
local time = require("time")
local sql = require("sql")
local errors = require("errors")

local resources = require("uploads_resources")
local persisted_json = require("persisted_json")

local upload_record_repo = {}

local function typed(kind: any, message: string): any
    return errors.new({ message = message, kind = kind })
end

local function select_upload_columns()
    return sql.builder.select(
        "uuid", "actor_id", "size", "mime_type",
        "storage_state", "storage_id", "storage_path", "type_id", "created_at",
        "updated_at", "metadata", "trace_context", "content_sha256",
        "processing_intent_state", "processing_job_id", "processing_max_execution_ms"
    )
end

local function now_rfc3339()
    return time.now():utc():format_rfc3339()
end

local function encode_json_object(value, field_name)
    if value == nil then return nil, nil end
    if type(value) == "table" then
        local encoded, err = json.encode(value)
        if err then
            return nil, "Failed to encode " .. field_name .. ": " .. err
        end
        return encoded, nil
    end
    return value, nil
end

local function encode_trace_context(value)
    if value == nil then return nil, nil end
    if type(value) ~= "table" then
        return nil, "trace_context must be an object"
    end
    return encode_json_object(value, "trace_context")
end

local function parse_upload_row(upload)
    if type(upload) ~= "table" then return nil, typed(errors.INTERNAL, "upload row is invalid") end
    local metadata, metadata_err = persisted_json.decode_table(upload.metadata, "kickside_uploads.metadata")
    if metadata_err then return nil, metadata_err end
    local trace_context, trace_err = persisted_json.decode_table(upload.trace_context,
        "kickside_uploads.trace_context", true)
    if trace_err then return nil, trace_err end
    upload.metadata = metadata
    upload.trace_context = trace_context
    return upload, nil
end

-- Look up a live upload for an account by content hash. Hard deletes remove the row,
-- so a returned record is always a live, non-deleted upload. Takes an open db handle
-- so the dedup check and a racing insert can observe the same connection state.
local function find_by_content_hash(db, actor_id, content_sha256, dedup_scope)
    local query = select_upload_columns()
        :from("kickside_uploads")
        :where("actor_id = ? AND content_sha256 = ? AND dedup_scope = ?", actor_id, content_sha256, dedup_scope)
        :limit(1)

    local rows, query_err = query:run_with(db):query()
    if query_err then return nil, query_err end
    if #rows == 0 then return nil, nil end

    local upload = rows[1]
    return parse_upload_row(upload)
end

local function find_by_uuid(db, uuid)
    local query = select_upload_columns()
        :from("kickside_uploads")
        :where("uuid = ?", uuid)
        :limit(1)

    local rows, query_err = query:run_with(db):query()
    if query_err then return nil, query_err end
    if #rows == 0 then return nil, nil end

    return parse_upload_row(rows[1])
end

-- Create a new upload record.
-- The per-actor content hash index resolves concurrent duplicate inserts to one record.
local function create_on(db, uuid, actor_id, size, mime_type, storage_id, storage_path, type_id, metadata, storage_state, content_sha256, trace_context, processing_intent, processing_max_execution_ms)
    if storage_state == nil then storage_state = "uploaded" end

    if not uuid or uuid == "" then
        return nil, "Upload ID is required"
    end

    if not actor_id or actor_id == "" then
        return nil, "Actor ID is required"
    end

    if not size or size <= 0 then
        return nil, "Valid file size is required"
    end

    if not mime_type or mime_type == "" then
        return nil, "MIME type is required"
    end

    if not storage_id or storage_id == "" then
        return nil, "Storage ID is required"
    end

    if not storage_path or storage_path == "" then
        return nil, "Storage path is required"
    end

    if not type_id or type_id == "" then
        return nil, "Type ID is required"
    end

    -- If metadata doesn't exist, initialize as empty table
    metadata = metadata or {}

    local metadata_json, metadata_err = encode_json_object(metadata, "metadata")
    if metadata_err then return nil, metadata_err end

    local trace_context_json, trace_err = encode_trace_context(trace_context)
    if trace_err then return nil, trace_err end

    local now = now_rfc3339()

    local content_hash = nil
    local dedup_scope = type(metadata) == "table" and metadata.parent_upload_id or ""
    if type(content_sha256) == "string" and content_sha256 ~= "" then
        content_hash = content_sha256
    end
    local intent_state = processing_intent == true and "pending" or nil
    if intent_state and storage_state ~= "uploaded" then
        return nil, typed(errors.INVALID, "processing intent requires uploaded storage")
    end
    if processing_max_execution_ms ~= nil and (type(processing_max_execution_ms) ~= "number"
        or processing_max_execution_ms < 1 or processing_max_execution_ms ~= math.floor(processing_max_execution_ms)) then
        return nil, typed(errors.INVALID, "processing max execution must be a positive integer")
    end

    -- Build the INSERT query
    local query = sql.builder.insert("kickside_uploads")
        :set_map({
            uuid = uuid,
            actor_id = actor_id,
            size = sql.as.int(size),
            mime_type = mime_type,
            storage_state = storage_state,
            storage_id = storage_id,
            storage_path = storage_path,
            type_id = type_id,
            created_at = now,
            updated_at = now,
            metadata = metadata_json,
            trace_context = trace_context_json and trace_context_json or sql.as.null(),
            content_sha256 = content_hash and content_hash or sql.as.null(),
            dedup_scope = dedup_scope,
            processing_intent_state = intent_state and intent_state or sql.as.null(),
            processing_max_execution_ms = processing_max_execution_ms or sql.as.null()
        })

    -- Execute the query
    local executor = query:suffix("ON CONFLICT DO NOTHING"):run_with(db)
    local result, err = executor:exec()

    if err then return nil, typed(errors.INTERNAL, "Failed to create upload record: " .. tostring(err)) end
    if tonumber(result.rows_affected) == 0 then
        -- A UNIQUE(actor_id, content_sha256) collision means an identical file already
        -- exists for this account (e.g. a duplicate member racing within the same batch).
        -- Resolve to that record instead of failing the insert.
        if content_hash then
            local existing, existing_err = find_by_content_hash(db, actor_id, content_hash, dedup_scope)
            if existing_err then return nil, existing_err end
            if existing then
                existing.deduped = true
                return existing
            end
        end
        local existing_id, existing_err = find_by_uuid(db, uuid)
        if existing_err then return nil, existing_err end
        if existing_id then
            return nil, typed(errors.CONFLICT, "upload already exists")
        end
        return nil, typed(errors.CONFLICT, "upload insert conflicts with an existing record")
    end

    return {
        uuid = uuid,
        actor_id = actor_id,
        size = size,
        mime_type = mime_type,
        storage_state = storage_state,
        storage_id = storage_id,
        storage_path = storage_path,
        type_id = type_id,
        created_at = now,
        updated_at = now,
        metadata = metadata,
        trace_context = trace_context,
        content_sha256 = content_hash,
        processing_intent_state = intent_state,
        processing_max_execution_ms = processing_max_execution_ms
    }
end

function upload_record_repo.create(...)
    local db, db_err = resources.get_db()
    if db_err then return nil, db_err end
    local upload, err = create_on(db, ...)
    db:release()
    return upload, err
end

function upload_record_repo.create_tx(tx, ...)
    return create_on(tx, ...)
end

function upload_record_repo.finalize_tx(tx, dbtype, upload_id, metadata_updates, etag, key, trace_context, max_execution_ms)
    local suffix = dbtype == sql.type.POSTGRES and " FOR UPDATE" or ""
    local rows, read_err = tx:query("SELECT * FROM kickside_uploads WHERE uuid=$1" .. suffix, { upload_id })
    if read_err then return nil, read_err end
    if not rows or not rows[1] then return nil, typed(errors.NOT_FOUND, "upload not found") end
    local upload, parse_err = parse_upload_row(rows[1])
    if parse_err then return nil, parse_err end
    if upload.storage_state ~= "pending" and upload.storage_state ~= "uploaded" then
        return nil, typed(errors.CONFLICT, "upload is not pending or uploaded")
    end
    local metadata = upload.metadata
    for k, v in pairs(metadata_updates or {}) do metadata[k] = v end
    if type(etag) == "string" and etag ~= "" then metadata.s3_etag = etag end
    local encoded, encode_err = encode_json_object(metadata, "metadata")
    if encode_err then return nil, encode_err end
    upload.trace_context = upload.trace_context or trace_context
    local trace_json, trace_err = encode_trace_context(upload.trace_context)
    if trace_err then return nil, trace_err end
    if type(key) == "string" and key ~= "" then upload.storage_path = key end
    upload.storage_state, upload.metadata = "uploaded", metadata
    upload.processing_intent_state = upload.processing_intent_state or "pending"
    upload.processing_max_execution_ms = upload.processing_max_execution_ms or max_execution_ms
    local _, update_err = sql.builder.update("kickside_uploads")
        :set("storage_state", "uploaded"):set("storage_path", upload.storage_path)
        :set("processing_intent_state", upload.processing_intent_state)
        :set("metadata", encoded):set("trace_context", trace_json or sql.as.null())
        :set("processing_max_execution_ms", upload.processing_max_execution_ms)
        :set("updated_at", now_rfc3339()):where("uuid = ?", upload_id):run_with(tx):exec()
    if update_err then return nil, update_err end
    return upload, nil
end

local function mark_storage_state(uuid: string, storage_state: string, processing_max_execution_ms: integer?)
    if not uuid or uuid == "" then
        return nil, "Upload ID is required"
    end

    if not storage_state or storage_state == "" then
        return nil, "Storage state is required"
    end

    local db, err = resources.get_db()
    if err then
        return nil, err
    end

    local now = now_rfc3339()

    local query = sql.builder.update("kickside_uploads")
        :set("storage_state", storage_state)
        :set("updated_at", now)
        :where("uuid = ?", uuid)
    if storage_state == "uploaded" then
        query = query:set("processing_intent_state", "pending")
        if processing_max_execution_ms ~= nil then
            query = query:set("processing_max_execution_ms", processing_max_execution_ms)
        end
    end

    local executor = query:run_with(db)
    local result, err = executor:exec()

    db:release()

    if err then
        return nil, "Failed to update upload storage state: " .. err
    end

    if result.rows_affected == 0 then
        return nil, "Upload not found"
    end

    return {
        uuid = uuid,
        storage_state = storage_state,
        updated_at = now,
        updated = true
    }
end

function upload_record_repo.mark_storage_uploaded(uuid, processing_max_execution_ms: integer?)
    return mark_storage_state(uuid, "uploaded", processing_max_execution_ms)
end

function upload_record_repo.mark_storage_completed(uuid)
    return mark_storage_state(uuid, "completed")
end

function upload_record_repo.mark_storage_failed(uuid)
    return mark_storage_state(uuid, "failed")
end

-- Return a failed upload to the uploaded state so its processing runs again.
-- Only a failed upload changes, so a concurrent retry or a live job is not reset.
function upload_record_repo.mark_failed_for_retry(uuid, processing_max_execution_ms: integer)
    if not uuid or uuid == "" then
        return nil, "Upload ID is required"
    end

    local db, err = resources.get_db()
    if err then
        return nil, err
    end

    local result, exec_err = sql.builder.update("kickside_uploads")
        :set("storage_state", "uploaded")
        :set("processing_intent_state", "pending")
        :set("processing_max_execution_ms", processing_max_execution_ms)
        :set("updated_at", now_rfc3339())
        :where("uuid = ? AND storage_state = ?", uuid, "failed")
        :run_with(db)
        :exec()

    db:release()

    if exec_err then
        return nil, "Failed to mark upload for retry: " .. exec_err
    end

    return result.rows_affected > 0, nil
end

-- A failed upload leaves content deduplication, so the same bytes can be uploaded
-- again as a new upload that is processed again.
function upload_record_repo.release_content_hash(uuid)
    if not uuid or uuid == "" then
        return nil, "Upload ID is required"
    end

    local db, err = resources.get_db()
    if err then
        return nil, err
    end

    local result, exec_err = sql.builder.update("kickside_uploads")
        :set("content_sha256", sql.as.null())
        :set("updated_at", now_rfc3339())
        :where("uuid = ? AND storage_state = ?", uuid, "failed")
        :run_with(db)
        :exec()

    db:release()

    if exec_err then
        return nil, "Failed to release upload content hash: " .. exec_err
    end

    return result.rows_affected > 0, nil
end

-- Update upload storage
function upload_record_repo.update_storage(uuid, storage_id, storage_path)
    if not uuid or uuid == "" then
        return nil, "Upload ID is required"
    end

    if not storage_id or storage_id == "" then
        return nil, "Storage ID is required"
    end

    if not storage_path or storage_path == "" then
        return nil, "Storage Path is required"
    end

    local db, err = resources.get_db()
    if err then
        return nil, err
    end

    local now = now_rfc3339()

    -- Build the UPDATE query
    local query = sql.builder.update("kickside_uploads")
        :set("storage_id", storage_id)
        :set("storage_path", storage_path)
        :set("updated_at", now)

    -- Add WHERE clause
    query = query:where("uuid = ?", uuid)

    -- Execute the query
    local executor = query:run_with(db)
    local result, err = executor:exec()

    db:release()

    if err then
        return nil, "Failed to update upload storage: " .. err
    end

    if result.rows_affected == 0 then
        return nil, "Upload not found"
    end

    return {
        uuid = uuid,
        storage_id = storage_id,
        storage_path = storage_path,
        updated_at = now,
        updated = true
    }
end

-- Update upload metadata
function upload_record_repo.update_metadata(uuid, metadata)
    if not uuid or uuid == "" then
        return nil, "Upload ID is required"
    end

    if not metadata then
        return nil, "Metadata is required"
    end

    local metadata_json, metadata_err = encode_json_object(metadata, "metadata")
    if metadata_err then return nil, metadata_err end

    local db, err = resources.get_db()
    if err then
        return nil, err
    end

    local now = now_rfc3339()

    -- Build the UPDATE query
    local query = sql.builder.update("kickside_uploads")
        :set("metadata", metadata_json)
        :set("updated_at", now)
        :where("uuid = ?", uuid)

    -- Execute the query
    local executor = query:run_with(db)
    local result, err = executor:exec()

    db:release()

    if err then
        return nil, "Failed to update upload metadata: " .. err
    end

    if result.rows_affected == 0 then
        return nil, "Upload not found"
    end

    return {
        uuid = uuid,
        updated_at = now,
        metadata = metadata,
        updated = true
    }
end

function upload_record_repo.update_trace_context(uuid, trace_context)
    if not uuid or uuid == "" then
        return nil, "Upload ID is required"
    end

    local trace_context_json, trace_err = encode_trace_context(trace_context)
    if trace_err then return nil, trace_err end

    local db, err = resources.get_db()
    if err then
        return nil, err
    end

    local now = now_rfc3339()
    local query = sql.builder.update("kickside_uploads")
        :set("trace_context", trace_context_json and trace_context_json or nil)
        :set("updated_at", now)
        :where("uuid = ?", uuid)

    local result, update_err = query:run_with(db):exec()
    db:release()

    if update_err then
        return nil, "Failed to update upload trace_context: " .. update_err
    end

    if result.rows_affected == 0 then
        return nil, "Upload not found"
    end

    return {
        uuid = uuid,
        updated_at = now,
        trace_context = trace_context,
        updated = true
    }
end

-- Update upload type ID
function upload_record_repo.update_type_id(uuid, type_id)
    if not uuid or uuid == "" then
        return nil, "Upload ID is required"
    end

    if not type_id or type_id == "" then
        return nil, "Type ID is required"
    end

    local db, err = resources.get_db()
    if err then
        return nil, err
    end

    local now = now_rfc3339()

    -- Build the UPDATE query
    local query = sql.builder.update("kickside_uploads")
        :set("type_id", type_id)
        :set("updated_at", now)
        :where("uuid = ?", uuid)

    -- Execute the query
    local executor = query:run_with(db)
    local result, err = executor:exec()

    db:release()

    if err then
        return nil, "Failed to update upload type: " .. err
    end

    if result.rows_affected == 0 then
        return nil, "Upload not found"
    end

    return {
        uuid = uuid,
        type_id = type_id,
        updated_at = now,
        updated = true
    }
end

-- Delete an upload
function upload_record_repo.delete(uuid)
    if not uuid or uuid == "" then
        return nil, "Upload ID is required"
    end

    local db, err = resources.get_db()
    if err then
        return nil, err
    end

    -- Build the DELETE query
    local query = sql.builder.delete("kickside_uploads")
        :where("uuid = ?", uuid)

    -- Execute the query
    local executor = query:run_with(db)
    local result, err = executor:exec()

    db:release()

    if err then
        return nil, "Failed to delete upload: " .. err
    end

    if result.rows_affected == 0 then
        return nil, "Upload not found"
    end

    return { deleted = true }
end

return upload_record_repo
