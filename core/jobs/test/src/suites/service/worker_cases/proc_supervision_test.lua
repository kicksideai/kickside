-- Worker dispatch + finalize decision logic. The process main loop (messages,
-- exact deadlines, cancel via channel.select) is process-bound and covered at
-- integration when the worker.service boots; here the isolatable path is tested
-- directly via the exported execute_job (type -> executor routing) and
-- process_job (claim -> run history -> lease heartbeat -> execute -> finalize),
-- driven through the already-tested claim/lifecycle libs.

local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local json = require("json")
local security = require("security")
local time = require("time")
local channel = require("channel")
local process = require("process")
local job_types = require("job_types")
local cfg = require("config")
local reclaim = require("reclaim")
local lifecycle = require("lifecycle")
local lease_status = require("lease_status")
local job_fixture = require("job_fixture")
local worker = require("worker")
local worker_pool = require("worker_pool")
local dispatch = require("worker_dispatch")
local worker_fence = require("worker_fence")
local worker_child = require("worker_child")
local proc_supervisor = require("proc_supervisor")
local jobs = require("jobs")
local worker_heartbeat = require("worker_heartbeat")

local active_db
local function release_db() if active_db then active_db:release(); active_db = nil end end
local function get_db() local db, err = sql.get("app:db"); active_db = db; return db, err end
local function with_db(fn)
    local db, err = get_db()
    if err or not db then error("jobs test: db connect failed: " .. tostring(err)) end
    fn(db)
end

local function make_thread(db: sql.DB): string
    local id = uuid.v7()
    sql.builder.insert("kickside_thread"):set_map({ id = id, thread_class = "test", component_id = id }):run_with(db):exec()
    return id
end

-- Enqueue a job parked and lease exactly that row. Claim selection has its own
-- suite on a private queue; these cases never claim from the shared queue.
local function enqueue_and_claim(db: sql.DB, dbtype: string, thread_id: string, job_type: string, opts: table?): table
    local params = { thread_id = thread_id, job_type = job_type }
    for key, value in pairs(opts or {}) do params[key] = value end
    local job, lease_err = job_fixture.enqueue_leased(db, dbtype, params)
    if lease_err or not job then error("own job lease failed: " .. tostring(lease_err)) end
    return job
end

local function job_row(db: sql.DB, id): table?
    local rows = sql.builder.select("status", "lease_token", "attempts", "scheduled_at", "wake_enabled")
        :from("kickside_job"):where(sql.builder.eq({ id = id })):run_with(db):query()
    return rows and rows[1] or nil
end

local function latest_run(db: sql.DB, job_id): table?
    local rows = sql.builder.select("status", "attempt_no", "error_text", "result_json")
        :from("kickside_job_run"):where(sql.builder.eq({ job_id = job_id }))
        :order_by("attempt_no DESC"):limit(1):run_with(db):query()
    return rows and rows[1] or nil
end

local SLEEP_PROC = "proc://app:job_sleep_proc"

local function enqueue_proc_and_claim(db: sql.DB, dbtype: string, thread_id: string, payload: any): table
    return enqueue_and_claim(db, dbtype, thread_id, "upload.process.test", {
        worker_ref = SLEEP_PROC,
        priority = 10000,
        max_attempts = 3,
        payload = payload,
    })
end

local function thread_events_for(db: sql.DB, thread_id: string, event_type: string): { table }
    return sql.builder.select("type", "body", "trace_id", "run_id", "correlation_key")
        :from("kickside_event")
        :where(sql.builder.eq({ thread_id = thread_id, type = event_type }))
        :run_with(db):query() or {}
end

local function define_tests()
    test.describe("lease deadline timestamps", function()
        test.it("interprets zone-less SQLite timestamps as UTC on a non-UTC host", function()
            for _, raw in ipairs({"2026-10-02 16:17:56.010700", "2026-10-02 16:17:56", "2026-10-02T16:17:56Z", "2026-10-02T12:17:56-04:00"}) do
                local parsed, err = proc_supervisor.parse_deadline(raw)
                test.is_nil(err)
                test.eq(parsed:unix(), 1790957876)
            end
        end)
    end)

    test.describe("jobs.worker proc supervision", function()
        local function err_text(e: any): string
            if e == nil then return "" end
            return tostring((e :: any):message())
        end

        -- Build hooks that replay a scripted list of lifecycle signals and
        -- record every terminate(pid).
        local function scripted_hooks(signals: { any }): table
            local i = 0
            local terminated: { string } = {}
            return {
                _terminated = terminated,
                spawn = function(): (string?, any) return "child-1", nil end,
                terminate = function(pid: string): () terminated[#terminated + 1] = pid end,
                wait = function(): any
                    i = i + 1
                    return signals[i] or { kind = "grace_expired" }
                end,
            }
        end

        test.it("returns the proc output on a successful exit, terminating nothing", function()
            local h = scripted_hooks({ { kind = "exit", result = { value = { ok = true, output = { success = true, n = 2 } } } } })
            local out, err, control = dispatch.supervise_proc_loop(h, "child-1")
            test.is_nil(err)
            test.is_nil(control)
            test.eq((out :: any).n, 2)
            test.eq(#h._terminated, 0)
        end)

        test.it("unwraps the live process value envelope before reading proc output", function()
            local h = scripted_hooks({
                { kind = "exit", result = { value = { ok = true, output = {
                    success = true,
                    thread_events = {
                        {
                            type = "test.job.completed",
                            body = { upload_id = "upload-live-proc" },
                            external = {
                                external_source = "test.jobs",
                                external_id = "upload-live-proc",
                                external_version = "test.job.completed",
                            },
                        },
                    },
                } } } },
            })
            local out, err, control = dispatch.supervise_proc_loop(h, "child-1")
            test.is_nil(err)
            test.is_nil(control)
            test.eq((out :: any).success, true)
            test.eq(#((out :: any).thread_events :: { any }), 1)
            test.eq(((out :: any).thread_events[1] :: any).type, "test.job.completed")
            test.eq(#h._terminated, 0)
        end)

        test.it("surfaces a failed proc result as an error without terminating", function()
            local h = scripted_hooks({ { kind = "exit", result = { error = errors.new({message = "stage blew up", kind = errors.INTERNAL}) } } })
            local out, err = dispatch.supervise_proc_loop(h, "child-1")
            test.is_nil(out)
            test.not_nil(err)
            test.is_true(err_text(err):find("stage blew up", 1, true) ~= nil)
            test.eq(#h._terminated, 0)
        end)

        test.it("terminates the child and fails on max_execution timeout", function()
            local h = scripted_hooks({ { kind = "timeout" }, { kind = "exit", from = "child-1" } })
            local out, err, control = dispatch.supervise_proc_loop(h, "child-1")
            test.is_nil(out)
            test.not_nil(err)
            test.is_nil(control)
            test.eq(#h._terminated, 1)
            test.eq(h._terminated[1], "child-1")
            test.is_true(err_text(err):find(dispatch.PROC_TIMEOUT_MARKER, 1, true) ~= nil)
        end)

        test.it("pumps one straggler signal after a confirmed termination", function()
            local waits = 0
            local h = scripted_hooks({ { kind = "timeout" }, { kind = "exit", from = "child-1" } })
            local raw_wait = h.wait
            h.wait = function(): any
                waits = waits + 1
                return raw_wait()
            end
            local out, err, control = dispatch.supervise_proc_loop(h, "child-1")
            test.is_nil(out)
            test.not_nil(err)
            test.is_nil(control)
            test.eq(h._terminated[1], "child-1")
            test.eq(waits, 2)
        end)

        test.it("withholds retry after unconfirmed termination or a failed quarantine update", function()
            local h = scripted_hooks({ { kind = "timeout" } })
            local out, err, control = dispatch.supervise_proc_loop(h, "child-1")
            test.is_nil(out)
            test.not_nil(err)
            test.eq(control, "termination_unconfirmed")
            test.eq(h._terminated[1], "child-1")
            -- The sweep's exact zero count needs a queue this case owns.
            local db, _, queue_err = job_fixture.private_queue("app:private_queue_proc_supervision_test")
            if not db or not _ then error("test queue unavailable: " .. tostring(queue_err)) end
            test.is_nil(queue_err)
            local dbtype = tostring(db:type())
            local job = enqueue_and_claim(db, dbtype, uuid.v7(), "test.quarantine")
            local prepare_err = worker_fence.prepare_termination(db, job)
            test.is_nil(prepare_err)
            local _, age_err = sql.builder.update("kickside_job")
                :set("lease_until", dbtype == sql.type.SQLITE and "2000-01-01 00:00:00" or "2000-01-01T00:00:00Z")
                :where(sql.builder.eq({ id = job.id })):run_with(db):exec()
            test.is_nil(age_err)

            local trigger_name = "quarantine_fail_" .. string.gsub(uuid.v7(), "-", "_")
            if dbtype == sql.type.POSTGRES then
                local _, fn_err = db:execute("CREATE FUNCTION " .. trigger_name .. "() RETURNS trigger LANGUAGE plpgsql AS $$BEGIN RAISE EXCEPTION 'injected quarantine failure'; END;$$")
                test.is_nil(fn_err)
                local _, trigger_err = db:execute("CREATE TRIGGER " .. trigger_name .. " BEFORE UPDATE ON kickside_job FOR EACH ROW WHEN (OLD.id = '" .. job.id .. "' AND NEW.lease_token IS NULL AND NEW.status = 'running') EXECUTE FUNCTION " .. trigger_name .. "()")
                test.is_nil(trigger_err)
            else
                local _, trigger_err = db:execute("CREATE TRIGGER " .. trigger_name .. " BEFORE UPDATE ON kickside_job FOR EACH ROW WHEN OLD.id = '" .. job.id .. "' AND NEW.lease_token IS NULL AND NEW.status = 'running' BEGIN SELECT RAISE(FAIL, 'injected quarantine failure'); END")
                test.is_nil(trigger_err)
            end

            local hold_err = worker_fence.hold_unconfirmed_execution(db, job)
            test.not_nil(hold_err)
            test.is_true(string.find(tostring(hold_err), "injected quarantine failure", 1, true) ~= nil)
            local reclaimed, reclaim_err = reclaim.reclaim_expired(db, dbtype)
            test.is_nil(reclaim_err)
            test.eq(reclaimed, 0)
            local rows = sql.builder.select("status", "lease_token", "last_error")
                :from("kickside_job"):where(sql.builder.eq({ id = job.id })):run_with(db):query()
            test.eq(rows[1].status, job_types.JOB_STATE.RUNNING)
            test.eq(rows[1].lease_token, job.lease_token)
            test.is_true(string.find(tostring(rows[1].last_error), "termination_pending:", 1, true) == 1)

            local _, drop_err = db:execute("DROP TRIGGER " .. trigger_name .. (dbtype == sql.type.POSTGRES and " ON kickside_job" or ""))
            test.is_nil(drop_err)
            if dbtype == sql.type.POSTGRES then
                local _, fn_drop_err = db:execute("DROP FUNCTION " .. trigger_name .. "()")
                test.is_nil(fn_drop_err)
            end
            local _, delete_err = sql.builder.delete("kickside_job")
                :where(sql.builder.eq({ id = job.id })):run_with(db):exec()
            test.is_nil(delete_err)
            db:release()
        end)

        test.it("stops supervised work when its worker heartbeat exits", function()
            local h = scripted_hooks({ { kind = "heartbeat_lost" }, { kind = "exit", from = "child-1" } })
            local out, err, control = dispatch.supervise_proc_loop(h, "child-1")
            test.is_nil(out)
            test.not_nil(err)
            test.eq(control, "shutdown")
            test.eq(h._terminated[1], "child-1")
        end)

        test.it("terminates the child and asks to shut down on a worker cancel", function()
            local h = scripted_hooks({ { kind = "cancel" }, { kind = "exit", from = "child-1" } })
            local out, err, control = dispatch.supervise_proc_loop(h, "child-1")
            test.is_nil(out)
            test.not_nil(err)
            test.eq(control, "shutdown")
            test.eq(h._terminated[1], "child-1")
        end)

        test.it("revokes a running child after committed cancellation", function()
            local h = scripted_hooks({ { kind = "revoked" }, { kind = "exit", from = "child-1" } })
            local out, err, control = dispatch.supervise_proc_loop(h, "child-1")
            test.is_nil(out)
            test.is_nil(err)
            test.eq(control, "revoked")
            test.eq(h._terminated[1], "child-1")
        end)

        test.it("awaits the monitored EXIT after a child LINK_DOWN before classifying the attempt", function()
            -- LINK_DOWN from a linked+monitored child ends its lifetime; the
            -- monitored EXIT follows and carries the final attempt outcome.
            local h = scripted_hooks(
                {
                    { kind = "peer_down", from = "child-1" },
                    { kind = "exit", from = "child-1", result = { value = { ok = true, output = { done = true } } } },
                })
            local out, err, control = dispatch.supervise_proc_loop(h, "child-1")
            test.is_nil(err)
            test.is_nil(control)
            test.is_true((out :: any).done)
            test.eq(#h._terminated, 0)
        end)

        test.it("maps a child LINK_DOWN to peer_down so the EXIT classifies the attempt", function()
            local events = channel.new(1)
            events:send({ kind = process.event.LINK_DOWN, from = "child-1" })
            local sig = proc_supervisor.wait_once(events, time.now():add(60 * time.SECOND), "child-1")
            test.eq(tostring((sig :: any).kind), "peer_down")

            local exit_events = channel.new(1)
            exit_events:send({ kind = process.event.EXIT, from = "child-1", result = { ok = true } })
            local exit_sig = proc_supervisor.wait_once(exit_events, time.now():add(60 * time.SECOND), "child-1")
            test.eq(tostring((exit_sig :: any).kind), "exit")
        end)

        test.it("checks lease ownership once at its exact expiry", function()
            local checks = 0
            local h = scripted_hooks({ { kind = "lease_expired" }, { kind = "exit", from = "child-1" } })
            h.check_lease = function(): (boolean, string?, error?)
                checks = checks + 1
                return false, nil, nil
            end
            local out, err = dispatch.supervise_proc_loop(h, "child-1")
            test.not_nil(err)
            test.is_nil(out)
            test.eq(checks, 1)
            test.eq(h._terminated[1], "child-1")
        end)

        test.it("spawns then supervises to a successful exit via run_supervised_proc", function()
            local h = scripted_hooks({ { kind = "exit", result = { value = { ok = true, output = { ran = 1 } } } } })
            local out, err = dispatch.run_supervised_proc(nil, "sqlite", { id = "j1", payload = "{}" },
                { worker_runtime = job_types.WORKER_RUNTIME.PROC, target_id = "x", worker_ref = "proc://x" }, h)
            test.is_nil(err)
            test.eq((out :: any).ran, 1)
        end)

        test.it("resolves the per-job max_execution_ms from payload, else the policy ceiling", function()
            local policy = { proc_max_execution_ms = 600000 }
            test.eq(dispatch.resolve_max_execution_ms({ payload = json.encode({ max_execution_ms = 1234 }) }, policy), 1234)
            test.eq(dispatch.resolve_max_execution_ms({ payload = "{}" }, policy), 600000)
            -- A non-positive override is ignored in favor of the policy ceiling.
            test.eq(dispatch.resolve_max_execution_ms({ payload = json.encode({ max_execution_ms = 0 }) }, policy), 600000)
        end)

        test.it("extracts native EXIT values and leaves output data uninterpreted", function()
            local ok_out, ok_err = dispatch.interpret_proc_result({ value = {ok = true, output = {a = 1}} })
            test.is_nil(ok_err)
            test.eq((ok_out :: any).a, 1)

            local wrapped_out, wrapped_err = dispatch.interpret_proc_result({value = {ok = true, output = {b = 2}}})
            test.is_nil(wrapped_err)
            test.eq((wrapped_out :: any).b, 2)

            local source = errors.new({kind = errors.PERMISSION_DENIED, message = "refused", retryable = false,
                details = {code = "native_proc_exit"}})
            local fail_out, fail_err = dispatch.interpret_proc_result({ error = source })
            test.is_nil(fail_out)
            test.not_nil(fail_err)
            test.eq(fail_err:kind(), errors.PERMISSION_DENIED)
            test.eq(fail_err:details().code, "native_proc_exit")

            local value_out, value_err = dispatch.interpret_proc_result({value = {ok = false, error_native = job_types.error_to_data(source)}})
            test.is_nil(value_out)
            test.eq(value_err:kind(), errors.PERMISSION_DENIED)

            local encoded_out, encoded_err = dispatch.interpret_proc_result({value = {ok = false,
                error_native = {kind = errors.CONFLICT, message = "encoded"}}})
            test.is_nil(encoded_out)
            test.eq(encoded_err:kind(), errors.CONFLICT)

            local legacy_out, legacy_err = dispatch.interpret_proc_result({ok = false, error_kind = "invalid", error = "old"})
            test.is_nil(legacy_out)
            test.not_nil(legacy_err)
            test.eq(legacy_err:kind(), errors.INVALID)
        end)
    end)
end
local run_cases = test.run_cases(define_tests)

-- This process supervises job children directly, standing in for the loop.
local function run(options)
    local trap_err = job_fixture.supervise_as_loop()
    if trap_err then error(trap_err) end
    return run_cases(options)
end

return { run = run }
