local test = require("test")
local sql = require("sql")
local migration_registry = require("migration_registry")

local function define_tests()
    test.describe("harness users closure", function()
        test.it("app_users carries the users-module DDL, not the stub shape", function()
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            local rows, query_err = db:query("SELECT email FROM app_users LIMIT 1")
            test.is_nil(query_err)
            test.ok(rows ~= nil)
            local groups, groups_err = db:query("SELECT 1 FROM app_user_groups LIMIT 1")
            test.is_nil(groups_err)
            test.ok(groups ~= nil)
            db:release()
        end)

        test.it("all registered app:db migrations are applied before suites run", function()
            local registered, find_err = migration_registry.find({ target_db = "app:db" })
            test.is_nil(find_err)
            test.ok(registered ~= nil and #registered > 0)
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            local rows, ledger_err = db:query("SELECT id FROM _migrations")
            db:release()
            test.is_nil(ledger_err)
            local applied: { [string]: boolean } = {}
            for _, row in ipairs(rows or {}) do applied[tostring((row :: any).id)] = true end
            for _, entry in ipairs(registered :: { any }) do
                test.ok(applied[tostring(entry.id)], "migration missing from boot ledger: " .. tostring(entry.id))
            end
        end)
    end)
end

return { run = test.run_cases(define_tests) }
