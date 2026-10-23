local json = require("json")
local contract = require("contract")
local registry = require("registry")
local tool_adapter = require("tool_adapter")

local M = {}

type Map = { [string]: any }

local NODE_TYPE = {
    FUNC = "userspace.dataflow.node.func:node",
    AGENT = "userspace.dataflow.node.agent:node",
    AWAIT = "kickside.blocks:await",
}

local INLINE_AGENT_MAX_TOKENS = 8000

local function map(value: any): Map
    return type(value) == "table" and (value :: Map) or {}
end

local function copy(value: any): any
    if type(value) ~= "table" then return value end
    local out: Map = next(value) == nil and json.encode(value) == "{}" and table.create(0, 1) or {}
    for key, item in pairs(value :: Map) do out[key] = copy(item) end
    return out
end

local function text(value: any): string
    return type(value) == "string" and value or ""
end

function M.plan_descriptor(descriptor: any, instance: any): (Map?, string?)
    local row = map(instance)
    local config = type(row.config) == "table" and row.config or {}
    local declared = map(descriptor)
    local execution = map(declared.execution)
    local kind = text(execution.kind)
    local plan: Map = { block_id = declared.id, config = {} }
    if kind == "function" then
        plan.node_type = NODE_TYPE.FUNC
        plan.config = {
            func_id = execution.function_id,
            args = { config = copy(config) },
            input_transform = { input = "input" },
        }
    elseif kind == "tool" then
        local tool_id = text(execution.tool_id)
        if not contract.exact_id(tool_id) then return nil, "Tool execution requires an exact namespace:name tool_id" end
        local entry, entry_err = registry.get(tool_id)
        if entry_err or type(entry) ~= "table" then return nil, "Tool not found: " .. tool_id end
        if not tool_adapter.visible(entry) then return nil, "entry is not a public registry tool" end
        plan.node_type = NODE_TYPE.FUNC
        plan.config = { func_id = tool_id }
        -- Native FUNC semantics own argument composition: connected object fields
        -- supply unset arguments and these fixed arguments take precedence. Blocks
        -- only freezes the exact target and user-selected overrides.
        if next(config :: Map) ~= nil then plan.config.args = copy(config) end
    elseif kind == "agent" then
        plan.node_type = NODE_TYPE.AGENT
        local native: Map = {}
        local agent_config = execution.mode == "config" and map(config) or execution
        local inline = execution.mode == "config" and text(agent_config.instructions) ~= ""
        if inline then
            native.agent = {
                id = "inline:" .. text(row.def_node_id),
                name = text(agent_config.name) ~= "" and agent_config.name or declared.title,
                max_tokens = tonumber(agent_config.max_tokens) or INLINE_AGENT_MAX_TOKENS,
            }
            native.arena = {
                prompt = agent_config.instructions,
                model = agent_config.model,
                tools = copy(agent_config.tools),
                exit_schema = copy(agent_config.exit_schema),
                tool_calling = text(agent_config.tool_calling) ~= "" and agent_config.tool_calling or "auto",
                context = copy(agent_config.context or {}),
            }
            if native.arena.exit_schema ~= nil then native.arena.tool_calling = "any" end
        else
            native.agent = execution.mode == "config" and agent_config.agent_id or execution.agent_id
            native.arena = {
                tool_calling = text(agent_config.tool_calling) ~= "" and agent_config.tool_calling or "auto",
                model = agent_config.model,
                tools = copy(agent_config.tools),
                exit_schema = copy(agent_config.exit_schema),
                context = copy(agent_config.context or {}),
            }
            if native.arena.exit_schema ~= nil then native.arena.tool_calling = "any" end
        end
        if text(agent_config.exit_func_id) ~= "" then native.arena.exit_func_id = agent_config.exit_func_id end
        if agent_config.max_iterations ~= nil then native.arena.max_iterations = tonumber(agent_config.max_iterations) end
        -- The engine reserves the agent-node inputs `context` (merges into the
        -- arena), `model` and `agent_id` (overrides). A workflow delivers one
        -- payload object, so those carriers are split out of it here; the whole
        -- payload stays visible to the agent under `input`.
        native.input_transform = {
            context = "input.context",
            model = "input.model",
            agent_id = "input.agent_id",
            max_iterations = "input.max_iterations",
            input = "input",
        }
        plan.config = native
    elseif kind == "wait" then
        plan.node_type = NODE_TYPE.AWAIT
        plan.config = {
            arm_id = execution.arm_id,
            block_config = copy(config),
        }
    else
        return nil, "unsupported Block execution kind: " .. kind
    end
    return plan, nil
end

function M.plan(entry: any, instance: any): (Map?, string?)
    local row = map(instance)
    local config = type(row.config) == "table" and row.config or {}
    local issue = contract.validate_instance(entry, config)
    if issue then return nil, issue end
    local descriptor, describe_err = contract.describe(entry)
    if not descriptor then return nil, describe_err end
    return M.plan_descriptor(descriptor, instance)
end

return M
