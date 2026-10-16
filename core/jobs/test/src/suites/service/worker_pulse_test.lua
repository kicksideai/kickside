local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local worker_heartbeat = require("worker_heartbeat")

local function run()
    test.describe("jobs worker heartbeat isolation", function()
        test.it("refreshes a heartbeat while its job marker row is locked", function()
            local db, db_err = sql.get("app:db")
            if not db then error("test database unavailable: " .. tostring(db_err)) end
            test.is_nil(db_err)
            local dbtype = tostring(db:type())
            local worker_id = "test-pulse-" .. uuid.v7()
            test.is_nil(worker_heartbeat.mark(db, dbtype, worker_id, "test-version"))
            if dbtype == sql.type.POSTGRES then
                local tx, begin_err = db:begin()
                test.is_nil(begin_err)
                local _, lock_err = tx:execute("UPDATE kickside_job_worker SET current_job_id=$1 WHERE id=$2",
                    { uuid.v7(), worker_id })
                test.is_nil(lock_err)
                local other, other_err = sql.get("app:db")
                if not other then error("test database unavailable: " .. tostring(other_err)) end
                test.is_nil(other_err)
                local _, timeout_err = other:execute("SET statement_timeout='100ms'")
                test.is_nil(timeout_err)
                local pulse_err = worker_heartbeat.pulse(other, dbtype, worker_id, "test-version")
                local _, reset_err = other:execute("RESET statement_timeout")
                other:release()
                tx:rollback()
                test.is_nil(reset_err)
                test.is_nil(pulse_err)
            else
                test.is_nil(worker_heartbeat.pulse(db, dbtype, worker_id, "test-version"))
            end
            local pulse, pulse_err = db:query("SELECT registry_version FROM kickside_job_worker_pulse WHERE worker_id=$1",
                { worker_id })
            test.is_nil(pulse_err)
            test.eq(tostring((pulse :: table)[1].registry_version), "test-version")
            local _, delete_err = db:execute("DELETE FROM kickside_job_worker WHERE id=$1", { worker_id })
            test.is_nil(delete_err)
            local orphan_err = worker_heartbeat.pulse(db, dbtype, worker_id, "test-version")
            test.not_nil(orphan_err)
            test.eq(orphan_err:kind(), errors.NOT_FOUND)
            local _, cleanup_err = db:execute("DELETE FROM kickside_job_worker_pulse WHERE worker_id=$1", { worker_id })
            test.is_nil(cleanup_err)
            db:release()
        end)
    end)
end

return { run = test.run_cases(run) }
