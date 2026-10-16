local test = require("test")
local funcs = require("funcs")
local sql = require("sql")
local plan = require("plan")

local execute
local assertions

local function migrate(ids, before, step_after)
    for _, id in ipairs(ids) do
        if before and before[id] and #before[id] > 0 then
            local db, err = sql.get("app:db")
            if err then error(tostring(err)) end
            execute(db, before[id])
            db:release()
        end
        local result, err = funcs.call(id, { database_id = "app:db", id = id, direction = "up" })
        if err then error(id .. ": " .. tostring(err)) end
        if not result or result.failed ~= 0 then
            error(id .. ": " .. tostring(result and result.error))
        end
        if step_after and step_after[id] and #step_after[id] > 0 then
            local db, db_err = sql.get("app:db")
            if db_err then error(tostring(db_err)) end
            assertions(db, step_after[id])
            db:release()
        end
    end
end

execute = function(db, statements)
    for _, statement in ipairs(statements) do
        local _, err = db:execute(statement)
        if err then error(tostring(err)) end
    end
end

assertions = function(db, cases)
    for _, case in ipairs(cases) do
        local rows, err = db:query(case.query)
        if err then error(tostring(err)) end
        test.eq(#rows, #case.rows, case.query)
        for index, expected in ipairs(case.rows) do
            for key, value in pairs(expected) do
                test.eq(tostring(rows[index][key]), tostring(value), case.query .. ": " .. key)
            end
        end
    end
end

local function define_tests()
    test.describe("published database update", function()
        test.it("runs added migrations and preserves representative published data", function()
            if plan.phase == "baseline" then
                migrate(plan.baseline)
                local db, err = sql.get("app:db")
                if err then error(tostring(err)) end
                execute(db, plan.fixture.seed)
                assertions(db, plan.fixture.assertions)
                db:release()
                return
            end
            local db, err
            migrate(plan.added, plan.fixture.before, plan.fixture.step_after)
            db, err = sql.get("app:db")
            if err then error(tostring(err)) end
            assertions(db, plan.fixture.assertions)
            assertions(db, plan.fixture.after or {})
            db:release()
            migrate(plan.added)
            db, err = sql.get("app:db")
            if err then error(tostring(err)) end
            assertions(db, plan.fixture.assertions)
            assertions(db, plan.fixture.after or {})
            db:release()
        end)
    end)
end
return { run = test.run_cases(define_tests) }
