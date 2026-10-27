-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local consts = require("consts")
local M = {}
type Map = { [string]: any }
M.records = {} :: Map

function M.get_nodes_for_dataflow(): (any, any?)
    return {{node_id = "wait-node", type = "kickside.blocks:await", status = consts.STATUS.WAITING}}, nil
end

function M.with_dataflow(): any
    local reader: any = {}
    function reader:with_data_types(): any return self end
    function reader:fetch_options(): any return self end
    function reader:all(): (any, any?) return M.records, nil end
    return reader
end

return M
