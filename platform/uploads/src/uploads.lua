local uuid = require("uuid")
local time = require("time")
local hash = require("hash")
local logger = require("logger")
local execution_identity = require("execution_identity")

local upload_record_repo = require("upload_record_repo")
local upload_query_repo = require("upload_query_repo")
local upload_response = require("upload_response")
local upload_tokens = require("upload_tokens")
local upload_read_model = require("upload_read_model")
local upload_type = require("upload_type")
local artifact_cleanup_repo = require("artifact_cleanup_repo")
local relocation_cleanup = require("relocation_cleanup_repo")
local resources = require("uploads_resources")
local uploads_events = require("uploads_events")
local upload_types = require("types")
local pipeline_lib = require("pipeline_lib")
local jobs = require("jobs")
local process_worker = require("process_worker")

local log = logger:named("upload_lib")

local IDENTITY_META_KEY = assert(execution_identity.CONTEXT_KEY, "execution_identity.CONTEXT_KEY is required")

local upload_lib = {}

-- The caller authorizes read access before issuing this bearer URL.
function upload_lib.delivery_url(upload_id: string, options: any?): (string?, any?)
    local upload, read_err = upload_query_repo.get(upload_id)
    if read_err then return nil, read_err end
    if not upload then
        return nil, errors.new({message = "Upload not found", kind = errors.NOT_FOUND, retryable = false})
    end
    local url, delivery_err = upload_response.delivery_url(upload.storage_id, upload.storage_path, nil,
        options and {expiration = options.expires_in} or nil)
    if delivery_err then return nil, delivery_err end
    if url then return url, nil end
    local token, token_err = upload_tokens.pack_read({upload_id = upload_id,
        audience = options and options.audience, expires_in = options and options.expires_in})
    if not token then return nil, token_err end
    return upload_response.raw_path(upload_id) .. "?token=" .. token, nil
end

local function failure(message: string, kind: string, error_kind: string, retryable: boolean?): error
    return errors.new({ message = message, kind = kind, retryable = retryable == true,
        details = { error_kind = error_kind } })
end

local function typed(err: any, kind: string, error_kind: string, prefix: string): error
    if type(err) == "userdata" then return err :: error end
    return failure(prefix .. tostring(err), kind, error_kind, kind == errors.UNAVAILABLE or kind == errors.INTERNAL)
end

local function cancel_processing_job(upload)
    if type(upload.processing_job_id) ~= "string" or upload.processing_job_id == "" then return end
    local _, cancel_err = jobs.cancel(upload.processing_job_id)
    if cancel_err then
        log:warn("failed to cancel upload job", { upload_id = upload.uuid, error = tostring(cancel_err) })
    end
end

local upload_mime = require("upload_mime")
local get_file_extension = upload_mime.get_file_extension
local get_mime_type_from_extension = upload_mime.get_mime_type_from_extension
local determine_upload_type = upload_mime.determine_upload_type

local function freeze_current_identity(metadata: any, parent_upload_id: string?, actor_id: string?): any?
    if type(metadata) ~= "table" then
        return errors.new({ message = "upload metadata table is required", kind = errors.INVALID,
            retryable = false, details = { error_kind = "declaration" } })
    end
    if metadata[IDENTITY_META_KEY] ~= nil then
        return errors.new({ message = "caller cannot supply upload execution identity", kind = errors.INVALID,
            retryable = false, details = { error_kind = "declaration" } })
    end
    if parent_upload_id then
        local parent, parent_err = upload_query_repo.get(parent_upload_id)
        if parent_err or not parent or parent.actor_id ~= actor_id then
            return errors.new({ message = "trusted parent upload is unavailable", kind = errors.PERMISSION_DENIED,
                retryable = false, details = { error_kind = "subject" } })
        end
        local row = type(parent.metadata) == "table" and parent.metadata[IDENTITY_META_KEY] or nil
        if type(row) ~= "table" then
            return errors.new({ message = "parent upload execution identity is required", kind = errors.PERMISSION_DENIED,
                retryable = false, details = { error_kind = "subject" } })
        end
        local _, row_err = execution_identity.from_row(row.actor_id, row.actor_context)
        if row_err then return row_err end
        if row.actor_id ~= actor_id then
            return failure("parent upload identity does not match its owner", errors.PERMISSION_DENIED, "subject")
        end
        metadata[IDENTITY_META_KEY] = { actor_id = row.actor_id, actor_context = row.actor_context }
        return nil
    end
    local identity, capture_err = execution_identity.capture()
    if not identity then
        return capture_err
    end
    local row, row_err = execution_identity.to_row(identity)
    if not row then
        return row_err
    end
    if actor_id and row.actor_id ~= actor_id then
        return failure("upload actor does not match authenticated caller", errors.PERMISSION_DENIED, "access")
    end
    metadata[IDENTITY_META_KEY] = { actor_id = row.actor_id, actor_context = row.actor_context }
    return nil
end

local function remove_storage_path(storage: any, storage_path: any, upload_id: any): error?
    local path = type(storage_path) == "string" and storage_path or ""
    if path == "" then return nil end
    if not storage then return failure("storage unavailable", errors.UNAVAILABLE, "infrastructure", true) end
    local _, remove_err = storage:remove(path)
    if remove_err ~= nil then
        if tostring(remove_err):find("no such file or directory", 1, true) then
            return nil
        end
        return typed(remove_err, errors.UNAVAILABLE, "infrastructure", "upload storage cleanup failed: ")
    end
    return nil
end

-- Release an upload's heavy storage: the original stored bytes plus every artifact
-- it owns. Artifact blobs are content-addressed and refcounted, so delete_for_upload
-- keeps any blob still referenced by a surviving upload's artifact. The original
-- bytes are per-upload (content dedup resolves before a second row is ever stored),
-- so removing them is unconditional. A byte-delete failure aborts the row delete so
-- the storage path remains durably discoverable for retry.
-- This is the single storage-teardown primitive shared by the rejected-upload,
-- failed-upload, and delete paths.
local function release_storage(upload: any, storage_override: any?): error?
    if type(upload) ~= "table" or type(upload.uuid) ~= "string" or upload.uuid == "" then return nil end

    local _, cleanup_err = relocation_cleanup.flush(upload)
    if cleanup_err then return cleanup_err end

    local storage = storage_override
    if not storage then
        local resolved, storage_err = resources.get_storage(tostring(upload.storage_id or ""))
        if storage_err then
            return typed(storage_err, errors.UNAVAILABLE, "infrastructure", "failed to get storage for upload cleanup: ")
        else
            storage = resolved
        end
    end
    local storage_err = remove_storage_path(storage, upload.storage_path, upload.uuid)
    if storage_err then return storage_err end

    local _, artifacts_err = artifact_cleanup_repo.delete_for_upload(upload.uuid)
    if artifacts_err then
        return typed(artifacts_err, errors.UNAVAILABLE, "infrastructure", "artifact cleanup failed for upload: ")
    end
    return nil
end

local function invoke_on_delete(upload): error?
    if not upload.type_id or upload.type_id == "" then
        return nil
    end

    local on_delete, err = upload_type.get_on_delete(upload.type_id)
    if err then return typed(err, errors.UNAVAILABLE, "infrastructure", "upload delete stages unavailable: ") end
    if type(on_delete) ~= "table" then
        return failure("upload delete stages returned no result", errors.INTERNAL, "infrastructure", true)
    end
    if #on_delete == 0 then return nil end

    -- Run delete stages as the uploading actor by reconstructing the execution identity
    -- frozen at upload time, so a stage can do scoped work like deleting the workspace
    -- component it created. Failed reconstruction leaves the upload as a retry target.
    local executor, recon_err = pipeline_lib.upload_stage_executor(upload, "delete:" .. tostring(upload.uuid), {
        upload_id = upload.uuid,
        actor_id = upload.actor_id,
        mime_type = upload.mime_type,
        type_id = upload.type_id,
    })
    if recon_err or not executor then
        return typed(recon_err or "no executor", errors.UNAVAILABLE, "infrastructure",
            "upload delete execution identity unavailable: ")
    end

    for i, stage in ipairs(on_delete) do
        local func_id = stage.func
        if func_id then
            local result, call_err = executor:call(tostring(func_id), {
                upload_id = upload.uuid,
                mime_type = upload.mime_type,
                storage_id = upload.storage_id,
                storage_path = upload.storage_path,
                size = upload.size,
                metadata = upload.metadata,
                processor_id = func_id,
            })

            if call_err then
                return typed(call_err, errors.UNAVAILABLE, "infrastructure",
                    "upload delete stage " .. tostring(i) .. " failed: ")
            end
            if type(result) ~= "table" or result.success ~= true then
                return failure("upload delete stage " .. tostring(i) .. " reported no success",
                    errors.UNAVAILABLE, "infrastructure", true)
            end
        end
    end
    return nil
end

local token_flow = require("uploads_tokens")

local function persist_file(actor_id: string, file_data: string | stream.Stream, filename: string, size: number, mime_type: string?, storage_id: string?, metadata: any, parent_upload_id: string?, processing: boolean)
    metadata = type(metadata) == "table" and metadata or {}
    local bound_id, bound_err = token_flow.bound_token_upload_id(metadata)
    if bound_err then return nil, bound_err end
    local upload_uuid = parent_upload_id and uuid.v4() or (bound_id or uuid.v4())
    if parent_upload_id then
        local rebind_err = token_flow.rebind_child_tokens(metadata, upload_uuid)
        if rebind_err then return nil, rebind_err end
    end

    local storage, err = resources.get_storage(storage_id)
    if err then
        return nil, typed(err, errors.UNAVAILABLE, "infrastructure", "")
    end

    local ext = get_file_extension(filename)
    local storage_path = upload_uuid
    if ext and ext ~= "" then
        storage_path = storage_path .. "." .. ext
    end

    metadata.filename = filename
    local trace_context, trace_err = token_flow.take_trace_context(metadata)
    if trace_err then return nil, typed(trace_err, errors.INVALID, "declaration", "") end

    -- Freeze the uploader's execution identity so the durable job can run pipeline
    -- stages as the authorizing user. Scoped work reconstructs from this.
    -- The managed key is stripped from callbacks/API views, so it never leaves the server.
    local identity_err = freeze_current_identity(metadata, parent_upload_id, actor_id)
    if identity_err then
        return nil, identity_err
    end

    if not mime_type or mime_type == "" or mime_type == "application/octet-stream" then
        mime_type = get_mime_type_from_extension(filename)
    end

    local success
    success, err = storage:writefile(storage_path, file_data)
    if not success then
        return nil, typed(err, errors.UNAVAILABLE, "infrastructure", "Failed to write file: ")
    end

    if ext:lower() == "dot" and mime_type == "text/vnd.graphviz" then
        local file, open_err = storage:open(storage_path, "r")
        local signature, inspect_err
        if file then
            local read_err
            signature, read_err = file:read(8)
            local _, close_err = file:close()
            if read_err then inspect_err = tostring(read_err) end
            if close_err then inspect_err = (inspect_err and inspect_err .. "; " or "") .. tostring(close_err) end
        else
            inspect_err = tostring(open_err)
        end
        if inspect_err then
            local remove_err = remove_storage_path(storage, storage_path, upload_uuid)
            if remove_err then inspect_err = inspect_err .. "; " .. tostring(remove_err) end
            return nil, typed(inspect_err, errors.UNAVAILABLE, "infrastructure", "Failed to inspect template: ")
        end
        if signature == string.char(0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1) then
            mime_type = "application/msword"
        end
    end

    local type_id, type_err = determine_upload_type(mime_type, filename)
    if not type_id then
        local remove_err = remove_storage_path(storage, storage_path, upload_uuid)
        if remove_err then return nil, remove_err end
        return nil, typed(type_err, errors.INVALID, "declaration", "")
    end

    -- Per-account content-hash deduplication. The bytes are now persisted, so hash them:
    -- a string input is hashed directly; a stream input (already consumed by writefile)
    -- is hashed from the stored copy. A hashing failure degrades to a non-deduplicated
    -- upload rather than blocking it.
    local content_sha256: string? = nil
    if processing and type(file_data) == "string" then
        content_sha256 = hash.sha256(file_data :: string)
    elseif processing then
        local stored = storage:readfile(storage_path)
        if type(stored) == "string" then
            content_sha256 = hash.sha256(stored)
        end
    end
    -- A callback token names this upload exactly; content dedup cannot redirect it
    -- to a prior upload with a different UUID.
    if bound_id then content_sha256 = nil end

    -- If this account already holds these exact bytes, drop the just-written copy and
    -- resolve to the existing upload: no second blob, no re-processing. The same file may
    -- still be attached to multiple KBs -- dedup is at the file/blob level only.
    if content_sha256 and content_sha256 ~= "" and not bound_id then
        local existing, lookup_err = upload_query_repo.find_by_content_hash(actor_id, content_sha256, parent_upload_id or "")
        if lookup_err then
            local remove_err = remove_storage_path(storage, storage_path, upload_uuid)
            if remove_err then lookup_err = tostring(lookup_err) .. "; " .. tostring(remove_err) end
            return nil, typed(lookup_err, errors.UNAVAILABLE, "infrastructure", "Failed to find existing upload: ")
        end
        if existing and existing.storage_state == "failed" then
            local _, release_err = upload_record_repo.release_content_hash(existing.uuid)
            if release_err then
                local remove_err = remove_storage_path(storage, storage_path, upload_uuid)
                if remove_err then release_err = tostring(release_err) .. "; " .. tostring(remove_err) end
                return nil, typed(release_err, errors.UNAVAILABLE, "infrastructure", "Failed to release failed upload: ")
            end
            existing = nil
        end
        if existing then
            local remove_err = remove_storage_path(storage, storage_path, existing.uuid)
            if remove_err then return nil, remove_err end
            token_flow.fill_missing_trace_context(existing, trace_context)
            token_flow.handle_dedup_upload_token(existing, metadata)
            existing.deduped = true
            return existing
        end
    end

    local create_args = { n = 13,
        upload_uuid,
        actor_id,
        size,
        mime_type,
        resources.get_storage_id(storage_id),
        storage_path,
        type_id,
        metadata,
        processing and "uploaded" or "completed",
        content_sha256,
        trace_context,
        processing,
        processing and process_worker.max_execution_ms() or nil
    }
    local function create_record(tx)
        if tx then return upload_record_repo.create_tx(tx, table.unpack(create_args, 1, create_args.n)) end
        return upload_record_repo.create(table.unpack(create_args, 1, create_args.n))
    end
    local upload
    if processing then
        local submitted
        submitted, err = process_worker.enqueue_upload_job({ uuid = upload_uuid, actor_id = actor_id,
            mime_type = mime_type, size = size, type_id = type_id, metadata = metadata,
            trace_context = trace_context, processing_max_execution_ms = process_worker.max_execution_ms() },
            false, create_record)
        upload = submitted and submitted.upload
    else
        upload, err = create_record(nil)
    end

    if err then
        if not upload then
            local remove_err = remove_storage_path(storage, storage_path, upload_uuid)
            if remove_err then return nil, typed(remove_err, errors.INTERNAL, "infrastructure", tostring(err) .. "; ") end
        end
        return nil, typed(err, errors.INTERNAL, "infrastructure", "Failed to create upload record: ")
    end

    -- A concurrent identical upload won the unique index: create resolved to that record
    -- instead of inserting ours. Drop our orphan blob and reference the winner; the
    -- winner already drives processing.
    if upload.deduped and upload.uuid ~= upload_uuid then
        local remove_err = remove_storage_path(storage, storage_path, upload.uuid)
        if remove_err then return nil, remove_err end
        token_flow.fill_missing_trace_context(upload, trace_context)
        token_flow.handle_dedup_upload_token(upload, metadata)
        return upload
    end

    return upload
end

function upload_lib.store_file(actor_id: string, file_data: string | stream.Stream, filename: string, size: number, mime_type: string?, storage_id: string?, metadata: any, parent_upload_id: string?)
    return persist_file(actor_id, file_data, filename, size, mime_type, storage_id, metadata, parent_upload_id, false)
end

function upload_lib.upload_file(actor_id: string, file_data: string | stream.Stream, filename: string, size: number, mime_type: string?, storage_id: string?, metadata: any, parent_upload_id: string?)
    return persist_file(actor_id, file_data, filename, size, mime_type, storage_id, metadata, parent_upload_id, true)
end

-- Run the processing of a failed upload again on its stored bytes.
function upload_lib.retry_upload(uuid)
    local upload, err = upload_query_repo.get(uuid)
    if err then
        if errors.is(err, errors.NOT_FOUND) then
            return nil, failure("upload not found", errors.NOT_FOUND, "subject")
        end
        return nil, typed(err, errors.UNAVAILABLE, "infrastructure", "")
    end

    local max_ms = math.floor(tonumber(upload.processing_max_execution_ms) or process_worker.max_execution_ms())
    local marked, mark_err = upload_record_repo.mark_failed_for_retry(upload.uuid, max_ms)
    if mark_err then return nil, typed(mark_err, errors.UNAVAILABLE, "infrastructure", "") end
    if not marked then
        return nil, failure("only a failed upload can be retried", errors.CONFLICT, "subject")
    end
    upload.storage_state = "uploaded"
    upload.processing_intent_state = "pending"
    upload.processing_max_execution_ms = max_ms

    local _, submit_err = process_worker.enqueue_upload_job(upload, true)
    if submit_err then
        return nil, typed(submit_err, errors.UNAVAILABLE, "infrastructure", "Failed to submit upload processing job: ")
    end

    return upload
end

function upload_lib.delete_upload(uuid)
    local upload, err = upload_query_repo.get(uuid)
    if err then
        if errors.is(err, errors.NOT_FOUND) then
            return nil, failure("upload not found", errors.NOT_FOUND, "subject")
        end
        return nil, typed(err, errors.UNAVAILABLE, "infrastructure", "")
    end
    if not upload then return nil, failure("upload lookup returned no result", errors.INTERNAL, "infrastructure", true) end

    cancel_processing_job(upload)
    local stage_err = invoke_on_delete(upload)
    if stage_err then return nil, stage_err end

    -- Release the original bytes plus this upload's artifacts/chunks first. A cleanup
    -- failure keeps the row as the durable retry target.
    local release_err = release_storage(upload)
    if release_err then
        return nil, release_err
    end

    -- Project the deletion onto the actor's uploads thread (automation source).
    local emitted, emit_err = uploads_events.emit(tostring(upload.actor_id), upload_types.EVENT.DELETED,
        { upload_id = uuid }, uuid, upload.trace_context)
    if emit_err then return nil, typed(emit_err, errors.UNAVAILABLE, "infrastructure", "upload deletion event failed: ") end
    if emitted ~= true then
        return nil, failure("upload deletion event reported no result", errors.UNAVAILABLE, "infrastructure", true)
    end

    return upload_record_repo.delete(uuid)
end

return require("uploads_presigned").attach(upload_lib, {
    uuid = uuid, time = time, resources = resources,
    upload_record_repo = upload_record_repo,
    upload_query_repo = upload_query_repo,
    upload_types = upload_types, token_flow = token_flow, identity_meta_key = IDENTITY_META_KEY,
    execution_identity = execution_identity,
    determine_upload_type = determine_upload_type, freeze_current_identity = freeze_current_identity,
    process_worker = process_worker,
    processing_max_execution_ms = process_worker.max_execution_ms,
})
