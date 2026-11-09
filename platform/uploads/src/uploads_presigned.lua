-- Direct-object upload lifecycle, attached to the public uploads library.
local function failure(message, kind, error_kind, retryable)
    return errors.new({ message = message, kind = kind, retryable = retryable == true,
        details = { error_kind = error_kind } })
end

local function typed(err, kind, error_kind, prefix)
    if type(err) == "userdata" then return err end
    return failure(prefix .. tostring(err), kind, error_kind,
        kind == errors.UNAVAILABLE or kind == errors.INTERNAL)
end

local function attach(upload_lib, deps)
    local uuid = deps.uuid
    local time = deps.time
    local resources = deps.resources
    local upload_types = deps.upload_types
    local token_flow = deps.token_flow
    local IDENTITY_META_KEY = deps.identity_meta_key
    local execution_identity = deps.execution_identity
    local determine_upload_type = deps.determine_upload_type
    local freeze_current_identity = deps.freeze_current_identity
    local process_worker = deps.process_worker

    function upload_lib.generate_presigned_url(actor_id, filename, size, mime_type, expires_in, metadata)
        if not actor_id or actor_id == "" then
            return nil, failure("Invalid actor ID", errors.INVALID, "declaration")
        end

        if not filename or filename == "" then
            return nil, failure("Invalid filename", errors.INVALID, "declaration")
        end

        if not size or type(size) ~= "number" or size <= 0 then
            return nil, failure("Invalid file size", errors.INVALID, "declaration")
        end

        mime_type = mime_type or "application/octet-stream"
        expires_in = expires_in or upload_types.DEFAULT_PRESIGN_EXPIRES_SECONDS
        if metadata ~= nil and type(metadata) ~= "table" then
            return nil, failure("metadata must be an object", errors.INVALID, "declaration")
        end
        metadata = metadata or {}

        local bound_id, bound_err = token_flow.bound_token_upload_id(metadata)
        if bound_err then return nil, bound_err end
        local id = bound_id or uuid.v4()
        if not id then
            return nil, failure("Failed to generate upload ID", errors.INTERNAL, "infrastructure", true)
        end

        metadata.filename = filename
        metadata.upload_method = "direct_s3"
        local trace_context, trace_err = token_flow.take_trace_context(metadata)
        if trace_err then return nil, typed(trace_err, errors.INVALID, "declaration", "") end
        local identity_err = freeze_current_identity(metadata, nil, actor_id)
        if identity_err then
            return nil, identity_err
        end

        local type_id, type_err = determine_upload_type(mime_type, filename)
        if not type_id then
            return nil, typed(type_err, errors.INVALID, "declaration", "")
        end

        local sanitized_filename = filename:gsub("[^%w%.%-_]", "_")
        local object_key = actor_id .. "/" .. id .. "/" .. sanitized_filename

        local s3, err = resources.get_s3()
        if err then
            return nil, typed(err, errors.UNAVAILABLE, "infrastructure", "")
        end

        local presigned_url
        presigned_url, err = s3:presigned_put_url(object_key, {
            expires_in = expires_in,
            content_type = mime_type,
            metadata = {
                actor_id = actor_id,
                original_name = filename,
                upload_id = id,
            },
        })
        s3:release()

        if err then
            return nil, typed(err, errors.UNAVAILABLE, "infrastructure", "Failed to generate presigned URL: ")
        end

        local _, create_err = deps.upload_record_repo.create(
            id,
            actor_id,
            size,
            mime_type,
            resources.get_storage_id(),
            "s3://" .. resources.get_s3_id() .. "/" .. object_key,
            type_id,
            metadata,
            "pending",
            nil,
            trace_context
        )

        if create_err then
            return nil, typed(create_err, errors.INTERNAL, "infrastructure", "Failed to create upload record: ")
        end

        local now = time.now()
        local duration = time.parse_duration(expires_in .. "s")
        local expires_at = now:add(duration)

        return {
            url = presigned_url,
            upload_id = id,
            object_key = object_key,
            expires_at = expires_at:unix(),
        }
    end

    -- Complete an S3 direct upload
    -- Parameters:
    --   actor_id: ID of the actor who initiated the upload
    --   upload_id: The UUID of the pending upload
    --   etag: Optional ETag from S3 response
    --   key: Optional S3 object key if different from expected
    --   metadata_updates: Optional metadata updates
    --   trace_context: Optional workflow trace context to persist on the upload row
    -- Returns:
    --   The completed upload record
    function upload_lib.complete_s3_upload(actor_id, upload_id, etag, key, metadata_updates, trace_context)
        -- Validate parameters
        if not actor_id or actor_id == "" then
            return nil, failure("Invalid actor ID", errors.INVALID, "declaration")
        end
        if not upload_id or upload_id == "" then
            return nil, failure("Invalid upload ID", errors.INVALID, "declaration")
        end

        if metadata_updates ~= nil and type(metadata_updates) ~= "table" then
            return nil, failure("metadata updates must be an object", errors.INVALID, "declaration")
        end
        metadata_updates = metadata_updates or {}
        if metadata_updates[IDENTITY_META_KEY] ~= nil then
            return nil, errors.new({ message = "caller cannot replace upload execution identity", kind = errors.INVALID,
                retryable = false, details = { error_kind = "declaration" } })
        end
        local bound_id, bound_err = token_flow.bound_token_upload_id(metadata_updates)
        if bound_err then return nil, bound_err end
        if bound_id and bound_id ~= upload_id then
            return nil, errors.new({ message = "callback token does not match upload", kind = errors.INVALID,
                retryable = false, details = { error_kind = "declaration" } })
        end
        if trace_context ~= nil and type(trace_context) ~= "table" then
            return nil, failure("trace_context must be an object", errors.INVALID, "declaration")
        end
        metadata_updates.trace_context = nil

        -- Get the pending upload record
        local upload, err = deps.upload_query_repo.get(upload_id)
        if err then
            if errors.is(err, errors.NOT_FOUND) then
                return nil, failure("upload not found", errors.NOT_FOUND, "subject")
            end
            return nil, typed(err, errors.UNAVAILABLE, "infrastructure", "Failed to retrieve upload record: ")
        end

        if not upload then
            return nil, failure("Upload record not found for ID: " .. upload_id, errors.NOT_FOUND, "subject")
        end

        -- Verify the upload belongs to the actor
        if upload.actor_id ~= actor_id then
            return nil, failure("Access denied: upload belongs to another actor", errors.PERMISSION_DENIED, "access")
        end

        -- Verify upload is in pending or already-uploaded state. A retried completion
        -- may add callback metadata; apply it idempotently and return the full record.
        if upload.storage_state ~= "pending" and upload.storage_state ~= "uploaded" then
            return nil, failure("Upload is in invalid storage state: " .. tostring(upload.storage_state), errors.CONFLICT, "declaration")
        end

        local submitted, submit_err = process_worker.enqueue_upload_job(upload, true, function(tx, dbtype)
            return deps.upload_record_repo.finalize_tx(tx, dbtype, upload_id, metadata_updates,
                etag, key, trace_context, deps.processing_max_execution_ms())
        end)
        if submit_err then return nil, submit_err end
        return submitted.upload
    end

    function upload_lib.complete_presigned_url(actor_id, upload_id, etag, metadata_updates)
        if metadata_updates ~= nil and type(metadata_updates) ~= "table" then
            return nil, failure("metadata updates must be an object", errors.INVALID, "declaration")
        end
        metadata_updates = metadata_updates or {}
        local caller_identity, caller_err = execution_identity.capture()
        if caller_err or not caller_identity then return nil, caller_err end
        local caller_row, row_err = execution_identity.to_row(caller_identity)
        if row_err or not caller_row then return nil, row_err end
        if caller_row.actor_id ~= actor_id then
            return nil, failure("upload actor does not match authenticated caller", errors.PERMISSION_DENIED, "access")
        end
        local trace_context, trace_err = token_flow.take_trace_context(metadata_updates)
        if trace_err then return nil, typed(trace_err, errors.INVALID, "declaration", "") end
        if metadata_updates[IDENTITY_META_KEY] ~= nil then
            return nil, errors.new({ message = "caller cannot replace upload execution identity", kind = errors.INVALID,
                retryable = false, details = { error_kind = "declaration" } })
        end

        local upload, err = upload_lib.complete_s3_upload(
            actor_id,
            upload_id,
            etag,
            nil,
            metadata_updates,
            trace_context
        )

        if err then
            return nil, err
        end

        return upload
    end

    return upload_lib
end

return { attach = attach }
