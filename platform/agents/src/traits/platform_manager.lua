-- Platform tool action dispatcher; each action module owns its operation.
local support = require("platform_manager_support")
local tool_result = require("tool_result")
local discovery = require("platform_manager_discovery")
local agents = require("platform_manager_agents")
local connections = require("platform_manager_connections")
local M = {}

local ACTIONS = {
    list_traits = discovery.list_traits,
    list_tools = discovery.list_tools,
    list_component_kinds = discovery.list_component_kinds,
    list_components = discovery.list_components,
    list_agents = discovery.list_agents,
    upsert_agent = agents.upsert_agent,
    update_agent = agents.update_agent,
    delete_agent = agents.delete_agent,
    attach_kb = agents.attach_kb,
    detach_kb = agents.detach_kb,
    attach_tool = agents.attach_tool,
    detach_tool = agents.detach_tool,
    list_connection_providers = discovery.list_connection_providers,
    list_connections = discovery.list_connections,
    upsert_connection = connections.upsert_connection,
    update_connection = connections.update_connection,
    delete_connection = connections.delete_connection,
    validate_connection = connections.validate_connection,
    list_reply_provider_kinds = discovery.list_reply_provider_kinds,
    list_reply_providers = connections.list_reply_providers,
    upsert_reply_provider = connections.upsert_reply_provider,
    update_reply_provider = connections.update_reply_provider,
    delete_reply_provider = connections.delete_reply_provider,
}

function M.handler(args: any): (any, error?)
    args = (type(args) == "table") and args or {}
    local action = support.trim(args.action)
    local handler = ACTIONS[action]
    if not handler then return tool_result.fail(errors.INVALID, "unknown action") end
    return handler(args)
end

return M
