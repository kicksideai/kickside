-- The Core retention sweep bounds thread growth by age alone: it reports only
-- what it deleted, and job output that shares the job's completion transaction
-- keeps landing on a thread holding more events than any former per-thread
-- count.
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local sweeper = require("sweeper")
local writer = require("threads_writer")
local jobs = require("jobs")
local prune_scaffold = require("prune_scaffold")

local FORMER_EVENT_ROWS = 100000

local function db(): sql.DB
    local handle, err = sql.get("app:db")
    if err or not handle then error("sweep test database unavailable: " .. tostring(err)) end
    return handle :: sql.DB
end

local function define_tests()
    test.describe("core retention sweep bounded by expiry", function()
        test.it("prunes a thread's aged events and reports deletion counts only", function()
            local thread_id = prune_scaffold.make_thread()
            prune_scaffold.add_events(thread_id, prune_scaffold.range(1, 3), 120)
            prune_scaffold.add_events(thread_id, { 4 }, 0)
            local handle = db()
            local result, err = sweeper.run_for_thread(handle, thread_id)
            test.is_nil(err)
            test.eq(result.events, 3)
            local stats, stats_err = sweeper.run(handle)
            handle:release()
            test.is_nil(stats_err)
            local keys: { string } = {}
            for key in pairs(stats :: table) do keys[#keys + 1] = key end
            table.sort(keys)
            test.eq(table.concat(keys, ","), "events,needs_continue,write_receipts")
            local left = prune_scaffold.seqs_of(thread_id)
            test.eq(#left, 1)
            test.eq(left[1], 4)
        end)

        test.it("lands job output with its completion on a thread past the former event count", function()
            local thread_id = prune_scaffold.make_thread()
            prune_scaffold.add_bulk_events(thread_id, FORMER_EVENT_ROWS)
            local enqueued, enqueue_err = jobs.enqueue({ namespace = "test", scope = thread_id,
                key = uuid.v7(), owner_locator = { kind = "thread", id = thread_id },
                thread_id = thread_id, job_type = "app:generic_job_target",
                immutable_payload = {}, parked = true })
            test.is_nil(enqueue_err)
            test.not_nil(enqueued)
            local handle = db()
            local token = "job-output-lease"
            local leased, lease_err = handle:execute([[UPDATE kickside_job SET status='running',
                lease_token=$1,execution_seq=1 WHERE id=$2]], { token, enqueued.id })
            test.is_nil(lease_err)
            test.eq(tonumber(leased.rows_affected), 1)
            local tx = assert(handle:begin())
            local appended, append_err = writer.append_system_tx(tx, tostring(handle:type()), thread_id,
                { { type = "job_output", body_json = "{}" } }, enqueued.id)
            test.is_nil(append_err)
            test.not_nil(appended)
            local _, complete_err = jobs.complete_tx(tx, enqueued.id, { token = token, execution_seq = 1 }, {})
            test.is_nil(complete_err)
            local _, commit_err = tx:commit()
            test.is_nil(commit_err)
            local rows, read_err = handle:query("SELECT event_count FROM kickside_thread WHERE id=$1", { thread_id })
            handle:release()
            test.is_nil(read_err)
            test.eq(tonumber(rows[1].event_count), FORMER_EVENT_ROWS + 1)
        end)
    end)
end

return test.run_cases(define_tests)
