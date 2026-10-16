local sql = require("sql")
local json = require("json")
local jobs = require("jobs")
local lifecycle = require("lifecycle")
local threads_writer = require("threads_writer")
local retention_notifier = require("retention_notifier")
local security = require("security")
local time = require("time")
local channel = require("channel")

type ThreadEvent = {
    type: string,
    body: { upload_id: unknown, ok: boolean?, error: string? }?,
    body_json: string?,
    external: { external_source: string, external_id: string, external_version: string },
    trace_context: unknown,
}

local function run(input)
    local actor = security.actor()
    local payload = type(input) == "table" and input.payload or nil
    if type(payload) == "table" and payload.raise_kind == "plain" then
        error(tostring(payload.raise_message or "function worker boom"))
    end
    if type(payload) == "table" and payload.raise_kind == "unavailable" then
        error(errors.new({message = "database unavailable", kind = errors.UNAVAILABLE, retryable = true,
            details = {code = "test_database_unavailable"}}))
    end
    if type(payload) == "table" and payload.raise_kind == "invalid" then
        error(errors.new({ message = tostring(payload.raise_message or "raised deterministic failure"), kind = errors.INVALID }))
    end
    if type(payload) == "table" and payload.raise_kind == "internal" then
        error(errors.new({ message = tostring(payload.raise_message or "raised infrastructure failure"), kind = errors.INTERNAL }))
    end
    if type(payload) == "table" and payload.raise_kind == "unavailable_after_side_effect" then
        local db = assert(sql.get("app:db"))
        local _, side_effect_err = db:execute(
            "UPDATE kickside_thread SET component_id = component_id || 'x' WHERE id=$1",
            { tostring(input.job.thread_id) })
        db:release()
        if side_effect_err then error(side_effect_err) end
        error(errors.new({
            message = tostring(payload.raise_message or "raised retryable failure after side effect"),
            kind = errors.UNAVAILABLE,
            retryable = true,
            details = { code = "TEST_SIDE_EFFECT_FAILURE" },
        }))
    end
    if type(payload) == "table" and payload.block == true then channel.new():receive() end
    if type(payload) == "table" and tonumber(payload.sleep_ms) then
        time.sleep(tostring(math.floor(tonumber(payload.sleep_ms) or 0)) .. "ms")
    end
    local thread_events: { ThreadEvent }? = nil
    local out = {
        ok = true,
        record = { status = "completed" },
        actor_id = actor and actor:id() or nil,
        job_type = type(input) == "table" and input.job and input.job.job_type or nil,
        upload_id = type(payload) == "table" and payload.upload_id or nil,
        trace_id = type(input) == "table" and input.trace_context and input.trace_context.trace_id or nil,
        deadline = type(input) == "table" and input.job and input.job.deadline or nil,
    }
    if type(payload) == "table" and payload.emit_thread_event == true then
        thread_events = {
            {
                type = tostring(payload.event_type or "test.job.completed"),
                body = { upload_id = payload.upload_id, ok = true },
                external = {
                    external_source = "test.jobs",
                    external_id = tostring(payload.upload_id or "upload"),
                    external_version = tostring(payload.event_type or "test.job.completed"),
                },
            },
        }
    end
    if type(payload) == "table" and type(payload.rearm) == "string" and payload.rearm ~= "" then
        out.rearm = payload.rearm
    end
    if type(payload) == "table" and payload.fail_with_event == true then
        out.ok = false
        out.job_error = tostring(payload.error_text or "configured job failure")
        out.failure_class = payload.failure_class
        thread_events = {
            {
                type = tostring(payload.event_type or "test.job.failed"),
                body = { upload_id = payload.upload_id, error = out.job_error },
                external = {
                    external_source = "test.jobs",
                    external_id = tostring(payload.upload_id or "upload"),
                    external_version = tostring(payload.event_type or "test.job.failed"),
                },
            },
        }
    end
    if thread_events ~= nil then
        local job = input.job
        local db = assert(sql.get("app:db"))
        local dbtype = tostring(db:type())
        local tx = assert(db:begin())
        for _, event in ipairs(thread_events) do
            event.body_json = assert(json.encode(event.body))
            event.body = nil
            event.trace_context = input.trace_context
        end
        local _, append_err = threads_writer.append_system_tx(tx, dbtype, job.thread_id, thread_events, job.id)
        if append_err then tx:rollback(); db:release(); error(append_err) end
        local error_text = out.job_error
        local settle_err
        if out.failure_class == "deterministic" then
            local rows = assert(tx:query("SELECT * FROM kickside_job WHERE id=$1", { job.id }))
            rows[1].lease_token = job.lease_token
            rows[1].execution_seq = job.execution_seq
            settle_err = lifecycle.fail_tx(tx, rows[1], dbtype, error_text, "deterministic")
        else
            local _, done_err = jobs.complete_tx(tx, job.id, {
                token = job.lease_token, execution_seq = job.execution_seq,
            }, { rearm = out.rearm, record = out.record })
            settle_err = done_err
        end
        if settle_err then tx:rollback(); db:release(); error(settle_err) end
        local runs = assert(tx:query("SELECT id FROM kickside_job_run WHERE job_id=$1 AND execution_seq=$2",
            { job.id, job.execution_seq }))
        local history_err = lifecycle.finalize_job_run(tx, dbtype, { id = runs[1].id },
            error_text and "failed" or "completed", out, out, error_text)
        if history_err then tx:rollback(); db:release(); error(history_err) end
        local _, commit_err = tx:commit()
        db:release()
        if commit_err then error(commit_err) end
        local _, notify_err = retention_notifier.notify({ kind = "events_appended", thread_id = job.thread_id })
        if notify_err then error(notify_err) end
        if payload.fail_after_settle then
            error(errors.new({ message = "notification failed after commit", kind = errors.INTERNAL }))
        end
        -- Return normally after the owner's failure transition; the worker
        -- observes the exact settled lease rather than failing it a second time.
        out.job_error = nil
        out.thread_events = nil
    end
    return out
end

return { run = run }
