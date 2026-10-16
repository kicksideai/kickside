local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local lifecycle = require("lifecycle")
local claim = require("claim")
local job_fixture = require("job_fixture")

local function define_tests()
    test.describe("worker claim thread fence", function()
        test.it("cancels a deleting owner's pending job and claims every runnable sibling without replay", function()
            local db, dbtype, open_err = job_fixture.private_queue("app:private_queue_claim_fence_test")
            if not db or not dbtype then error("test queue unavailable: " .. tostring(open_err)) end
            test.is_nil(open_err)
            local queue, dialect = db :: sql.DB, dbtype :: string
            local deleting, healthy = uuid.v7(), uuid.v7()
            local ids = {}
            for index = 1, 3 do
                local id, enqueue_err = lifecycle.enqueue_job(queue, dialect, {
                    owner_locator = { kind = "thread", id = index == 1 and deleting or healthy },
                    thread_id = index == 1 and deleting or healthy,
                    job_type = "test.capacity", concurrency_key = tostring(index),
                })
                test.is_nil(enqueue_err)
                ids[index] = id
            end
            local seeded, seed_err = queue:execute([[UPDATE kickside_job_thread_cleanup SET started=$1
                WHERE thread_id=$2]], { dialect == sql.type.POSTGRES and true or 1, deleting })
            test.is_nil(seed_err)
            test.eq(tonumber(seeded.rows_affected), 1)
            local workers = {}
            for index = 1, 3 do
                workers[index] = "deleting-owner-worker-" .. uuid.v7()
                local _, worker_err = queue:execute([[INSERT INTO kickside_job_worker(id,registry_version,last_seen_at)
                    VALUES($1,'v1',CURRENT_TIMESTAMP)]], { workers[index] })
                test.is_nil(worker_err)
            end
            local claimed, claim_err = claim.claim_batch(queue, dialect, 3, nil, nil, workers)
            test.is_nil(claim_err)
            test.eq(#claimed, 2)
            local seen = {}
            for _, job in ipairs(claimed) do
                test.is_true(job.id == ids[2] or job.id == ids[3])
                test.is_nil(seen[job.id])
                seen[job.id] = true
                test.eq(job.attempts, 1)
            end
            local rows, read_err = queue:query([[SELECT status,attempts,execution_seq,lease_token,finished_at
                FROM kickside_job WHERE id=$1]], { ids[1] })
            test.is_nil(read_err)
            test.eq(rows[1].status, "cancelled")
            test.eq(tonumber(rows[1].attempts), 0)
            test.eq(tonumber(rows[1].execution_seq), 0)
            test.is_nil(rows[1].lease_token)
            test.not_nil(rows[1].finished_at)
            local runs = queue:query("SELECT id FROM kickside_job_run WHERE job_id=$1", { ids[1] })
            test.eq(#runs, 0)
            local repeated, repeat_err = claim.claim_batch(queue, dialect, 1, nil, nil, { workers[3] })
            test.is_nil(repeat_err)
            test.eq(#repeated, 0)
            local retained = queue:query("SELECT id FROM kickside_job WHERE owner_kind='thread' AND owner_id=$1", { deleting })
            test.eq(#retained, 1)
            queue:release()
        end)

        test.it("claims the highest-priority job of an owner holding more runs than any former per-owner count", function()
            local db, dbtype, open_err = job_fixture.private_queue("app:private_queue_claim_fence_test")
            if not db or not dbtype then error("test queue unavailable: " .. tostring(open_err)) end
            test.is_nil(open_err)
            test.not_nil(db)
            local queue = db :: sql.DB
            local dialect = dbtype :: string
            local busy_owner, other_owner = uuid.v7(), uuid.v7()
            local busy_id, busy_err = lifecycle.enqueue_job(queue, dialect, {
                owner_locator = { kind = "test", id = busy_owner },
                thread_id = uuid.v7(), job_type = "test.claim", priority = 10,
            })
            test.is_nil(busy_err)
            local _, other_err = lifecycle.enqueue_job(queue, dialect, {
                owner_locator = { kind = "test", id = other_owner },
                thread_id = uuid.v7(), job_type = "test.claim", priority = 0,
            })
            test.is_nil(other_err)
            local seed: string
            if dialect == sql.type.POSTGRES then
                seed = [[INSERT INTO kickside_job_run
                    (id,job_id,owner_kind,owner_id,job_type,attempt_no,execution_seq,status,lease_token,started_at,finished_at)
                    SELECT md5($1::text || ':' || n::text)::uuid,$1::uuid,'test',$2,'test.claim',1,n + 1000,'success','seed',$3::timestamptz,$3::timestamptz
                    FROM generate_series(1,100000) AS n]]
            else
                seed = [[WITH RECURSIVE numbered(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM numbered WHERE n<100000)
                    INSERT INTO kickside_job_run
                    (id,job_id,owner_kind,owner_id,job_type,attempt_no,execution_seq,status,lease_token,started_at,finished_at)
                    SELECT lower(hex(randomblob(16))),$1,'test',$2,'test.claim',1,n + 1000,'success','seed',$3,$3
                    FROM numbered]]
            end
            local seeded, seed_err = queue:execute(seed, { busy_id, busy_owner, "2000-01-01T00:00:00Z" })
            test.is_nil(seed_err)
            test.eq(tonumber(seeded.rows_affected), 100000)
            local worker_id = "claim-busy-" .. uuid.v7()
            local _, worker_err = queue:execute("INSERT INTO kickside_job_worker"
                .. "(id,registry_version,last_seen_at) VALUES($1,'v1',CURRENT_TIMESTAMP)", { worker_id })
            test.is_nil(worker_err)

            local claimed, claim_err = claim.claim_batch(queue, dialect, 1, nil, nil, { worker_id })
            test.is_nil(claim_err)
            test.eq(#claimed, 1)
            test.eq(claimed[1].id, busy_id)
            queue:release()
        end)
    end)
end

return { run = test.run_cases(define_tests) }
