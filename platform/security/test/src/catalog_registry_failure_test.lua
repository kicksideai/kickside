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
        test.it("rejects an unavailable policy in a registry scope", function()
            local original_find, original_list = registry.find, scopes.list
            registry.find = function(filter)
                if filter[".kind"] == "security.scope" then
                    return {{id = "app:missing_policy_scope", data = {policies = {"app:unavailable_policy"}}}}, nil
                end
                return {}, nil
            end
            scopes.list = function() return {}, nil end
            local ok, failure = pcall(function()
                local result, err = catalog.scopes()
                test.is_nil(result)
                test.is_true(errors.is(err, errors.NOT_FOUND))
            end)
            registry.find, scopes.list = original_find, original_list
            if not ok then error(failure) end
        end)
        for _, target in ipairs({"", "app.security:user"}) do
            test.it("lists a stored selection over available policies with target '" .. target .. "'", function()
                local original_find, original_list = registry.find, scopes.list
                registry.find = function(filter)
                    if filter[".kind"] == "security.policy" then
                        return {{id = "app:available_policy", data = {groups = {"app.security:user"},
                            policy = {actions = "access", resources = "app:available", effect = "allow"}}}}, nil
                    end
                    if filter[".kind"] == "registry.entry" then
                        return {{id = "app:role_user", data = {role_id = "app.security:user"}}}, nil
                    end
                    return {}, nil
                end
                scopes.list = function()
                    return {{slug = "missing_policy_scope", label = "", description = "", target = target,
                        policies = {"app:unavailable_policy", "app:available_policy"}, enabled = true}}, nil
                end
                local ok, failure = pcall(function()
                    local result, err = catalog.scopes()
                    test.is_nil(err)
                    local listed
                    for _, scope in ipairs(result or {}) do
                        if scope.id == (target == "" and "kickside.security.scopes:missing_policy_scope" or target) then
                            listed = target == "" and scope.policies or scope.overlay_policies
                        end
                    end
                    test.not_nil(listed)
                    test.eq(#listed, 1)
                    test.eq(listed[1].id, "app:available_policy")
                end)
                registry.find, scopes.list = original_find, original_list
                if not ok then error(failure) end
            end)
        end
    end)
end
return {run = test.run_cases(define_tests)}
