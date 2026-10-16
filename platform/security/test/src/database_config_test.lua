-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local registry = require("registry_fixture")
local configured = require("configured")
local consts = require("security_consts")
local scopes = require("scopes")
local groups = require("groups")

return {run = test.run_cases(function()
    test.describe("security database configuration", function()
        test.it("propagates the registry configuration error unchanged", function()
            local source = errors.new({kind = errors.PERMISSION_DENIED, retryable = false,
                message = "database configuration read denied"})
            registry.get = function(_) return nil, source end
            local id, err = configured.db_id()
            test.is_nil(id)
            test.eq(err, source)
        end)
        test.it("rejects a missing database id", function()
            registry.get = function(_) return {meta = {}}, nil end
            local id, err = configured.db_id()
            test.is_nil(id)
            test.is_true(errors.is(err, errors.UNAVAILABLE))
        end)
        test.it("uses the shared resolver at every persistence boundary", function()
            local original = consts.db_id
            local source = errors.new({kind = errors.UNAVAILABLE, retryable = true,
                message = "database configuration unavailable"})
            consts.db_id = function() return nil, source end
            local ok, failure = pcall(function()
                for index, read in ipairs({
                    function() return scopes.list() end,
                    function() return groups.list() end,
                    function() return groups.save({"app:configured_group"}) end,
                    function() return groups.current("app:configured_set", "revision") end,
                    function() return groups.mark_materialized({"app:configured_set"}, "revision") end,
                }) do
                    local result, err = read()
                    test.is_nil(result, "persistence boundary " .. index)
                    test.eq(err, source, "persistence boundary " .. index)
                end
            end)
            consts.db_id = original
            if not ok then error(failure) end
        end)
    end)
end)}
