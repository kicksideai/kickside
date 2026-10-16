-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local registry = require("registry_fixture")
local projection = require("projection")
local groups = require("policy_groups")

return {run = test.run_cases(function()
    test.describe("projection registry reads", function()
        test.it("propagates the policy binding snapshot error", function()
            local source = errors.new({kind = errors.UNAVAILABLE, message = "policy snapshot read fails"})
            local result, err = groups.plan({}, {}, {find = function() return nil, source end})
            test.is_nil(result)
            test.eq(err, source)
        end)
        test.it("propagates group-set entry read errors", function()
            local source = errors.new({kind = errors.UNAVAILABLE, message = "group set read fails"})
            local reads = 0
            registry.snapshot = function()
                return {
                    get = function() return nil, source end,
                    find = function()
                        reads = reads + 1
                        if reads == 1 then return {{id = "app:checked_policy", meta = {}, data = {
                            groups = {"app:checked_group"}, policy = {actions = "read", resources = "*", effect = "allow"}}}}, nil end
                        return {}, nil
                    end,
                }, nil
            end
            local result, err = projection.materialize({"app:checked_group"})
            test.is_nil(result)
            test.eq(err, source)
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
