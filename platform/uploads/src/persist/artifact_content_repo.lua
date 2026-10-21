local json = require("json")
local time = require("time")
local uuid = require("uuid")
local hash = require("hash")
local sql = require("sql")
local errors = require("errors")

local persisted_json = require("persisted_json")
local resources = require("uploads_resources")
local artifact_schema = require("artifact_schema")
local artifact_cleanup_repo = require("artifact_cleanup_repo")

local artifact_content_repo = {}

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

local function digest_for(content)
    local digest, err = hash.sha256(content or "")
    if err then return nil, err end
    if not digest or digest == "" then return nil, "empty digest" end
    return digest
end

-- Each attempted blob owns a distinct storage path. Deduplication still happens on
-- (storage_id, checksum) in the database, but a losing concurrent writer can now
-- remove only the bytes it wrote without risking the winning blob's content.
local function artifact_path(checksum: string, blob_id: string, requested_path: string?): string
    if type(requested_path) == "string" and requested_path ~= "" then
        return requested_path .. ".artifact-" .. blob_id
    end
    return "artifact-sha256-" .. checksum .. "-" .. blob_id
end

local function remove_blob_bytes(storage, storage_path: string): string?
    local _, remove_err = storage:remove(storage_path)
    if remove_err ~= nil and not tostring(remove_err):find("no such file or directory", 1, true) then
        return "artifact blob cleanup failed: " .. tostring(remove_err)
    end
    return nil
end

local function load_blob_by_checksum(db, storage_id, checksum)
    local query = sql.builder.select(
            "blob_id", "checksum", "mime_type", "size", "storage_id",
            "storage_path", "metadata", "created_at", "updated_at"
        )
        :from("kickside_upload_artifact_blobs")
        :where("storage_id = ? AND checksum = ?", storage_id, checksum)
        :limit(1)

    local rows, err = query:run_with(db):query()
    if err then return nil, "failed to load artifact blob: " .. err end
    if #rows == 0 then return nil end
    local row = rows[1]
    local metadata, metadata_err = persisted_json.decode_table(row.metadata, "artifact.metadata", true)
    if metadata_err then return nil, metadata_err end
    row.metadata = metadata or {}
    return row
end

local function load_blob_by_id(db, blob_id)
    local query = sql.builder.select(
            "blob_id", "checksum", "mime_type", "size", "storage_id",
            "storage_path", "metadata", "created_at", "updated_at"
        )
        :from("kickside_upload_artifact_blobs")
        :where("blob_id = ?", blob_id)
        :limit(1)

    local rows, err = query:run_with(db):query()
    if err then return nil, "failed to load artifact blob: " .. err end
    if #rows == 0 then return nil, typed(errors.NOT_FOUND, "artifact blob not found") end
    local row = rows[1]
    local metadata, metadata_err = persisted_json.decode_table(row.metadata, "artifact.metadata", true)
    if metadata_err then return nil, metadata_err end
    row.metadata = metadata or {}
    return row
end

function artifact_content_repo.normalize_artifact_row(row)
    if not row then return row end
    local locator, locator_err = persisted_json.decode_table(row.locator, "artifact.locator", true)
    if locator_err then return nil, locator_err end
    row.locator = locator or {}
    local metadata, metadata_err = persisted_json.decode_table(row.metadata, "artifact.metadata", true)
    if metadata_err then return nil, metadata_err end
    row.metadata = metadata or {}
    if row.occurrence_count ~= nil then
        row.occurrence_count = tonumber(row.occurrence_count) or 1
        row.duplicate_count = math.max(0, row.occurrence_count - 1)
    end
    return row
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

local function locator_storage(locator)
    if type(locator) ~= "table" then return nil, nil end
    local storage_id = locator.storage_id
    local storage_path = locator.storage_path
    if type(storage_id) ~= "string" or storage_id == "" then return nil, nil end
    if type(storage_path) ~= "string" or storage_path == "" then return nil, nil end
    return storage_id, storage_path
end

function artifact_content_repo.create_blob(mime_type, content, metadata, options)
    if not mime_type or mime_type == "" then return nil, "mime_type is required" end
    if type(content) ~= "string" then return nil, "content must be a binary string" end
    options = options or {}

    local checksum, checksum_err = digest_for(content)
    if checksum_err then return nil, checksum_err end

    -- Encode every fallible in-memory field before mutating external storage.
    local metadata_json, encode_err = encode_json(metadata)
    if encode_err then return nil, encode_err end

    local storage_id = resources.get_storage_id(options.storage_id)

    local db, err = resources.get_db()
    if err then return nil, err end

    local existing, load_err = load_blob_by_checksum(db, storage_id, checksum)
    if load_err then
        db:release()
        return nil, load_err
    end
    if existing then
        db:release()
        return existing
    end

    local blob_id = uuid.v4()
    local requested_path: string? = nil
    if type(options.storage_path) == "string" then
        requested_path = options.storage_path :: string
    end
    local storage_path = artifact_path(checksum, blob_id, requested_path)

    local storage, storage_err = resources.get_storage(storage_id, db)
    if storage_err or not storage then
        db:release()
        return nil, storage_err or "failed to get artifact storage"
    end

    local write_ok, write_err = storage:writefile(storage_path, content)
    if write_ok == false or write_err then
        local cleanup_err = remove_blob_bytes(storage, storage_path)
        db:release()
        if cleanup_err then
            return nil, "failed to write artifact blob: " .. tostring(write_err) .. "; " .. cleanup_err
        end
        return nil, "failed to write artifact blob: " .. tostring(write_err)
    end

    local timestamp = now()
    local query = sql.builder.insert("kickside_upload_artifact_blobs")
        :set_map({
            blob_id = blob_id,
            checksum = checksum,
            mime_type = mime_type,
            size = sql.as.int(#content),
            storage_id = storage_id,
            storage_path = storage_path,
            metadata = metadata_json,
            created_at = timestamp,
            updated_at = timestamp,
        })

    local _, insert_err = query:run_with(db):exec()
    if insert_err then
        local raced, raced_err = load_blob_by_checksum(db, storage_id, checksum)
        local cleanup_err = remove_blob_bytes(storage, storage_path)
        db:release()
        if cleanup_err then
            return nil, "failed to create artifact blob: " .. insert_err .. "; " .. cleanup_err
        end
        if raced_err then
            return nil, "failed to create artifact blob: " .. insert_err .. "; " .. raced_err
        end
        if raced then return raced end
        return nil, "failed to create artifact blob: " .. insert_err
    end

    db:release()
    return {
        blob_id = blob_id,
        checksum = checksum,
        mime_type = mime_type,
        size = #content,
        storage_id = storage_id,
        storage_path = storage_path,
        metadata = metadata or {},
        created_at = timestamp,
        updated_at = timestamp,
    }
end

function artifact_content_repo.create_artifact(args)
    args = args or {}
    local schema_ok, schema_err = artifact_schema.validate_artifact_args(args)
    if not schema_ok then return nil, schema_err end

    local blob_id = args.blob_id
    local blob
    if args.content ~= nil then
        local blob_err
        blob, blob_err = artifact_content_repo.create_blob(args.mime_type or "application/octet-stream", args.content, args.blob_metadata, {
            storage_id = args.storage_id,
            storage_path = args.storage_path,
        })
        if blob_err then return nil, blob_err end
        if not blob then return nil, "failed to create artifact blob" end
        blob_id = blob.blob_id
    end

    local db, err = resources.get_db()
    if err then return nil, err end

    if args.parent_artifact_id ~= nil and args.parent_artifact_id ~= "" then
        local parent, parent_err = load_artifact_by_id(db, args.parent_artifact_id)
        if parent_err then
            db:release()
            return nil, parent_err
        end
        if parent.upload_id ~= args.upload_id then
            db:release()
            return nil, "parent_artifact_id belongs to a different upload"
        end
    end

    if blob_id ~= nil and blob_id ~= "" and not blob then
        local blob_err
        blob, blob_err = load_blob_by_id(db, blob_id)
        if blob_err then
            db:release()
            return nil, blob_err
        end
    end

    local metadata_json, metadata_err = encode_json(args.metadata or {})
    if metadata_err then
        db:release()
        return nil, metadata_err
    end
    local locator_json, locator_err = encode_json(args.locator or {})
    if locator_err then
        db:release()
        return nil, locator_err
    end

    local artifact_id = args.artifact_id or uuid.v4()
    local timestamp = now()
    local mime_type = args.mime_type or (blob and blob.mime_type) or "application/octet-stream"
    local checksum = args.checksum or (blob and blob.checksum)
    local query = sql.builder.insert("kickside_upload_artifacts")
        :set_map({
            artifact_id = artifact_id,
            upload_id = args.upload_id,
            parent_artifact_id = nullable(args.parent_artifact_id),
            blob_id = nullable(blob_id),
            checksum = nullable(checksum),
            kind = args.kind,
            role = nullable(args.role),
            mime_type = mime_type,
            label = nullable(args.label),
            ordinal = sql.as.int(tonumber(args.ordinal) or 0),
            locator = locator_json,
            metadata = metadata_json,
            created_at = timestamp,
            updated_at = timestamp,
        })

    local _, insert_err = query:run_with(db):exec()
    db:release()
    if insert_err then return nil, "failed to create artifact: " .. insert_err end

    return {
        artifact_id = artifact_id,
        upload_id = args.upload_id,
        parent_artifact_id = args.parent_artifact_id,
        blob_id = blob_id,
        checksum = checksum,
        kind = args.kind,
        role = args.role,
        mime_type = mime_type,
        label = args.label,
        ordinal = tonumber(args.ordinal) or 0,
        locator = args.locator or {},
        metadata = args.metadata or {},
        created_at = timestamp,
        updated_at = timestamp,
    }
end

-- Replace an artifact's content: stores a new (dedup-aware) blob and repoints the
-- artifact row at it. Used when a later pipeline stage supersedes an earlier stage's
-- output -- e.g. OCR replacing an empty doc2md markdown primary with transcribed text.
function artifact_content_repo.update_content(upload_id, artifact_id, content, options)
    if type(content) ~= "string" then return nil, "content must be a string" end
    options = options or {}

    local artifact, get_err = artifact_content_repo.get_artifact(upload_id, artifact_id)
    if get_err then return nil, get_err end
    if not artifact then return nil, typed(errors.NOT_FOUND, "artifact not found") end

    local mime_type = options.mime_type or artifact.mime_type or "application/octet-stream"

    local storage_id = options.storage_id
    if (not storage_id or storage_id == "") and artifact.blob_id and artifact.blob_id ~= "" then
        local existing_blob = artifact_content_repo.get_blob(artifact.blob_id)
        if existing_blob then storage_id = existing_blob.storage_id end
    end

    local blob, blob_err = artifact_content_repo.create_blob(mime_type, content, options.blob_metadata, { storage_id = storage_id })
    if blob_err then return nil, blob_err end
    if not blob then return nil, "failed to create artifact blob" end

    local db, err = resources.get_db()
    if err then return nil, err end

    local timestamp = now()
    local _, update_err = sql.builder.update("kickside_upload_artifacts")
        :set_map({
            blob_id = blob.blob_id,
            checksum = blob.checksum,
            mime_type = mime_type,
            updated_at = timestamp,
        })
        :where("artifact_id = ?", artifact_id)
        :where("upload_id = ?", upload_id)
        :run_with(db)
        :exec()
    db:release()
    if update_err then return nil, "failed to update artifact content: " .. update_err end
    if type(artifact.blob_id) == "string" and artifact.blob_id ~= "" and artifact.blob_id ~= blob.blob_id then
        local cleanup_db, cleanup_db_err = resources.get_db()
        if cleanup_db_err then return nil, cleanup_db_err end
        local _, cleanup_err = artifact_cleanup_repo.collect_orphan_blobs(cleanup_db, { artifact.blob_id })
        cleanup_db:release()
        if cleanup_err then return nil, cleanup_err end
    end

    return {
        artifact_id = artifact_id,
        upload_id = upload_id,
        blob_id = blob.blob_id,
        checksum = blob.checksum,
        mime_type = mime_type,
        size = blob.size,
        updated_at = timestamp,
    }
end

function artifact_content_repo.get_blob(blob_id)
    if not blob_id or blob_id == "" then return nil, "blob_id is required" end
    local db, err = resources.get_db()
    if err then return nil, err end
    local blob, blob_err = load_blob_by_id(db, blob_id)
    db:release()
    if blob_err then return nil, blob_err end
    return blob
end

function artifact_content_repo.get_artifact(upload_id, artifact_id)
    if not upload_id or upload_id == "" then return nil, "upload_id is required" end
    if not artifact_id or artifact_id == "" then return nil, "artifact_id is required" end

    local db, err = resources.get_db()
    if err then return nil, err end
    local artifact, artifact_err = load_artifact_by_id(db, artifact_id)
    db:release()
    if artifact_err then return nil, artifact_err end
    if artifact.upload_id ~= upload_id then return nil, typed(errors.NOT_FOUND, "artifact not found for upload") end
    return artifact
end

function artifact_content_repo.read_blob(blob_id)
    local blob, blob_err = artifact_content_repo.get_blob(blob_id)
    if blob_err then return nil, blob_err end
    if not blob then return nil, typed(errors.NOT_FOUND, "artifact blob not found") end
    if type(blob.storage_id) ~= "string" or type(blob.storage_path) ~= "string" then
        return nil, typed(errors.INVALID, "artifact blob storage location is invalid")
    end

    local storage_id = blob.storage_id :: string
    local storage_path = blob.storage_path :: string

    local storage, storage_err = resources.get_storage(storage_id)
    if storage_err or not storage then
        return nil, storage_err or "failed to get artifact storage"
    end

    local content = storage:readfile(storage_path)
    if type(content) ~= "string" then
        return nil, typed(errors.INVALID, "failed to read artifact blob")
    end
    return content, nil, blob
end

function artifact_content_repo.read_artifact_content(upload_id, artifact_id)
    local artifact, artifact_err = artifact_content_repo.get_artifact(upload_id, artifact_id)
    if artifact_err then return nil, artifact_err end
    if not artifact then return nil, typed(errors.NOT_FOUND, "artifact not found") end

    if artifact.blob_id and artifact.blob_id ~= "" then
        local content, content_err, blob = artifact_content_repo.read_blob(artifact.blob_id)
        if content_err then return nil, content_err end
        return content, nil, blob, artifact
    end

    local storage_id, storage_path = locator_storage(artifact.locator)
    if not storage_id or not storage_path then
        return nil, typed(errors.INVALID, "artifact has no readable bytes")
    end

    local artifact_storage_id = storage_id :: string
    local artifact_storage_path = storage_path :: string

    local storage, storage_err = resources.get_storage(artifact_storage_id)
    if storage_err or not storage then
        return nil, storage_err or "failed to get artifact storage"
    end

    local content = storage:readfile(artifact_storage_path)
    if type(content) ~= "string" then
        return nil, typed(errors.INVALID, "failed to read artifact bytes")
    end

    return content, nil, {
        blob_id = nil,
        checksum = artifact.checksum,
        mime_type = artifact.mime_type,
        size = #content,
        storage_id = artifact_storage_id,
        storage_path = artifact_storage_path,
        metadata = artifact.metadata or {},
    }, artifact
end

return artifact_content_repo
