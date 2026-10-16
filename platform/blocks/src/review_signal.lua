local dataflow_repo = require("dataflow_repo")
local M = {}
local function str(value: any): string
    return type(value) == "string" and value or ""
end
local function dependency(): any
    return (M :: any)._dataflow_repo or dataflow_repo
end
function M.authorize(dataflow_id: string, signal_id: string, reviewer_id: string): (boolean?, string?)
    local repo = dependency()
    local flow, flow_err = repo.get(dataflow_id)
    if flow_err then return nil, "review signal lookup failed: " .. tostring(flow_err) end
    local nodes, nodes_err = repo.get_nodes_for_dataflow(dataflow_id)
    if nodes_err then return nil, "review signal lookup failed: " .. tostring(nodes_err) end
    local authorized = false
    for _, node in ipairs(type(nodes) == "table" and nodes or {}) do
        local config = type(node.config) == "table" and node.config or {}
        local recorded_signal = str(config.signal_id) ~= "" and str(config.signal_id) or str(node.node_id)
        if recorded_signal == signal_id and node.type == "kickside.blocks:await"
            and config.arm_id == "kickside.inbox:arm_decision" then
            local block = type(config.block_config) == "table" and config.block_config or {}
            local reviewer = str(block.assignee)
            if reviewer == "" and type(flow) == "table" then reviewer = str(flow.actor_id) end
            authorized = reviewer ~= "" and reviewer == reviewer_id
        end
    end
    if not authorized then return nil, "review signal access denied" end

    return true, nil
end
return M
