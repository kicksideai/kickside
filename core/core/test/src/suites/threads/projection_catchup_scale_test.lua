local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local time = require("time")
local process = require("process")
local channel = require("channel")
local json = require("json")
local fs = require("fs")
local fixture = require("fixture")

return { run = test.run_cases(function()
    test.describe("Projection addressed dispatch scale", function()
        local context = fixture.new()
        local thread_id, worker_pid, events
        test.after_each(function()
            if worker_pid then
                test.is_nil(select(2, process.terminate(worker_pid)))
                local timeout = time.after("5s")
                while true do
                    local selected = channel.select({ events:case_receive(), timeout:case_receive() })
                    test.is_false(selected.channel == timeout)
                    local event = selected.value
                    if type(event) == "table" and tostring(event.from) == worker_pid and event.kind == process.event.EXIT then break end
                end
                worker_pid = nil
            end
            if thread_id then
                local db, err = sql.get("app:db")
                test.is_nil(err)
                test.is_nil(select(2, db:execute("DELETE FROM kickside_job WHERE thread_id=$1", { thread_id })))
                test.is_nil(select(2, db:execute("DELETE FROM kickside_projection_cursor WHERE thread_id=$1", { thread_id })))
                test.is_nil(select(2, db:execute("DELETE FROM kickside_projection WHERE thread_id=$1", { thread_id })))
                test.is_nil(select(2, db:release()))
                test.is_nil(select(2, context.as_owner("delete", { thread_id = thread_id })))
                thread_id = nil
            end
        end)
        for _, count in ipairs({ 1000, 10000 }) do
            test.it("reaches the head within five seconds behind " .. tostring(count) .. " unrelated due cursors", function()
                local created, create_err = context.as_owner("create", { impl_id = "kickside.test.threads:thread_kind", thread_class = "scale_" .. context.suffix })
                test.is_nil(create_err)
                thread_id = created.thread_id
                local selected, register_err = context.as_owner("register_projection", {
                    thread_id = thread_id, kind = "target", worker_ref = "func://app:test_count_worker" })
                test.is_nil(register_err)
                local batch = {}
                for _ = 1, 48 do batch[#batch + 1] = { type = "kickside.test.threads:trigger", role = "user", body = {} } end
                test.is_nil(select(2, context.as_owner("append_events", { thread_id = thread_id, events = batch })))
                local db, db_err = sql.get("app:db")
                test.is_nil(db_err)
                for first = 1, count, 40 do
                    local projections = sql.builder.insert("kickside_projection"):columns("id", "thread_id", "kind", "projection_key", "body", "state", "last_event_seq")
                    local cursors = sql.builder.insert("kickside_projection_cursor"):columns("id", "projection_id", "thread_id", "cursor_key", "generation", "last_seq", "status", "debounce_idle_ms", "debounce_max_ms", "job_id")
                    local jobs = sql.builder.insert("kickside_job"):columns("id", "thread_id", "owner_kind", "owner_id", "job_type", "worker_ref", "payload", "job_identity", "slot", "scheduled_at")
                    for i = first, math.min(count, first + 39) do
                        local projection, cursor, job = uuid.v7(), uuid.v7(), uuid.v7()
                        projections = projections:values(projection, thread_id, "filler", tostring(i), '{"meta":{"worker_ref":"func://app:test_count_worker"}}', "valid", 0)
                        cursors = cursors:values(cursor, projection, thread_id, "default", 1, 0, "active", 600000, 600000, job)
                        local payload, encode_err = json.encode({ cursor_id = cursor })
                        test.is_nil(encode_err)
                        jobs = jobs:values(job, thread_id, "thread", thread_id, "kickside.core.projections:advance", "kickside.core.projections:advance", payload, "scale:" .. cursor, true, "2000-01-01T00:00:00Z")
                    end
                    test.is_nil(select(2, projections:run_with(db):exec()))
                    test.is_nil(select(2, jobs:run_with(db):exec()))
                    test.is_nil(select(2, cursors:run_with(db):exec()))
                end
                test.is_nil(select(2, db:release()))
                events = process.events()
                local pid, spawn_err = process.spawn_monitored("kickside.core.jobs.service:worker", "app:processes")
                test.is_nil(spawn_err)
                worker_pid = tostring(pid)
                local started = time.now()
                local result, catch_err = context.as_owner("catch_up_projection", {
                    thread_id = thread_id, kind = "target", deadline = started:add(5 * time.SECOND):utc():format("2006-01-02T15:04:05.999999999Z07:00") })
                local elapsed = time.now():sub(started):milliseconds()
                local storage, storage_err = fs.get("app:uploads")
                test.is_nil(storage_err)
                local encoded, encode_err = json.encode({ unrelated_cursors = count, elapsed_ms = elapsed,
                    error = catch_err and tostring(catch_err) or nil, last_seq = result and result.last_seq or nil })
                test.is_nil(encode_err)
                test.is_nil(select(2, storage:writefile("projection-scale-" .. tostring(count) .. ".json", encoded)))
                test.is_nil(catch_err)
                test.is_true(result.done)
                test.eq(result.cursor_id, selected.projection.cursor_id)
                test.eq(result.last_seq, 48)
                test.is_true(elapsed < 5000)
            end)
        end
    end)
end) }
