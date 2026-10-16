-- Real loop exit, registry movement, crash recovery, and heartbeat refresh.
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local time = require("time")
local process = require("process")
local channel = require("channel")
local registry = require("registry")
local events = require("events")
local logger = require("logger")
local job_types = require("job_types")
local reclaim = require("reclaim")
local lifecycle = require("lifecycle")
local job_fixture = require("job_fixture")
local worker_child = require("worker_child")
local worker_heartbeat = require("worker_heartbeat")
local jobs = require("jobs")

local function make_thread(db: sql.DB): string
    local id = uuid.v7()
    sql.builder.insert("kickside_thread"):set_map({ id = id, thread_class = "test", component_id = id }):run_with(db):exec()
    return id
end

local function job_row(db, id): table?
    local rows = sql.builder.select("status", "lease_token", "attempts", "scheduled_at", "wake_enabled")
        :from("kickside_job"):where(sql.builder.eq({ id = id })):run_with(db):query()
    return rows and rows[1] or nil
end

local function latest_run(db, job_id): table?
    local rows = sql.builder.select("status", "attempt_no", "error_text", "result_json")
        :from("kickside_job_run"):where(sql.builder.eq({ job_id = job_id }))
        :order_by("attempt_no DESC"):limit(1):run_with(db):query()
    return rows and rows[1] or nil
end

local function define_tests()
        local function wait_for_exit(events, pid)
            local deadline = time.after("15s")
            while true do
                local selected = channel.select({ events:case_receive(), deadline:case_receive() })
                if selected.channel ~= events then
                    error("loop did not exit for " .. tostring(pid))
                end
                local event = selected.value
                if type(event) == "table" and tostring(event.from) == tostring(pid)
                    and event.kind == process.event.EXIT then
                    return
                end
            end
        end


    test.describe("jobs.worker loop lifecycle", function()
        local cleanup_version: any? = nil
        local keeper_to_release: any? = nil
        test.after_each(function()
            if cleanup_version then
                local _, restore_err = registry.apply_version(cleanup_version)
                test.is_nil(restore_err)
                cleanup_version = nil
            end
            if keeper_to_release then keeper_to_release:release(); keeper_to_release = nil end
        end)

        local function describe_rows(rows: table, fields: { string }): string
            local descriptions: { string } = {}
            for _, row in ipairs(rows) do
                local values: { string } = {}
                for _, field in ipairs(fields) do
                    values[#values + 1] = field .. "=" .. tostring(row[field])
                end
                descriptions[#descriptions + 1] = "{" .. table.concat(values, ",") .. "}"
            end
            return table.concat(descriptions, ";")
        end

        -- claim_probe enqueues a probe job and returns the slot loop that
        -- claimed it: its registry version is the claim-time version, and its
        -- pulse is fresh at that version.
        local function claim_probe(version_id: string): string
            local topic = "jobs.service.probe." .. uuid.v7()
            local signal = process.listen(topic, { message = true })
            local queued, enqueue_err = jobs.enqueue({ namespace = "jobs-service-test", scope = "process",
                owner_locator = { kind = "test", id = "loop_test" },
                key = uuid.v7(), job_type = "app:live_job_probe",
                immutable_payload = { reply_pid = tostring(process.pid()), reply_topic = topic } })
            test.is_nil(enqueue_err)
            test.not_nil(queued)
            local selected = channel.select({ signal:case_receive(), time.after("15s"):case_receive() })
            process.unlisten(signal)
            if selected.channel ~= signal then
                local diagnostic, diagnostic_err = sql.get("app:db")
                if not diagnostic then error("test database unavailable: " .. tostring(diagnostic_err)) end
                test.is_nil(diagnostic_err)
                test.not_nil(diagnostic)
                local services, services_err = diagnostic:query("SELECT pid,started_version FROM jobs_service_probe")
                local jobs_rows, jobs_err = diagnostic:query(
                    "SELECT id,status,scheduled_at,execution_seq,last_error FROM kickside_job WHERE id=$1", { queued.id })
                local workers, workers_err = diagnostic:query("SELECT w.id,w.current_job_id,p.registry_version,p.last_seen_at"
                    .. " FROM kickside_job_worker w JOIN kickside_job_worker_pulse p ON p.worker_id=w.id ORDER BY w.id")
                local runs, runs_err = diagnostic:query(
                    "SELECT status,error_text,execution_seq FROM kickside_job_run WHERE job_id=$1", { queued.id })
                diagnostic:release()
                test.is_nil(services_err)
                test.is_nil(jobs_err)
                test.is_nil(workers_err)
                test.is_nil(runs_err)
                error("no slot claimed the probe at version " .. version_id
                    .. "; services=" .. describe_rows(services, { "pid", "started_version" })
                    .. "; job=" .. describe_rows(jobs_rows, { "id", "status", "scheduled_at", "execution_seq", "last_error" })
                    .. "; workers=" .. describe_rows(workers, { "id", "current_job_id", "registry_version", "last_seen_at" })
                    .. "; runs=" .. describe_rows(runs, { "status", "error_text", "execution_seq" }))
            end
            local event = selected.value
            test.eq(event:topic(), topic)
            local data = event:payload():data()
            test.eq(data.job_id, queued.id)
            test.eq(tostring(data.registry_version), version_id)
            local slot_id = tostring(data.worker_id)
            local db, db_err = sql.get("app:db")
            if not db then error("test database unavailable: " .. tostring(db_err)) end
            test.is_nil(db_err)
            local heart, heart_err = db:query("SELECT registry_version FROM kickside_job_worker_pulse WHERE worker_id=$1", { slot_id })
            test.is_nil(heart_err)
            test.eq(tostring(heart[1].registry_version), version_id)
            db:release()
            test.is_true(type(data.sender_pid) == "string" and data.sender_pid ~= "")
            test.is_true(type(data.ack_topic) == "string" and data.ack_topic ~= "")
            local _, ack_err = process.send(data.sender_pid, data.ack_topic, { job_id = queued.id })
            test.is_nil(ack_err)
            return slot_id
        end

        -- wait_for_probe_version returns the test-owned pool root started at
        -- version_id (other than exclude_id) once one of its slots claimed a
        -- probe at that version. The module's own worker service is disabled
        -- here, so the claiming slot belongs to this root.
        local function wait_for_probe_version(version_id: string, exclude_id: string?): table
            claim_probe(version_id)
            local db, db_err = sql.get("app:db")
            if not db then error("test database unavailable: " .. tostring(db_err)) end
            test.is_nil(db_err)
            local probes, probe_err = db:query("SELECT pid FROM jobs_service_probe WHERE started_version=$1 AND pid<>$2"
                .. " ORDER BY stamp DESC LIMIT 1", { version_id, tostring(exclude_id or "") })
            db:release()
            test.is_nil(probe_err)
            test.eq(#probes, 1)
            return { id = tostring(probes[1].pid), registry_version = version_id }
        end

        local function wait_for_proc_end(events, pid)
            local deadline = time.after("15s")
            while true do
                local selected = channel.select({ events:case_receive(), deadline:case_receive() })
                if selected.channel ~= events then
                    error("process did not end for " .. tostring(pid))
                end
                local event = selected.value
                if type(event) == "table" and tostring(event.from) == tostring(pid)
                    and (event.kind == process.event.EXIT
                        or string.find(string.lower(tostring((event :: any).kind or "")), "exit", 1, true) ~= nil) then
                    return
                end
            end
        end

        local function probe_row_count(): integer
            local db, db_err = sql.get("app:db")
            if not db then error("test database unavailable: " .. tostring(db_err)) end
            test.is_nil(db_err)
            local rows = sql.builder.select("pid"):from("jobs_service_probe"):run_with(db):query()
            db:release()
            return rows and #rows or 0
        end

        local function fresh_service_entry(comment: string): table
            return {
                id = "app:jobs_service_restart_probe",
                kind = "process.service",
                meta = { comment = comment },
                data = {
                    process = "app:jobs_service_probe_loop", host = "app:processes",
                    lifecycle = {
                        auto_start = true,
                        restart = { initial_delay = "2s", max_delay = "2s", max_attempts = 30 },
                        security = { groups = { "wippy.security:process" } },
                    },
                },
            }
        end

        test.it("stops a cancelled starting loop before it reports idle", function()
            local idle = process.listen("kickside.core.jobs:worker_idle")
            local lifecycle_events = process.events()
            local pid, spawn_err = process.spawn_monitored("app:jobs_cancelled_loop", "app:processes",
                { dispatcher_pid = tostring(process.pid()) })
            test.is_nil(spawn_err)
            wait_for_exit(lifecycle_events, tostring(pid))
            local notice = channel.select({ idle:case_receive(), default = true })
            process.unlisten(idle)
            test.is_true(notice.default, "a cancelled starting loop does not offer itself to the dispatcher")
        end)

        test.it("keeps an idle slot on the commit of the version it runs and recycles on a newer version", function()
            local idle = process.listen("kickside.core.jobs:worker_idle")
            local lifecycle_events = process.events()
            local original_version, original_err = registry.current_version()
            test.is_nil(original_err)
            local pid, spawn_err = process.spawn_monitored(job_types.LOOP_PROCESS_ID, "app:processes",
                { dispatcher_pid = tostring(process.pid()) })
            test.is_nil(spawn_err)
            local reported = channel.select({ idle:case_receive(), time.after("15s"):case_receive() })
            process.unlisten(idle)
            test.eq(reported.channel, idle, "the loop does not report idle")
            test.eq(reported.value.worker_id, tostring(pid))
            test.eq(reported.value.version, tostring(original_version:id()))

            -- A registry commit is published after its version becomes current,
            -- so a loop that started at that version still receives it.
            local sent, send_err = events.send("registry", "registry.commit", "registry.tx/loop-test/registry.commit", nil)
            test.is_nil(send_err)
            test.is_true(sent)
            local early = channel.select({ lifecycle_events:case_receive(), time.after("1s"):case_receive() })
            local exited_early = early.channel == lifecycle_events and type(early.value) == "table"
                and tostring(early.value.from) == tostring(pid) and early.value.kind == process.event.EXIT
            if exited_early then
                test.is_false(exited_early, "an idle loop recycled on the commit of the version it already runs")
                return
            end

            local snapshot, snapshot_err = registry.snapshot()
            test.is_nil(snapshot_err)
            local changes = snapshot:changes()
            changes:create({ id = "app:loop_version_probe_" .. uuid.v7():gsub("-", "_"), kind = "registry.entry",
                meta = { comment = "Test-owned registry version advance" }, data = {} })
            cleanup_version = original_version
            local _, apply_err = changes:apply()
            test.is_nil(apply_err)
            wait_for_exit(lifecycle_events, tostring(pid))
        end)

        test.it("drives a live jobs process.service through mutation, kill, and entry restart", function()
            local db, db_err = sql.get("app:db")
            if not db then error("test database unavailable: " .. tostring(db_err)) end
            test.is_nil(db_err)
            local _, table_err = db:execute([[CREATE TABLE jobs_service_probe (stamp TEXT PRIMARY KEY, pid TEXT NOT NULL UNIQUE, started_version TEXT)]])
            test.is_nil(table_err)
            -- Keep the harness's in-memory SQLite database alive while the
            -- service is torn down and recreated between registry versions.
            local keeper_db = db
            keeper_to_release = keeper_db

            local original_version, original_err = registry.current_version()
            test.is_nil(original_err)
            cleanup_version = original_version

            -- Mutation creates the service: the supervisor starts the probe loop
            -- at the new registry version with a fresh worker heartbeat.
            local snapshot, snapshot_err = registry.snapshot()
            test.is_nil(snapshot_err)
            local changes = snapshot:changes()
            changes:create(fresh_service_entry("Test-owned jobs service restart probe"))
            local service_version, service_err = changes:apply()
            test.is_nil(service_err)
            local first = wait_for_probe_version(tostring(service_version:id()), nil)
            local proc_events = process.events()
            local _, monitor_err = process.monitor(first.id)
            test.is_nil(monitor_err)

            -- Kill restarts the entry: terminating the probe is followed by a
            -- supervisor respawn at the same registry version.
            process.terminate(first.id)
            wait_for_proc_end(proc_events, first.id)
            local second = wait_for_probe_version(tostring(service_version:id()), first.id)
            test.is_true(second.id ~= first.id)
            test.eq(second.registry_version, tostring(service_version:id()))
            local _, monitor_err2 = process.monitor(second.id)
            test.is_nil(monitor_err2)

            -- A registry mutation reaches the live service: the upgradable pool
            -- root keeps running while its slot loops recycle and claim at the
            -- new version.
            local snap2, snap_err2 = registry.snapshot()
            test.is_nil(snap_err2)
            local bump = snap2:changes()
            bump:update(fresh_service_entry("Test-owned jobs service replacement probe"))
            local changed_version, apply_err = bump:apply()
            test.is_nil(apply_err)
            claim_probe(tostring(changed_version:id()))
            test.eq(probe_row_count(), 2)

            -- Deleting the entry stops resurrection: restoring the original
            -- version removes the probe service and starts nothing new.
            local removed, remove_err = registry.apply_version(original_version)
            test.is_nil(remove_err)
            test.is_true(removed)
            test.is_nil((registry.get("app:jobs_service_restart_probe")))
            wait_for_proc_end(proc_events, second.id)
            local absent_topic = "jobs.service.absent." .. uuid.v7()
            local absent = process.listen(absent_topic, { message = true })
            local absent_job, absent_err = jobs.enqueue({ namespace = "jobs-service-test", scope = "process",
                owner_locator = { kind = "test", id = "loop_test" },
                key = uuid.v7(), job_type = "app:live_job_probe",
                immutable_payload = { reply_pid = tostring(process.pid()), reply_topic = absent_topic } })
            test.is_nil(absent_err)
            local no_reply = channel.select({ absent:case_receive(), time.after("3s"):case_receive() })
            test.is_true(no_reply.channel ~= absent, "deleted service claimed a probe")
            process.unlisten(absent)
            local _, cancel_err = jobs.cancel(absent_job.id)
            test.is_nil(cancel_err)
            test.eq(probe_row_count(), 2)

            -- Recreating the entry restarts it: the probe runs again at the new
            -- version with a fresh heartbeat, under a different process.
            local snap3, snap_err3 = registry.snapshot()
            test.is_nil(snap_err3)
            local recreate = snap3:changes()
            recreate:create(fresh_service_entry("Test-owned jobs service recreated probe"))
            local recreated_version, recreate_err = recreate:apply()
            test.is_nil(recreate_err)
            local third = wait_for_probe_version(tostring(recreated_version:id()), second.id)
            test.is_true(third.id ~= second.id)
            test.eq(third.registry_version, tostring(recreated_version:id()))
            local _, monitor_err3 = process.monitor(third.id)
            test.is_nil(monitor_err3)

            -- Restoring the original version tears the probe down again, and the
            -- probe table is dropped so later suites see a clean database.
            local restored, restore_err = registry.apply_version(original_version)
            test.is_nil(restore_err)
            test.is_true(restored)
            test.is_nil((registry.get("app:jobs_service_restart_probe")))
            wait_for_proc_end(proc_events, third.id)
            local cleanup, cleanup_err = sql.get("app:db")
            if not cleanup then error("test database unavailable: " .. tostring(cleanup_err)) end
            test.is_nil(cleanup_err)
            local _, drop_err = cleanup:execute([[DROP TABLE jobs_service_probe]])
            test.is_nil(drop_err)
            cleanup:release()
            keeper_db:release()
            keeper_to_release = nil
            cleanup_version = nil
        end)
    end)

    test.describe("jobs.worker hot upgrade", function()
        local function open_db(): sql.DB
            local db, db_err = sql.get("app:db")
            if not db then error("test database unavailable: " .. tostring(db_err)) end
            return db
        end

        local function rows_text(list: any, fields: { string }): string
            local out: { string } = {}
            for _, row in ipairs(list or {}) do
                local values: { string } = {}
                for _, field in ipairs(fields) do values[#values + 1] = field .. "=" .. tostring(row[field]) end
                out[#out + 1] = "{" .. table.concat(values, ",") .. "}"
            end
            return table.concat(out, ";")
        end

        local active: table? = nil

        -- start_upgrade_service starts a test-owned pool service on the
        -- module's worker code with every pre-existing pending job parked.
        local function start_upgrade_service(): table
            local db, db_err = sql.get("app:db")
            if not db then error("test database unavailable: " .. tostring(db_err)) end
            local _, table_err = db:execute([[CREATE TABLE jobs_service_probe (stamp TEXT PRIMARY KEY, pid TEXT NOT NULL, started_version TEXT)]])
            test.is_nil(table_err)
            local pending, pending_err = db:query("SELECT id,scheduled_at FROM kickside_job WHERE status='pending' AND scheduled_at IS NOT NULL")
            test.is_nil(pending_err)
            local _, park_err = db:execute("UPDATE kickside_job SET scheduled_at=NULL WHERE status='pending'")
            test.is_nil(park_err)
            db:release()
            local original_version, original_err = registry.current_version()
            test.is_nil(original_err)
            local snapshot, snapshot_err = registry.snapshot()
            test.is_nil(snapshot_err)
            local changes = snapshot:changes()
            changes:create({
                id = "app:jobs_service_upgrade_probe", kind = "process.service",
                meta = { comment = "Test-owned jobs service hot-upgrade probe" },
                data = {
                    process = "app:jobs_service_probe_loop", host = "app:processes",
                    lifecycle = {
                        auto_start = true,
                        restart = { initial_delay = "1s", max_delay = "1s", max_attempts = 30 },
                        security = { groups = { "wippy.security:process" } },
                    },
                },
            })
            local service_version, service_err = changes:apply()
            test.is_nil(service_err)
            active = { pending = pending, original_version = original_version, service_version = service_version }
            return active :: table
        end

        local function stop_upgrade_service(started: table): ()
            local running = open_db()
            local roots, root_err = running:query("SELECT DISTINCT pid FROM jobs_service_probe")
            test.is_nil(root_err)
            running:release()
            local proc_events = process.events()
            for _, root in ipairs(roots or {}) do
                local _, monitor_err = process.monitor(tostring(root.pid))
                test.is_nil(monitor_err)
            end
            local restored, restore_err = registry.apply_version(started.original_version)
            test.is_nil(restore_err)
            test.is_true(restored)
            for _, root in ipairs(roots or {}) do wait_for_exit(proc_events, tostring(root.pid)) end
            active = nil
            local cleanup, cleanup_err = sql.get("app:db")
            if not cleanup then error("test database unavailable: " .. tostring(cleanup_err)) end
            local _, drop_err = cleanup:execute([[DROP TABLE jobs_service_probe]])
            test.is_nil(drop_err)
            for _, row in ipairs(started.pending) do
                local _, unpark_err = cleanup:execute("UPDATE kickside_job SET scheduled_at=$1 WHERE id=$2 AND status='pending'",
                    { row.scheduled_at, row.id })
                test.is_nil(unpark_err)
            end
            cleanup:release()
        end

        test.after_each(function()
            if active then stop_upgrade_service(active :: table) end
        end)

        local function enqueue_probe(topic: string, extra: table?): table
            local payload: table = { reply_pid = tostring(process.pid()), reply_topic = topic }
            for key, value in pairs(extra or {}) do payload[key] = value end
            local queued, enqueue_err = jobs.enqueue({ namespace = "jobs-service-test", scope = "upgrade",
                owner_locator = { kind = "test", id = "loop_test" },
                key = uuid.v7(), job_type = "app:live_job_probe", max_attempts = 1,
                immutable_payload = payload })
            test.is_nil(enqueue_err)
            return queued :: table
        end

        local function await_signal(signal: any, label: string, job_id: string): table
            local selected = channel.select({ signal:case_receive(), time.after("15s"):case_receive() })
            if selected.channel ~= signal then
                local diagnostic = open_db()
                local rows, row_err = diagnostic:query("SELECT status,last_error,lease_until,execution_seq FROM kickside_job WHERE id=$1", { job_id })
                test.is_nil(row_err)
                local roots, root_err = diagnostic:query("SELECT pid,started_version FROM jobs_service_probe ORDER BY stamp")
                test.is_nil(root_err)
                local runs, run_err = diagnostic:query("SELECT status,worker_pid,started_at,finished_at,error_text FROM kickside_job_run WHERE job_id=$1", { job_id })
                test.is_nil(run_err)
                local owners, owner_err = diagnostic:query("SELECT w.id,w.current_job_id,p.registry_version,p.last_seen_at FROM kickside_job_worker w LEFT JOIN kickside_job_worker_pulse p ON p.worker_id=w.id WHERE w.current_job_id=$1", { job_id })
                test.is_nil(owner_err)
                diagnostic:release()
                error(label .. " did not run; job=" .. rows_text(rows, { "status", "last_error", "lease_until", "execution_seq" })
                    .. "; roots=" .. rows_text(roots, { "pid", "started_version" })
                    .. "; runs=" .. rows_text(runs, { "status", "worker_pid", "started_at", "finished_at", "error_text" })
                    .. "; owners=" .. rows_text(owners, { "id", "current_job_id", "registry_version", "last_seen_at" }))
            end
            return selected.value:payload():data()
        end

        -- upgrade_worker_code commits one registry version that changes the
        -- pool root's and the slot loops' code graph.
        local function upgrade_worker_code(): any
            local upgrade_snapshot, upgrade_snapshot_err = registry.snapshot()
            test.is_nil(upgrade_snapshot_err)
            local upgrade = upgrade_snapshot:changes()
            for _, id in ipairs({ "app:jobs_service_probe_loop", "kickside.core.jobs.service:loop" }) do
                local entry, entry_err = registry.get(id)
                test.is_nil(entry_err)
                local meta = entry.meta or {}
                meta.comment = tostring(meta.comment or "") .. " (upgraded)"
                upgrade:update({ id = id, kind = entry.kind, meta = meta, data = entry.data })
            end
            local upgraded_version, upgrade_err = upgrade:apply()
            test.is_nil(upgrade_err)
            return upgraded_version
        end

        test.it("finishes an in-flight execution exactly once under its old code while new work runs on the new code", function()
            local started = start_upgrade_service()
            local service_version = started.service_version

            -- An execution is in flight when the upgrade lands: the probe has
            -- reported its claim and waits for an acknowledgment.
            local in_flight_topic = "jobs.upgrade.inflight." .. uuid.v7()
            local in_flight_signal = process.listen(in_flight_topic, { message = true })
            local in_flight = enqueue_probe(in_flight_topic)
            local first = await_signal(in_flight_signal, "the in-flight probe", in_flight.id)
            test.eq(tostring(first.registry_version), tostring(service_version:id()))

            local log_subscription, log_err = events.subscribe("logs", "logs.entry")
            test.is_nil(log_err)
            local log_channel = log_subscription:channel()
            local start_boundary = "jobs upgrade log start " .. uuid.v7()
            logger:info(start_boundary)
            local start_deadline = time.after("5s")
            while true do
                local selected = channel.select({ log_channel:case_receive(), start_deadline:case_receive() })
                test.is_true(selected.channel == log_channel, "upgrade log start does not arrive")
                if selected.value.data.entry.message == start_boundary then break end
            end
            local upgraded_version = upgrade_worker_code()

            -- Work queued after the commit runs on the new code in another slot
            -- while the in-flight execution is still unacknowledged.
            local queued_topic = "jobs.upgrade.queued." .. uuid.v7()
            local queued_signal = process.listen(queued_topic, { message = true })
            local queued = enqueue_probe(queued_topic)
            local second = await_signal(queued_signal, "work queued after the upgrade", queued.id)
            test.eq(tostring(second.registry_version), tostring(upgraded_version:id()))
            test.is_true(tostring(second.worker_id) ~= tostring(first.worker_id))
            local _, queued_ack_err = process.send(second.sender_pid, second.ack_topic, { job_id = queued.id })
            test.is_nil(queued_ack_err)

            -- The in-flight execution was never interrupted: its original
            -- process takes the acknowledgment and completes.
            local _, ack_err = process.send(first.sender_pid, first.ack_topic, { job_id = in_flight.id })
            test.is_nil(ack_err)
            local settle_deadline = time.now():add(15 * time.SECOND)
            local settled: table? = nil
            while time.now():before(settle_deadline) do
                local check = open_db()
                local rows = check:query("SELECT status,execution_seq FROM kickside_job WHERE id=$1", { in_flight.id })
                check:release()
                if rows and rows[1] and rows[1].status ~= "running" and rows[1].status ~= "pending" then
                    settled = rows[1]
                    break
                end
                time.sleep("50ms")
            end
            test.not_nil(settled, "the in-flight execution never settled")
            test.eq((settled :: table).status, job_types.JOB_STATE.DONE)
            test.eq(tonumber((settled :: table).execution_seq), tonumber(first.execution_seq))
            local repeated = channel.select({ in_flight_signal:case_receive(), time.after("2s"):case_receive() })
            test.is_true(repeated.channel ~= in_flight_signal, "the in-flight execution ran its effect twice")
            process.unlisten(in_flight_signal)
            process.unlisten(queued_signal)

            local check, check_err = sql.get("app:db")
            if not check then error("test database unavailable: " .. tostring(check_err)) end
            local runs = check:query("SELECT status,execution_seq FROM kickside_job_run WHERE job_id=$1", { in_flight.id })
            test.eq(#runs, 1, "the in-flight job recorded " .. tostring(#runs) .. " runs: " .. rows_text(runs, { "status", "execution_seq" }))
            test.eq(runs[1].status, "completed")
            local roots = check:query("SELECT pid FROM jobs_service_probe WHERE started_version=$1",
                { tostring(upgraded_version:id()) })
            local old_roots = check:query("SELECT pid FROM jobs_service_probe WHERE started_version=$1",
                { tostring(service_version:id()) })
            local all_roots = check:query("SELECT pid,started_version FROM jobs_service_probe ORDER BY stamp")
            check:release()
            local roots_text = "upgraded=" .. tostring(upgraded_version:id()) .. " roots="
                .. rows_text(all_roots, { "pid", "started_version" })

            local boundary = "jobs upgrade log boundary " .. uuid.v7()
            logger:info(boundary)
            local log_deadline = time.after("5s")
            local error_logs: { string } = {}
            local observed = 0
            while true do
                local selected = channel.select({ log_channel:case_receive(), log_deadline:case_receive() })
                test.is_true(selected.channel == log_channel, "upgrade log boundary does not arrive")
                local entry = selected.value.data.entry
                if entry.message == boundary then break end
                observed = observed + 1
                if entry.level >= 2 then error_logs[#error_logs + 1] = entry.message end
            end
            log_subscription:close()
            stop_upgrade_service(started)

            test.is_true(observed > 0, "the hot upgrade emits observable runtime logs")
            test.eq(#error_logs, 0, table.concat(error_logs, "\n"))
            test.eq(#roots, 1, roots_text)
            test.eq(#old_roots, 1, roots_text)
            test.eq(roots[1].pid, old_roots[1].pid, "the runtime upgrades the supervised root in place")
        end)

        test.it("drains an in-flight execution up to its own max_execution ceiling", function()
            local started = start_upgrade_service()
            local topic = "jobs.upgrade.ceiling." .. uuid.v7()
            local signal = process.listen(topic, { message = true })
            local ceiling_ms = 3000
            local probe = enqueue_probe(topic, { max_execution_ms = ceiling_ms })
            local first = await_signal(signal, "the ceiling probe", probe.id)
            local claimed_at = time.now()
            upgrade_worker_code()

            -- The probe is never acknowledged. The upgrade does not end it; its
            -- declared ceiling does, through the ordinary timeout termination.
            local settle_deadline = time.now():add(20 * time.SECOND)
            local settled: table? = nil
            while time.now():before(settle_deadline) do
                local check = open_db()
                local rows = check:query("SELECT status,last_error,execution_seq FROM kickside_job WHERE id=$1", { probe.id })
                check:release()
                if rows and rows[1] and rows[1].status ~= "running" and rows[1].status ~= "pending" then
                    settled = rows[1]
                    break
                end
                time.sleep("50ms")
            end
            local settled_after_ms = math.floor((time.now():sub(claimed_at):nanoseconds()) / 1000000)
            test.not_nil(settled, "the overrunning execution never settled")
            test.eq((settled :: table).status, job_types.JOB_STATE.DEAD)
            test.is_true(string.find(tostring((settled :: table).last_error), worker_child.PROC_TIMEOUT_MARKER, 1, true) ~= nil,
                "the execution ended at its ceiling: " .. tostring((settled :: table).last_error))
            test.is_true(settled_after_ms >= ceiling_ms - 500,
                "the execution ended " .. tostring(settled_after_ms) .. "ms after its claim, before its ceiling")
            test.eq(tonumber((settled :: table).execution_seq), tonumber(first.execution_seq))
            local repeated = channel.select({ signal:case_receive(), time.after("2s"):case_receive() })
            test.is_true(repeated.channel ~= signal, "the overrunning execution ran again")
            process.unlisten(signal)
            local check = open_db()
            local runs = check:query("SELECT status FROM kickside_job_run WHERE job_id=$1", { probe.id })
            check:release()
            test.eq(#runs, 1)
            stop_upgrade_service(started)
        end)
    end)

    test.describe("jobs.worker supervised long work", function()
        test.it("refreshes the worker heartbeat during real supervised work", function()
            local worker_id = "long-real-" .. uuid.v7()
            local register_db, register_err = sql.get("app:db")
            if not register_db then error("test database unavailable: " .. tostring(register_err)) end
            test.is_nil(register_err)
            test.is_nil(worker_heartbeat.mark(register_db, tostring(register_db:type()), worker_id, "test-version"))
            register_db:release()
            local hb_pid, start_err = worker_heartbeat.start(worker_id, "test-version", "100ms")
            test.is_nil(start_err)
            do
                local db, db_err = sql.get("app:db")
                if not db then error("test database unavailable: " .. tostring(db_err)) end
                test.is_nil(db_err)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local before = lifecycle.now_string(dbtype)
                local job_id, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                    owner_locator = { kind = "test", id = "loop_test" },
                    parked = true,
                    thread_id = thread_id,
                    job_type = "upload.process.test",
                    worker_ref = "proc://app:job_sleep_proc",
                    priority = 10000,
                    payload = { sleep_ms = 1500 },
                })
                test.is_nil(enqueue_err)
                local job, lease_err = job_fixture.lease_own(db, dbtype, job_id)
                if not job then error("test job lease fails: " .. tostring(lease_err)) end
                test.is_nil(lease_err)
                test.not_nil(job)
                test.eq(job.id, job_id)
                db:release()

                local child_err = worker_child.supervise_job_child(job)
                test.is_nil(child_err)

                local verify_db, verify_err = sql.get("app:db")

                if not verify_db then error("test database unavailable: " .. tostring(verify_err)) end
                test.is_nil(verify_err)
                test.eq(job_row(verify_db, job_id).status, job_types.JOB_STATE.DONE)
                local runs = sql.builder.select("status", "execution_seq")
                    :from("kickside_job_run"):where(sql.builder.eq({ job_id = job_id }))
                    :run_with(verify_db):query()
                test.eq(#runs, 1)
                test.eq(runs[1].status, "completed")
                local rows = sql.builder.select("last_seen_at")
                    :from("kickside_job_worker_pulse"):where(sql.builder.eq({ worker_id = worker_id }))
                    :run_with(verify_db):query()
                test.eq(#rows, 1)
                test.is_true(tostring(rows[1].last_seen_at) > before)
                verify_db:release()
            end
            test.is_nil(worker_heartbeat.stop(hb_pid))
            local cleanup_db, cleanup_err = sql.get("app:db")
            if not cleanup_db then error("test database unavailable: " .. tostring(cleanup_err)) end
            test.is_nil(cleanup_err)
            sql.builder.delete("kickside_job_worker")
                :where(sql.builder.eq({ id = worker_id })):run_with(cleanup_db):exec()
            cleanup_db:release()

            -- Crash a real execution process after its proc target has marked
            -- durable start, then reclaim the lease and run its next attempt.
            local crash_db, crash_err = sql.get("app:db")
            if not crash_db then error("test database unavailable: " .. tostring(crash_err)) end
            test.is_nil(crash_err)
            local dbtype = tostring(crash_db:type())
            local thread_id = make_thread(crash_db)
            local crash_topic = "jobs.crash_probe." .. uuid.v7()
            local crash_signal = process.listen(crash_topic, { message = true })
            local crash_job, arm_err = job_fixture.enqueue_leased(crash_db, dbtype, {
                thread_id = thread_id, job_type = "test.process_crash",
                worker_ref = "proc://app:job_crash_probe", priority = 100000,
                payload = { reply_pid = tostring(process.pid()), reply_topic = crash_topic },
            })
            test.is_nil(arm_err)
            local crash_id = tostring((crash_job :: table).id)
            test.eq(tonumber((crash_job :: table).attempts), 1)
            crash_db:release()

            local events = process.events()
            local child_pid, child_err = process.spawn_monitored(
                "kickside.core.jobs.service:job_child", "app:processes", { job = crash_job })
            test.is_nil(child_err)
            test.not_nil(child_pid)
            local start_deadline = time.after("5s")
            local start_result = channel.select({ crash_signal:case_receive(), start_deadline:case_receive() })
            test.eq(start_result.channel, crash_signal, "crash probe did not mark durable start")
            test.eq(tostring(start_result.value:payload():data().job_id), crash_id)
            process.unlisten(crash_signal)
            process.terminate(tostring(child_pid))
            wait_for_exit(events, tostring(child_pid))

            local retry_db, retry_err = sql.get("app:db")

            if not retry_db then error("test database unavailable: " .. tostring(retry_err)) end
            test.is_nil(retry_err)
            test.eq(job_row(retry_db, crash_id).status, job_types.JOB_STATE.RUNNING)
            local ancient = dbtype == sql.type.SQLITE and "2000-01-01 00:00:00" or "2000-01-01T00:00:00Z"
            local _, age_err = sql.builder.update("kickside_job")
                :set("lease_until", ancient)
                :where(sql.builder.eq({ id = crash_id })):run_with(retry_db):exec()
            test.is_nil(age_err)
            local _, reclaim_err = reclaim.reclaim_expired(retry_db, dbtype)
            test.is_nil(reclaim_err)
            test.eq(job_row(retry_db, crash_id).status, job_types.JOB_STATE.PENDING)
            local retry, lease_err = job_fixture.lease_own(retry_db, dbtype, crash_id)
            if not retry then error("test job lease fails: " .. tostring(lease_err)) end
            test.is_nil(lease_err)
            test.eq(retry.id, crash_id)
            test.eq(tonumber(retry.attempts), 2)
            retry_db:release()

            local retry_pid, retry_spawn_err = process.spawn_monitored(
                "kickside.core.jobs.service:job_child", "app:processes", { job = retry })
            test.is_nil(retry_spawn_err)
            wait_for_exit(events, tostring(retry_pid))
            local final_db, final_err = sql.get("app:db")
            if not final_db then error("test database unavailable: " .. tostring(final_err)) end
            test.is_nil(final_err)
            test.eq(job_row(final_db, crash_id).status, job_types.JOB_STATE.DONE)
            test.eq(latest_run(final_db, crash_id).status, "completed")
            final_db:release()
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
