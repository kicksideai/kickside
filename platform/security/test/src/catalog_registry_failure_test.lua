-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local registry = require("registry")
local catalog = require("catalog")
local scopes = require("scopes")

local function define_tests()
    test.describe("scope catalog registry boundaries", function()
        for _, operation in ipairs({"policies", "scopes"}) do
            for _, stage in ipairs(operation == "policies" and {1} or {1, 2, 3}) do
                test.it("propagates registry read failure from " .. operation .. " stage " .. stage, function()
                    local original_find, original_list = registry.find, scopes.list
                    local source = errors.new({kind = errors.UNAVAILABLE, retryable = true,
                        message = "catalog registry read fails", details = {stage = stage}})
                    local reads = 0
                    registry.find = function(_)
                        reads = reads + 1
                        if reads == stage then return nil, source end
                        return {}, nil
                    end
                    scopes.list = function() return {}, nil end
                    local ok, failure = pcall(function()
                        local result, err = catalog[operation]()
                        test.is_nil(result)
                        test.eq(err, source)
                    end)
                    registry.find, scopes.list = original_find, original_list
                    if not ok then error(failure) end
                end)
            end
        end
        for _, source in ipairs({"custom", "registry"}) do
            test.it("rejects an unavailable policy in a " .. source .. " scope", function()
                local original_find, original_list = registry.find, scopes.list
                registry.find = function(filter)
                    if source == "registry" and filter[".kind"] == "security.scope" then
                        return {{id = "app:missing_policy_scope", data = {policies = {"app:unavailable_policy"}}}}, nil
                    end
                    return {}, nil
                end
                scopes.list = function()
                    if source == "custom" then return {{slug = "missing_policy_scope", label = "", description = "",
                        target = "", policies = {"app:unavailable_policy"}, enabled = true}}, nil end
                    return {}, nil
                end
                local ok, failure = pcall(function()
                    local result, err = catalog.scopes()
                    test.is_nil(result)
                    test.is_true(errors.is(err, errors.NOT_FOUND))
                end)
                registry.find, scopes.list = original_find, original_list
                if not ok then error(failure) end
            end)
        end
    end)
end
return {run = test.run_cases(define_tests)}
