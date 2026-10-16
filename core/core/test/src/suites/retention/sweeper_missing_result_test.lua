local test = require("test")
local sql = require("sql")
local sweeper = require("sweeper")

-- Implement the full database interface. The injected query result is deliberately
-- untrusted: these cases verify that the sweeper refuses a missing SQL proof.
local function missing_result_db(query: fun(): (any, error?)): sql.DB
    return {
        type = function(_self: sql.DB): (string, error?) return sql.type.SQLITE, nil end,
        query = function(_self: sql.DB, _statement: string, ...: any): (any, error?)
            return query()
        end,
        execute = function(_self: sql.DB, _statement: string, ...: any): (sql.ExecuteResult, error?)
            error("unexpected execute")
        end,
        prepare = function(_self: sql.DB, _statement: string): (sql.Statement, error?)
            error("unexpected prepare")
        end,
        begin = function(_self: sql.DB, _options: any?): (sql.Transaction, error?)
            error("unexpected begin")
        end,
        release = function(_self: sql.DB): (boolean, error?)
            error("unexpected release")
        end,
        stats = function(_self: sql.DB): (sql.DBStats, error?)
            error("unexpected stats")
        end,
    }
end

return test.run_cases(function()
    test.describe("retention missing SQL proofs", function()
        test.it("rejects a missing policy result for one thread", function()
            local db = missing_result_db(function(): (any, error?) return nil, nil end)
            local result, err = sweeper.run_for_thread(db, "missing-policy")
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INTERNAL), tostring(err))
        end)

        test.it("rejects a missing policy scan result", function()
            local calls = 0
            local db = missing_result_db(function(): (any, error?)
                calls = calls + 1
                if calls == 1 then return {}, nil end
                return nil, nil
            end)
            local result, err = sweeper.run(db)
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INTERNAL), tostring(err))
        end)
    end)
end)
