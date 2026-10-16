local test = require("test")
local funcs = require("funcs")
local scratch = require("migration_scratch")

return { run = test.run_cases(function()
    test.describe("Core encoding admission", function()
        test.after_each(function() scratch.drop() end)
        test.it("refuses non-UTF8 PostgreSQL before schema writes and accepts SQLite", function()
            scratch.reset("SQL_ASCII")
            local result, call_err = funcs.new():call("kickside.core.migrations:00_encoding", {
                database_id = "app:migration_db", direction = "up", id = "encoding-contract-audit",
            })
            test.is_nil(call_err)
            if scratch.postgres() then
                test.eq(result.status, "error")
                test.contains(tostring(result.error), "database encoding is SQL_ASCII")
                test.contains(tostring(result.error), "requires UTF8")
            else
                test.eq(result.status, "complete", tostring(result.error))
            end
        end)
    end)
end) }
