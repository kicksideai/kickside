local test = require("test")
local sql = require("sql")

local function cases()
    test.describe("uploads boot initialization", function()
        test.it("leaves upload durability to the creation transaction without a maintenance slot", function()
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            test.not_nil(db)
            -- Read only: calling ensure_slot here would hide missing boot work.
            local rows, query_err = db:query([[
                SELECT slot, queue_tier, wake_key, scheduled_at
                FROM kickside_job
                WHERE job_type = 'kickside.uploads.service:intent_reconcile'
            ]])
            db:release()
            test.is_nil(query_err)
            test.eq(0, #rows)
        end)
    end)
end

local run_cases = test.run_cases(cases)
return { run = function(options: any): any return run_cases(options) end }
