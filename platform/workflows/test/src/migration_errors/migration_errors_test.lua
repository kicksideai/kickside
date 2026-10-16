local test = require("test")
local fixtures = {
    { "01", require("01_workflows") },
    { "02", require("02_definition_state") },
    { "04", require("04_admission_recovery") },
}

-- Use the published migration runner with a transaction double: a failed SQL
-- operation aborts the transaction, so continuing replaces the cause with 25P02.
local function run_migration(fn: any, dialect: string, direction: string, fail_at: integer?): (any, any)
    local trace: any = { steps = {}, rolled_back = false, committed = false, aborted = false }
    local tx: any = {}
    local function operation(kind: string, statement: string): (any?, any?)
        trace.steps[#trace.steps + 1] = { kind = kind, statement = statement }
        if trace.aborted then return nil, "25P02 current transaction is aborted" end
        if #trace.steps == fail_at then
            trace.aborted = true
            return nil, "ORIGINAL_SQL_FAILURE at step " .. tostring(fail_at)
        end
        if kind == "execute" then return { rows_affected = 1 }, nil end
        if string.find(statement, "SELECT COUNT", 1, true) then return { { n = 0 } }, nil end
        if string.find(statement, "FROM workflow_def_events", 1, true)
            and string.find(statement, "ORDER BY workflow_id", 1, true) then
            return { { workflow_id = "fixture", seq = 1, type = "kickside.workflows.events:node.added", body = '{"id":"n","kind":"branch"}' } }, nil
        end
        return {}, nil
    end
    function tx:execute(statement: string, _args: any): (any?, any?)
        if string.find(statement, "_migrations", 1, true) then
            if trace.aborted then return nil, "25P02 current transaction is aborted" end
            return { rows_affected = 1 }, nil
        end
        return operation("execute", statement)
    end
    function tx:query(statement: string, _args: any): (any?, any?)
        if string.find(statement, "_migrations", 1, true) then
            if trace.aborted then return nil, "25P02 current transaction is aborted" end
            return { { count = 0 } }, nil
        end
        return operation("query", statement)
    end
    function tx:rollback() trace.rolled_back = true; return true end
    function tx:commit() trace.committed = true; return true end
    local db: any = {}
    function db:type() return dialect, nil end
    function db:query(statement: string, _args: any)
        if string.find(statement, "pg_tables", 1, true) then return { { exists = true } }, nil end
        if string.find(statement, "sqlite_master", 1, true) then return { { count = 1 } }, nil end
        return {}, nil
    end
    function db:begin() return tx, nil end
    return fn({ db = db, id = "fixture", direction = direction, force = true }), trace
end

local function define_tests()
    test.describe("workflow migration SQL errors", function()
        for _, fixture in ipairs(fixtures) do
            for _, dialect in ipairs({ "postgres", "sqlite" }) do
                for _, direction in ipairs({ "up", "down" }) do
                    test.it(fixture[1] .. " " .. dialect .. " " .. direction .. " preserves the first SQL error and stops", function()
                        local baseline, baseline_trace = run_migration(fixture[2], dialect, direction, nil)
                        test.eq(baseline.failed, 0, tostring(baseline.error))
                        for i = 1, #baseline_trace.steps do
                            local result, trace = run_migration(fixture[2], dialect, direction, i)
                            test.eq(result.failed, 1, "SQL step " .. tostring(i) .. " must fail the migration")
                            local err = tostring(result.migrations[1].error)
                            test.is_true(string.find(err, "ORIGINAL_SQL_FAILURE", 1, true) ~= nil, err)
                            test.eq(#trace.steps, i, "no SQL after the first error")
                            test.is_true(trace.rolled_back)
                            test.is_false(trace.committed)
                        end
                    end)
                end
            end
        end
    end)
end
return test.run_cases(define_tests)
