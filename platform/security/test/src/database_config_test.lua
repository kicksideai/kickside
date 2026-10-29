local group_resolver = require("group_resolver")
local scope_writer = require("scope_writer")
local trigger_reconcile = require("trigger_reconcile")
-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local registry = require("registry_fixture")
local configured = require("configured")
local consts = require("security_consts")
local scopes = require("scopes")
local projection = require("projection")

return {run = test.run_cases(function()
    test.describe("security database configuration", function()
        local projector
        test.before_all(function() projector = scope_writer.start_projector() end)
        test.after_all(function() scope_writer.stop_projector(projector) end)

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
            local slug = "configuration_scope_read"
            test.not_nil(assert(scopes.upsert({slug = slug, policies = {}}, "database-config-test")))
            test.not_nil(assert(trigger_reconcile.trigger()))
            local original = consts.db_id
            local source = errors.new({kind = errors.UNAVAILABLE, retryable = true,
                message = "database configuration unavailable"})
            consts.db_id = function() return nil, source end
            local ok, failure = pcall(function()
                for index, read in ipairs({
                    function() return scopes.list() end,
                    function() return scopes.get("configured") end,
                    function() return scopes.upsert({slug = "configured", policies = {}}, "database-config-test") end,
                    function() return scopes.delete("configured") end,
                    function() return group_resolver.resolve({"kickside.security.scopes:" .. slug}) end,
                }) do
                    local result, err = read()
                    test.is_true(result == nil or result == false, "persistence boundary " .. index)
                    test.eq(err, source, "persistence boundary " .. index)
                end
            end)
            consts.db_id = original
            test.is_true(assert(scopes.delete(slug)))
            test.not_nil(assert(trigger_reconcile.trigger()))
            if not ok then error(failure) end
        end)
    end)
end)}
