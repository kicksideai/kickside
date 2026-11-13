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
local processing_hooks = require("processing_hooks")

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

-- Settle an upload's processing outcome in one transaction: its storage state,
-- callback jobs, thread event and, on success, the processing hooks. Inside the
-- processing job the same transaction completes the job's lease; the outcome of
-- a dead processing job (dead_job_id) settles only the upload that job still
-- owns. Returns false when the upload is not the settling job's to settle.
local function settle(job: any, upload: any, outcome: table, dead_job_id: string?): (boolean, any?)
    local success = outcome.success == true
    local prepared_hooks
    if success then
        local prepare_err
        prepared_hooks, prepare_err = processing_hooks.prepare(outcome.output)
        if prepare_err then return false, prepare_err end
    end
    local event = success and completed_event(upload, upload.trace_context)
        or failed_event(upload, tostring(outcome.error_text), upload.trace_context)
    local body_json, encode_err = json.encode(event.body)
    if encode_err then return false, encode_err end
    event.body, event.body_json = nil, body_json
    local db, db_err = sql.get(jobs_config.db_id())
    if db_err or not db then return false, db_err end
    local raw_type, type_err = db:type()
    if type_err then db:release(); return false, type_err end
    local dbtype = tostring(raw_type)
    local tx, begin_err = db:begin()
    if begin_err or not tx then db:release(); return false, begin_err end
    local function abort(err: any): (boolean, any?)
        tx:rollback()
        db:release()
        return false, err
    end
    local settled, state_err = upload_record_repo.settle_storage_tx(tx, upload.uuid,
        success and "completed" or "failed", dead_job_id)
    if state_err then return abort(state_err) end
    if not settled then return abort(nil) end
    local callback_ok, callback_err = pipeline_lib.invoke_upload_token(upload, success,
        outcome.error_text, tx, dbtype)
    if not callback_ok then
        if success or type(callback_err) ~= "userdata" or callback_err:retryable() then
            return abort(callback_err)
        end
        local body = assert(json.decode(body_json))
        body.callback_error = tostring(callback_err)
        event.body_json, encode_err = json.encode(body)
        if encode_err then return abort(encode_err) end
    end
    local thread_id = tostring(job.thread_id or "")
    local completing: string? = nil
    if dead_job_id == nil then completing = tostring(job.id) end
    local _, append_err = threads_writer.append_system_tx(tx, dbtype, thread_id, { event }, completing)
    if append_err then return abort(append_err) end
    if success then
        local recorded, hook_err = processing_hooks.completed(tx, dbtype, job, outcome.output, event.trace_context, prepared_hooks)
        if hook_err or recorded ~= true then
            return abort(hook_err or errors.new({message="Processing extension did not acknowledge completion",kind=errors.INTERNAL,retryable=true}))
        end
    end
    if dead_job_id == nil then
        local _, complete_err = jobs.complete_tx(tx, tostring(job.id), {
            token = job.lease_token, execution_seq = job.execution_seq,
        }, {})
        if complete_err then return abort(complete_err) end
    end
    local _, commit_err = tx:commit()
    db:release()
    if commit_err then return false, commit_err end
    local _, notify_err = retention_notifier.notify({ kind = "events_appended", thread_id = thread_id })
    if notify_err then return false, notify_err end
    local _, nudge_err = jobs.nudge_workers()
    if nudge_err then return false, nudge_err end
    return true, nil
end

-- A processing job settles the upload it holds; one that no longer can reports why.
local function settle_from_job(job: any, upload: any, outcome: table): any?
    local settled, settle_err = settle(job, upload, outcome)
    if settle_err then return settle_err end
    if not settled then
        return errors.new({ message = "upload " .. tostring(upload.uuid) .. " is no longer processing",
            kind = errors.CONFLICT, retryable = false })
    end
    return nil
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
        if errors.is(err, errors.NOT_FOUND) then
            log:info("upload missing; treating job as cancelled", { upload_id = upload_id })
            return { skipped = true, cancelled = true, upload_id = upload_id }, nil
        end
        return nil, "upload lookup failed: " .. tostring(err)
    end

    local running, running_err = ensure_running(job)
    if not running then
        return { skipped = true, cancelled = true, upload_id = upload_id, reason = running_err }, nil
    end


    local cancel_ref = nil
    if tostring(job.id or "") ~= "" and tostring(job.lease_token or "") ~= "" then
        cancel_ref = {job_id = tostring(job.id), lease_token = tostring(job.lease_token), execution_seq = job.execution_seq}
    end
    local success, proc_err, processed_upload, retriable = true, nil, upload, nil
    -- Completion is the processing checkpoint. A publication/settings/callback
    -- retry must never repeat conversion or OCR for an already processed upload.
    if upload.storage_state ~= "completed" then
        success, proc_err, processed_upload, retriable = pipeline_lib.process_upload(upload, {
            final_attempt = is_final_attempt(job),
            should_continue = function(_phase)
                return ensure_running(job)
            end,
            -- Carry the job lease so heavy stages (OCR) can observe cancellation
            -- between their own internal batches, not only between pipeline stages.
            cancel_ref = cancel_ref,
        })
    end
    if not success then
        if tostring(proc_err or "") == "job cancelled" then
            return { skipped = true, cancelled = true, upload_id = upload_id }, nil
        end
        if terminal_failure(job, retriable) then
            local error_text = tostring(proc_err or "upload processing failed")
            -- The terminal storage mark is part of the job's write set: a job that
            -- cannot record its outcome returns to the queue instead of reporting
            -- a result the store does not reflect.
            local settle_err = settle_from_job(job, upload, { success = false, error_text = error_text })
            if settle_err then return nil, settle_err end
            local output = { upload_id = upload_id, job_error = error_text }
            if type(proc_err) == "userdata" then return output, proc_err end
            return output, nil
        end
        return nil, proc_err or "upload processing failed"
    end

    local final_upload: any = type(processed_upload) == "table" and processed_upload or upload
    local output = { success = true, upload_id = upload_id, owner_actor_id = final_upload.actor_id }
    local settle_err = settle_from_job(job, final_upload, { success = true, output = output })
    if settle_err then return nil, settle_err end
    return output, nil
end

-- The dead handler of process_job_proc (meta.job_dead). A processing job that
-- ended dead never settled its upload from inside, so its outcome settles the
-- upload failed with the job's last error. Redelivery and an upload that a
-- retry has since taken over leave the upload unchanged.
local function dead(input: any): (any, any?)
    local outcome = type(input) == "table" and type(input.payload) == "table" and input.payload or {}
    local job_id = tostring(outcome.job_id or "")
    if job_id == "" then
        return nil, errors.new({ message = "dead outcome requires job_id", kind = errors.INVALID, retryable = false })
    end
    local dead_job, read_err = jobs.get_job(job_id)
    if read_err then return nil, read_err end
    if not dead_job then return { skipped = true, reason = "job_absent", job_id = job_id }, nil end
    if dead_job.status ~= job_types.JOB_STATE.DEAD then
        return nil, errors.new({ message = "job " .. job_id .. " is not dead", kind = errors.INVALID, retryable = false })
    end
    local upload, upload_err = upload_query_repo.find_by_processing_job(tostring(dead_job.owner_id), job_id)
    if upload_err then return nil, upload_err end
    if not upload then return { skipped = true, reason = "upload_not_held", job_id = job_id }, nil end
    local error_text = tostring(dead_job.last_error or "upload processing job ended dead")
    local settled, settle_err = settle({ thread_id = dead_job.thread_id }, upload,
        { success = false, error_text = error_text }, job_id)
    if settle_err then return nil, settle_err end
    log:info("dead processing job settled", { upload_id = upload.uuid, job_id = job_id, settled = settled })
    return { upload_id = upload.uuid, job_id = job_id, settled = settled }, nil
end

local function repair_dead(limit: integer): (integer?, any?, boolean?)
    local ids, list_err = upload_query_repo.list_dead_processing_jobs(limit)
    if list_err then return nil, list_err end
    local repaired = 0
    for _, id in ipairs(ids) do
        local result, settle_err = dead({payload = {job_id = id}})
        if settle_err then return nil, settle_err end
        if result.settled then repaired = repaired + 1 end
    end
    return repaired, nil, #ids == limit
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

return { run = run, main = main, dead = dead, repair_dead = repair_dead, terminal_failure = terminal_failure }
