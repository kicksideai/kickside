-- Controlled message ordering and durable marker fences for pool assignments.
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local process = require("process")
local worker_pool = require("worker_pool")
local lifecycle = require("lifecycle")
local lifecycle_cancel = require("lifecycle_cancel")
local claim = require("claim")
local reclaim = require("reclaim")
local job_fixture = require("job_fixture")
local worker_fence = require("worker_fence")

local function pending_pair(db, dbtype, worker_id)
    local _, worker_err = db:execute("INSERT INTO kickside_job_worker"
        .. "(id,registry_version,last_seen_at) VALUES($1,'v1',CURRENT_TIMESTAMP)", { worker_id })
    test.is_nil(worker_err)
    local first, first_err = lifecycle.enqueue_job(db, dbtype, {
        owner_locator = { kind = "test", id = "idle_report_test" },
        thread_id = uuid.v7(), job_type = "assignment-epoch-first", priority = 100 })
    test.is_nil(first_err)
    local second, second_err = lifecycle.enqueue_job(db, dbtype, {
        owner_locator = { kind = "test", id = "idle_report_test" },
        thread_id = uuid.v7(), job_type = "assignment-epoch-second", priority = 0 })
    test.is_nil(second_err)
    if not first or not second then error("pending job pair is absent") end
    return first, second
end

local function job_status(db, id)
    local rows, err = db:query("SELECT status FROM kickside_job WHERE id=$1", { id })
    test.is_nil(err)
    return rows[1].status
end

local function define_tests()
    test.describe("job assignment epochs", function()
        test.it("ignores an idle report sent before its assignment was consumed", function()
            local db, dbtype, queue_err = job_fixture.private_queue("app:private_queue_idle_report_test")
            if not db or not dbtype then error("test queue unavailable: " .. tostring(queue_err)) end
            test.is_nil(queue_err)
            test.not_nil(db)
            local worker_id = "epoch-worker"
            local first, second = pending_pair(db, dbtype, worker_id)
            local events_ch = { case_receive = function(self) return self end }
            local registry_ch = { case_receive = function(self) return self end }
            local idle_ch = { case_receive = function(self) return self end }
            local timer_ch = { case_receive = function(self) return self end }
            local now_ns, selection = 0, 0
            local sends: table[] = {}
            local root = worker_pool.new({
                retention_schedule = job_fixture.no_retention_schedule,
                sql_get = function() return {
                    type = function() return db:type() end,
                    query = function(_, ...) return db:query(...) end,
                    begin = function() return db:begin() end,
                    release = function() end,
                }, nil end,
                policy = function() return job_fixture.pool_policy({ worker_count_sqlite = 1,
                    worker_count_postgres = 1 }), nil end,
                process = {
                    registry = job_fixture.process_registry("epoch-pool"),
                    event = process.event, pid = function() return "epoch-pool" end,
                    events = function() return events_ch end, set_options = function() end,
                    listen = function() return idle_ch end, unlisten = function() end,
                    spawn_linked_monitored = function() return worker_id end,
                    send = function(_to, _topic, message)
                        sends[#sends + 1] = message
                        return true, nil
                    end,
                    cancel = function() end,
                },
                time = {
                    now = function() return { unix_nano = function() return now_ns end } end,
                    after = function() return timer_ch end,
                },
                channel = { select = function(cases)
                    if cases.default == true then return { default = true } end
                    selection = selection + 1
                    if selection > 5 then
                        return { channel = events_ch, value = { kind = process.event.EXIT, from = worker_id } }
                    end
                    if selection == 1 then
                        return { channel = idle_ch,
                            value = { kind = "idle", worker_id = worker_id, version = "v1", epoch = 0 } }
                    elseif selection == 2 then
                        now_ns = 2000000
                        return { channel = timer_ch }
                    elseif selection == 3 then
                        -- A was claimed, but the worker has not consumed it.
                        return { channel = idle_ch,
                            value = { kind = "idle", worker_id = worker_id, version = "v1", epoch = 0 } }
                    elseif selection == 4 and #cases == 4 then
                        now_ns = 4000000
                        return { channel = timer_ch }
                    end
                    return { channel = events_ch, value = { kind = process.event.CANCEL } }
                end },
                registry = { current_version = function()
                    return { id = function() return "v1" end }, nil
                end },
                events = { subscribe = function() return {
                    channel = function() return registry_ch end, close = function() end,
                } end },
            })
            root.main()
            test.eq(#sends, 1, "a stale idle report must not claim a second job")
            test.eq(sends[1].job.id, first)
            test.eq(sends[1].epoch, 1)
            -- Pool cancellation releases A because its worker never consumed
            -- the assignment; the stale notice must not lose that record.
            test.eq(job_status(db, first), "pending")
            test.eq(job_status(db, second), "pending")
            local marker, marker_err = db:query("SELECT current_job_id FROM kickside_job_worker WHERE id=$1", { worker_id })
            test.is_nil(marker_err)
            test.is_nil(marker[1].current_job_id)
            db:release()
        end)

        test.it("does not overwrite a worker's live database assignment", function()
            local db, dbtype, queue_err = job_fixture.private_queue("app:private_queue_idle_report_test")
            if not db or not dbtype then error("test queue unavailable: " .. tostring(queue_err)) end
            test.is_nil(queue_err)
            test.not_nil(db)
            local worker_id = "marker-worker"
            local first, second = pending_pair(db, dbtype, worker_id)
            local claimed, first_err = claim.claim_batch(db, dbtype, 1, "live", nil, { worker_id })
            test.is_nil(first_err)
            test.eq(claimed[1].id, first)
            local duplicate, duplicate_err = claim.claim_batch(db, dbtype, 1, "live", nil, { worker_id })
            test.is_nil(duplicate)
            test.not_nil(duplicate_err)
            test.eq((duplicate_err :: error):kind(), errors.CONFLICT)
            test.eq(job_status(db, first), "running")
            test.eq(job_status(db, second), "pending")
            local marker, marker_err = db:query("SELECT current_job_id FROM kickside_job_worker WHERE id=$1", { worker_id })
            test.is_nil(marker_err)
            test.eq(tostring(marker[1].current_job_id), first)
            db:release()
        end)

        test.it("claims a full batch after cancelling one worker's running job", function()
            local db, dbtype, queue_err = job_fixture.private_queue("app:private_queue_idle_report_test")
            if not db or not dbtype then error("test queue unavailable: " .. tostring(queue_err)) end
            test.is_nil(queue_err)
            test.not_nil(db)
            local first_worker, second_worker = "cancel-worker-a", "cancel-worker-b"
            local first, second = pending_pair(db, dbtype, first_worker)
            local _, worker_err = db:execute("INSERT INTO kickside_job_worker"
                .. "(id,registry_version,last_seen_at) VALUES($1,'v1',CURRENT_TIMESTAMP)", { second_worker })
            test.is_nil(worker_err)
            local original, claim_err = claim.claim_batch(db, dbtype, 1, "live", nil, { first_worker })
            test.is_nil(claim_err)
            test.eq(original[1].id, first)
            local cancelled, cancel_err, executions = lifecycle_cancel.cancel_job(db, dbtype, { id = first })
            test.is_nil(cancel_err)
            test.is_true(cancelled)
            test.eq(#executions, 1)
            local settled, settle_err = lifecycle_cancel.finish_cancellation(db, dbtype, executions[1])
            test.is_nil(settle_err)
            test.is_true(settled)
            local third, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                owner_locator = { kind = "test", id = "idle_report_test" },
                thread_id = uuid.v7(), job_type = "assignment-epoch-third", priority = -100 })
            test.is_nil(enqueue_err)
            local claimed, batch_err = claim.claim_batch(db, dbtype, 2, "live", nil,
                { first_worker, second_worker })
            test.is_nil(batch_err)
            test.eq(#claimed, 2)
            test.eq(claimed[1].id, second)
            test.eq(claimed[2].id, third)
            local markers, marker_err = db:query("SELECT id,current_job_id FROM kickside_job_worker"
                .. " WHERE id IN ($1,$2) ORDER BY id", { first_worker, second_worker })
            test.is_nil(marker_err)
            test.eq(tostring(markers[1].current_job_id), second)
            test.eq(tostring(markers[2].current_job_id), third)
            db:release()
        end)

        test.it("clears worker markers on reclaim and unconfirmed termination", function()
            local db, dbtype, queue_err = job_fixture.private_queue("app:private_queue_idle_report_test")
            if not db or not dbtype then error("test queue unavailable: " .. tostring(queue_err)) end
            test.is_nil(queue_err)
            test.not_nil(db)
            local first, second = pending_pair(db, dbtype, "reclaim-worker")
            local reclaimed_job, claim_err = claim.claim_batch(db, dbtype, 1, "live", nil, { "reclaim-worker" })
            test.is_nil(claim_err)
            test.eq(reclaimed_job[1].id, first)
            local old = dbtype == sql.type.SQLITE and "2000-01-01 00:00:00" or "2000-01-01T00:00:00Z"
            local _, age_err = db:execute("UPDATE kickside_job SET lease_until=$1 WHERE id=$2", { old, first })
            test.is_nil(age_err)
            local count, reclaim_err = reclaim.reclaim_expired(db, dbtype)
            test.is_nil(reclaim_err)
            test.eq(count, 1)
            local marker, marker_err = db:query("SELECT current_job_id FROM kickside_job_worker WHERE id=$1",
                { "reclaim-worker" })
            test.is_nil(marker_err)
            test.is_nil(marker[1].current_job_id)

            local cancelled, cancel_err = lifecycle_cancel.cancel_job(db, dbtype, { id = first })
            test.is_nil(cancel_err)
            test.is_true(cancelled)
            local held_job, held_err = claim.claim_batch(db, dbtype, 1, "live", nil, { "reclaim-worker" })
            test.is_nil(held_err)
            test.eq(held_job[1].id, second)
            test.is_nil(worker_fence.prepare_termination(db, held_job[1]))
            test.is_nil(worker_fence.hold_unconfirmed_execution(db, held_job[1]))
            local held_marker, read_err = db:query("SELECT current_job_id FROM kickside_job_worker WHERE id=$1",
                { "reclaim-worker" })
            test.is_nil(read_err)
            test.is_nil(held_marker[1].current_job_id)
            db:release()
        end)
    end)
end

return test.run_cases(define_tests)
