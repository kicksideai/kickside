-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local funcs = require("funcs")
local M = {}

function M.pack(params)
    local result, err = funcs.call("kickside.uploads.persist:token_pack", params)
    if err then error(err, 0) end
    return result.value, result.error
end

function M.unpack(token)
    local result, err = funcs.call("kickside.uploads.persist:token_unpack", token)
    if err then error(err, 0) end
    return result.value, result.error
end

function M.pack_read(params)
    local result, err = funcs.call("kickside.uploads.tokens:pack_read", params)
    if err then error(err, 0) end
    return result.value, result.error
end

function M.unpack_read(token, expected)
    local result, err = funcs.call("kickside.uploads.persist:token_unpack_read", token, expected)
    if err then error(err, 0) end
    return result.value, result.error
end

return M
