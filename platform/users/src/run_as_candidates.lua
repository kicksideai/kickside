local security = require("security")
local execution_identity = require("execution_identity")
local component = require("component")
local support = require("user_repo_support")

local M = {}

local function failure(kind, message)
    return errors.new({kind = kind, retryable = false, message = message})
end

function M.list(input)
    if input ~= nil and type(input) ~= "table" then
        return nil, failure(errors.INVALID, "candidate query must be an object")
    end
    local options = input or {}
    local limit = options.limit or 25
    local query = options.q or ""
    local cursor = options.cursor or ""
    if type(limit) ~= "number" or limit < 1 or limit > 100 or limit ~= math.floor(limit)
        or type(query) ~= "string" or #query > 200 or type(cursor) ~= "string" or #cursor > 256 then
        return nil, failure(errors.INVALID, "candidate query, limit or cursor is invalid")
    end
    local captured, capture_err = execution_identity.capture({component_id = options.component_id})
    if capture_err or not captured then return nil, capture_err end
    local actor = security.actor()
    if not actor or captured.principal.kind ~= "user" or captured.principal.id ~= actor:id()
        or not execution_identity.same_principal(captured.principal, captured.authorized_by) then
        return nil, failure(errors.PERMISSION_DENIED, "candidate selection requires its authenticated operator")
    end
    local authorized, authorization_err = execution_identity.authorize(captured)
    if authorization_err or not authorized then return nil, authorization_err end
    if captured.component_id then
        local allowed, access_err = component.validate_principal_access(captured.component_id, component.ACCESS.ADMIN,
            captured.principal, authorized.meta.security_groups, authorized.meta.access_filter)
        if access_err then return nil, access_err end
        if not allowed then return nil, failure(errors.PERMISSION_DENIED, "candidate selection requires root ADMIN") end
    end
    local db, db_err = support.get_db()
    if db_err or not db then return nil, db_err end
    local pattern = "%" .. query:lower():gsub("!", "!!"):gsub("%%", "!%%"):gsub("_", "!_") .. "%"
    local rows, rows_err = db:query([[SELECT app_users.user_id, app_users.full_name
        FROM app_users JOIN app_user_bot_accounts ON app_user_bot_accounts.user_id = app_users.user_id
        WHERE app_users.status = 'active' AND app_users.user_id > $1
          AND (LOWER(COALESCE(app_users.full_name, '')) LIKE $2 ESCAPE '!'
               OR app_users.user_id LIKE $2 ESCAPE '!')
        ORDER BY app_users.user_id LIMIT $3]], {cursor, pattern, limit + 1})
    db:release()
    if rows_err then return nil, rows_err end
    local candidates = {}
    for index, row in ipairs(rows) do
        if index > limit then break end
        local selected, selected_err = execution_identity.capture({component_id = captured.component_id,
            principal = {kind = "user", id = row.user_id}})
        if selected_err or not selected then return nil, selected_err end
        local permitted, permission_err = execution_identity.authorize(selected)
        if permission_err then
            if not errors.is(permission_err, errors.PERMISSION_DENIED) then return nil, permission_err end
        elseif permitted then
            candidates[#candidates + 1] = {kind = "user", id = row.user_id,
                label = type(row.full_name) == "string" and row.full_name ~= "" and row.full_name or row.user_id}
        else
            return nil, failure(errors.UNAVAILABLE, "candidate authorization returns no result")
        end
    end
    return {me = {kind = "user", id = captured.principal.id, label = "Me"}, candidates = candidates,
        next_cursor = #rows > limit and rows[limit].user_id or nil}, nil
end

return M
