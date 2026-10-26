-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local registry = require("registry_fixture")
local projection = require("projection")

return {run = test.run_cases(function()
    test.describe("projection registry reads", function()
        test.it("propagates snapshot acquisition errors", function()
            local source = errors.new({kind = errors.UNAVAILABLE, message = "scope snapshot read fails"})
            registry.snapshot = function() return nil, source end
            local result, err = projection.reconcile()
            test.is_nil(result)
            test.eq(err, source)
        end)
        test.it("rejects an absent registry snapshot", function()
            registry.snapshot = function() return nil, nil end
            local result, err = projection.reconcile()
            test.is_nil(result)
            test.is_true(errors.is(err, errors.UNAVAILABLE))
            test.eq(err:retryable(), true)
        end)
        for _, stage in ipairs({1, 2, 3}) do
            test.it("propagates snapshot read error at projection stage " .. stage, function()
                local source = errors.new({kind = errors.UNAVAILABLE, message = "projection snapshot read fails"})
                local reads = 0
                local version = {id = function() return 1 end}
                registry.snapshot = function()
                    return {
                        version = function() return version end,
                        find = function()
                            reads = reads + 1
                            if reads == stage then return nil, source end
                            return {}, nil
                        end,
                    }, nil
                end
                local result, err = projection.reconcile()
                test.is_nil(result)
                test.eq(err, source)
            end)
        end
    end)
end)}
