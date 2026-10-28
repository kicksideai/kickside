-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local M = {}
type Map = { [string]: any }
M.state = {} :: Map
function M.flow(id: string): (any?, error?)
    M.state.flow_id = id
    return M.state.flow, M.state.failure
end
function M.pending_signal(id: string, signal: string, node_type: string): (any?, error?)
    M.state.flow_id, M.state.signal_id, M.state.node_type = id, signal, node_type
    M.state.calls = (M.state.calls or 0) + 1
    return M.state.node, M.state.failure
end
return M
