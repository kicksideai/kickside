-- worker_ref parse + validate + dispatch coverage. validate runs against the live
-- registry (the test_count_worker function.lua is registered); run invokes it
-- through funcs.call and confirms the returned body patch.

local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local json = require("json")
local time = require("time")
local process = require("process")
local worker = require("worker")
local types = require("types")
local execution_identity = require("execution_identity")

local WORKER_ID = "app:test_count_worker"
local PROC_WORKER_ID = "app:test_proc_worker"

local function with_db(fn: (sql.DB) -> ())
    local db, err = sql.get("app:db")
    if err or not db then
        error("projection worker test: db connect failed: " .. tostring(err))
    end
    local ok, run_err = pcall(fn, db)
    db:release()
    if not ok then
        error(run_err)
    end
end

local function now_string(db): string
    if db:type() == sql.type.SQLITE then
        return time.now():format(time.DATE_TIME)
    end
    return time.now():format(time.RFC3339)
end

-- Insert a thread plus one event carrying raw_body verbatim (as the storage layer
-- writes it -- a JSON string), returning the thread id.
local function thread_with_event(db: sql.DB, raw_body: string): string
    local thread_id = uuid.v7()
    local now = now_string(db)
    local _, terr = sql.builder.insert("kickside_thread")
        :set_map({ id = thread_id, thread_class = "test", component_id = thread_id, event_count = 1, last_event_ts = now })
        :run_with(db):exec()
    if terr then error("make_thread failed: " .. tostring(terr)) end
    local _, eerr = sql.builder.insert("kickside_event")
        :set_map({
            id = uuid.v7(),
            thread_id = thread_id,
            type = "kickside.threads:message.created",
            role = "user",
            body = raw_body,
            seq = 1,
            trace_id = "trace-" .. thread_id,
            run_id = "run-" .. thread_id,
            correlation_key = "kb:test:" .. thread_id,
            created_at = now,
        })
        :run_with(db):exec()
    if eerr then error("make_event failed: " .. tostring(eerr)) end
    return thread_id
end

local function define_tests()
    test.describe("Projection Worker", function()
        test.it("admits the declared post-commit worker with the same owner frame", function()
            local binding = { target_id = "app:commit_probe_worker", actor_id = "owner", actor_context = "stored-v2", system_identity = false }
            local hook, err = worker.post_commit_binding(binding)
            test.is_nil(err)
            test.eq(hook.target_id, "app:commit_probe_notify")
            test.eq(hook.actor_id, binding.actor_id)
            test.eq(hook.actor_context, binding.actor_context)
            test.eq(hook.system_identity, false)
            local absent, absent_err = worker.post_commit_binding({ target_id = WORKER_ID })
            test.is_nil(absent)
            test.is_nil(absent_err)
        end)

        test.it("rejects proc, private, scoped and undeclared post-commit targets", function()
            for _, name in ipairs({ "commit_proc_hook", "commit_private_hook", "commit_scoped_hook", "commit_undeclared_hook" }) do
                local hook, err = worker.post_commit_binding({ target_id = "app:" .. name, system_identity = false })
                test.is_nil(hook)
                test.not_nil(err)
            end
        end)

        test.it("parses a func:// ref into runtime + target", function()
            local binding, err = worker.parse("func://" .. WORKER_ID, true)
            test.is_nil(err)
            test.not_nil(binding)
            test.eq((binding :: table).worker_runtime, types.WORKER_RUNTIME.FUNC)
            test.eq((binding :: table).target_id, WORKER_ID)
            test.eq((binding :: table).worker_ref, "func://" .. WORKER_ID)
        end)

        test.it("parses a proc:// ref", function()
            local binding, err = worker.parse("proc://some.ns:proc", true)
            test.is_nil(err)
            test.eq((binding :: table).worker_runtime, types.WORKER_RUNTIME.PROC)
        end)

        test.it("treats an empty optional ref as no binding, no error", function()
            local binding, err = worker.parse("", false)
            test.is_nil(err)
            test.is_nil(binding)
        end)

        test.it("rejects an empty required ref", function()
            local binding, err = worker.parse("", true)
            test.is_nil(binding)
            test.not_nil(err)
            test.eq((err :: any):kind(), errors.INVALID)
        end)

        test.it("rejects a ref with an unsupported scheme", function()
            local binding, err = worker.parse("http://x", true)
            test.is_nil(binding)
            test.not_nil(err)
            test.eq((err :: any):kind(), errors.INVALID)
        end)

        test.it("rejects a bare id with no scheme", function()
            local binding, err = worker.parse("just.an:id", true)
            test.is_nil(binding)
            test.not_nil(err)
        end)

        test.it("validates a registered function.lua worker", function()
            local binding = worker.parse("func://" .. WORKER_ID, true)
            local validated, err = worker.validate(binding :: table)
            test.is_nil(err)
            test.not_nil(validated)
            test.eq((validated :: table).worker_runtime, types.WORKER_RUNTIME.FUNC)
        end)

        test.it("refuses private and configured-security targets at dispatch", function()
            for _, target in ipairs({ "app:test_private_projection_worker", "app:test_actor_projection_worker",
                "app:test_scoped_projection_worker" }) do
                local binding = worker.parse("func://" .. target, true)
                local output, err = worker.run(binding :: table, {})
                test.is_nil(output)
                test.not_nil(err)
                test.eq((err :: any):kind(), errors.PERMISSION_DENIED)
            end
            local proc_binding = worker.parse("proc://app:test_private_proc_projection_worker", true)
            local output, err = worker.run_proc_supervised(proc_binding :: table, {}, { proc_host = "app:processes" })
            test.is_nil(output)
            test.not_nil(err)
            test.eq((err :: any):kind(), errors.PERMISSION_DENIED)
        end)

        test.it("refuses an unmarked function worker", function()
            local binding = worker.parse("func://app:test_gate", true)
            local validated, err = worker.validate(binding :: table)
            test.is_nil(validated)
            test.not_nil(err)
            test.eq((err :: any):kind(), errors.INVALID)
        end)

        test.it("rejects the lifecycle reaper as a public projection worker", function()
            local binding, parse_err = worker.parse("func://kickside.core.lifecycle:reaper", true)
            test.is_nil(parse_err)
            local validated, validate_err = worker.validate(binding :: table)
            test.is_nil(validated)
            test.not_nil(validate_err)
            test.eq((validate_err :: any):kind(), errors.PERMISSION_DENIED)

            local system_validated, system_err = worker.validate(binding :: table, true)
            test.is_nil(system_err)
            test.not_nil(system_validated)
        end)

        test.it("fails validation for a missing target", function()
            local binding = worker.parse("func://kickside.core.projections:does_not_exist", true)
            local validated, err = worker.validate(binding :: table)
            test.is_nil(validated)
            test.not_nil(err)
            test.eq((err :: any):kind(), errors.NOT_FOUND)
        end)

        test.it("fails validation on a runtime/kind mismatch", function()
            -- The target is a function.lua, but the ref declares proc://.
            local binding = worker.parse("proc://" .. WORKER_ID, true)
            local validated, err = worker.validate(binding :: table)
            test.is_nil(validated)
            test.not_nil(err)
            test.eq((err :: any):kind(), errors.INVALID)
        end)

        test.it("blocks a daemon proc target", function()
            test.is_true(worker.is_blocked_daemon("kickside.core.jobs.service:worker"))
            test.is_false(worker.is_blocked_daemon(WORKER_ID))
        end)

        test.it("runs a func:// worker and returns its body patch", function()
            local binding = worker.parse("func://" .. WORKER_ID, true)
            local output, err = worker.run(binding :: table, {
                projection = { body = { stats = { count = 2 } } },
                range = { processed_count = 3, to_seq = 5 },
            })
            test.is_nil(err)
            test.not_nil(output)
            test.eq((output :: table).last_seq, 5)
            test.eq((output :: table).body.stats.count, 5)
        end)

        test.it("rejects a proc:// binding on the inline run path", function()
            local binding = {
                worker_ref = "proc://" .. PROC_WORKER_ID,
                worker_runtime = types.WORKER_RUNTIME.PROC,
                target_id = PROC_WORKER_ID,
            }
            local output, err = worker.run(binding, {
                projection = { body = { stats = { count = 2 } } },
                range = { processed_count = 3, to_seq = 5 },
            })
            test.is_nil(output)
            test.not_nil(err)
            test.eq((err :: any):kind(), errors.INVALID)
        end)

        test.it("runs a proc:// worker under its stored identity resolved live via the supervised path", function()
            local actor_id = "proc-owner@example.test"
            local row, row_err = execution_identity.to_row({
                version = 2,
                principal = { kind = "user", id = actor_id },
                authorized_by = { kind = "user", id = actor_id },
                captured_at = "2026-01-01T00:00:00Z",
            })
            test.is_nil(row_err)
            local binding = {
                worker_ref = "proc://" .. PROC_WORKER_ID,
                worker_runtime = types.WORKER_RUNTIME.PROC,
                target_id = PROC_WORKER_ID,
                actor_id = (row :: any).actor_id,
                actor_context = (row :: any).actor_context,
            }
            local output, err = worker.run_proc_supervised(binding, {
                projection = { body = { stats = { count = 2 } } },
                range = { processed_count = 3, to_seq = 5 },
            }, {
                proc_host = "app:processes",
            })
            test.is_nil(err)
            test.not_nil(output)
            test.eq((output :: table).body.stats.count, 5)
            test.eq((output :: table).body.proc_actor_id, actor_id)
            test.eq((output :: table).body.proc_actor_user_id, actor_id)
            test.is_true((output :: table).body.proc_has_scope)
        end)

        test.it("preserves the supervising caller's process options", function()
            local before = process.get_options()
            local _, setup_err = process.set_options({ trap_links = false })
            test.is_nil(setup_err)
            local binding = {
                worker_ref = "proc://" .. PROC_WORKER_ID,
                worker_runtime = types.WORKER_RUNTIME.PROC,
                target_id = PROC_WORKER_ID,
            }
            local output, err = worker.run_proc_supervised(binding, {
                projection = { body = { stats = { count = 2 } } },
                range = { processed_count = 3, to_seq = 5 },
            }, { proc_host = "app:processes" })
            local after = process.get_options()
            local _, restore_err = process.set_options(before)
            test.is_nil(restore_err)
            test.is_nil(err)
            test.not_nil(output)
            test.eq(after.trap_links, false)
        end)

        test.it("surfaces a proc worker's returned error instead of an empty successful batch", function()
            local binding = {
                worker_ref = "proc://app:test_refusing_proc_worker",
                worker_runtime = types.WORKER_RUNTIME.PROC,
                target_id = "app:test_refusing_proc_worker",
            }
            local output, err = worker.run_proc_supervised(binding, {
                projection = { body = {} },
                range = { processed_count = 1, to_seq = 1 },
            }, { proc_host = "app:processes" })
            test.is_nil(output)
            test.not_nil(err)
            test.eq((err :: any):kind(), errors.INTERNAL)
            test.contains(tostring(err), "worker refused the batch")
        end)

        -- query_event_rows is the prefetch boundary: a worker reads event.body as a
        -- structured table, so the stored JSON-string body must be decoded here. A
        -- raw string would force every worker to re-decode (and silently fold an
        -- empty body when it forgets), so the engine decodes once.
        test.it("decodes each prefetched event body from its stored JSON string into a table", function()
            with_db(function(db)
                local thread_id = thread_with_event(db, json.encode({ kind = "skill.created", body = "# Title\nText", version = 3 }))
                local rows, err = worker.query_event_rows(db, thread_id, 1, 10, 100)
                test.is_nil(err)
                test.not_nil(rows)
                test.eq(#(rows :: table[]), 1)
                local ev = (rows :: table[])[1]
                test.eq(type(ev.body), "table")
                test.eq((ev.body :: any).kind, "skill.created")
                test.eq((ev.body :: any).body, "# Title\nText")
                test.eq((ev.body :: any).version, 3)
                test.eq(ev.trace_context.trace_id, "trace-" .. thread_id)
                test.eq(ev.trace_context.run_id, "run-" .. thread_id)
                test.eq(ev.trace_context.correlation_key, "kb:test:" .. thread_id)
                test.is_nil(ev.trace_id)
            end)
        end)

        test.it("refuses an undecodable event body instead of folding an empty replacement", function()
            with_db(function(db)
                for _, body in ipairs({ "false", "7", '"text"', "null" }) do
                    local thread_id = thread_with_event(db, body)
                    local rows, err = worker.query_event_rows(db, thread_id, 1, 10, 100)
                    test.is_nil(rows)
                    test.is_true(errors.is(err, errors.INTERNAL))
                    test.eq(err:details().field, "kickside_event.body")
                end
                local thread_id = thread_with_event(db, "{}")
                local _, insert_err = db:execute("INSERT INTO kickside_event (id,thread_id,type,role,body,seq) VALUES ($1,$2,'test:event','user',$3,2)",
                    { uuid.v7(), thread_id, "not valid json" })
                if tostring(db:type()) == sql.type.POSTGRES then
                    test.not_nil(insert_err)
                else
                    test.is_nil(insert_err)
                    local rows, err = worker.query_event_rows(db, thread_id, 1, 10, 100)
                    test.is_nil(rows)
                    test.is_true(errors.is(err, errors.INTERNAL))
                    test.eq(err:details().field, "kickside_event.body")
                end
            end)
        end)

    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    local _, trap_err = process.set_options({ trap_links = true })
    if trap_err then return nil, trap_err end
    return run_cases(options)
end

return { run = run }
