-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local M = { lookup_error = nil, send_error = nil }

M.registry = {}

function M.registry.lookup(_hub_name: string): (any?, error?)
    if M.lookup_error then return nil, M.lookup_error end
    return { id = "fixture-hub" }, nil
end

function M.send(_hub: any, _topic: string, _data: any): (any?, error?)
    if M.send_error then return nil, M.send_error end
    return true, nil
end

function M.reset(lookup_error: error?, send_error: error?): ()
    M.lookup_error, M.send_error = lookup_error, send_error
end

return M
