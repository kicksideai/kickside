-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local M: any = {lookups = 0, permissions = 0, allowed = true}
function M.kind_for_impl(id: string)
    M.lookups = M.lookups + 1
    return {meta = {mutation = id == "open" and "open" or "closed"}}, nil
end
function M.can(action: string, id: string)
    M.permissions = M.permissions + 1
    return M.allowed, nil
end
return M
