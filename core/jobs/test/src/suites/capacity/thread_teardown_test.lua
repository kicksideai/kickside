local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local jobs = require("jobs")
local thread_fence = require("thread_fence")
local job_fixture = require("job_fixture")

local function open_db(): sql.DB
    local db, err = sql.get("app:db")
    if not db then error("test database unavailable: " .. tostring(err)) end
    if err or not db then error("thread teardown DB unavailable: " .. tostring(err)) end
    return db :: sql.DB
end

local function define_tests()
    test.describe("jobs-owned thread cleanup", function()
        test.it("acquires the durable cleanup fence in one round trip and preserves its state", function()
            local db = open_db()
            local tx, begin_err = db:begin()
            test.is_nil(begin_err)
            local reads = 0
            local function observe() reads = reads + 1 end
            local probe = job_fixture.observe_tx(tx, observe, observe)
            local id = uuid.v7()
            local state, fence_err = thread_fence.lock(probe, id)
            local first_reads = reads
            local _, update_err = tx:execute("UPDATE kickside_job_thread_cleanup SET started=TRUE,next_page_seq=7 WHERE thread_id=$1", { id })
            local held, held_err = thread_fence.lock(probe, id)
            tx:rollback()
            db:release()
            test.is_nil(fence_err)
            test.not_nil(state)
            test.is_false(state.started)
            test.is_nil(update_err)
            test.is_nil(held_err)
            test.is_true(held.started)
            test.eq(tonumber(held.next_page_seq), 7)
            test.eq(first_reads, 1)
            test.eq(reads, 2)
        end)

        test.it("pages bounded cleanup with durable receipts and recovers a lost acknowledgment", function()
            local thread_id = uuid.v7()
            local db = open_db()
            local _, thread_err = db:execute([[INSERT INTO kickside_thread
                (id,thread_class,component_id,event_count) VALUES ($1,'jobs-cleanup',$2,0)]], { thread_id, thread_id })
            test.is_nil(thread_err, tostring(thread_err))
            for index = 1, 101 do
                local job_id = uuid.v7()
                local _, job_err = db:execute([[INSERT INTO kickside_job
                    (id,thread_id,job_type,job_identity,owner_kind,owner_id,status)
                    VALUES ($1,$2,'test.thread_cleanup',$3,'thread',$4,'pending')]],
                    { job_id, thread_id, "thread-cleanup:" .. job_id, thread_id })
                test.is_nil(job_err, tostring(job_err))
            end
            db:release()

            local first, apply_err = jobs.cleanup_thread_page(thread_id, 0)
            test.is_nil(apply_err, tostring(apply_err))
            test.not_nil(first)
            test.eq(first.processed, 100)
            test.is_false(first.done)
            test.eq(first.discarded.kickside_job, 100)
            test.eq(first.unresolved.kickside_job, 100)

            local replay, replay_err = jobs.cleanup_thread_page(thread_id, 0)
            test.is_nil(replay_err, tostring(replay_err))
            test.not_nil(replay)
            test.eq(replay.processed, first.processed)
            test.eq(replay.discarded.kickside_job, first.discarded.kickside_job)

            -- A next-page request proves Core committed the prior page. It
            -- acknowledges that receipt even if Core stopped before its
            -- explicit post-commit acknowledgment call.
            local final, final_err = jobs.cleanup_thread_page(thread_id, 1)
            test.is_nil(final_err, tostring(final_err))
            test.not_nil(final)
            test.eq(final.processed, 1)
            test.is_true(final.done)
            test.eq(final.discarded.kickside_job, 1)
            test.eq(final.unresolved.kickside_job, 1)
            local acknowledged, acknowledge_err = jobs.ack_thread_cleanup_page(thread_id, 1, true)
            test.is_nil(acknowledge_err, tostring(acknowledge_err))
            test.is_true(acknowledged)
            local repeated_ack, repeated_ack_err = jobs.ack_thread_cleanup_page(thread_id, 1, true)
            test.is_nil(repeated_ack_err, tostring(repeated_ack_err))
            test.is_true(repeated_ack)

            local verify = open_db()
            local jobs_left, jobs_err = verify:query("SELECT id FROM kickside_job WHERE thread_id=$1", { thread_id })
            test.is_nil(jobs_err, tostring(jobs_err))
            test.eq(#jobs_left, 0)
            local receipts, receipt_err = verify:query([[SELECT page_seq,acknowledged_at,processed,done
                FROM kickside_job_thread_cleanup_receipt WHERE thread_id=$1 ORDER BY page_seq]], { thread_id })
            test.is_nil(receipt_err, tostring(receipt_err))
            test.eq(#receipts, 2)
            test.not_nil(receipts[1].acknowledged_at)
            test.not_nil(receipts[2].acknowledged_at)
            test.eq(tonumber(receipts[1].processed), 100)
            test.eq(tonumber(receipts[2].processed), 1)
            local fence, read_err = verify:query([[SELECT started,completed_at FROM kickside_job_thread_cleanup
                WHERE thread_id=$1]], { thread_id })
            test.is_nil(read_err, tostring(read_err))
            test.not_nil(fence[1].completed_at)
            local remaining, remaining_err = verify:query([[SELECT COUNT(*) AS n FROM kickside_job
                WHERE owner_kind='thread' AND owner_id=$1]], { thread_id })
            test.is_nil(remaining_err, tostring(remaining_err))
            test.eq(tonumber(remaining[1].n), 0)
            verify:execute("DELETE FROM kickside_job_thread_cleanup_receipt WHERE thread_id=$1", { thread_id })
            local no_fence, no_fence_err = verify:execute([[DELETE FROM kickside_job_thread_cleanup
                WHERE thread_id=$1]], { thread_id })
            test.is_nil(no_fence_err, tostring(no_fence_err))
            test.eq(tonumber(no_fence.rows_affected), 1)
            local no_thread_rows, no_thread_err = verify:execute("DELETE FROM kickside_thread WHERE id=$1", { thread_id })
            test.is_nil(no_thread_err, tostring(no_thread_err))
            test.eq(tonumber(no_thread_rows.rows_affected), 1)
            verify:release()
        end)

        -- Projection slots carry their owner thread only as owner_kind/owner_id.
        local function insert_owned_slot(db: sql.DB, thread_id: string): string
            local job_id = uuid.v7()
            local _, job_err = db:execute([[INSERT INTO kickside_job
                (id,thread_id,job_type,job_identity,owner_kind,owner_id,status,slot,execution_seq)
                VALUES ($1,NULL,'test.owned_slot',$2,'thread',$3,'pending',TRUE,1)]],
                { job_id, "owned-slot:" .. job_id, thread_id })
            if job_err then error("owned slot insert failed: " .. tostring(job_err)) end
            local _, run_err = db:execute([[INSERT INTO kickside_job_run
                (id,job_id,thread_id,job_type,attempt_no,execution_seq,status,owner_kind,owner_id)
                VALUES ($1,$2,NULL,'test.owned_slot',1,1,'completed','thread',$3)]], { uuid.v7(), job_id, thread_id })
            if run_err then error("owned run insert failed: " .. tostring(run_err)) end
            return job_id
        end

        local function owned_count(db: sql.DB, thread_id: string): integer
            local rows, err = db:query([[SELECT (SELECT COUNT(*) FROM kickside_job WHERE owner_kind='thread' AND owner_id=$1)
                + (SELECT COUNT(*) FROM kickside_job_run WHERE owner_kind='thread' AND owner_id=$1) AS n]], { thread_id })
            if err or not rows then error("owned count failed: " .. tostring(err)) end
            return math.floor(tonumber(rows[1].n) or -1)
        end

        local function forget_thread(db: sql.DB, thread_id: string)
            db:execute("DELETE FROM kickside_job_thread_cleanup_receipt WHERE thread_id=$1", { thread_id })
            db:execute("DELETE FROM kickside_job_thread_cleanup WHERE thread_id=$1", { thread_id })
            db:execute("DELETE FROM kickside_thread WHERE id=$1", { thread_id })
        end

        test.it("removes a thread's owner-only slot and its runs before reporting done", function()
            local thread_id = uuid.v7()
            local db = open_db()
            local _, thread_err = db:execute([[INSERT INTO kickside_thread
                (id,thread_class,component_id,event_count) VALUES ($1,'jobs-cleanup',$2,0)]], { thread_id, thread_id })
            test.is_nil(thread_err, tostring(thread_err))
            insert_owned_slot(db, thread_id)
            db:release()

            local page, page_err = jobs.cleanup_thread_page(thread_id, 0)
            test.is_nil(page_err, tostring(page_err))
            test.is_true(page.done)
            test.eq(page.discarded.kickside_job, 1)
            test.eq(page.discarded.kickside_job_run, 1)
            local verify = open_db()
            test.eq(owned_count(verify, thread_id), 0)
            forget_thread(verify, thread_id)
            verify:release()
        end)

        test.it("removes owned rows left behind after a thread's cleanup completed", function()
            local thread_id = uuid.v7()
            local db = open_db()
            local _, thread_err = db:execute([[INSERT INTO kickside_thread
                (id,thread_class,component_id,event_count) VALUES ($1,'jobs-cleanup',$2,0)]], { thread_id, thread_id })
            test.is_nil(thread_err, tostring(thread_err))
            db:release()
            local page, page_err = jobs.cleanup_thread_page(thread_id, 0)
            test.is_nil(page_err, tostring(page_err))
            test.is_true(page.done)
            local acknowledged, ack_err = jobs.ack_thread_cleanup_page(thread_id, 0, true)
            test.is_nil(ack_err, tostring(ack_err))
            test.is_true(acknowledged)

            -- The shape a teardown that selected owned rows by thread_id left.
            db = open_db()
            insert_owned_slot(db, thread_id)
            db:release()
            local swept, sweep_err = jobs.retention_sweep()
            test.is_nil(sweep_err, tostring(sweep_err))
            test.is_true(swept.thread_cleanup_leftovers >= 2)
            local verify = open_db()
            test.eq(owned_count(verify, thread_id), 0)
            forget_thread(verify, thread_id)
            verify:release()
        end)

        test.it("preserves surviving-owner jobs and reports only discarded evidence", function()
            local thread_id, owner_id = uuid.v7(), uuid.v7()
            local job_id, run_id = uuid.v7(), uuid.v7()
            local db = open_db()
            local _, thread_err = db:execute([[INSERT INTO kickside_thread
                (id,thread_class,component_id,event_count) VALUES ($1,'jobs-cleanup',$2,0)]], { thread_id, thread_id })
            test.is_nil(thread_err, tostring(thread_err))
            local _, job_err = db:execute([[INSERT INTO kickside_job
                (id,thread_id,job_type,job_identity,owner_kind,owner_id,status)
                VALUES ($1,$2,'test.thread_cleanup',$3,'automation',$4,'pending')]],
                { job_id, thread_id, "external-cleanup:" .. job_id, owner_id })
            test.is_nil(job_err, tostring(job_err))
            local _, run_err = db:execute([[INSERT INTO kickside_job_run
                (id,job_id,thread_id,job_type,attempt_no,execution_seq,status,owner_kind,owner_id)
                VALUES ($1,$2,$3,'test.thread_cleanup',1,1,'running','automation',$4)]],
                { run_id, job_id, thread_id, owner_id })
            test.is_nil(run_err, tostring(run_err))
            db:release()

            local page, page_err = jobs.cleanup_thread_page(thread_id, 0)
            test.is_nil(page_err, tostring(page_err))
            test.not_nil(page)
            test.is_true(page.done)
            test.eq(page.processed, 2)
            test.is_nil(page.discarded.kickside_job)
            test.is_nil(page.discarded.kickside_job_run)
            test.is_nil(page.unresolved.kickside_job)
            test.is_nil(page.unresolved.kickside_job_run)
            local acknowledged, acknowledge_err = jobs.ack_thread_cleanup_page(thread_id, 0, true)
            test.is_nil(acknowledge_err, tostring(acknowledge_err))
            test.is_true(acknowledged)

            local verify = open_db()
            local rows, read_err = verify:query([[SELECT j.thread_id,j.status,r.thread_id AS run_thread_id,
                r.status AS run_status FROM kickside_job j
                JOIN kickside_job_run r ON r.job_id=j.id
                WHERE j.id=$1]], { job_id })
            test.is_nil(read_err, tostring(read_err))
            test.eq(#rows, 1)
            test.is_nil(rows[1].thread_id)
            test.is_nil(rows[1].run_thread_id)
            test.eq(rows[1].status, "pending")
            test.eq(rows[1].run_status, "running")
            verify:execute("DELETE FROM kickside_job_thread_cleanup_receipt WHERE thread_id=$1", { thread_id })
            verify:execute("DELETE FROM kickside_job_run WHERE id=$1", { run_id })
            verify:execute("DELETE FROM kickside_job WHERE id=$1", { job_id })
            verify:execute("DELETE FROM kickside_job_thread_cleanup WHERE thread_id=$1", { thread_id })
            verify:execute("DELETE FROM kickside_thread WHERE id=$1", { thread_id })
            verify:release()
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
