local test = require("test")
local registry = require("registry")

type DependencyData = {
    component: string?,
    version: string?,
}

type DependencyEntry = {
    id: string?,
    kind: string?,
    component: string?,
    version: string?,
    data: DependencyData?,
}

type ToolData = { tools: { string }? }
type ToolEntry = { data: ToolData? }
type FunctionData = {
    modules: { string }?,
    imports: { [string]: string }?,
}
type FunctionEntry = { data: FunctionData?, meta: { [string]: any }? }

local EXPECTED: { [string]: { string } } = {
    ["kickside.knowledge:dep.kickside.component"] = { "kickside/component", "*" },
    ["kickside.knowledge:dep.kickside.execution"] = { "kickside/execution", "*" },
    ["kickside.knowledge:dep.kickside.contract"] = { "kickside/contract", "*" },
    ["kickside.knowledge:dep.kickside.core"] = { "kickside/core", "*" },
    ["kickside.knowledge:dep.kickside.models"] = { "kickside/models", "*" },
    ["kickside.knowledge:dep.kickside.uploads"] = { "kickside/uploads", "*" },
    ["kickside.knowledge:dep.wippy.agent"] = { "wippy/agent", "*" },
    ["kickside.knowledge:dep.wippy.dataflow"] = { "wippy/dataflow", "*" },
    ["kickside.knowledge:dep.wippy.llm"] = { "wippy/llm", "*" },
    ["kickside.knowledge:dep.wippy.views"] = { "wippy/views", "*" },
}

local function dependency_data(raw: DependencyEntry): DependencyData
    return raw.data or { component = raw.component, version = raw.version }
end

local function tools_of(id: string): { string }
    local raw = registry.get(id) :: ToolEntry?
    test.not_nil(raw, id .. " must exist")
    local data = (raw :: ToolEntry).data or {}
    return data.tools or {}
end

local function assert_no_engine_tools(id: string)
    for _, tool_id in ipairs(tools_of(id)) do
        test.is_false(tool_id:sub(1, #"kickside.kb10.") == "kickside.kb10.",
            id .. " must not make the optional kb10 engine mandatory")
    end
end

local function contains(values: { string }, expected: string): boolean
    for _, value in ipairs(values) do
        if value == expected then return true end
    end
    return false
end

local function define_tests()
    test.describe("kickside.knowledge packaging", function()
        test.it("reads embedding choices from the configured model catalog", function()
            local entry = registry.get("kickside.knowledge.api:list_embedding_models") :: FunctionEntry
            test.eq((entry.data :: FunctionData).imports.models, "kickside.models.catalog:model_catalog")
        end)
        test.it("declares its direct production dependency set with open versions", function()
            local found: { [string]: boolean } = {}
            local all, err = registry.find({})
            test.is_nil(err)
            for _, raw in ipairs(all or {}) do
                local entry = raw :: DependencyEntry
                local id = tostring(entry.id or "")
                if id:sub(1, #"kickside.knowledge:") == "kickside.knowledge:"
                    and entry.kind == "ns.dependency" then
                    local expected = EXPECTED[id]
                    test.not_nil(expected, "unexpected Knowledge dependency: " .. id)
                    local data = dependency_data(entry)
                    test.eq(data.component, expected[1], id .. " component")
                    test.eq(data.version, expected[2], id .. " version")
                    test.is_true(data.version == "*" or (data.version or ""):sub(1, 2) == ">=",
                        id .. " must use an open compatible range")
                    if data.version ~= "*" then
                        test.is_false((data.version or ""):find("<", 3, true) ~= nil,
                            id .. " must not impose an upper pin")
                    end
                    found[id] = true
                end
            end

            for id, _ in pairs(EXPECTED) do
                test.eq(found[id], true, "missing Knowledge dependency: " .. id)
            end
        end)

        test.it("keeps engines and optional integrations out of the dependency graph", function()
            test.is_nil((registry.get("kickside.knowledge:dep.kickside.kb10")))
            test.is_nil((registry.get("kickside.knowledge:dep.kickside.agents")))
            test.is_nil((registry.get("kickside.knowledge:dep.kickside.automation")))

            assert_no_engine_tools("kickside.knowledge.traits:kb_reader")
            assert_no_engine_tools("kickside.knowledge.traits:kb_explorer")
            assert_no_engine_tools("kickside.knowledge.traits:knowledge_manager")
            assert_no_engine_tools("kickside.knowledge.retrieval:kb_query_agent")
        end)

        test.it("keeps KB lifecycle owned by Knowledge", function()
            local raw = registry.get("kickside.knowledge.api:delete_kb") :: FunctionEntry?
            test.not_nil(raw)
            local data = (raw :: FunctionEntry).data or {}
            local modules = data.modules or {}
            test.is_true(contains(modules, "contract"))

            local imports = data.imports or {}
            test.eq(imports.component, "kickside.component:component")
            test.eq(imports.http_errors, "kickside.contract:http_errors")
            local import_count = 0
            for _, imported in pairs(imports) do
                import_count = import_count + 1
                test.is_false(tostring(imported):find("kickside.automation", 1, true) ~= nil)
            end
            test.eq(import_count, 2)
        end)

        test.it("keeps the Knowledge Manager on canonical component identity and minimal native capabilities", function()
            local raw = registry.get("kickside.knowledge.traits:knowledge_manager_tool") :: FunctionEntry?
            test.not_nil(raw)
            local data = (raw :: FunctionEntry).data or {}
            local modules = data.modules or {}
            test.is_true(contains(modules, "contract"))
            test.is_true(contains(modules, "security"))
            test.is_false(contains(modules, "component"))
            test.is_false(contains(modules, "registry"))

            local imports = data.imports or {}
            test.eq(imports.component, "kickside.component:component")
            test.eq(imports.engines, "kickside.knowledge:engines")

            local meta = (raw :: FunctionEntry).meta or {}
            test.eq(meta.public, true)
            test.is_nil(meta.mcp)
            local schema = tostring(meta.input_schema or "")
            test.is_true(schema:find('"component_id"', 1, true) ~= nil)
            test.is_false(schema:find('"kb_id"', 1, true) ~= nil)
            test.is_true(schema:find('"resummarize_knowledge_base"', 1, true) ~= nil)
            test.is_true(schema:find('"reembed_knowledge_base"', 1, true) ~= nil)
            test.is_true(schema:find('"knowledge_base_maintenance"', 1, true) ~= nil)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
