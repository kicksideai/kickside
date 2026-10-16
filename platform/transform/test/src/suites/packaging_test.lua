local test = require("test")
local registry = require("registry")

local function data(entry: any): any
    return type(entry) == "table" and (entry.data or entry) or {}
end

local function assert_targets(requirement_id: string, expected: { [string]: string })
    local requirement = registry.get(requirement_id)
    test.not_nil(requirement)
    local seen: { [string]: string } = {}
    for _, target in ipairs((data(requirement).targets or {}) :: { any }) do
        seen[tostring(target.entry)] = tostring(target.path)
    end
    local expected_count = 0
    for entry_id, path in pairs(expected) do
        expected_count = expected_count + 1
        test.eq(seen[entry_id], path, requirement_id .. " misses " .. entry_id)
    end
    local actual_count = 0
    for _ in pairs(seen) do actual_count = actual_count + 1 end
    test.eq(actual_count, expected_count, requirement_id .. " contains a stale or duplicate target")
end

local function meta(entry: any): any
    return type(entry) == "table" and (entry.meta or (entry.data and entry.data.meta)) or {}
end

local function define_tests()
    test.describe("kickside.transform packaging", function()
        test.it("injects every host-owned integration resource", function()
            assert_targets("kickside.transform:ui_server", {
                ["kickside.transform:ui_static"] = ".meta.server",
            })
            assert_targets("kickside.transform:api_router", {
                ["kickside.transform.api:assist.endpoint"] = ".meta.router",
                ["kickside.transform.api:validate.endpoint"] = ".meta.router",
                ["kickside.transform.api:snippet.endpoint"] = ".meta.router",
            })

            local ui_requirement = registry.get("kickside.transform:ui_server")
            local static = registry.get("kickside.transform:ui_static")
            test.not_nil(ui_requirement)
            local server = tostring(meta(static).server)
            test.is_true(server ~= "" and server ~= "nil")
        end)

        test.it("selects the strategy contract suite in the native harness", function()
            local suite = registry.get("kickside.transform:strategy_test")
            test.not_nil(suite)
            test.eq(meta(suite).type, "test")
            test.eq(meta(suite).suite, "transform")
        end)

    end)
end

return { run = test.run_cases(define_tests) }
