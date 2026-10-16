local sql = require("sql")
local json = require("json")
local jobs_config = require("jobs_config")
local threads_writer = require("threads_writer")
local retention_notifier = require("retention_notifier")
local logger = require("logger")
local upload_record_repo = require("upload_record_repo")
local upload_query_repo = require("upload_query_repo")
local pipeline_lib = require("pipeline_lib")
local upload_types = require("types")
local jobs = require("jobs")
local job_types = require("job_types")

local log = logger:named("upload_job")

local function job_info(input: any): any
    return type(input) == "table" and type(input.job) == "table" and input.job or {}
end

local function is_final_attempt(job: any): boolean
    if type(job) ~= "table" or job.id == nil then return true end
    if job.is_final_attempt == true then return true end
    local attempt = tonumber(job.attempt_no) or 1
    local max_attempts = tonumber(job.max_attempts) or attempt
    return attempt >= max_attempts
end

-- A failure finalizes the upload (no retry) when it is explicitly non-retriable
-- (a permanent input failure such as "file too large") or when the retry budget is
-- exhausted. A retriable failure before the final attempt returns to the job for
-- backoff instead of terminating.
local function terminal_failure(job: any, retriable: any): boolean
    return retriable == false or is_final_attempt(job)
end

local function ensure_running(job: any): (boolean, string?)
    if type(job) ~= "table" or tostring(job.id or "") == "" or tostring(job.lease_token or "") == "" then
        return true, nil
    end
    local active, active_err = jobs.lease_valid(tostring(job.id), {
        token = job.lease_token, execution_seq = job.execution_seq,
    })
    if active_err then
        return false, tostring(active_err)
    end
    if active ~= true then
        return false, "job cancelled"
    end
    return true, nil
end

local function upload_event(upload: any, etype: string, body: any, trace_context: any?): table
    return {
        type = etype,
        body = body,
        trace_context = trace_context,
        external = {
            external_source = upload_types.EVENT_SOURCE,
            external_id = tostring(upload.uuid),
            external_version = etype,
        },
    }
end

local function completed_event(upload: any, trace_context: any?): table
    return upload_event(upload, upload_types.EVENT.COMPLETED, {
        upload_id = upload.uuid,
        filename = type(upload.metadata) == "table" and upload.metadata.filename or nil,
        mime_type = upload.mime_type,
        size = upload.size,
        type_id = upload.type_id,
    }, trace_context)
end

local function failed_event(upload: any, error_text: string, trace_context: any?): table
    return upload_event(upload, upload_types.EVENT.FAILED, {
        upload_id = upload.uuid,
        filename = type(upload.metadata) == "table" and upload.metadata.filename or nil,
        mime_type = upload.mime_type,
        size = upload.size,
        type_id = upload.type_id,
        error = error_text,
    }, trace_context)
end

-- Uploads owns publication and settles the same lease before returning to Jobs.
local function publish_output(job: any, event: table, output: table): (table?, any?)
    local body_json, encode_err = json.encode(event.body)
    if encode_err then return nil, encode_err end
    event.body, event.body_json = nil, body_json
    local db, db_err = sql.get(jobs_config.db_id())
    if db_err or not db then return nil, db_err end
    local raw_type, type_err = db:type()
    if type_err then db:release(); return nil, type_err end
    local dbtype = tostring(raw_type)
    local tx, begin_err = db:begin()
    if begin_err or not tx then db:release(); return nil, begin_err end
    local thread_id = tostring(job.thread_id or "")
    local _, append_err = threads_writer.append_system_tx(tx, dbtype, thread_id, { event }, tostring(job.id))
    if append_err then
        tx:rollback()
        db:release()
        return nil, append_err
    end
    local _, complete_err = jobs.complete_tx(tx, tostring(job.id), {
        token = job.lease_token, execution_seq = job.execution_seq,
    }, {})
    if complete_err then
        tx:rollback()
        db:release()
        return nil, complete_err
    end
    local _, commit_err = tx:commit()
    db:release()
    if commit_err then return nil, commit_err end
    local _, notify_err = retention_notifier.notify({ kind = "events_appended", thread_id = thread_id })
    if notify_err then return nil, notify_err end
    return output, nil
end

local function run(input: any): (any, any?)
    input = type(input) == "table" and input or {}
    local payload = type(input.payload) == "table" and input.payload or {}
    local job = job_info(input)
    local upload_id = tostring(payload.upload_id or "")
    if upload_id == "" then
        return nil, "missing upload_id"
    end

    local upload, err = upload_query_repo.get(upload_id)
    if err then
        if err == "Upload not found" then
            log:info("upload missing; treating job as cancelled", { upload_id = upload_id })
            return { skipped = true, cancelled = true, upload_id = upload_id }, nil
        end
        return nil, "upload lookup failed: " .. tostring(err)
    end

    local running, running_err = ensure_running(job)
    if not running then
        return { skipped = true, cancelled = true, upload_id = upload_id, reason = running_err }, nil
    end


    local success, proc_err, processed_upload, retriable = pipeline_lib.process_upload(upload, {
        should_continue = function(_phase)
            return ensure_running(job)
        end,
        -- Carry the job lease so heavy stages (OCR) can observe cancellation
        -- between their own internal batches, not only between pipeline stages.
        cancel_ref = {
            job_id = tostring(job.id or ""),
            lease_token = tostring(job.lease_token or ""),
        },
    })
    if not success then
        if tostring(proc_err or "") == "job cancelled" then
            return { skipped = true, cancelled = true, upload_id = upload_id }, nil
        end
        if terminal_failure(job, retriable) then
            local error_text = tostring(proc_err or "upload processing failed")
            -- The terminal storage mark is part of the job's write set: a job that
            -- cannot record its outcome returns to the queue instead of reporting
            -- a result the store does not reflect.
            local _, state_err = upload_record_repo.mark_storage_failed(upload_id)
            if state_err then
                return nil, "failed to mark upload storage state failed: " .. tostring(state_err)
            end
            local callback_ok, callback_err = pipeline_lib.invoke_upload_token(upload, false, error_text)
            if not callback_ok then
                log:warn("failed to enqueue upload error callback", { upload_id = upload_id, error = tostring(callback_err) })
                return nil, callback_err
            end
            return publish_output(job, failed_event(upload, error_text, upload.trace_context), {
                upload_id = upload_id, job_error = error_text,
            })
        end
        return nil, tostring(proc_err or "upload processing failed")
    end

    local final_upload: any = type(processed_upload) == "table" and processed_upload or upload
    local _, state_err = upload_record_repo.mark_storage_completed(upload_id)
    if state_err then
        return nil, "failed to mark upload storage state completed: " .. tostring(state_err)
    end
    local callback_ok, callback_err = pipeline_lib.invoke_upload_token(final_upload, true, nil)
    if not callback_ok then
        return nil, callback_err
    end

    local final_trace_context = type(final_upload) == "table" and final_upload.trace_context or nil

    return publish_output(job, completed_event(final_upload, final_trace_context), {
        success = true, upload_id = upload_id,
    })
end

-- proc:// entry point. The monitored process transports one status value, with
-- native failures serialized into error_native.
local function main(input: any): table
    local result, err = run(input)
    if err then
        local native = type(err) == "userdata" and err
            or (errors.new({message = tostring(err), kind = errors.INTERNAL}) :: error)
        return {ok = false, error_native = job_types.error_to_data(native :: error)}
    end
    return {ok = true, output = result}
end

return { run = run, main = main, terminal_failure = terminal_failure }
