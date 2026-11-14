-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local types = require("component_types")
local M = {version = 1, reads = 0, source = nil :: error?,
    fields = {{path = {"api_key"}, type = "string"}} :: {types.SecretField}}

function M.current_version()
    return {id = function(): integer return M.version end}, nil
end

function M.kind_for_impl(_id: string)
    M.reads = M.reads + 1
    if M.source then return nil, M.source end
    return {meta = {secret_fields = M.fields}}, nil
end

M.get = M.kind_for_impl
return M
