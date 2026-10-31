local json = require("json")
local retry = require("retry")

local M = {}

type Map = { [string]: any }

M.API_VERSION = "kickside.block/v1"
M.BLOCK_TYPE = "kickside.block"

local function map(value: any): Map
    return type(value) == "table" and (value :: Map) or {}
end

local function text(value: any): string
    return type(value) == "string" and value or ""
end

local function exact_id(value: any): boolean
    local id = text(value)
    return id ~= "" and id == id:match("^([^%s:]+:[^%s:]+)$")
end

local function exact_id_array(value: any, path: string): string?
    if type(value) ~= "table" then return path .. " must be an array" end
    local count = 0
    for index, item in ipairs(value :: { any }) do
        count = count + 1
        if not exact_id(item) then return path .. "[" .. tostring(index) .. "] must be an exact namespace:name id" end
    end
    for key, _ in pairs(value :: Map) do
        if type(key) ~= "number" or key < 1 or math.floor(key) ~= key or key > count then
            return path .. " must be an array"
        end
    end
    return nil
end

local function reject_unknown(value: Map, allowed: Map, path: string): string?
    for key, _ in pairs(value) do
        if allowed[key] ~= true then return path .. " contains unsupported field " .. tostring(key) end
    end
    return nil
end

local function schema(value: any, path: string, required: boolean): string?
    if value == nil and not required then return nil end
    if type(value) ~= "table" then return path .. " must be a JSON Schema object" end
    if text(map(value).type) ~= "object" then return path .. ".type must be object" end
    return nil
end

local function validate_ports(value: any, path: string): string?
    if type(value) ~= "table" then return path .. " must be an array" end
    local seen: Map = {}
    for index, raw in ipairs(value :: { any }) do
        if type(raw) ~= "table" then return path .. "[" .. tostring(index) .. "] must be an object" end
        local port = raw :: Map
        local unknown = reject_unknown(port, {
            id = true, label = true, direction = true, condition = true, schema = true,
        }, path .. "[" .. tostring(index) .. "]")
        if unknown then return unknown end
        local id = text(port.id)
        if id == "" then return path .. "[" .. tostring(index) .. "].id is required" end
        if seen[id] then return path .. " contains duplicate id " .. id end
        seen[id] = true
        if port.label ~= nil and text(port.label) == "" then return path .. "[" .. tostring(index) .. "].label must be a string" end
        if port.direction ~= "out" then return path .. "[" .. tostring(index) .. "].direction must be out" end
        if port.condition ~= nil and text(port.condition) == "" then return path .. "[" .. tostring(index) .. "].condition must be a string" end
        if port.schema ~= nil then
            local issue = schema(port.schema, path .. "[" .. tostring(index) .. "].schema", true)
            if issue then return issue end
        end
    end
    for key, _ in pairs(value :: Map) do
        if type(key) ~= "number" or key < 1 or math.floor(key) ~= key then return path .. " must be an array" end
    end
    return nil
end

local function validate_execution(value: any, path: string): string?
    if type(value) ~= "table" then return path .. " must be an object" end
    local execution = value :: Map
    local kind = text(execution.kind)
    local _, retry_err = retry.validate(execution, kind == "function" and "func" or kind)
    if retry_err then return path .. ": " .. retry_err end
    if kind == "function" then
        local unknown = reject_unknown(execution, { kind = true, function_id = true,
            retry_policy = true, start_to_close_timeout = true, schedule_to_close_timeout = true }, path)
        if unknown then return unknown end
        if not exact_id(execution.function_id) then return path .. ".function_id must be an exact namespace:name id" end
    elseif kind == "agent" then
        if execution.mode == "config" then
            local unknown = reject_unknown(execution, { kind = true, mode = true }, path)
            if unknown then return unknown end
        else
            local unknown = reject_unknown(execution, { kind = true, agent_id = true }, path)
            if unknown then return unknown end
            if not exact_id(execution.agent_id) then return path .. ".agent_id must be an exact namespace:name id" end
        end
    elseif kind == "wait" then
        local unknown = reject_unknown(execution, { kind = true, arm_id = true }, path)
        if unknown then return unknown end
        if execution.arm_id ~= nil and not exact_id(execution.arm_id) then return path .. ".arm_id must be an exact namespace:name id" end
    else
        return path .. ".kind must be function, agent, or wait"
    end
    return nil
end

function M.validate(entry: any): string?
    if type(entry) ~= "table" then return "Block declaration must be an entry" end
    local row = entry :: Map
    local id = text(row.id)
    if not exact_id(id) then return "Block id must be an exact namespace:name id" end
    if text(map(row.meta).type) ~= M.BLOCK_TYPE then return id .. " is not a Block" end
    if text(row.kind) ~= "registry.entry" then return id .. " must be a registry.entry" end
    local data = map(row.data)
    local block = map(data.block)
    if type(data.block) ~= "table" then return id .. ".data.block is required" end
    local unknown = reject_unknown(block, {
        api_version = true, input = true, config = true, output = true, error = true,
        ports = true, presentation = true, execution = true,
    }, id .. ".data.block")
    if unknown then return unknown end
    if text(block.api_version) ~= M.API_VERSION then return id .. ".data.block.api_version must be " .. M.API_VERSION end
    local issue = schema(block.input, id .. ".data.block.input", true)
        or schema(block.config, id .. ".data.block.config", true)
        or schema(block.output, id .. ".data.block.output", true)
        or schema(block.error, id .. ".data.block.error", false)
    if issue then return issue end
    issue = validate_ports(block.ports, id .. ".data.block.ports")
    if issue then return issue end
    local declares_failed = false
    for _, raw_port in ipairs(block.ports :: { any }) do
        if type(raw_port) == "table" and text((raw_port :: Map).id) == "failed" then declares_failed = true end
    end
    if declares_failed ~= (block.error ~= nil) then
        return id .. ".data.block.error and the failed port must be declared together"
    end
    if block.presentation ~= nil then
        if type(block.presentation) ~= "table" then return id .. ".data.block.presentation must be an object" end
        issue = reject_unknown(block.presentation :: Map, {
            category = true, icon = true, hue = true, blurb = true, config_wc = true,
        }, id .. ".data.block.presentation")
        if issue then return issue end
    end
    issue = validate_execution(block.execution, id .. ".data.block.execution")
    if issue then return issue end
    local execution = map(block.execution)
    if execution.kind == "agent" and execution.mode == "config" then
        local properties = map(map(block.config).properties)
        if text(map(properties.agent_id).type) ~= "string" then return id .. ".data.block.config.properties.agent_id.type must be string for configurable agent execution" end
        if text(map(properties.instructions).type) ~= "string" then return id .. ".data.block.config.properties.instructions.type must be string for configurable agent execution" end
        local standard: Map = {
            agent_id = true, instructions = true, name = true, model = true, tools = true,
            exit_schema = true, tool_calling = true, context = true, max_tokens = true,
            exit_func_id = true, max_iterations = true,
        }
        for key, _ in pairs(properties) do
            if standard[key] ~= true then return id .. ".data.block.config contains unsupported configurable agent field " .. tostring(key) end
        end
    end
    return nil
end

function M.block(entry: any): Map
    return map(map(map(entry).data).block)
end

function M.validate_instance(entry: any, config: any): string?
    local issue = M.validate(entry)
    if issue then return issue end
    local supplied = type(config) == "table" and config or {}
    local valid, err = json.validate(M.block(entry).config, supplied)
    if valid ~= true then return "Block config invalid: " .. tostring(err) end
    local execution = map(M.block(entry).execution)
    if execution.kind == "agent" and execution.mode == "config" then
        local cfg = map(supplied)
        local has_agent = text(cfg.agent_id) ~= ""
        local has_inline = text(cfg.instructions) ~= ""
        if has_agent == has_inline then return "Configurable Agent Block requires exactly one of config.agent_id or config.instructions" end
        if has_agent and not exact_id(cfg.agent_id) then return "config.agent_id must be an exact namespace:name id" end
        local calling = text(cfg.tool_calling)
        if calling ~= "" and calling ~= "auto" and calling ~= "any" and calling ~= "none" then return "config.tool_calling must be auto, any, or none" end
        if cfg.exit_schema ~= nil and (type(cfg.exit_schema) ~= "table" or text(map(cfg.exit_schema).type) ~= "object") then
            return "config.exit_schema must be an object JSON Schema"
        end
        if cfg.exit_schema ~= nil and calling == "none" then return "config.exit_schema requires tool_calling auto or any" end
        if cfg.tools ~= nil then
            local tools_issue = exact_id_array(cfg.tools, "config.tools")
            if tools_issue then return tools_issue end
            if calling == "none" and #(cfg.tools :: { any }) > 0 then return "config.tools requires tool_calling auto or any" end
        end
        if cfg.context ~= nil and type(cfg.context) ~= "table" then return "config.context must be an object" end
        if cfg.max_tokens ~= nil then
            local budget = cfg.max_tokens
            if type(budget) ~= "number" or budget < 1 or budget ~= math.floor(budget) then
                return "config.max_tokens must be a positive integer"
            end

            if has_agent then return "config.max_tokens applies to inline instructions, not to config.agent_id" end
        end
        if cfg.exit_func_id ~= nil then
            if not exact_id(cfg.exit_func_id) then return "config.exit_func_id must be an exact namespace:name id" end
            -- The engine calls it with the finish answer, and only an exit_schema gives the agent a finish.
            if cfg.exit_schema == nil then return "config.exit_func_id checks the finish answer, so it requires config.exit_schema" end
        end
        if cfg.max_iterations ~= nil then
            local turns = cfg.max_iterations
            if type(turns) ~= "number" or turns < 1 or turns ~= math.floor(turns) then
                return "config.max_iterations must be a positive integer"
            end
        end
    end
    return nil
end

function M.describe(entry: any): (Map?, string?)
    local issue = M.validate(entry)
    if issue then return nil, issue end
    local row = entry :: Map
    local meta, block = map(row.meta), M.block(row)
    local presentation = map(block.presentation)
    return {
        id = row.id,
        title = meta.title or meta.name or row.id,
        description = meta.description or meta.comment,
        public = meta.public == true,
        input = block.input,
        config = block.config,
        output = block.output,
        error = block.error,
        ports = block.ports,
        presentation = presentation,
        execution = block.execution,
    }, nil
end

M.exact_id = exact_id

return M
