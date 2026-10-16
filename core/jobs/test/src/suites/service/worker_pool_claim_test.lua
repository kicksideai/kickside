-- Claim failures reach the pool as typed errors: an occupied worker marker
-- contradicts the slot's idle notice and retires the slot, while any other
-- claim failure is retried on its backoff deadline with the slot kept.
local test = require("test")
local sql = require("sql")
local process = require("process")
local worker_pool = require("worker_pool")
local job_fixture = require("job_fixture")
local time = require("time")
local uuid = require("uuid")
local clock = require("clock")
local lifecycle = require("lifecycle")
local claim = require("claim")
local events = require("events")
local channel = require("channel")
local logger = require("logger")

local IDLE_TOPIC = "kickside.core.jobs:worker_idle"
local WORKER_ID = "claim-worker"

local function claim_failure(): error
    return (errors.new({ message = "claim batch candidates failed", kind = errors.INTERNAL }) :: error)
end

local function marker_conflict(): error
    return (errors.new({ message = "worker is not available for another claim", kind = errors.CONFLICT,
        details = { reason = "worker_marker_occupied" } }) :: error)
end

-- run_pool drives one pool root through: an idle notice, then cancellation.
-- claim_batch(call) answers each claim; due_count is the due backlog every
-- backlog read reports. The result reports what the pool did.
local function run_pool(claim_batch: (integer) -> (table[]?, error?), queued_wakes: integer?, queued_idle: integer?,
        awaited: boolean?, due_count: integer?, backlog: ((string?) -> (table?, error?))?, claim_at: string?): table
    local events_ch = { case_receive = function(self) return self end }
    local registry_ch = { case_receive = function(self) return self end }
    local idle_ch = { case_receive = function(self) return self end }
    local wake_ch = { case_receive = function(self) return self end }
    local timer_ch = { case_receive = function(self) return self end }
    local outcome = { backlog_reads = 0, claims = 0, cancels = 0, retired = 0, assignments = 0, timers = 0, max_drained = 0, trace = {} }
    local selections = 0
    local pending_wakes = queued_wakes or 0
    local pending_idle = queued_idle or 0
    local drained = 0
    local pool = worker_pool.new({
        job_class = { awaited_types = function() return awaited and { "awaited" } or {}, nil end },
        retention_schedule = job_fixture.no_retention_schedule,
        sql_get = function() return {
            type = function() return sql.type.SQLITE end,
            query = function() outcome.trace[#outcome.trace + 1] = "deadline"; return { {} }, nil end,
            release = function() end,
        }, nil end,
        policy = function() return job_fixture.pool_policy({ worker_count_sqlite = 1,
            worker_count_postgres = 1 }), nil end,
        reclaim = {
            reclaim_expired = function() return 0, nil end,
            reclaim_terminated = function() return 0, nil end,
            close_lost_runs = function() return 0, nil end,
        },
        claim = {
            due_backlog = function(_db, _dbtype, _grace, at: string?)
                outcome.backlog_reads = outcome.backlog_reads + 1
                if backlog then return backlog(at) end
                return { count = due_count or 0, oldest_age_ms = 1000, overdue = 0 }, nil
            end,
            claim_batch = function()
                outcome.claims = outcome.claims + 1
                outcome.trace[#outcome.trace + 1] = "claim"
                local batch, err = claim_batch(outcome.claims)
                return batch, err, nil, nil, claim_at
            end,
        },
        claim_execution = { release_unstarted = function() return false, nil end },
        process = {
            event = process.event,
            pid = function() return "claim-pool" end,
            events = function() return events_ch end,
            set_options = function() end,
            listen = function(topic: string) return topic == IDLE_TOPIC and idle_ch or wake_ch end,
            unlisten = function() end,
            registry = {
                register = function() return true, nil end,
                unregister = function() return true, nil end,
            },
            spawn_linked_monitored = function() return WORKER_ID end,
            send = function() outcome.trace[#outcome.trace + 1] = "assignment"; outcome.assignments = outcome.assignments + 1; return true, nil end,
            cancel = function() outcome.cancels = outcome.cancels + 1 end,
        },
        time = {
            now = function() return { unix_nano = function() return 0 end } end,
            after = function() outcome.timers = outcome.timers + 1; return timer_ch end,
        },
        channel = { select = function(cases: any)
            if cases.default == true then
                local receives_idle = false
                for _, case in ipairs(cases) do
                    if case == idle_ch then receives_idle = true end
                end
                if receives_idle and selections >= 1 and pending_idle > 0 then
                    pending_idle = pending_idle - 1
                    return { channel = idle_ch, value = { kind = "idle", worker_id = WORKER_ID, version = "v1", epoch = 0 } }
                end
                if pending_wakes > 0 then
                    pending_wakes = pending_wakes - 1
                    drained = drained + 1
                    outcome.max_drained = math.max(outcome.max_drained, drained)
                    return { channel = wake_ch, value = { kind = "wake" } }
                end
                return { default = true }
            end
            drained = 0
            if selections == 1 and pending_wakes > 0 then
                pending_wakes = pending_wakes - 1
                return { channel = wake_ch, value = { kind = "wake" } }
            end
            if selections == 1 and pending_idle > 0 then
                pending_idle = pending_idle - 1
                return { channel = idle_ch, value = { kind = "idle", worker_id = WORKER_ID, version = "v1", epoch = 0 } }
            end
            selections = selections + 1
            if selections > 2 then
                return { channel = events_ch, value = { kind = process.event.EXIT, from = WORKER_ID } }
            end
            if selections == 1 then
                return { channel = idle_ch,
                    value = { kind = "idle", worker_id = WORKER_ID, version = "v1", epoch = 0 } }
            end
            -- Draining cancels every live slot; only cancels before it are the pool's decisions.
            outcome.retired = outcome.cancels
            return { channel = events_ch, value = { kind = process.event.CANCEL } }
        end },
        registry = { current_version = function()
            return { id = function() return "v1" end }, nil
        end },
        events = { subscribe = function()
            return { channel = function() return registry_ch end, close = function() end }, nil
        end },
    })
    pool.main()
    return outcome
end

local function define_tests()
    test.describe("job pool claim refusals", function()
        test.it("observes both durable deadline classes in one database read", function()
            local db, dbtype, db_err = job_fixture.private_queue("app:private_queue_claim_selection_test")
            test.is_nil(db_err)
            if not db or not dbtype then error("test queue is absent") end
            local reads = 0
            local probe = job_fixture.observe_db(db, function() reads = reads + 1 end)
            local delay, kind, deadline_err = worker_pool.next_deadline(probe, dbtype, clock.now(dbtype))
            db:release()
            test.is_nil(deadline_err)
            test.is_nil(delay)
            test.is_nil(kind)
            test.eq(reads, 1)
        end)

        test.it("arms a deadline for work that becomes due after the dispatch instant", function()
            local db, dbtype, db_err = job_fixture.private_queue("app:private_queue_claim_selection_test")
            test.is_nil(db_err)
            if not db or not dbtype then error("test queue is absent") end
            -- The dispatch claimed at dispatch_at; the row became due after that
            -- instant and before the dispatch reads its next deadline.
            local started = time.now()
            local dispatch_at = clock.format(started:add(-2 * time.SECOND), dbtype)
            local _, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                owner_locator = { kind = "test", id = "worker_pool_claim_test" },
                thread_id = uuid.v7(), job_type = "test.deadline",
                scheduled_at = clock.format(started:add(-1 * time.SECOND), dbtype),
            })
            test.is_nil(enqueue_err)
            local delay, kind, deadline_err = worker_pool.next_deadline(db, dbtype, dispatch_at)
            db:release()
            test.is_nil(deadline_err)
            test.eq(kind, "due", "work due after the claim instant arms no dispatch deadline")
            test.eq(delay, 1)
        end)

        test.it("sends committed awaited work before reading maintenance deadlines", function()
            local outcome = run_pool(function()
                return { { id = "awaited-job", job_type = "awaited", worker_id = WORKER_ID,
                    run_ctx = { id = "awaited-run" } } }, nil
            end, nil, nil, true)
            test.eq(outcome.assignments, 1)
            local claim_index = nil
            for index, event in ipairs(outcome.trace) do
                if event == "claim" then claim_index = index; break end
            end
            test.is_true(claim_index ~= nil)
            if claim_index == nil then error("claim is absent") end
            test.eq(outcome.trace[claim_index + 1], "assignment")
        end)

        test.it("reads the due backlog only when an idle general slot claims nothing", function()
            local empty = run_pool(function() return {}, nil end)
            test.eq(empty.claims, 1)
            test.eq(empty.backlog_reads, 1)
            local claimed = run_pool(function()
                return { { id = "general-job", job_type = "general", worker_id = WORKER_ID,
                    run_ctx = { id = "general-run" } } }, nil
            end)
            test.eq(claimed.assignments, 1)
            test.eq(claimed.backlog_reads, 0)
            local failed = run_pool(function() return nil, claim_failure() end)
            test.eq(failed.backlog_reads, 0)
        end)

        -- error_logs runs fn and returns the error-level log messages it emits.
        local function error_logs(fn: () -> ()): { string }
            local subscription, subscription_err = events.subscribe("logs", "logs.entry")
            test.is_nil(subscription_err)
            local logs = subscription:channel()
            -- Earlier tests' logs stream asynchronously: start after a boundary.
            local start = "pool claim test start " .. uuid.v7()
            logger:info(start)
            local start_deadline = time.after("5s")
            while true do
                local selected = channel.select({ logs:case_receive(), start_deadline:case_receive() })
                test.is_true(selected.channel == logs, "log start boundary does not arrive")
                if selected.value.data.entry.message == start then break end
            end
            local boundary = "pool claim test boundary " .. uuid.v7()
            fn()
            logger:info(boundary)
            local found: { string } = {}
            local deadline = time.after("5s")
            while true do
                local selected = channel.select({ logs:case_receive(), deadline:case_receive() })
                test.is_true(selected.channel == logs, "log boundary does not arrive")
                local entry = selected.value.data.entry
                if entry.message == boundary then break end
                if entry.level >= 2 then found[#found + 1] = entry.message end
            end
            subscription:close()
            return found
        end

        test.it("returns the candidate cutoff for empty and successful claims", function()
            local db, dbtype, db_err = job_fixture.private_queue("app:private_queue_claim_selection_test")
            test.is_nil(db_err)
            if not db or not dbtype then error("test queue is absent") end
            local observed: string? = nil
            local probe: sql.DB = job_fixture.observe_db(db)
            probe.query = function(_, statement: string, params: table?)
                if not params then error("claim candidate parameters are absent") end
                observed = tostring(params[2])
                return db:query(statement, params)
            end
            local empty, empty_err, _, _, empty_at = claim.claim_batch(probe, dbtype, 1)
            test.is_nil(empty_err)
            test.eq(#empty, 0)
            test.not_nil(empty_at)
            test.eq(empty_at, observed)
            local _, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                owner_locator = { kind = "test", id = "worker_pool_claim_test" },
                thread_id = uuid.v7(), job_type = "test.cutoff", scheduled_at = "2000-01-01 00:00:00" })
            test.is_nil(enqueue_err)
            local batch, batch_err, _, _, claimed_at = claim.claim_batch(probe, dbtype, 1)
            test.is_nil(batch_err)
            test.eq(#batch, 1)
            test.not_nil(claimed_at)
            test.eq(claimed_at, observed)
            db:release()
        end)

        test.it("measures due backlog and grace against the supplied claim cutoff", function()
            local db, dbtype, db_err = job_fixture.private_queue("app:private_queue_claim_selection_test")
            test.is_nil(db_err)
            if not db or not dbtype then error("test queue is absent") end
            local instant, parse_err = clock.parse("2001-01-01T00:00:00.500000Z")
            test.is_nil(parse_err)
            for _, offset in ipairs({ -2000, -500, 0, 5 }) do
                local _, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                    owner_locator = { kind = "test", id = "worker_pool_claim_test" },
                    thread_id = uuid.v7(), job_type = "test.cutoff",
                    scheduled_at = clock.format(instant:add(offset * time.MILLISECOND), dbtype) })
                test.is_nil(enqueue_err)
            end
            local backlog, backlog_err = claim.due_backlog(db, dbtype, 1, clock.format(instant, dbtype))
            test.is_nil(backlog_err)
            test.eq(backlog.count, 3)
            test.eq(backlog.overdue, 1)
            test.eq(backlog.oldest_age_ms, 2000)
            local current, current_err = claim.due_backlog(db, dbtype, 1)
            test.is_nil(current_err)
            test.eq(current.count, 4)
            test.eq(current.overdue, 4)
            db:release()
        end)

        test.it("does not report work that is due only on the later database clock", function()
            local db, dbtype, db_err = job_fixture.private_queue("app:private_queue_claim_selection_test")
            test.is_nil(db_err)
            if not db or not dbtype then error("test queue is absent") end
            local instant, parse_err = clock.parse("2001-01-01T00:00:00.500000Z")
            test.is_nil(parse_err)
            local claim_at = clock.format(instant, dbtype)
            local _, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                owner_locator = { kind = "test", id = "worker_pool_claim_test" },
                thread_id = uuid.v7(), job_type = "test.cutoff",
                scheduled_at = clock.format(instant:add(5 * time.MILLISECOND), dbtype) })
            test.is_nil(enqueue_err)
            local outcome: table = {}
            local logged = error_logs(function()
                outcome = run_pool(function() return {}, nil end,
                    nil, nil, nil, nil, function(at)
                        return claim.due_backlog(db, dbtype, 0, at)
                    end, claim_at)
            end)
            db:release()
            test.eq(#logged, 0, table.concat(logged, "\n"))
            test.eq(outcome.claims, 1)
            test.eq(outcome.backlog_reads, 1)
        end)

        test.it("claims work committed after its candidate read before it reports unclaimed due work", function()
            local outcome: table = {}
            local logged = error_logs(function()
                outcome = run_pool(function(call: integer)
                    if call == 1 then return {}, nil end
                    return { { id = "late-job", job_type = "general", worker_id = WORKER_ID,
                        run_ctx = { id = "late-run" } } }, nil
                end, nil, nil, nil, 1)
            end)
            test.eq(outcome.claims, 2)
            test.eq(outcome.backlog_reads, 1)
            test.eq(outcome.assignments, 1)
            test.eq(#logged, 0, table.concat(logged, "\n"))
        end)

        test.it("reports due work that a claim made after its evidence still left unclaimed", function()
            local outcome: table = {}
            local logged = error_logs(function()
                outcome = run_pool(function() return {}, nil end, nil, nil, nil, 1)
            end)
            test.eq(outcome.claims, 2)
            test.eq(outcome.backlog_reads, 1)
            test.eq(outcome.assignments, 0)
            test.eq(#logged, 1)
            test.is_true(string.find(logged[1], "claimed nothing while claimable work is due", 1, true) ~= nil, logged[1])
        end)

        test.it("coalesces queued current idle reports with wakes before the authoritative scan", function()
            local outcome = run_pool(function() return {}, nil end, 3, 5)
            test.eq(outcome.claims, 1)
            test.eq(outcome.assignments, 0)
            test.eq(outcome.retired, 0)
        end)

        test.it("coalesces queued durable wake notices before scanning for runnable jobs", function()
            local outcome = run_pool(function() return {}, nil end, 5)
            test.eq(outcome.claims, 1)
            test.eq(outcome.assignments, 0)
            test.eq(outcome.retired, 0)
        end)

        test.it("bounds each wake drain and dispatches the remaining notices", function()
            local bound = job_fixture.pool_policy().worker_claim_batch
            local notices = bound * 3
            local outcome = run_pool(function() return {}, nil end, notices)
            test.eq(outcome.max_drained, bound)
            -- Boot drains one batch before the fixture's idle registration.
            test.eq(outcome.claims, 1 + math.ceil((notices - 2 * bound) / (bound + 1)))
            test.eq(outcome.assignments, 0)
            test.eq(outcome.retired, 0)
        end)

        test.it("retries a failed claim on its backoff deadline without retiring the slot", function()
            local outcome = run_pool(function()
                return nil, claim_failure()
            end)
            test.eq(outcome.claims, 1)
            test.eq(outcome.assignments, 0)
            test.eq(outcome.retired, 0)
            test.is_true(outcome.timers > 0, "the failed dispatch is retried on its backoff deadline")
        end)

        test.it("retires the slot whose occupied marker contradicts its idle notice", function()
            local outcome = run_pool(function() return nil, marker_conflict() end)
            test.eq(outcome.claims, 1)
            test.eq(outcome.retired, 1)
            test.eq(outcome.assignments, 0)
        end)
    end)
end

return test.run_cases(define_tests)
