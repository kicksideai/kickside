-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local registry = require("registry")
local funcs = require("funcs")
local consts = require("security_consts")

return {run = test.run_cases(function()
    test.describe("source scope upgrade", function()
        test.it("retires generated policies in bounded commits and preserves native entries", function()
            local original = assert(registry.current_version())
            local ok, failure = pcall(function()
                local changes = assert(registry.snapshot()):changes()
                for i = 1, 405 do
                    local source = "app:scope_upgrade_" .. i
                    changes:create({id = source, kind = "security.policy", data = {policy = {
                        actions = "access", resources = "record:" .. i, effect = "allow"}}})
                    local id = consts.CUSTOM_SCOPE_NS .. ".bindings:" .. source:gsub(".", function(c)
                        return string.format("%02x", string.byte(c))
                    end)
                    changes:create({id = id, kind = "security.policy",
                        meta = {private = true, managed_by = consts.MANAGED_BY, scope_projection_policy = source},
                        data = {groups = {"app:previous_group"}, policy = {actions = "access", resources = "record:" .. i, effect = "allow"}}})
                end
                local group = "app:previous_group"
                local metadata_id = consts.CUSTOM_SCOPE_NS .. ".metadata:" .. group:gsub(".", function(c)
                    return string.format("%02x", string.byte(c))
                end)
                changes:create({id = metadata_id, kind = "security.policy",
                    meta = {private = true, managed_by = consts.MANAGED_BY, scope_metadata = true,
                        scope_projection_effective = {}},
                    data = {groups = {"app:previous_group"}, policy = {actions = "registry.get", resources = "app:previous_group", effect = "allow"}}})
                local seeded = assert(changes:apply())
                test.is_true(assert(funcs.call("app:retire_source_bindings")))
                for _, entry in ipairs(assert(registry.find({[".kind"] = "security.policy"}))) do
                    test.is_nil((entry.meta or {}).scope_projection_policy)
                    test.neq((entry.meta or {}).scope_metadata, true)
                end
                test.not_nil(assert(registry.get("app:module_access")))
                local retired = assert(registry.current_version())
                test.eq(retired:id() - seeded:id(), 3, "406 generated entries retire in three bounded commits")
                test.not_nil(assert(registry.get("app:scope_upgrade_405")))
                test.is_true(assert(funcs.call("app:retire_source_bindings")))
                test.eq(assert(registry.current_version()):id(), retired:id())
            end)
            test.is_true(assert(registry.apply_version(original)))
            if not ok then error(failure) end
        end)
    end)
end)}
