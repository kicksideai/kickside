local test = require("test")
local registry = require("registry")
local json = require("json")

-- Locks the model-agnostic contract split: the knowledge control plane exposes ONLY
-- the store lifecycle to a KB engine. Node/edge/embedding/summary/graph operations
-- must not appear on the kb_store_lifecycle contract surface — they are the engine's
-- own internal concern (kb10's node_store), never a knowledge contract.

local LIFECYCLE_CONTRACT = "kickside.knowledge:kb_store_lifecycle"
local MAINTAINABLE_CONTRACT = "kickside.knowledge:maintainable"
local ALLOWED = { create_store = true, get_store = true, update_config = true, delete_store = true }
local MAINTENANCE_ALLOWED = { schedule_resummarize = true, schedule_reembed = true, maintenance_status = true }
local BANNED = {
    "insert_node", "insert_graph_node", "update_node", "get_node", "get_nodes",
    "browse_nodes", "delete_node", "find_by_external_id", "insert_embedding",
    "vector_search", "vector_dimensions", "insert_edge", "get_edges",
    "get_edges_batch", "delete_edge", "apply_graph_patch", "graph_traverse",
    "get_summaries", "list_document_summaries", "set_descriptions",
}

local function methods_of(entry: any): { [string]: boolean }
    local names: { [string]: boolean } = {}
    local list = nil
    if type(entry) == "table" then
        list = entry.methods
        if list == nil and type(entry.data) == "table" then list = entry.data.methods end
    end
    for _, m in ipairs((type(list) == "table" and list or {}) :: { any }) do
        if type(m) == "table" and type(m.name) == "string" then
            names[m.name] = true
        end
    end
    return names
end

local function define_tests()
    test.describe("kickside.knowledge kb_store_lifecycle contract surface", function()
        test.it("defines exactly the four model-agnostic lifecycle methods", function()
            local entry, err = registry.get(LIFECYCLE_CONTRACT)
            test.is_nil(err)
            test.not_nil(entry, LIFECYCLE_CONTRACT .. " is missing")
            local names = methods_of(entry)

            for allowed in pairs(ALLOWED) do
                test.is_true(names[allowed] == true, "missing lifecycle method " .. allowed)
            end
            for name in pairs(names) do
                test.is_true(ALLOWED[name] == true, "unexpected non-lifecycle method on the contract: " .. name)
            end
        end)

        test.it("describes the store row returned to knowledge callers", function()
            local entry, err = registry.get(LIFECYCLE_CONTRACT)
            test.is_nil(err)
            local output = nil
            for _, method in ipairs(entry.data.methods) do
                if method.name == "get_store" then output = method.output_schemas[1] end
            end
            test.not_nil(output)
            test.eq(output.format, "application/schema+json")
            local schema, decode_err = json.decode(output.definition)
            test.is_nil(decode_err)
            for field, kind in pairs({ id = "string", component_id = "string",
                embedding_model = "string", config = "object", kb_type = "string" }) do
                test.not_nil(schema.properties[field], "get_store omits " .. field)
                test.eq(schema.properties[field].type, kind)
            end
            for _, field in ipairs({ "enrichment_agent_id", "auto_summary", "auto_description" }) do
                test.not_nil(schema.properties[field], "get_store omits " .. field)
                test.eq(schema.properties[field].type[1], "string")
                test.eq(schema.properties[field].type[2], "null")
            end
            test.not_nil(schema.properties.config_snapshot)
            test.is_nil(schema.required, "existing engines may omit store fields")
            test.is_true(schema.additionalProperties ~= false, "engine-specific row fields remain valid")
        end)

        test.it("carries no node/edge/embedding/graph method", function()
            local names = methods_of((registry.get(LIFECYCLE_CONTRACT)))
            for _, banned in ipairs(BANNED) do
                test.is_true(names[banned] ~= true, "node method leaked onto the lifecycle contract: " .. banned)
            end
        end)
    end)

    test.describe("kickside.knowledge maintainable contract surface", function()
        test.it("defines exactly the published whole-KB maintenance methods", function()
            local entry, err = registry.get(MAINTAINABLE_CONTRACT)
            test.is_nil(err)
            test.not_nil(entry, MAINTAINABLE_CONTRACT .. " is missing")
            local names = methods_of(entry)

            for allowed in pairs(MAINTENANCE_ALLOWED) do
                test.is_true(names[allowed] == true, "missing maintenance method " .. allowed)
            end
            for name in pairs(names) do
                test.is_true(MAINTENANCE_ALLOWED[name] == true,
                    "unexpected method on the maintainable contract: " .. name)
            end
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
