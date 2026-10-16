-- Platform agent creation, updates, and links.
local support = require("platform_manager_support")
local tool_result = require("tool_result")
local AGENTS_CONTRACT = support.AGENTS_CONTRACT
local trim = support.trim
local component_id_from = support.component_id_from
local open_contract = support.open_contract
local M = {}

local function upsert_agent(args: any): (any, error?)
    local agents, err = open_contract(AGENTS_CONTRACT)
    if err then return nil, err end
    local name = trim(args.name)
    if name == "" then return tool_result.fail(errors.INVALID, "name is required") end
    local result, upsert_err = agents:upsert({
        name = name,
        description = args.description,
        model = args.model,
        prompt = args.prompt,
        traits = args.traits,
        trait_contexts = args.trait_contexts,
        trait_agent_options = args.trait_agent_options,
        agent_options = args.agent_options,
        tools = args.tools,
        public = args.public,
    })
    if upsert_err then return nil, errors.wrap(upsert_err, "upsert agent") end
    return result, nil
end

local function update_agent(args: any): (any, error?)
    local component_id = component_id_from(args)
    if component_id == "" then return tool_result.fail(errors.INVALID, "component_id or agent_id is required") end
    local agents, err = open_contract(AGENTS_CONTRACT)
    if err then return nil, err end
    local result, update_err = agents:update({
        component_id = component_id,
        name = args.name,
        description = args.description,
        model = args.model,
        prompt = args.prompt,
        traits = args.traits,
        trait_contexts = args.trait_contexts,
        trait_agent_options = args.trait_agent_options,
        agent_options = args.agent_options,
        tools = args.tools,
        public = args.public,
    })
    if update_err then return nil, errors.wrap(update_err, "update agent") end
    return result, nil
end

local function agent_link(args: any, method_name: string, required_key: string): (any, error?)
    local component_id = component_id_from(args)
    if component_id == "" then return tool_result.fail(errors.INVALID, "component_id or agent_id is required") end
    if trim(args[required_key]) == "" then return tool_result.fail(errors.INVALID, required_key .. " is required") end
    local agents, err = open_contract(AGENTS_CONTRACT)
    if err then return nil, err end
    if method_name == "attach_kb" then
        local result, link_err = agents:attach_kb({ component_id = component_id, kb_id = args.kb_id })
        if link_err then return nil, errors.wrap(link_err, "attach_kb") end
        return result, nil
    elseif method_name == "detach_kb" then
        local result, link_err = agents:detach_kb({ component_id = component_id, kb_id = args.kb_id })
        if link_err then return nil, errors.wrap(link_err, "detach_kb") end
        return result, nil
    elseif method_name == "attach_tool" then
        local result, link_err = agents:attach_tool({ component_id = component_id, tool_id = args.tool_id })
        if link_err then return nil, errors.wrap(link_err, "attach_tool") end
        return result, nil
    end
    local result, link_err = agents:detach_tool({ component_id = component_id, tool_id = args.tool_id })
    if link_err then return nil, errors.wrap(link_err, "detach_tool") end
    return result, nil
end

local function delete_agent(args: any): (any, error?)
    local component_id = component_id_from(args)
    if component_id == "" then return tool_result.fail(errors.INVALID, "component_id or agent_id is required") end
    local agents, err = open_contract(AGENTS_CONTRACT)
    if err then return nil, err end
    local result, delete_err = agents:delete({ component_id = component_id })
    if delete_err then return nil, errors.wrap(delete_err, "delete agent") end
    return result, nil
end


M.upsert_agent = upsert_agent
M.update_agent = update_agent
M.delete_agent = delete_agent
M.attach_kb = function(args: any): (any, error?) return agent_link(args, "attach_kb", "kb_id") end
M.detach_kb = function(args: any): (any, error?) return agent_link(args, "detach_kb", "kb_id") end
M.attach_tool = function(args: any): (any, error?) return agent_link(args, "attach_tool", "tool_id") end
M.detach_tool = function(args: any): (any, error?) return agent_link(args, "detach_tool", "tool_id") end

return M
