local reflection = require("reflection")
local registry = require("registry")
local security = require("security")
local json = require("json")
local test = require("test")

local entries = {
    {
        id = "app:definition",
        kind = "ns.definition",
        meta = { title = "KickSide", comment = "App shell" },
        data = {},
    },
    {
        id = "kickside.agents.traits:platform_manager",
        kind = "registry.entry",
        meta = { type = "agent.trait", title = "Platform Manager", comment = "Mutation capable" },
        data = { tools = { "kickside.agents.traits:platform_manager_tool" } },
    },
    {
        id = "kickside.self_reflection:reflection",
        kind = "library.lua",
        meta = { comment = "Registry introspection library" },
        data = { source = "file://reflection.lua" },
    },
    {
        id = "kickside.self_reflection.traits:self_reflection_tool",
        kind = "function.lua",
        meta = { type = "tool", title = "Self Reflection", comment = "Read-only registry search" },
        data = { source = "file://self_reflection_tool.lua", imports = { "kickside.self_reflection:reflection" } },
    },
    {
        id = "kickside.knowledge:nav_item",
        kind = "registry.entry",
        meta = { type = "ui.nav_item", title = "Knowledge", path = "/knowledge" },
        data = {},
    },
    {
        id = "kickside.ui:admin_view",
        kind = "registry.entry",
        meta = { type = "view.component", title = "Admin", tag_name = "kickside-admin" },
        data = {},
    },
}

local registry_port = {}

function registry_port.find(query: any): (any, any)
    local out = {}
    for _, entry in ipairs(entries) do
        local ok = true
        for k, v in pairs(query or {}) do
            if k == ".kind" then
                ok = ok and entry.kind == v
            elseif k == "meta.type" then
                ok = ok and entry.meta and entry.meta.type == v
            end
        end
        if ok then out[#out + 1] = entry end
    end
    return out, nil
end

function registry_port.get(id: string): (any, any)
    for _, entry in ipairs(entries) do
        if entry.id == id then return entry, nil end
    end
    return nil, nil
end

local function define_tests()
    test.describe("self reflection", function()
        test.it("searches registry entries by text and kind", function()
            local r = reflection.search(registry_port, { q = "reflection", kind = "function.lua" })
            test.eq(r.success, true)
            test.eq(#r.entries, 1)
            test.eq(r.entries[1].id, "kickside.self_reflection.traits:self_reflection_tool")
        end)

        test.it("pages registry search in id order with a cursor", function()
            local seen = {}
            local cursor = nil
            repeat
                local page = reflection.search(registry_port, { namespace = "kickside", limit = 1, cursor = cursor })
                test.is_true(#page.entries <= 1)
                for _, row in ipairs(page.entries) do seen[#seen + 1] = row.id end
                cursor = page.next_cursor
            until cursor == nil
            test.eq(#seen, 5)
            for index = 2, #seen do test.is_true(seen[index] > seen[index - 1]) end
            local _, invalid_err = reflection.search(registry_port, { limit = 0 })
            test.is_true(errors.is(invalid_err, errors.INVALID))
        end)

        test.it("returns the entry with its full meta and data", function()
            local r = reflection.get_entry(registry_port, { id = "kickside.self_reflection.traits:self_reflection_tool" })
            test.eq(r.success, true)
            test.eq(r.entry.type, "tool")
            test.eq(r.entry.title, "Self Reflection")
            test.eq(r.entry.meta.comment, "Read-only registry search")
            test.eq(r.entry.data.imports[1], "kickside.self_reflection:reflection")
            test.eq(r.entry.data.source, "file://self_reflection_tool.lua")
        end)

        test.it("builds overview and namespace tree", function()
            local overview = reflection.overview(registry_port, { limit = 4 })
            test.eq(overview.success, true)
            test.eq(overview.overview.modules.count, 1)
            test.eq(overview.overview.agent_traits.count, 1)
            test.eq(overview.overview.tools.count, 1)

            local tree = reflection.tree(registry_port, { namespace = "kickside" })
            test.eq(tree.success, true)
            test.is_true(tree.tree.count >= 4)
            test.is_true(#tree.tree.children >= 2)
            local names = {}
            for _, child in ipairs(tree.tree.children) do names[child.name] = true end
            test.eq(names.agents, true)
            test.eq(names.self_reflection, true)

            local first = reflection.tree(registry_port, { namespace = "kickside", limit = 1 })
            test.eq(#first.tree.children, 1)
            test.eq(first.tree.next_cursor, first.tree.children[1].name)
            local second = reflection.tree(registry_port, { namespace = "kickside", limit = 1, cursor = first.tree.next_cursor })
            test.is_true(second.tree.children[1].name > first.tree.children[1].name)
        end)

        test.it("publishes a direct namespace tree without a depth input", function()
            local tool, tool_err = registry.get("kickside.self_reflection.traits:self_reflection_tool")
            test.is_nil(tool_err)
            test.not_nil(tool)
            local schema, schema_err = json.decode((tool :: any).meta.input_schema)
            test.is_nil(schema_err)
            test.is_nil((schema :: any).properties.depth)
        end)

        test.it("traces related ids and compares namespaces", function()
            local related = reflection.related(registry_port, { id = "kickside.self_reflection.traits:self_reflection_tool" })
            test.eq(related.success, true)
            test.eq(related.related.entry.id, "kickside.self_reflection.traits:self_reflection_tool")
            test.eq(related.related.outbound[1].id, "kickside.self_reflection:reflection")
            test.eq(related.related.outbound[1].missing, nil)
            test.eq(#related.related.inbound, 0)
            test.is_nil(related.related.next_cursor)

            local inbound = reflection.related(registry_port, { id = "kickside.self_reflection:reflection" })
            test.eq(inbound.related.inbound[1].id, "kickside.self_reflection.traits:self_reflection_tool")

            local paged = reflection.related(registry_port, { id = "kickside.self_reflection.traits:self_reflection_tool", limit = 1 })
            test.eq(#paged.related.outbound + #paged.related.inbound, 1)

            local comparison = reflection.compare_namespaces(registry_port, {
                namespaces = { "kickside.agents", "kickside.self_reflection", "kickside.ui" },
            })
            test.eq(comparison.success, true)
            test.eq(#comparison.comparison, 3)
            test.eq(comparison.comparison[2].namespace, "kickside.self_reflection")
            test.is_true(comparison.comparison[2].count >= 1)

            local first_comparison = reflection.compare_namespaces(registry_port, {
                namespaces = { "kickside.agents", "kickside.self_reflection", "kickside.ui" }, limit = 1,
            })
            test.eq(#first_comparison.comparison, 1)
            test.not_nil(first_comparison.next_cursor)
            local next_comparison = reflection.compare_namespaces(registry_port, {
                namespaces = { "kickside.agents", "kickside.self_reflection", "kickside.ui" }, limit = 1,
                cursor = first_comparison.next_cursor,
            })
            test.eq(#next_comparison.comparison, 1)
            test.is_true(next_comparison.comparison[1].namespace > first_comparison.comparison[1].namespace)
        end)

        test.it("SLOP-REFLECTION-RELATED-READ-ERROR retains absent outbound refs and propagates lookup failures", function()
            local native_entry, native_err = registry.get("app:missing-outbound-reference")
            test.is_nil(native_entry)
            test.is_true(errors.is(native_err, errors.NOT_FOUND))

            local absent_ref_error = errors.new({ message = "entry not found", kind = errors.NOT_FOUND })
            local absent_ref_port = {
                find = registry_port.find,
                get = function(id: string): (any, any)
                    if id == "kickside.self_reflection:reflection" then return nil, absent_ref_error end
                    return registry_port.get(id)
                end,
            }
            local absent_result, absent_err = reflection.related(absent_ref_port, {
                id = "kickside.self_reflection.traits:self_reflection_tool",
            })
            test.is_nil(absent_err)
            test.eq(absent_result.success, true)
            test.eq(absent_result.related.outbound[1].id, "kickside.self_reflection:reflection")
            test.eq(absent_result.related.outbound[1].missing, true)

            local root_read_error = errors.new({ message = "registry unavailable", kind = errors.UNAVAILABLE })
            local root_failure_port = {
                find = registry_port.find,
                get = function(id: string): (any, any)
                    if id == "kickside.self_reflection.traits:self_reflection_tool" then return nil, root_read_error end
                    return registry_port.get(id)
                end,
            }
            local root_result, root_err = reflection.related(root_failure_port, {
                id = "kickside.self_reflection.traits:self_reflection_tool",
            })
            test.is_nil(root_result)
            test.is_true(errors.is(root_err, errors.UNAVAILABLE))

            local failing_port = {
                find = registry_port.find,
                get = function(id: string): (any, any)
                    if id == "kickside.self_reflection:reflection" then return nil, "registry unavailable" end
                    return registry_port.get(id)
                end,
            }
            local result, err = reflection.related(failing_port, {
                id = "kickside.self_reflection.traits:self_reflection_tool",
            })
            test.is_nil(result)
            test.not_nil(err)
            test.is_true(tostring(err):find("registry unavailable", 1, true) ~= nil)
        end)

        test.it("ships execution apart from the optional tool discovery policy", function()
            local actor = security.new_actor("self-reflection-policy-test", {})
            local allow = security.policy("kickside.self_reflection.security:self_reflection_access")
            local tools = security.policy("kickside.self_reflection.security:tool_runtime")

            test.eq(
                allow:evaluate(actor, "access", "kickside.self_reflection.traits:self_reflection_tool", {}),
                "allow")
            test.eq(
                allow:evaluate(actor, "registry.find", "kickside.self_reflection.traits:self_reflection", {}),
                "undefined")

            test.eq(
                tools:evaluate(actor, "registry.find", "kickside.self_reflection.traits:self_reflection", {}),
                "allow")
            test.eq(
                tools:evaluate(actor, "registry.get", "kickside.self_reflection:definition", {}),
                "undefined")
        end)
    end)
end

return { run = test.run_cases(define_tests) }
