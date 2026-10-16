-- Worker dispatch + finalize decision logic. The process main loop (deadline,
-- wake topic, cancellation via channel.select) is process-bound and covered at
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
local reclaim = require("reclaim")
local lifecycle = require("lifecycle")
local job_fixture = require("job_fixture")
local worker = require("worker")
local worker_pool = require("worker_pool")
local dispatch = require("worker_dispatch")
local worker_child = require("worker_child")
local worker_fence = require("worker_fence")
local proc_supervisor = require("proc_supervisor")
local jobs = require("jobs")
local worker_heartbeat = require("worker_heartbeat")
local worker_db_scaffold = require("worker_db_scaffold")

local sc = worker_db_scaffold.new()
local release_db = sc.release_db
local get_db = sc.get_db
local with_db = sc.with_db
local make_thread = sc.make_thread
local enqueue_and_claim = sc.enqueue_and_claim
local job_row = sc.job_row
local latest_run = sc.latest_run
local enqueue_proc_and_claim = sc.enqueue_proc_and_claim

local function define_tests()
    test.describe("singleton process admission", function()
        local function driver(registrations: { any }, owners: { any }, signals: { any }): any
            local trace = {}
            local registration_index, owner_index, signal_index = 0, 0, 0
            local source = { case_receive = function() return { channel = "events" } end }
            local proc = {
                event = process.event,
                pid = function() return "self" end,
                registry = {
                    CONSISTENT = process.registry.CONSISTENT,
                    register = function(name, _meta, consistency)
                        trace[#trace + 1] = "register:" .. name
                        test.eq(consistency, process.registry.CONSISTENT)
                        registration_index = registration_index + 1
                        local answer = registrations[registration_index]
                        return answer.ok, answer.err
                    end,
                    lookup = function(name, consistency)
                        trace[#trace + 1] = "lookup:" .. name
                        test.eq(consistency, process.registry.CONSISTENT)
                        owner_index = owner_index + 1
                        local answer = owners[owner_index]
                        return answer.pid, answer.err
                    end,
                },
                monitor = function(pid) trace[#trace + 1] = "monitor:" .. pid; return true, nil end,
            }
            local select = { select = function()
                signal_index = signal_index + 1
                return signals[signal_index]
            end }
            return { source = source, process = proc, channel = select, trace = trace }
        end
        test.it("reclaims a name when the handoff owner disappears before lookup", function()
            local exists = errors.new({ kind = errors.ALREADY_EXISTS, message = "owned" })
            local d = driver({ { err = exists }, { ok = true } }, { {} }, {})
            local claimed, owner, err = proc_supervisor.claim_or_owner("test:handoff", d)
            test.is_true(claimed)
            test.is_nil(owner)
            test.is_nil(err)
            test.eq(#d.trace, 3)
        end)
        test.it("returns a live handoff owner without waiting for its exit", function()
            local exists = errors.new({ kind = errors.ALREADY_EXISTS, message = "owned" })
            local d = driver({ { err = exists } }, { { pid = "owner" } }, {})
            local claimed, owner, err = proc_supervisor.claim_or_owner("test:handoff", d)
            test.is_false(claimed)
            test.eq(owner, "owner")
            test.is_nil(err)
            test.eq(#d.trace, 2)
        end)
        test.it("keeps a singleton name this process already holds across an in-place upgrade", function()
            local exists = errors.new({ kind = errors.ALREADY_EXISTS, message = "owned" })
            local d = driver({ { err = exists } }, { { pid = "self" } }, {})
            local claimed, owner, err = proc_supervisor.claim_or_owner("test:handoff", d)
            test.is_true(claimed)
            test.is_nil(owner)
            test.is_nil(err)
            test.eq(#d.trace, 2)
        end)
        test.it("claims immediately and propagates registration failures", function()
            test.eq(type(proc_supervisor.claim_singleton), "function")
            local d = driver({ { ok = true } }, {}, {})
            local claimed, cancelled, err = proc_supervisor.claim_singleton("test:singleton", d.source, d)
            test.eq(claimed, true)
            test.eq(cancelled, false)
            test.is_nil(err)
            local refused = errors.new({ kind = errors.PERMISSION_DENIED, message = "registration refused" })
            d = driver({ { err = refused } }, {}, {})
            claimed, cancelled, err = proc_supervisor.claim_singleton("test:singleton", d.source, d)
            test.eq(claimed, false)
            test.eq(cancelled, false)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED))
        end)
        test.it("retries a vanished owner and ignores unrelated exits before claiming", function()
            test.eq(type(proc_supervisor.claim_singleton), "function")
            local exists = errors.new({ kind = errors.ALREADY_EXISTS, message = "owned" })
            local d = driver({ { err = exists }, { err = exists }, { ok = true } },
                { {}, { pid = "owner" } }, {
                    { ok = true, value = { kind = process.event.EXIT, from = "other" } },
                    { ok = true, value = { kind = process.event.EXIT, from = "owner" } },
                })
            local claimed, cancelled, err = proc_supervisor.claim_singleton("test:singleton", d.source, d)
            test.eq(claimed, true)
            test.eq(cancelled, false)
            test.is_nil(err)
            test.eq(d.trace[5], "monitor:owner")
        end)
        test.it("reports cancellation and version replacement as clean standby outcomes", function()
            test.eq(type(proc_supervisor.claim_singleton), "function")
            for _, kind in ipairs({ process.event.CANCEL, process.event.OUTDATED }) do
                local d = driver({ { err = errors.new({ kind = errors.ALREADY_EXISTS, message = "owned" }) } },
                    { { pid = "owner" } }, { { ok = true, value = { kind = kind } } })
                local claimed, cancelled, err, stop_kind = proc_supervisor.claim_singleton("test:singleton", d.source, d)
                test.eq(claimed, false)
                test.eq(cancelled, true)
                test.is_nil(err)
                test.eq(stop_kind, kind)
                test.eq(#d.trace, 3)
            end
        end)
    end)
    test.describe("jobs.worker child outcome", function()
        test.it("returns the native error kind and message when a child cannot start", function()
            local result = worker.run_job_child({})
            local err = job_types.error_from_data(result.error_native)
            test.is_false(result.ok)
            test.eq(err:kind(), errors.INVALID)
            test.eq(err:message(), "missing job")
        end)

        test.it("returns no legacy fields when a child cannot start", function()
            local result = worker.run_job_child({})
            local err = job_types.error_from_data(result.error_native)
            test.is_false(result.ok)
            test.not_nil(err)
            test.is_nil(err:retryable())
            test.is_nil(err:details())
        end)
    end)

    test.describe("jobs.worker proc supervision", function()
        test.after_each(release_db)
        local function err_text(e: any): string
            if e == nil then return "" end
            return tostring((e :: any):message())
        end

        -- Build hooks that replay a scripted list of wait() signals and record
        -- every terminate(pid).
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

        test.it("stops waiting when the matching EXIT confirms termination", function()
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

        test.it("runs the child to its own exit when the supervising code becomes outdated", function()
            local h = scripted_hooks({ { kind = "outdated" },
                { kind = "exit", result = { value = { ok = true, output = { success = true, n = 3 } } } } })
            local out, err, control, retire = dispatch.supervise_proc_loop(h, "child-1")
            test.is_nil(err)
            test.is_nil(control)
            test.eq((out :: any).n, 3)
            test.eq(#h._terminated, 0)
            test.is_true(retire, "an outdated supervisor retires once its execution settles")
        end)

        test.it("bounds an outdated supervisor's drain by the execution's own max_execution ceiling", function()
            local h = scripted_hooks({ { kind = "outdated" }, { kind = "timeout" }, { kind = "exit", from = "child-1" } })
            local out, err, control, retire = dispatch.supervise_proc_loop(h, "child-1")
            test.is_nil(out)
            test.is_nil(control)
            test.eq(#h._terminated, 1)
            test.is_true(err_text(err):find(dispatch.PROC_TIMEOUT_MARKER, 1, true) ~= nil)
            test.is_true(retire)
        end)

        test.it("confirms a termination in progress when the supervising code becomes outdated", function()
            local h = scripted_hooks({ { kind = "timeout" }, { kind = "outdated" }, { kind = "exit", from = "child-1" } })
            local out, err, control, retire = dispatch.supervise_proc_loop(h, "child-1")
            test.is_nil(out)
            test.is_nil(control)
            test.eq(#h._terminated, 1)
            test.is_true(err_text(err):find(dispatch.PROC_TIMEOUT_MARKER, 1, true) ~= nil)
            test.is_true(retire)
        end)

        test.it("reports no retirement for a supervisor whose code stays current", function()
            local h = scripted_hooks({ { kind = "exit", result = { value = { ok = true, output = { success = true } } } } })
            local _, err, _, retire = dispatch.supervise_proc_loop(h, "child-1")
            test.is_nil(err)
            test.is_false(retire)
        end)

        test.it("withholds retry after unconfirmed termination or a failed quarantine update", function()
            local h = scripted_hooks({ { kind = "timeout" } })
            local out, err, control = dispatch.supervise_proc_loop(h, "child-1")
            test.is_nil(out)
            test.not_nil(err)
            test.eq(control, "termination_unconfirmed")
            test.eq(h._terminated[1], "child-1")
            -- The sweep's exact zero count needs a queue this case owns.
            local db, _, queue_err = job_fixture.private_queue("app:private_queue_worker_supervision_test")
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
            release_db()
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

        test.it("checks lease ownership once at its exact expiry", function()
            local checks = 0
            local h = scripted_hooks({ { kind = "lease_expired" }, { kind = "exit", from = "child-1" } })
            h.check_lease = function(): (boolean, string?, error?)
                checks = checks + 1
                return false, nil, nil
            end
            local out, err, control = dispatch.supervise_proc_loop(h, "child-1")
            test.is_nil(out)
            test.not_nil(err)
            test.is_nil(control)
            test.eq(checks, 1)
            test.eq(h._terminated[1], "child-1")
            test.eq(err:kind(), errors.CONFLICT)
            test.eq(err:details().code, job_types.ERROR_CODE.LEASE_LOST)
            test.is_true(job_types.is_lease_lost_error(err))
        end)

        test.it("awaits the monitored EXIT after a child LINK_DOWN", function()
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

        test.it("keeps supervising across an unrelated event", function()
            local h = scripted_hooks(
                { { kind = "other" }, { kind = "exit", result = { value = { ok = true, output = { done = true } } } } })
            local out, err = dispatch.supervise_proc_loop(h, "child-1")
            test.is_nil(err)
            test.is_true((out :: any).done)
            test.eq(#h._terminated, 0)
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

        test.it("extracts native EXIT errors and leaves output data uninterpreted", function()
            local ok_out, ok_err = dispatch.interpret_proc_result({ok = true, output = {a = 1}})
            test.is_nil(ok_err)
            test.eq((ok_out :: any).a, 1)

            local wrapped_out, wrapped_err = dispatch.interpret_proc_result({value = {ok = true, output = {b = 2}}})
            test.is_nil(wrapped_err)
            test.eq((wrapped_out :: any).b, 2)

            local source = errors.new({kind = errors.CONFLICT, message = "lease ownership changed", retryable = false,
                details = {code = job_types.ERROR_CODE.LEASE_LOST, lease = {sequence = 7}}})
            local native_out, native_err = dispatch.interpret_proc_result({error = source})
            test.is_nil(native_out)
            test.eq(native_err:kind(), errors.CONFLICT)
            test.is_false(native_err:retryable())
            test.eq(native_err:details().code, job_types.ERROR_CODE.LEASE_LOST)
            test.eq(native_err:details().lease.sequence, 7)

            local wrapped_fail_out, wrapped_fail_err = dispatch.interpret_proc_result({value = {ok = false, error = "wrapped nope"}})
            test.is_nil(wrapped_fail_out)
            test.eq(wrapped_fail_err:kind(), errors.INVALID)

            local native_data_out, native_data_err = dispatch.interpret_proc_result({value = {
                ok = false, error_native = {kind = errors.CONFLICT, message = "encoded"},
            }})
            test.is_nil(native_data_out)
            test.eq(native_data_err:kind(), errors.CONFLICT)

            local unknown_out, unknown_err = dispatch.interpret_proc_result({ok = false,
                error_native = {kind = "", message = "upstream has no kind", retryable = true,
                    details = {source = "proc"}}})
            test.is_nil(unknown_out)
            test.eq(unknown_err:kind(), errors.UNKNOWN)
            test.is_true(unknown_err:retryable())
            test.eq(unknown_err:details().source, "proc")

            local unsupported_out, unsupported_err = dispatch.interpret_proc_result({ok = false,
                error_native = {kind = "NotARealKind", message = "unsupported native kind"}})
            test.is_nil(unsupported_out)
            test.eq(unsupported_err:kind(), errors.INVALID)

            local malformed_out, malformed_err = dispatch.interpret_proc_result({ok = false,
                error_native = {kind = errors.CONFLICT, message = "bad native", retryable = "false"}})
            test.is_nil(malformed_out)
            test.eq(malformed_err:kind(), errors.INVALID)

            local fail_out, fail_err = dispatch.interpret_proc_result({ok = false, error = "nope"})
            test.is_nil(fail_out)
            test.eq(fail_err:kind(), errors.INVALID)

            local legacy_out, legacy_err = dispatch.interpret_proc_result({ok = false, error = "legacy fallback", error_kind = "invalid"})
            test.is_nil(legacy_out)
            test.eq(legacy_err:kind(), errors.INVALID)

            local non_idempotent = errors.new({ kind = errors.UNAVAILABLE, message = "target unavailable",
                retryable = true, details = { request = "one" } })
            local no_runtime_retry = job_types.error_with_retryable(non_idempotent, false)
            test.eq(no_runtime_retry:kind(), errors.UNAVAILABLE)
            test.is_false(no_runtime_retry:retryable())
            test.eq(no_runtime_retry:details().request, "one")

            local unsupported, unsupported_err = dispatch.interpret_proc_result({value = {raw = 7}})
            test.is_nil(unsupported)
            test.eq(unsupported_err:kind(), errors.INVALID)

            local malformed, malformed_err = dispatch.interpret_proc_result({error = "not native"})
            test.is_nil(malformed)
            test.eq(malformed_err:kind(), errors.INVALID)
        end)
    end)

    -- End-to-end over the live spawn/monitor/terminate wiring: a real proc child is
    -- spawned, supervised, and either reaped on the max_execution deadline or run to
    -- a clean exit. Proves a proc:// job can never pin a worker or, conversely, lose
    -- its lease to legitimate multi-second work.
    test.describe("jobs.worker supervised proc (live)", function()
        test.after_each(release_db)
        test.it("runs a multi-hundred-ms proc to completion without losing its lease", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                -- 300ms of work under the default (large) ceiling: completes cleanly.
                local job = enqueue_proc_and_claim(db, dbtype, thread_id, { sleep_ms = 300 })

                worker.process_job(db, dbtype, "test-pid-" .. uuid.v7(), job :: table)

                test.eq(job_row(db, job.id).status, job_types.JOB_STATE.DONE)
                test.is_nil(job_row(db, job.id).lease_token)
                local run = latest_run(db, job.id)
                test.not_nil(run)
                test.eq(run.status, "completed")
            end)
        end)

        test.it("ends a one-shot proc dead when its failure carries a deterministic kind", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                for _ = 1, 10 do
                    local thread_id = make_thread(db)
                    local job = enqueue_proc_and_claim(db, dbtype, thread_id, {
                        fail = true, error_text = "bad input", error_kind = "invalid",
                    })

                    worker.process_job(db, dbtype, "test-pid-" .. uuid.v7(), job :: table)

                    local row = job_row(db, job.id)
                    test.eq(row.status, job_types.JOB_STATE.DEAD)
                    test.is_nil(row.scheduled_at)
                    local run = latest_run(db, job.id)
                    test.not_nil(run)
                    test.eq(run.status, job_types.RUN_STATE.FAILED)
                end
            end)
        end)
    end)

    -- Each case kills a linked supervised child; the suite process traps links
    -- like the loop, so the child's LINK_DOWN arrives as an event.
    test.describe("jobs.worker child termination", function()
        test.after_each(release_db)
        test.it("finalizes a proc timeout inside its execution child", function()
            local db, db_err = get_db()
            test.is_nil(db_err)
            local dbtype = tostring(db:type())
            local job = enqueue_proc_and_claim(db, dbtype, make_thread(db), { block = true, max_execution_ms = 250 })
            release_db()

            -- The execution child owns and reaps its proc target; the test only
            -- monitors the child, as the loop's supervisor would.
            local events = process.events()
            local child_pid, spawn_err = process.spawn_monitored(
                "kickside.core.jobs.service:job_child", "app:processes", { job = job })
            test.is_nil(spawn_err)
            local deadline = time.after("15s")
            local exit_event: any = nil
            while exit_event == nil do
                local selected = channel.select({ events:case_receive(), deadline:case_receive() })
                if selected.channel ~= events then error("execution child did not exit") end
                local event: any = selected.value
                if type(event) == "table" and tostring(event.from) == tostring(child_pid)
                    and event.kind == process.event.EXIT then
                    exit_event = event
                end
            end
            test.is_nil(exit_event.result.error)

            local verify_db, verify_err = get_db()
            test.is_nil(verify_err)
            test.eq(job_row(verify_db, job.id).status, job_types.JOB_STATE.PENDING)
            local run = latest_run(verify_db, job.id)
            test.not_nil(run)
            test.eq(run.status, job_types.RUN_STATE.FAILED)
            test.is_true(tostring(run.error_text):find(dispatch.PROC_TIMEOUT_MARKER, 1, true) ~= nil)
            release_db()
        end)

        test.it("terminates a blocked function child at max_execution", function()
            local db, db_err = get_db()
            test.is_nil(db_err)
            local dbtype = tostring(db:type())
            local thread_id = make_thread(db)
            local id, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                owner_locator = { kind = "test", id = "worker_supervision_test" },
                parked = true,
                thread_id = thread_id,
                job_type = "test.function.child",
                worker_ref = "func://app:generic_job_target",
                priority = 10000,
                payload = { block = true, max_execution_ms = 250 },
            })
            test.is_nil(enqueue_err)
            local job, lease_err = job_fixture.lease_own(db, dbtype, id)
            if not job then error("test job lease fails: " .. tostring(lease_err)) end
            test.is_nil(lease_err)
            test.eq(job.id, id)
            release_db()

            local child_err = worker_child.supervise_job_child(job)
            test.not_nil(child_err)
            test.is_true(tostring(child_err):find(worker_child.PROC_TIMEOUT_MARKER, 1, true) ~= nil)

            local verify_db, verify_err = get_db()
            test.is_nil(verify_err)
            test.eq(job_row(verify_db, id).status, job_types.JOB_STATE.RUNNING)
            release_db()
        end)

        test.it("terminates a proc that exceeds max_execution and retries it", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                -- The target waits on a channel until the supervisor terminates it.
                local job = enqueue_proc_and_claim(db, dbtype, thread_id, { block = true, max_execution_ms = 250 })

                worker.process_job(db, dbtype, "test-pid-" .. uuid.v7(), job :: table)

                -- attempts (1) < max (3): the killed attempt is requeued, not completed.
                test.eq(job_row(db, job.id).status, job_types.JOB_STATE.PENDING)
                local run = latest_run(db, job.id)
                test.not_nil(run)
                test.eq(run.status, job_types.RUN_STATE.FAILED)
                test.is_true(tostring(run.error_text):find(dispatch.PROC_TIMEOUT_MARKER, 1, true) ~= nil)
            end)
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
