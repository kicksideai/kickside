-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local sql = require("sql")
local funcs = require("funcs")
local M = {}
function M.resolve(request: any): (any?, error?)
    local db, db_err = sql.get(request.denied_db or "app:db")
    if db then db:release(); return {database_denied = false}, nil end
    if not errors.is(db_err, errors.PERMISSION_DENIED) then return nil, db_err end
    local own_database = nil
    if request.allowed_db then
        local own, own_err = sql.get(request.allowed_db)
        if own_err or not own then return nil, own_err end
        own:release()
        own_database = true
    end
    local selected, err = funcs.call("kickside.security.runtime:resolve_groups", request)
    if err then return nil, err end
    return {database_denied = true, own_database = own_database, selected = selected}, nil
end
return M
