local test = require("test")
local block_catalog = require("block_catalog")

type Map = { [string]: any }

local function tool_descriptor(id: string, public: boolean): Map
    local input = {
        type = "object",
        required = { "path" },
        properties = {
            path = { type = "string" },
            pattern = { type = "string" },
        },
        additionalProperties = false,
    }
    local config = {
        type = "object",
        properties = {
            path = { type = "string" },
            pattern = { type = "string" },
        },
        additionalProperties = false,
    }
    local output = {
        type = "object",
        properties = { count = { type = "integer" } },
        additionalProperties = false,
    }
    local failure = {
        type = "object",
        required = { "code", "message" },
        properties = { code = { type = "string" }, message = { type = "string" } },
        additionalProperties = false,
    }
    return {
        id = id,
        title = "Count Files",
        description = "Count matching files",
        public = public,
        source_kind = "tool",
        tool = true,
        input = input,
        config = config,
        output = output,
        error = failure,
        ports = {
            { id = "result", label = "Result", direction = "out", schema = output },
            { id = "failed", label = "Failed", direction = "out", schema = failure },
        },
        presentation = { category = "Tools", icon = "tabler:tool", hue = "blue" },
        execution = { kind = "tool", tool_id = id },
    }
end

local function explicit_descriptor(id: string): Map
    local schema = { type = "object", additionalProperties = true }
    local declaration: Map = {
        id = id,
        kind = "registry.entry",
        meta = { type = "kickside.block", public = true, title = "Agent" },
        data = { block = {
            api_version = "kickside.block/v1",
            input = schema,
            config = schema,
            output = schema,
            ports = { { id = "result", direction = "out" } },
            execution = { kind = "agent", mode = "config" },
        } },
    }
    return {
        id = id,
        title = "Agent",
        public = true,
        source_kind = "block",
        input = schema,
        config = schema,
        output = schema,
        ports = { { id = "result", direction = "out" } },
        presentation = { category = "Agents" },
        execution = { kind = "agent", mode = "config" },
        declaration = declaration,
    }
end

local function run()
    test.describe("Workflow canonical Block catalog", function()
        test.it("projects tools with exact identity and preserves non-public compiler descriptors", function()
            local old = block_catalog._blocks
            block_catalog._blocks = {
                catalog = function()
                    return {
                        ["keeper.files:count_files"] = tool_descriptor("keeper.files:count_files", true),
                        ["keeper.files:private_count"] = tool_descriptor("keeper.files:private_count", false),
                        ["kickside.agents:block.agent"] = explicit_descriptor("kickside.agents:block.agent"),
                    }, nil
                end,
            }

            local catalog, err = block_catalog.catalog()
            block_catalog._blocks = old

            test.is_nil(err)
            local count = (catalog :: Map)["keeper.files:count_files"] :: Map
            test.not_nil(count)
            test.eq(count.kind, "block")
            test.eq(count.id, "keeper.files:count_files")
            test.eq(count.category, "Tools")
            test.is_true(count.tool)
            test.eq(count.source_kind, "tool")
            test.eq((((count.input_schema :: Map).properties :: Map).path :: Map).type, "string")
            test.eq((((count.output_schema :: Map).properties :: Map).count :: Map).type, "integer")
            test.is_nil((count.config_schema :: Map).required)
            test.eq(((count.execution :: Map).tool_id), "keeper.files:count_files")
            test.is_false((((catalog :: Map)["keeper.files:private_count"] :: Map).public))
            local agent = (catalog :: Map)["kickside.agents:block.agent"] :: Map
            test.eq((((agent.declaration :: Map).data :: Map).block :: Map).api_version, "kickside.block/v1")
        end)
    end)
end

return { run = test.run_cases(run) }
