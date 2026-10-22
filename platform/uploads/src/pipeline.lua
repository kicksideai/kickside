local upload_record_repo = require("upload_record_repo")
local upload_type = require("upload_type")
local upload_tokens = require("upload_tokens")
local upload_types = require("types")
local logger = require("logger")
local execution_identity = require("execution_identity")
local jobs = require("jobs")
local hash = require("hash")
local security = require("security")
local funcs = require("funcs")
local artifact_parts_repo = require("artifact_parts_repo")
local metadata_sanitizer = require("metadata_sanitizer")

-- Private upload-metadata key carrying the uploader's stored execution identity
-- ({ actor_id, actor_context }). It uses the canonical managed-context spelling
-- and is stripped from callback/API metadata before leaving the server.
local IDENTITY_META_KEY = assert(execution_identity.CONTEXT_KEY, "execution_identity.CONTEXT_KEY is required")
local CALLBACK_JOB_TYPE = "kickside.uploads.service:callback_job"

local log = logger:named("uploads.processing")

local pipeline_lib = {}
type CallbackError = string | error

-- Merge metadata instead of overwriting
function pipeline_lib.merge_metadata(existing_metadata, new_metadata)
    if not existing_metadata then
        return new_metadata
    end

    if not new_metadata then
        return existing_metadata
    end

    local merged = {}

    -- Copy existing metadata
    for k, v in pairs(existing_metadata) do
        merged[k] = v
    end

    -- Merge in new metadata (overwriting existing keys)
    for k, v in pairs(new_metadata) do
        merged[k] = v
    end

    return merged
end

-- Build the funcs executor a deferred upload stage (processing or teardown) runs as.
-- Uploads carry the uploader's frozen execution identity in private metadata;
-- reconstruct it fail-closed (a revoked scope or non-active actor returns an error
-- and does not run). There is no actor_id-only fallback: upload.actor_id is the
-- owner column, not an execution frame.
function pipeline_lib.upload_stage_executor(upload, context_id: string, base_context: any): (any?, error?)
    local identity = type(upload.metadata) == "table" and upload.metadata[IDENTITY_META_KEY] or nil
    if type(identity) == "table" and type(identity.actor_id) == "string" and identity.actor_id ~= "" then
        local stored, row_err = execution_identity.from_row(identity.actor_id, identity.actor_context)
        if row_err or not stored then return nil, row_err end
        if identity.actor_id ~= upload.actor_id then
            return nil, errors.new({ message = "upload identity does not match its owner",
                kind = errors.PERMISSION_DENIED })
        end
        local actor, actor_err = security.actor()
        if actor_err then return nil, actor_err end
        local executor, bind_err
        if actor and actor:id() == upload.actor_id then
            local scope, scope_err = security.scope()
            if scope_err then return nil, scope_err end
            if not scope then
                return nil, errors.new({ message = "authenticated upload scope is unavailable",
                    kind = errors.UNAVAILABLE })
            end
            local actor_bound, actor_bind_err = funcs.new():with_actor(actor)
            if actor_bind_err or not actor_bound then return nil, actor_bind_err end
            executor, bind_err = actor_bound:with_scope(scope)
        else
            executor, bind_err = execution_identity.bind(stored, {
                deferred_owner = "kickside.uploads:uploads",
            })
        end
        if bind_err or not executor then return nil, bind_err end
        local contextual, context_err = executor:with_context(base_context)
        if context_err or not contextual then return nil, context_err end
        return contextual, nil
    end

    return nil, errors.new({ message = "upload execution identity is required", kind = errors.PERMISSION_DENIED, retryable = false, details = { error_kind = "subject" } })
end

local function add_token(tokens: { string }, seen: { [string]: boolean }, token: any): ()
    if type(token) ~= "string" or token == "" or seen[token] then return end
    seen[token] = true
    tokens[#tokens + 1] = token
end

local function callback_tokens(metadata: any): { string }
    local tokens: { string } = {}
    local seen: { [string]: boolean } = {}
    if type(metadata) ~= "table" then return tokens end

    add_token(tokens, seen, metadata.__upload_token)
    if type(metadata.__upload_tokens) == "table" then
        for _, token in ipairs(metadata.__upload_tokens) do
            add_token(tokens, seen, token)
        end
    end
    return tokens
end

local function upload_trace_context(upload: any): any
    return type(upload) == "table" and upload.trace_context or nil
end

local function callback_status(success: any): string
    return success and "completed" or "error"
end

local function stage_error(stage_title: any, processor_id: any, message: any): string
    return "upload stage \"" .. tostring(stage_title) .. "\" (" .. tostring(processor_id) .. ") failed: " .. tostring(message)
end

-- Transcription stages report a soft failure as success = true plus a code under
-- <kind>_error, so the upload must read that code or it settles as completed with
-- no text. Content outcomes describe the file, not a failure; permanent codes fail
-- at once; any other code retries. Provider text is stored as transcription_failed.
local TRANSCRIPTION_CONTENT_OUTCOMES = { no_text_detected = true, too_large = true, transcript_too_large = true }
local TRANSCRIPTION_PERMANENT_ERRORS = { storage_pointer_missing = true }

local TRANSCRIPTION_KEYS = { ocr_error = true, asr_error = true, conversion_error = true }

-- Returns the failing key, its stable code and the reported text. A known
-- transcription key is rewritten to its stable code before it is stored.
local function transcription_error(metadata: any): (string?, string?, string?)
    if type(metadata) ~= "table" then return nil, nil, nil end
    for key, value in pairs(metadata) do
        if type(key) == "string" and key:match("_error$") and type(value) == "string" and value ~= ""
            and not TRANSCRIPTION_CONTENT_OUTCOMES[value] then
            local code = metadata_sanitizer.transcription_code(value) :: string
            if TRANSCRIPTION_KEYS[key] then metadata[key] = code end
            return key, code, value
        end
    end
    return nil, nil, nil
end

-- Transcription only enriches an upload that already has primary text, so its
-- failure must not discard that text.
local function has_primary_text(upload_id: any): boolean
    local primary, err = artifact_parts_repo.read_primary_content(upload_id)
    if err or type(primary) ~= "table" or type(primary.content) ~= "string" then return false end
    return (primary.content :: string):match("%S") ~= nil
end

local function callback_idempotency_key(upload: any, token: string, success: any): string
    local digest = hash.sha256(token .. ":" .. callback_status(success))
    return CALLBACK_JOB_TYPE .. ":" .. tostring(upload.uuid or "") .. ":" .. tostring(digest or "")
end

local function enqueue_upload_token_once(upload, token: string, success, error_msg): (boolean, CallbackError?)
    local payload, err = upload_tokens.unpack(token)
    if err then
        log:warn("upload token unpack failed", { upload_id = upload.uuid, error = err })
        if type(err) == "userdata" then return false, err end
        return false, errors.new({ message = "upload token unpack failed: " .. tostring(err),
            kind = errors.INVALID, retryable = false, details = { error_kind = "declaration" } })
    end

    if payload.upload_id ~= upload.uuid then
        return false, errors.new({ message = "upload callback token does not match upload", kind = errors.INVALID,
            retryable = false, details = { error_kind = "declaration" } })
    end

    local func_id = tostring(success and payload.function_id or payload.on_error_id)
    if not func_id or func_id == "nil" then
        return false, errors.new({ message = "upload callback function is required", kind = errors.INVALID,
            retryable = false, details = { error_kind = "declaration" } })
    end

    local owner_actor_id: string? = nil
    if type(upload.actor_id) == "string" then
        owner_actor_id = upload.actor_id
    end
    local component_id = upload_types.component_id_for_owner(owner_actor_id)
    if not component_id then
        return false, errors.new({ message = "upload actor has no uploads component id",
            kind = errors.INVALID, retryable = false, details = { error_kind = "declaration" } })
    end

    local actor_id = type(payload.actor_id) == "string" and payload.actor_id or nil
    if not actor_id or actor_id == "" then
        log:warn("upload token missing actor_id", { upload_id = upload.uuid, function_id = func_id })
        return false, errors.new({ message = "upload callback authorizer is required", kind = errors.INVALID,
            retryable = false, details = { error_kind = "declaration" } })
    end

    local job_payload = {
        upload_id = upload.uuid,
        token = token,
        success = success == true,
        error = error_msg,
    }
    local _, enqueue_err = jobs.enqueue({
        namespace = "thread", scope = component_id,
        owner_locator = { kind = "user", id = owner_actor_id :: string },
        key = callback_idempotency_key(upload, token, success),
        thread_id = component_id,
        job_type = CALLBACK_JOB_TYPE,
        queue_tier = "live",
        priority = 10,
        max_attempts = 8,
        concurrency_key = "uploads:callback:" .. component_id,
        immutable_payload = job_payload,
        trace_context = payload.trace_context,
    })
    if enqueue_err then
        if type(enqueue_err) == "userdata" then return false, enqueue_err end
        return false, errors.new({ message = "upload callback enqueue failed: " .. tostring(enqueue_err),
            kind = errors.UNAVAILABLE, retryable = true, details = { error_kind = "infrastructure" } })
    end
    return true, nil
end

-- Schedule upload completion token callback(s) as durable core jobs.
function pipeline_lib.invoke_upload_token(upload, success, error_msg)
    if not upload or not upload.metadata then return true, nil end

    local first_err = nil
    for _, token in ipairs(callback_tokens(upload.metadata)) do
        local ok, err = enqueue_upload_token_once(upload, token, success, error_msg)
        if not ok then
            first_err = first_err or err or errors.new({ message = "failed to enqueue upload callback",
                kind = errors.INTERNAL, retryable = true, details = { error_kind = "infrastructure" } })
            log:warn("upload token callback enqueue failed", {
                upload_id = upload.uuid,
                error = tostring(err),
            })
        end
    end
    if first_err then return false, first_err end
    return true, nil
end

-- Process a single upload using funcs library. Execution authority lives in
-- kickside_job; this function only runs stages and updates upload artifacts.
function pipeline_lib.process_upload(upload, opts)
    opts = type(opts) == "table" and opts or {}
    local should_continue = type(opts.should_continue) == "function" and opts.should_continue or nil
    local cancel_ref = type(opts.cancel_ref) == "table" and opts.cancel_ref or nil

    -- Check if upload has a type_id
    if not upload.type_id or upload.type_id == "" then
        local error_msg = "Upload has no type_id assigned"
        log:error("upload processing failed", { upload_id = upload.uuid, error = error_msg })
        return false, error_msg
    end

    -- Get pipeline stages for this upload type
    local pipeline, err = upload_type.get_pipeline(upload.type_id)
    if err then
        local error_msg = "Failed to get pipeline: " .. err
        log:error("upload processing failed", { upload_id = upload.uuid, type_id = upload.type_id, error = error_msg })
        return false, error_msg
    end

    -- Run stages as the uploading actor: reconstruct the frozen execution identity
    -- captured at upload time so scoped work (e.g. registering a workspace component)
    -- succeeds. A present-but-unreconstructable identity fails the upload closed.
    local executor, recon_err = pipeline_lib.upload_stage_executor(upload, "upload:" .. tostring(upload.uuid), {
        upload_id = upload.uuid,
        actor_id = upload.actor_id,
        mime_type = upload.mime_type,
        type_id = upload.type_id,
    })
    if recon_err or not executor then
        local error_msg = "Failed to reconstruct upload execution identity: " .. tostring(recon_err)
        log:error("upload processing failed", { upload_id = upload.uuid, error = error_msg })
        return false, error_msg
    end

    -- Execute each processor in sequence
    local trace_context = upload_trace_context(upload)
    for i, stage in ipairs(pipeline) do
        local processor_id = stage.func
        local stage_title = stage.title or tostring(processor_id or ("Stage " .. i))
        local continue = should_continue
        if continue then
            local continue_ok, continue_err = continue(stage_title)
            if not continue_ok then
                local error_msg = tostring(continue_err or "job cancelled")
                log:info("upload processing stopped", { upload_id = upload.uuid, stage = stage_title, error = error_msg })
                return false, error_msg
            end
        end

        log:info("running upload processor", {
            upload_id = upload.uuid,
            processor_id = processor_id,
            stage = stage_title,
            index = i,
        })

        -- Call the processor function
        local result, err = executor:call(tostring(processor_id), {
            upload_id = upload.uuid,
            mime_type = upload.mime_type,
            storage_id = upload.storage_id,
            storage_path = upload.storage_path,
            size = upload.size,
            metadata = upload.metadata,
            processor_id = processor_id,
            options = (stage :: any).options,
            trace_context = trace_context,
            cancel_ref = cancel_ref,
        })

        -- Check for errors. A thrown/absent result is a transient-shaped failure and
        -- retries through the job budget. A processor MAY instead return a classified
        -- failure { success = false, retriable = ... }: a permanent input failure
        -- (retriable = false) is surfaced with its flag so the job finalizes on the
        -- first attempt instead of looping.
        if err or not result then
            local raw_error = err and tostring(err) or ("Processing failed at step " .. i)
            local error_msg = stage_error(stage_title, processor_id, raw_error)
            log:error("upload processor failed", {
                upload_id = upload.uuid,
                processor_id = processor_id,
                stage = stage_title,
                error = raw_error,
            })
            return false, error_msg
        end

        continue = should_continue
        if continue then
            local continue_ok, continue_err = continue(stage_title)
            if not continue_ok then
                local error_msg = tostring(continue_err or "job cancelled")
                log:info("upload processing stopped after processor", { upload_id = upload.uuid, stage = stage_title, error = error_msg })
                return false, error_msg
            end
        end

        local reported_error: string? = nil
        local retriable = true
        if result.success == false then
            reported_error = tostring(result.error or ("Processing failed at step " .. i))
            retriable = (result :: any).retriable ~= false
        else
            local reported_key, reported_code, reported_text = transcription_error(result.metadata)
            if reported_key then
                reported_error = reported_key .. ": " .. tostring(reported_code)
                retriable = not TRANSCRIPTION_PERMANENT_ERRORS[reported_code]
                if reported_text ~= reported_code then
                    log:warn("upload processor reported provider text", {
                        upload_id = upload.uuid,
                        processor_id = processor_id,
                        stage = stage_title,
                        detail = reported_text,
                    })
                end
                if (not retriable or opts.final_attempt == true) and has_primary_text(upload.uuid) then
                    log:warn("upload keeps primary text after transcription failure", {
                        upload_id = upload.uuid,
                        stage = stage_title,
                        error = reported_error,
                    })
                    reported_error = nil
                end
            end
        end

        -- If the processor returned updated metadata, merge with existing metadata
        if result.metadata then
            -- Get existing metadata
            local existing_metadata = upload.metadata or {}

            -- Merge with new metadata
            local merged_metadata = pipeline_lib.merge_metadata(existing_metadata, result.metadata)

            -- Update the upload record with merged metadata
            local _, metadata_err = upload_record_repo.update_metadata(upload.uuid, merged_metadata)
            if metadata_err then
                return false, stage_error(stage_title, processor_id, "failed to persist document metadata: " .. tostring(metadata_err))
            else
                -- Update local copy of metadata
                upload.metadata = merged_metadata
            end
        end

        if reported_error then
            local error_msg = stage_error(stage_title, processor_id, reported_error)
            log:error("upload processor reported failure", {
                upload_id = upload.uuid,
                processor_id = processor_id,
                stage = stage_title,
                error = reported_error,
                retriable = retriable,
            })
            return false, error_msg, nil, retriable
        end
    end

    return true, nil, upload
end

return pipeline_lib
