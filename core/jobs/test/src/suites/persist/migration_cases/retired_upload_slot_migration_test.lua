local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local funcs = require("funcs")
local jobs = require("jobs")

local function assert_rows(actual, expected)
    test.eq(#actual, #expected)
    for i, row in ipairs(expected) do
        for column, value in pairs(row) do test.eq(actual[i][column], value, column) end
        for column, value in pairs(actual[i]) do test.eq(value, row[column], column) end
    end
end

return test.run_cases(function()
    test.describe("retired Uploads maintenance slot migration", function()
        test.it("cancels the published parked slot and preserves processing jobs and history", function()
            -- Uploads 0.1.71 intent_maintenance.ensure_slot enrollment.
            local slot, err = jobs.enqueue({namespace="uploads",scope="maintenance",key="intent",
                owner_locator={kind="installation",id="kickside.uploads"},
                job_type="kickside.uploads.service:intent_reconcile",immutable_payload={},slot=true,
                queue_tier="maintenance",wake_key="uploads:intent",parked=true})
            test.is_nil(err)
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            local function exec(statement,params)
                local _,e=db:execute(statement,params or {})
                test.is_nil(e)
            end
            local function query(statement,params)
                local rows,e=db:query(statement,params or {})
                test.is_nil(e)
                return rows
            end
            local completed, processing, run_id = uuid.v7(), uuid.v7(), uuid.v7()
            exec("INSERT INTO kickside_job(id,job_type,job_identity,owner_kind,owner_id,status) VALUES($1,'kickside.uploads.service:intent_reconcile',$2,'installation','kickside.uploads','done')",{completed,completed})
            exec("INSERT INTO kickside_job(id,job_type,job_identity,owner_kind,owner_id) VALUES($1,'proc://kickside.uploads.service:process_job_proc',$2,'user','legacy-owner')",{processing,processing})
            exec("INSERT INTO kickside_job_run(id,job_id,job_type,owner_kind,owner_id,attempt_no,execution_seq,status) VALUES($1,$2,'kickside.uploads.service:intent_reconcile','installation','kickside.uploads',1,1,'success')",{run_id,slot.id})
            local history=query("SELECT * FROM kickside_job_run WHERE id=$1",{run_id})
            local untouched=query("SELECT * FROM kickside_job WHERE id IN ($1,$2) ORDER BY id",{completed,processing})
            for i=1,2 do
                local result,e=funcs.call("kickside.core.jobs.migrations:21_retire_upload_intent_slot",{database_id="app:db",id="test:retired_upload_slot_"..tostring(i)})
                test.is_nil(e)
                test.eq(result.status,"complete",tostring(result.error or (result.migrations and result.migrations[1].error)))
                local rows=query("SELECT * FROM kickside_job WHERE id=$1",{slot.id})
                test.eq(rows[1].status,"cancelled")
                test.not_nil(rows[1].finished_at)
                test.eq(rows[1].job_type,"kickside.uploads.service:intent_reconcile")
                assert_rows(query("SELECT * FROM kickside_job_run WHERE id=$1",{run_id}),history)
                assert_rows(query("SELECT * FROM kickside_job WHERE id IN ($1,$2) ORDER BY id",{completed,processing}),untouched)
            end
            exec("DELETE FROM kickside_job_run WHERE id=$1", {run_id})
            exec("DELETE FROM kickside_job WHERE id IN ($1,$2,$3)", {slot.id,completed,processing})
            db:release()
        end)
    end)
end)
