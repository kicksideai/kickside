-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local inventory = require("inventory")
local function reader_for(entries)
    entries.read = function() return inventory.read_from(entries) end
    return inventory.new(entries)
end
return {run = test.run_cases(function()
    test.describe("Versioned maintenance declarations", function()
        test.it("caches once per version and replaces membership on install and uninstall", function()
            local generation, reads = "v1", 0
            local declarations = {{id = "module:owner", meta = {actor_id = "system:module.owner"}}}
            local reader = reader_for({current_version = function() return {id = function() return generation end} end,
                find = function(criteria)
                    test.eq(criteria[".kind"], "registry.entry")
                    test.eq(criteria["meta.type"], "kickside.execution.maintenance_actor")
                    reads = reads + 1
                    return declarations
                end})
            test.is_true(reader.contains("system:module.owner"))
            test.is_false(reader.contains("system:module.undeclared"))
            test.eq(reads, 1)
            generation = "v2"
            declarations = {{id = "other:owner", meta = {actor_id = "system:other.owner"}}}
            test.is_false(reader.contains("system:module.owner"))
            test.is_true(reader.contains("system:other.owner"))
            test.eq(reads, 2)
            generation, declarations = "v3", {}
            test.is_false(reader.contains("system:other.owner"))
            test.eq(reads, 3)
        end)
        test.it("returns registry failures and never caches a partial or invalid inventory", function()
            local generation, reads = "v1", 0
            local failure = errors.new({kind = errors.UNAVAILABLE, message = "registry unavailable"})
            local version_err, find_err, key = failure, nil, "system:declared"
            local reader = reader_for({current_version = function()
                return {id = function() return generation end}, version_err
            end, find = function()
                reads = reads + 1
                return {{id = "module:owner", meta = {actor_id = key}}}, find_err
            end})
            local value, err = reader.contains("system:declared")
            test.is_nil(value); test.eq(err, failure); test.eq(reads, 0)
            version_err, find_err = nil, failure
            value, err = reader.contains("system:declared")
            test.is_nil(value); test.eq(err, failure)
            find_err, key = nil, " system:declared"
            value, err = reader.contains("system:declared")
            test.is_nil(value); test.is_true(errors.is(err, errors.INVALID))
            key = "system:declared"
            test.is_true(reader.contains(key)); test.eq(reads, 3)
        end)
    end)
end)}
