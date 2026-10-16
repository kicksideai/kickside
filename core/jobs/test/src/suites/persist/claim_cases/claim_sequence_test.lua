local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local job_types = require("job_types")
local claim = require("claim")
local lifecycle = require("lifecycle")
local job_fixture = require("job_fixture")

local PAST = "2000-01-01T00:00:00Z"

local function with_db(fn: (sql.DB, string) -> ())
    local db, _, err = job_fixture.private_queue("app:private_queue_claim_sequence_test")
    if err or not db then error("jobs test: private queue unavailable: " .. tostring(err)) end
    fn(db, tostring(db:type()))
    db:release()
end

local function exec(db: sql.DB, statement: string, args: { any })
    local _, err = db:execute(statement, args)
    if err then error("seed failed: " .. tostring(err)) end
end

-- A due slot at execution_seq `seq` whose recorded runs are the completed
-- executions `runs`, as left by a completed and rearmed slot.
local function seeded_slot(db: sql.DB, dbtype: string, job_type: string, seq: integer, runs: { integer }): string
    local id, err = lifecycle.enqueue_job(db, dbtype, {
        owner_locator = { kind = "automation", id = uuid.v7() }, job_type = job_type,
        job_identity = { namespace = "drive", scope = uuid.v7(), key = "main" }, slot = true,
        scheduled_at = PAST, max_attempts = 3,
    })
    if err or not id then error("enqueue failed: " .. tostring(err)) end
    exec(db, "UPDATE kickside_job SET execution_seq=$1, attempts=0 WHERE id=$2", { seq, id })
    local now = lifecycle.now_string(dbtype)
    for _, run_seq in ipairs(runs) do
        exec(db, [[INSERT INTO kickside_job_run (id,job_id,owner_kind,owner_id,job_type,attempt_no,execution_seq,
            worker_pid,lease_token,status,started_at,finished_at,result_json,actions_json,created_at,updated_at)
            VALUES ($1,$2,'automation','seed',$3,1,$4,'worker-gone',$5,'completed',$6,$6,'{}','{}',$6,$6)]],
            { uuid.v7(), id, job_type, run_seq, uuid.v7(), now })
    end
    return id :: string
end

local function workers(db: sql.DB, dbtype: string, count: integer): { string }
    local ids: { string } = {}
    for i = 1, count do
        ids[i] = "worker-" .. uuid.v7()
        exec(db, "INSERT INTO kickside_job_worker (id,registry_version,last_seen_at) VALUES ($1,'1',$2)",
            { ids[i], lifecycle.now_string(dbtype) })
    end
    return ids
end

local function run_seqs(db: sql.DB, id: string): { integer }
    local rows, err = db:query("SELECT execution_seq,status FROM kickside_job_run WHERE job_id=$1 ORDER BY execution_seq", { id })
    if err or not rows then error("runs unreadable: " .. tostring(err)) end
    local out: { integer } = {}
    for _, row in ipairs(rows) do out[#out + 1] = math.floor(tonumber(row.execution_seq) or -1) end
    return out
end

local function define_tests()
    test.describe("jobs claim execution sequence", function()
        test.it("claims the spiral.center rows: completed runs at or past the job's sequence never collide", function()
            with_db(function(db, dbtype)
                -- 11 rounds and 3 advances: one completed run at the job's current sequence.
                local current = seeded_slot(db, dbtype, "kickside.automation:round", 1, { 1 })
                -- command_dispatcher, intent_reconcile: requeued past their last run.
                local requeued = seeded_slot(db, dbtype, "kickside.automation:command_dispatcher", 2, { 1 })
                -- Never run.
                local fresh = seeded_slot(db, dbtype, "kickside.oauth:dispatch_refresh", 0, {})
                -- Run history recorded past the job's own counter.
                local ahead = seeded_slot(db, dbtype, "kickside.core.projections:advance", 1, { 1, 2 })

                local batch, err, _, refused = claim.claim_batch(db, dbtype, 4, nil, nil, workers(db, dbtype, 4))
                test.is_nil(err)
                test.eq(#(refused or {}), 0)
                test.eq(#batch, 4)
                local by_id: { [string]: table } = {}
                for _, job in ipairs(batch) do by_id[tostring(job.id)] = job end
                test.eq(by_id[current].execution_seq, 2)
                test.eq(by_id[requeued].execution_seq, 3)
                test.eq(by_id[fresh].execution_seq, 1)
                test.eq(by_id[ahead].execution_seq, 3)
                for id, expected in pairs({ [current] = 2, [requeued] = 3, [fresh] = 1, [ahead] = 3 }) do
                    local rows, read_err = db:query("SELECT execution_seq,status FROM kickside_job WHERE id=$1", { id })
                    test.is_nil(read_err)
                    test.eq(math.floor(tonumber(rows[1].execution_seq) or -1), expected)
                    test.eq(rows[1].status, job_types.JOB_STATE.RUNNING)
                    local seqs = run_seqs(db, id)
                    test.eq(seqs[#seqs], expected)
                end
            end)
        end)

        test.it("refuses a row that cannot be leased alone and claims the rest of the batch", function()
            with_db(function(db, dbtype)
                local healthy = seeded_slot(db, dbtype, "kickside.automation:round", 1, { 1 })
                local orphan = seeded_slot(db, dbtype, "kickside.automation:round", 0, {})
                exec(db, "UPDATE kickside_job SET owner_kind='' WHERE id=$1", { orphan })
                local other = seeded_slot(db, dbtype, "kickside.uploads.service:intent_reconcile", 0, {})

                local batch, err, _, refused = claim.claim_batch(db, dbtype, 3, nil, nil, workers(db, dbtype, 3))
                test.is_nil(err)
                test.eq(#batch, 2)
                local claimed: { [string]: boolean } = {}
                for _, job in ipairs(batch) do claimed[tostring(job.id)] = true end
                test.is_true(claimed[healthy])
                test.is_true(claimed[other])
                test.eq(#(refused or {}), 1)
                test.eq((refused :: { table })[1].id, orphan)
                test.contains(tostring((refused :: { table })[1].error), "owner locator")
                local rows, read_err = db:query("SELECT status FROM kickside_job WHERE id=$1", { orphan })
                test.is_nil(read_err)
                test.eq(rows[1].status, job_types.JOB_STATE.PENDING)
            end)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
