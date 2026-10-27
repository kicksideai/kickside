-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local registry = require("registry")

local function entry(id)
    local value, err = registry.get(id)
    test.is_nil(err)
    test.not_nil(value)
    return value
end

local function define_tests()
    test.describe("Memory host bindings", function()
        test.it("serves Memory and Knowledge through the harness HTTP resources", function()
            test.eq(entry("kickside.memory:ui_static").meta.server, "app:gateway")
            test.eq(entry("kickside.knowledge:ui_static").meta.server, "app:gateway")
            test.eq(entry("kickside.memory.api:list_memories.endpoint").meta.router, "app:api")
            test.eq(entry("kickside.knowledge.api:list_kb.endpoint").meta.router, "app:api")
        end)

        test.it("binds Memory persistence and member access to the harness", function()
            test.eq(entry("kickside.memory:db_config").meta.db_id, "app:db")
            test.eq(entry("kickside.memory.migrations:01_memory_schema").meta.target_db, "app:db")
            test.eq(entry("kickside.memory.security:module_access").data.groups[1], "app:user")
            test.eq(entry("kickside.knowledge.security:module_access").data.groups[1], "app:user")
        end)
    end)
end

local cases = test.run_cases(define_tests)
return { run = function(options) return cases(options) end }
