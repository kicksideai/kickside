local test = require("test")
local purge = require("purge")
local fixture = require("fixture")
return {run = test.run_cases(function()
    test.describe("permanent receipt purge response failures", function()
        for _, owned in ipairs({true, false}) do
            local cases = {
                {stage = "query", field = "query", response = {}},
                {stage = "query", field = "query", response = {value = false}},
                {stage = "query", field = "query", response = {value = {false}}},
                {stage = "query", field = "query", response = {value = {unexpected = {}}}},
                {stage = "query", field = "query", response = {value = {[2] = {}}}},
                {stage = "query", field = "query.identity", response = {value = {{}}}},
                {stage = "delete", field = "delete.rows_affected", response = {}},
                {stage = "delete", field = "delete.rows_affected", response = {value = false}},
                {stage = "delete", field = "delete.rows_affected", response = {value = {}}},
                {stage = "delete", field = "delete.rows_affected", response = {value = {rows_affected = "invalid"}}},
                {stage = "delete", field = "delete.rows_affected", response = {value = {rows_affected = -1}}},
                {stage = "delete", field = "delete.rows_affected", response = {value = {rows_affected = 0.5}}},
                {stage = "delete", field = "delete.rows_affected", response = {value = {rows_affected = 2}}},
            }
            if owned then
                cases[#cases + 1] = {stage = "begin", field = "begin", response = {}}
                cases[#cases + 1] = {stage = "begin", field = "begin", response = {value = {}}}
            end
            for index, case in ipairs(cases) do
                test.it(tostring(owned) .. "/" .. case.field .. "/" .. tostring(index), function()
                    local db, counts = fixture.executor("", nil, owned)
                    counts.responses[case.stage] = case.response
                    local ok, result, err = pcall(purge.run, db, "2020-01-01T00:00:00Z", 5)
                    test.is_true(ok)
                    test.is_nil(result)
                    test.eq(type(err), "userdata")
                    test.eq(err:kind(), errors.INTERNAL)
                    test.eq(err:retryable(), false)
                    test.eq(err:details().code, "receipt_purge_response")
                    test.eq(err:details().field, case.field)
                    test.eq(counts.commits, 0)
                    test.eq(counts.deletes, case.stage == "delete" and 1 or 0)
                    test.eq(counts.rollbacks, owned and case.stage == "delete" and 1 or 0)
                    test.eq(counts.begins, owned and case.stage ~= "query" and 1 or 0)
                end)
            end
            for _, count in ipairs({0, 1, "0", "1"}) do
                test.it("retains SQL deletion proofs/" .. tostring(owned) .. "/" .. tostring(count), function()
                    local db, counts = fixture.executor("", nil, owned)
                    counts.responses.delete = {value = {rows_affected = count}}
                    local result, err = purge.run(db, "2020-01-01T00:00:00Z", 5)
                    test.is_nil(err)
                    test.eq(result.deleted, tonumber(count))
                    test.eq(counts.commits, owned and 1 or 0)
                    test.eq(counts.rollbacks, 0)
                end)
            end
            test.it("retains empty receipt collection/" .. tostring(owned), function()
                local db, counts = fixture.executor("", nil, owned)
                counts.responses.query = {value = {}}
                local result, err = purge.run(db, "2020-01-01T00:00:00Z", 5)
                test.is_nil(err)
                test.eq(result.deleted, 0)
                test.eq(counts.deletes, 0)
                test.eq(counts.commits, owned and 1 or 0)
            end)
        end
        test.it("requires a transactional executor", function()
            local result, err = purge.run({}, "2020-01-01T00:00:00Z", 5)
            test.is_nil(result)
            test.eq(err:kind(), errors.INTERNAL)
            test.eq(err:retryable(), false)
            test.eq(err:details().code, "receipt_purge_response")
            test.eq(err:details().field, "executor")
        end)
    end)
end)}
