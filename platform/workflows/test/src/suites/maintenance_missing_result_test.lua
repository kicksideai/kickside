local test = require("test")
local maintenance = require("maintenance")

local function fake_admission(query: any, execute: any): any
    return { now = function() return "2000-01-01T00:00:00Z" end,
        transaction = function(fn: any): (any?, any?)
            return fn({ query = query, execute = execute }, "sqlite")
        end }
end

return test.run_cases(function()
    test.describe("workflow maintenance SQL proofs", function()
        test.it("rejects an orphan gate delete without an affected-row result", function()
            local instance = maintenance.new({ admission = fake_admission(function()
                return { { trigger_id = "orphan" } }, nil
            end, function() return nil, nil end) })
            local result, err = instance.prune_terminal(1)
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INTERNAL), tostring(err))
        end)

        test.it("rejects a missing due-run query result", function()
            local instance = maintenance.new({ admission = fake_admission(
                function() return nil, nil end, function() return nil, nil end) })
            local result, err = instance._claim_due(false, 1)
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INTERNAL), tostring(err))
        end)
    end)
end)
