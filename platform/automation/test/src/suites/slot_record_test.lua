local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local drive = require("drive")
local native_slot = require("native_slot")
local subject = require("subject")
local boundary = require("boundary")
local jobs = require("jobs")

return test.run_cases(function()
    test.describe("slot record outcomes", function()
        for _, case in ipairs({
            { name = "missing response" },
            { name = "missing count", response = {} },
            { name = "invalid count", response = { rows_affected = "invalid" } },
            { name = "unexpected count", response = { rows_affected = 2 } },
            { name = "negative count", response = { rows_affected = -1 } },
            { name = "non-table response", response = true },
            { name = "database failure", failure = "write refused" },
        }) do
            test.it("preserves the canonical slot after " .. case.name, function()
                local owner = uuid.v7()
                local db = assert(sql.get("app:db"))
                local tx = assert(db:begin())
                local _, insert_err = drive.insert_tx(tx, {automation_id=owner,drive_key="main",source_kind="timer"})
                if insert_err then tx:rollback() else tx:commit() end
                db:release();test.is_nil(insert_err,tostring(insert_err))
                local id, provision_err = native_slot.provision(owner,"main")
                test.is_nil(provision_err,tostring(provision_err))
                boundary.calls = 0
                boundary.response, boundary.failure = case.response, case.failure
                local ok, answer, err = pcall(subject.provision,owner,"main")
                test.is_true(ok,tostring(answer));test.is_nil(answer);test.not_nil(err)
                test.is_true(errors.is(err,errors.INTERNAL),tostring(err))
                local job, read_err = jobs.get_job(id)
                test.is_nil(read_err,tostring(read_err));test.not_nil(job);test.eq(job.status,"pending")
            end)
        end
        test.it("distinguishes a verified zero-row owner result from a successful write", function()
            boundary.calls = 1
            boundary.response,boundary.failure={rows_affected=0},nil
            local err=subject.record(uuid.v7(),"main",uuid.v7())
            test.is_true(errors.is(err,errors.CONFLICT),tostring(err))
            boundary.response={rows_affected=1}
            test.is_nil(subject.record(uuid.v7(),"main",uuid.v7()))
        end)
    end)
end)
