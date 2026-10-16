-- Drive slots (design v5 §4.1; CONTRACTS §6): one reusable kickside_job per
-- drive under the canonical (drive, automation_id, drive_key) identity, its id
-- recorded on the drive, and a repeated provision converging on that same job.
-- Runs on SQLite and PostgreSQL.

local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local drive = require("drive")
local slot = require("slot")
local slot_purge = require("slot_purge")
local owner_gc = require("owner_gc")

local DB = "app:db"

local function open_db(): sql.DB
    local db, err = sql.get(DB)
    if err or not db then error("slot test: db connect failed: " .. tostring(err)) end
    return db :: sql.DB
end

local function new_drive(automation_id: string, drive_key: string, source: table?)
    local db = open_db()
    local tx = db:begin() :: sql.Transaction
    local spec: drive.NewDrive = { automation_id = automation_id, drive_key = drive_key, source_kind = "timer" }
    for k, v in pairs(source or {}) do spec[k] = v end
    local _, err = drive.insert_tx(tx, spec)
    if err then tx:rollback(); db:release(); error(tostring(err)) end
    tx:commit()
    db:release()
end

local function part(value: string): string
    return tostring(#value) .. ":" .. value
end

local function job_row(job_id: string): table?
    local db = open_db()
    local rows, err = db:query("SELECT id, job_identity, slot, job_type, worker_ref, payload, status, wake_key, owner_kind, owner_id FROM kickside_job WHERE id = $1", { job_id })
    db:release()
    if err then error(tostring(err)) end
    return (rows :: { table })[1]
end

local function define_tests()
    test.describe("automation drive slot", function()
        test.it("enqueues one slot per drive under the drive identity and records it on the drive", function()
            local id = uuid.v7()
            new_drive(id, "poll")
            local job_id, err = slot.provision(id, "poll")
            test.is_nil(err, tostring(err))
            test.not_nil(job_id)

            local job = job_row(job_id :: string) :: table
            test.eq(job.job_identity, part("drive") .. part(id) .. part("poll"))
            test.is_true(job.slot == true or job.slot == 1)
            test.eq(job.job_type, slot.JOB_TYPE)
            test.eq(job.worker_ref, slot.JOB_TYPE)
            test.eq(job.owner_kind, "automation")
            test.eq(job.owner_id, id)
            test.contains(tostring(job.payload), id)
            test.contains(tostring(job.payload), "poll")

            local db = open_db()
            local row = drive.get(db, id, "poll")
            db:release()
            test.eq((row :: table).job_id, job_id)
        end)

        test.it("purges a drive slot by identity when its id was never recorded", function()
            local owner, other = uuid.v7(), uuid.v7()
            new_drive(owner, "main")
            new_drive(other, "main")
            local orphan_id, orphan_err = slot.enqueue(owner, "main", nil)
            test.is_nil(orphan_err, tostring(orphan_err))
            local other_id, other_err = slot.provision(other, "main")
            test.is_nil(other_err, tostring(other_err))
            local opened = open_db()
            local _, run_err = opened:execute([[INSERT INTO kickside_job_run
                (id,job_id,owner_kind,owner_id,job_type,attempt_no,execution_seq,status,started_at,finished_at)
                VALUES ($1,$2,'automation',$3,'test.slot',1,1,'success','2026-01-01T00:00:00Z','2026-01-01T00:00:01Z')]],
                { uuid.v7(), orphan_id, owner })
            opened:release()
            test.is_nil(run_err, tostring(run_err))
            local removed, purge_err = slot_purge.purge_slot({ namespace = "drive", scope = owner, key = "main" })
            test.is_nil(purge_err, tostring(purge_err))
            test.eq(removed, 1)
            local db = open_db()
            local row, row_err = db:query("SELECT COUNT(*) AS n FROM kickside_job WHERE id=$1", { orphan_id })
            test.is_nil(row_err, tostring(row_err))
            test.eq(tonumber(row[1].n), 0, "slot row")
            local runs, runs_err = db:query("SELECT COUNT(*) AS n FROM kickside_job_run WHERE job_id=$1", { orphan_id })
            test.is_nil(runs_err, tostring(runs_err))
            test.eq(tonumber(runs[1].n), 0, "slot run history")
            db:release()
            test.not_nil(job_row(other_id :: string))
        end)

        test.it("pages slot run history before removing its owner row", function()
            local owner = uuid.v7()
            new_drive(owner, "main")
            local job_id, enqueue_err = slot.enqueue(owner, "main", nil)
            test.is_nil(enqueue_err, tostring(enqueue_err))
            local db = open_db()
            for i = 1, 205 do
                local inserted, run_err = db:execute([[INSERT INTO kickside_job_run
                    (id,job_id,owner_kind,owner_id,job_type,attempt_no,execution_seq,status,started_at,finished_at)
                    VALUES ($1,$2,'automation',$3,'test.slot',$4,$5,'success',
                        '2026-01-01T00:00:00Z','2026-01-01T00:00:01Z')]],
                    { uuid.v7(), job_id, owner, i, 2000000000 + i })
                test.is_nil(run_err, "run " .. tostring(i) .. ": " .. tostring(run_err))
                test.eq(tonumber(inserted.rows_affected), 1)
            end
            db:release()
            local spec = { namespace = "drive", scope = owner, key = "main" }
            local first, first_err = slot_purge.purge_slot(spec)
            db = open_db()
            local rows, read_err = db:query("SELECT COUNT(*) AS n FROM kickside_job_run WHERE job_id=$1", { job_id })
            db:release()
            local after_first = tonumber(rows[1].n)
            local second, second_err = slot_purge.purge_slot(spec)
            local third, third_err = slot_purge.purge_slot(spec)
            test.is_nil(read_err, tostring(read_err))
            test.is_nil(first)
            test.is_true(errors.is(first_err, errors.CONFLICT), tostring(first_err))
            test.is_true((first_err :: any):details().cleanup_pending)
            test.is_true(after_first >= 105, "one call must delete at most 100 run rows")
            test.is_nil(second)
            test.is_true(errors.is(second_err, errors.CONFLICT), tostring(second_err))
            test.eq(third, 1)
            test.is_nil(third_err, tostring(third_err))
            test.is_nil(job_row(job_id :: string))
        end)

        test.it("reclaims a slot enqueued after owner deletion fenced its drive", function()
            local owner = uuid.v7()
            new_drive(owner, "main")
            local original = slot.enqueue
            local delete_err: any = nil
            slot.enqueue = function(id: string, key: string, wake_key: string?): (string?, error?)
                local _, err = owner_gc.delete(owner)
                delete_err = err
                if err then return nil, err end
                return original(id, key, wake_key)
            end
            local job_id, provision_err = slot.provision(owner, "main")
            slot.enqueue = original
            test.is_nil(delete_err, tostring(delete_err))
            test.is_nil(job_id)
            test.not_nil(provision_err)
            local opened = open_db()
            local identity = part("drive") .. part(owner) .. part("main")
            local rows, read_err = opened:query("SELECT COUNT(*) AS n FROM kickside_job WHERE job_identity=$1", { identity })
            opened:release()
            test.is_nil(read_err, tostring(read_err))
            test.eq(tonumber(rows[1].n), 0, "late slot must be reclaimed")
        end)

        test.it("keeps the command dispatcher's maintenance slot active alongside drive slots", function()
            local id = uuid.v7()
            new_drive(id, "main")
            local _, err = slot.provision(id, "main")
            test.is_nil(err, tostring(err))
            local db = open_db()
            local rows, q_err = db:query("SELECT job_type, worker_ref, queue_tier, status, owner_kind, owner_id FROM kickside_job WHERE job_identity = $1"
                .. " AND status IN ('pending','running')", { part("automation") .. part("maintenance") .. part("command_dispatcher") })
            db:release()
            test.is_nil(q_err)
            test.eq(#(rows :: { table }), 1)
            test.eq((rows :: { table })[1].job_type, slot.DISPATCHER_JOB_TYPE)
            test.eq((rows :: { table })[1].queue_tier, "maintenance")
            test.eq((rows :: { table })[1].owner_kind, "installation")
            test.eq((rows :: { table })[1].owner_id, "kickside.automation")
        end)

        test.it("keys an event drive's slot by its source thread's wake key", function()
            local id = uuid.v7()
            local thread_id = uuid.v7()
            new_drive(id, "main", { source_kind = "event", source_thread_id = thread_id })
            local job_id, err = slot.provision(id, "main")
            test.is_nil(err, tostring(err))
            test.eq((job_row(job_id :: string) :: table).wake_key, "thread:" .. thread_id)
        end)

        test.it("gives a drive without a source no slot", function()
            local id = uuid.v7()
            new_drive(id, "main", { source_kind = "none" })
            local job_id, err = slot.provision(id, "main")
            test.is_nil(err, tostring(err))
            test.is_nil(job_id)
            local db = open_db()
            local row = drive.get(db, id, "main")
            local missing = drive.missing_slots(db, 100000)
            db:release()
            test.is_nil((row :: table).job_id)
            for _, m in ipairs(missing :: { table }) do test.is_true(m.automation_id ~= id) end
        end)

        test.it("refuses a drive source kind outside the vocabulary", function()
            local db = open_db()
            local tx = db:begin() :: sql.Transaction
            local _, err = drive.insert_tx(tx, { automation_id = uuid.v7(), drive_key = "main", source_kind = "install" })
            tx:rollback()
            db:release()
            test.not_nil(err)
            test.eq((err :: any):kind(), "Invalid")
        end)

        test.it("converges a repeated provision on the same active slot", function()
            local id = uuid.v7()
            new_drive(id, "main")
            local first = slot.provision(id, "main")
            local second, err = slot.provision(id, "main")
            test.is_nil(err, tostring(err))
            test.eq(second, first)
        end)

        test.it("moves the wake key of a drive's active slot in place when its source moves", function()
            local id = uuid.v7()
            local first_thread, second_thread = uuid.v7(), uuid.v7()
            new_drive(id, "main", { source_kind = "event", source_thread_id = first_thread })
            local first = slot.provision(id, "main") :: string
            test.eq((job_row(first) :: table).wake_key, "thread:" .. first_thread)
            local db = open_db()
            local _, move_err = db:execute("UPDATE kickside_automation_drive SET source_thread_id = $1 WHERE automation_id = $2",
                { second_thread, id })
            db:release()
            test.is_nil(move_err, tostring(move_err))
            local second, err = slot.provision(id, "main")
            test.is_nil(err, tostring(err))
            test.eq(second, first)
            local job = job_row(first) :: table
            test.eq(job.wake_key, "thread:" .. second_thread)
            test.eq(job.status, "pending")
        end)
    end)
end

return test.run_cases(define_tests)
