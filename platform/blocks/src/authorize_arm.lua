-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local security = require("security")
local destination = require("destination")

local M = {}
type Map = { [string]: any }

function M.authorize(args: any): (Map?, error?)
    local dataflow_id, signal_id, args_err = destination.ids(args)
    if args_err then return nil, args_err end
    local actor = security.actor()
    if not actor or not security.scope() or actor:id() == "" then
        return nil, destination.failure(nil, "An authenticated actor and scope are required",
            "BLOCK_ARM_IDENTITY_REQUIRED", errors.PERMISSION_DENIED, false)
    end
    local flow, flow_err = destination.get(dataflow_id)
    if flow_err then return nil, flow_err end
    if flow.actor_id ~= actor:id() then
        return nil, destination.failure(nil, "Flow belongs to another actor",
            "BLOCK_ARM_FORBIDDEN", errors.PERMISSION_DENIED, false)
    end
    local node, signal_err = destination.pending(dataflow_id, signal_id, flow)
    if signal_err then return nil, signal_err end
    return {authorized = true, dataflow_id = dataflow_id, signal_id = signal_id, node_id = node.node_id}, nil
end

return M
