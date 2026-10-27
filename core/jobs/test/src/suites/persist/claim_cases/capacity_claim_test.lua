-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local job_types = require("job_types")
local claim = require("claim")
local lifecycle = require("lifecycle")
local job_fixture = require("job_fixture")

local function with_db(fn)
    local db, _, err = job_fixture.private_queue("app:private_queue_capacity_claim_test")
    if err or not db then error("capacity queue unavailable: " .. tostring(err)) end
    fn(db)
    db:release()
end

local function enqueue(db: sql.DB, dbtype: string, worker: string, key: string, ordinal: integer,
        scheduled_at: string?, slot: boolean?): string
    local id, err = lifecycle.enqueue_job(db, dbtype, {
        owner_locator = { kind = "test", id = "capacity_claim" },
        thread_id = uuid.v7(),
        job_type = worker,
        worker_ref = worker,
        concurrency_key = key,
        job_identity = { namespace = "capacity", scope = key, key = tostring(ordinal) },
        scheduled_at = scheduled_at or "2000-01-01T00:00:00Z",
        slot = slot == true,
    })
    if err then error("capacity enqueue failed: " .. tostring(err)) end
    return id :: string
end

local function define_tests()
    test.describe("jobs capacity claims", function()
        test.it("shares Settings-backed capacity across worker types and permits the declared per-key limit", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local first = enqueue(db, dbtype, "app:capacity_worker_a", "zone-a", 1)
                local second = enqueue(db, dbtype, "app:capacity_worker_b", "zone-a", 2)
                local deferred = enqueue(db, dbtype, "app:capacity_worker_a", "zone-b", 3)

                local batch, claim_err = claim.claim_batch(db, dbtype, 3)
                test.is_nil(claim_err)
                test.eq(#batch, 2)
                local running = {}
                for _, job in ipairs(batch) do running[tostring(job.id)] = true end
                test.is_true(running[first])
                test.is_true(running[second])
                test.is_nil(running[deferred])

                local rows, rows_err = db:query("SELECT id,status,capacity_group FROM kickside_job ORDER BY id")
                test.is_nil(rows_err)
                local pending = 0
                for _, row in ipairs(rows or {}) do
                    if tostring(row.id) == deferred then
                        test.eq(row.status, job_types.JOB_STATE.PENDING)
                        test.eq(row.capacity_group, "app.capacity")
                        pending = pending + 1
                    end
                end
                test.eq(pending, 1)
            end)
        end)

        test.it("keeps descriptorless workers single-flighted by their concurrency key", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local first = enqueue(db, dbtype, "test.legacy.capacity", "legacy-key", 1)
                local second = enqueue(db, dbtype, "test.legacy.capacity", "legacy-key", 2)
                local batch, claim_err = claim.claim_batch(db, dbtype, 2)
                test.is_nil(claim_err)
                test.eq(#batch, 1)
                test.eq(batch[1].id, first)
                local rows, rows_err = db:query("SELECT status,capacity_group FROM kickside_job WHERE id=$1", { second })
                test.is_nil(rows_err)
                test.eq(rows[1].status, job_types.JOB_STATE.PENDING)
                test.is_nil(rows[1].capacity_group)
            end)
        end)

        test.it("excludes capacity-declared and descriptorless work sharing a concurrency key", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local configured = enqueue(db, dbtype, "app:capacity_worker_a", "mixed-key", 1,
                    "2000-01-01T00:00:00Z")
                local legacy = enqueue(db, dbtype, "test.legacy.capacity", "mixed-key", 2,
                    "2000-01-01T00:00:01Z")
                local batch, claim_err = claim.claim_batch(db, dbtype, 2)
                test.is_nil(claim_err)
                test.eq(#batch, 1)
                local rows, rows_err = db:query("SELECT id,status FROM kickside_job ORDER BY id")
                test.is_nil(rows_err)
                local running, pending = 0, 0
                for _, row in ipairs(rows or {}) do
                    local id = tostring(row.id)
                    if id == configured or id == legacy then
                        if row.status == job_types.JOB_STATE.RUNNING then running = running + 1 end
                        if row.status == job_types.JOB_STATE.PENDING then pending = pending + 1 end
                    end
                end
                test.eq(running, 1)
                test.eq(pending, 1)
            end)
        end)

        test.it("converges declared capacity for existing jobs and reusable slots", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local admitted = enqueue(db, dbtype, "app:capacity_worker_a", "persisted-admission", 1,
                    "2999-01-01T00:00:00Z", true)
                local _, clear_admitted_err = db:execute("UPDATE kickside_job SET capacity_group=NULL WHERE id=$1", { admitted })
                test.is_nil(clear_admitted_err)
                local admitted_again, admitted_err, inserted = lifecycle.enqueue_job(db, dbtype, {
                    owner_locator = { kind = "test", id = "capacity_claim" },
                    thread_id = uuid.v7(),
                    job_type = "app:capacity_worker_a",
                    worker_ref = "app:capacity_worker_a",
                    concurrency_key = "persisted-admission",
                    job_identity = { namespace = "capacity", scope = "persisted-admission", key = "1" },
                    slot = true,
                })
                test.is_nil(admitted_err)
                test.eq(admitted_again, admitted)
                test.is_false(inserted)

                local pending = enqueue(db, dbtype, "app:capacity_worker_b", "persisted-claim", 2, nil, true)
                local _, clear_pending_err = db:execute("UPDATE kickside_job SET capacity_group=NULL WHERE id=$1", { pending })
                test.is_nil(clear_pending_err)
                local claimed, claim_err = claim.claim_job(db, dbtype)
                test.is_nil(claim_err)
                test.eq(claimed.id, pending)

                local rows, rows_err = db:query("SELECT id,capacity_group FROM kickside_job WHERE id IN ($1,$2)",
                    { admitted, pending })
                test.is_nil(rows_err)
                test.eq(#rows, 2)
                for _, row in ipairs(rows) do test.eq(row.capacity_group, "app.capacity") end
            end)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
