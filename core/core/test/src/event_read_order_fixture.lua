-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local M = {order = {}, admin = false, level = "", base_allowed = true, component_id = "component"}
function M.reset(level: string, admin: boolean, base_allowed: boolean?)
    M.order, M.admin, M.level, M.base_allowed = {}, admin, level, base_allowed ~= false
end
function M.has_access(id: string, mask: integer): (boolean, error?)
    M.order[#M.order + 1] = tostring(mask) .. ":" .. id
    if mask == 1 then return M.base_allowed, nil end
    return M.admin, nil
end
local db = {}
function db:query(query: string, args: table): (table?, error?)
    if query:find("SELECT body", 1, true) then
        M.order[#M.order + 1] = "body"
        return {{body = {secret = "committed"}}}, nil
    end
    M.order[#M.order + 1] = "level"
    return {{component_id = M.component_id, event_read = M.level}}, nil
end
function db:release() M.order[#M.order + 1] = "release" end
function M.get(_id: string): (any, error?) return db, nil end
return M
