-- Runtime boot readiness releases suites only after every registered app:db
-- migration is recorded in the ledger.
local test = require("test")
local sql = require("sql")
local migration_registry = require("migration_registry")
local migration_runner = require("migration_runner")

local function registered_migrations(): { any }
    local registered, err = migration_registry.find({ target_db = "app:db" })
    test.is_nil(err)
    test.ok(registered ~= nil and #registered > 0)
    return registered :: { any }
end

local function missing_migrations(db: any, registered: { any }): { string }
    local rows, err = db:query("SELECT id FROM _migrations")
    test.is_nil(err)
    local applied: { [string]: boolean } = {}
    for _, row in ipairs(rows or {}) do applied[tostring((row :: any).id)] = true end
    local missing: { string } = {}
    for _, entry in ipairs(registered) do
        local id = tostring(entry.id)
        if not applied[id] then missing[#missing + 1] = id end
    end
    return missing
end

local function define_tests()
    test.describe("users harness migration ledger", function()
        test.it("ignores recorded migration ids that are no longer registered", function()
            local orphan = "kickside.test.removed:01_schema"
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            local _, insert_err = db:execute("INSERT INTO _migrations(id, description) VALUES ($1, $2)",
                { orphan, "removed migration fixture" })
            test.is_nil(insert_err)
            db:release()
            local runner = migration_runner.setup("app:db")
            local found, find_err = runner:find_migrations()
            local result = runner:run()
            db, db_err = sql.get("app:db")
            if db_err or not db then error("migration ledger DB unavailable: " .. tostring(db_err)) end
            local rows, read_err = db:query("SELECT id FROM _migrations WHERE id=$1", { orphan })
            local _, delete_err = db:execute("DELETE FROM _migrations WHERE id=$1", { orphan })
            db:release()
            test.is_nil(read_err, tostring(read_err))
            test.is_nil(delete_err, tostring(delete_err))
            test.is_nil(find_err)
            for _, entry in ipairs(found or {}) do test.neq(entry.id, orphan) end
            test.eq(#rows, 1)
            test.eq(result.status, "complete")
            test.eq(result.migrations_failed, 0)
            test.eq(result.migrations_applied, 0)
        end)

        test.it("seeds the initial admin with the canonical pbk2 password hash", function()
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            local rows, read_err = db:query([[SELECT password_hash FROM app_users
                WHERE user_id IN (SELECT user_id FROM app_user_groups WHERE group_id='app.security:admin')]])
            db:release()
            test.is_nil(read_err)
            test.is_true(#rows > 0)
            for _, row in ipairs(rows) do
                test.is_true(tostring(row.password_hash):match("^pbk2%$210000%$%x+%$%x+$") ~= nil)
            end
        end)

        test.it("contains every registered migration before suites run", function()
            local registered = registered_migrations()
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            local missing = missing_migrations(db, registered)
            db:release()
            test.eq(#missing, 0)
        end)

        test.it("detects a registered migration missing from the ledger", function()
            local registered = registered_migrations()
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            local tx, tx_err = db:begin()
            test.is_nil(tx_err)
            local _, delete_err = tx:execute("DELETE FROM _migrations WHERE id = $1",
                { "kickside.users.migrations:09_profile" })
            test.is_nil(delete_err)
            local missing = missing_migrations(tx, registered)
            tx:rollback()
            db:release()
            test.eq(#missing, 1)
            test.eq(missing[1], "kickside.users.migrations:09_profile")
        end)
    end)
end

return { run = test.run_cases(define_tests) }
