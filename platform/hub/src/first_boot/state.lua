-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local contract = require("contract")

local M = {}

M.NAMESPACE = "kickside.hub"
M.KEY = "first_boot_install"

local function settings()
    local def, err = contract.get("kickside.settings:settings")
    if err then return nil, err end
    return def:open()
end

function M.read(): (any?, any?)
    local inst, err = settings()
    if not inst then return nil, err end
    local result, read_err = inst:get({ namespace = M.NAMESPACE, key = M.KEY })
    if read_err then return nil, read_err end
    if not result.success then return nil, result.error end
    return type(result.value) == "table" and result.value or {}, nil
end

function M.write(value: any): (boolean, any?)
    local inst, err = settings()
    if not inst then return false, err end
    local result, write_err = inst:set({ namespace = M.NAMESPACE, key = M.KEY, value = value })
    if write_err then return false, write_err end
    if not result.success then return false, result.error end
    return true, nil
end

return M
