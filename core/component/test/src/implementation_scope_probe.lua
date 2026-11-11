local component_reader = require("component_reader")
local ops = require("ops")
local sql = require("sql")
local security = require("security")
local component = require("component")

local function run(request: {denied: string, visible: string?, principal: any?, groups: any?, access_filter: any?, identity_write: boolean?})
    if request.identity_write then
        local actor = assert(security.actor())
        local result, err = component.set_execution_identity(request.denied,
            {kind = "user", id = actor:id()}, "scope-selection", 0)
        return {result = result, refused = errors.is(err, errors.PERMISSION_DENIED),
            error = err and tostring(err) or nil,
            implementation_visible = security.can("registry.get", request.visible or "scope.hidden:component")}
    end
    if request.principal then
        local admin, admin_err = component.validate_identity_authorizer_admin(request.denied,
            request.principal, request.groups)
        if admin_err then error(admin_err) end
        local principal, principal_err = component.validate_principal_access(request.denied,
            component.ACCESS.ADMIN, request.principal, request.groups, request.access_filter)
        if principal_err then error(principal_err) end
        return {admin = admin, principal = principal,
            implementation_visible = security.can("registry.get", "scope.hidden:component")}
    end
    local actor = assert(security.actor())
    local uid = actor:id() :: string
    local reader = component_reader.new():with_user(uid):with_access_mask(1)
    local rows, err = reader:limit(1):all()
    if err then error(err) end
    local count, count_err = reader:count()
    if count_err then error(count_err) end
    local denied, denied_err = reader:with_components(request.denied):one()
    if denied_err then error(denied_err) end
    local db, db_err = sql.get("app:db")
    if db_err then error(db_err) end
    local allowed, access_err = ops.check_user_access(db, uid, request.denied, 1)
    local visible_allowed, visible_err = ops.check_user_access(db, uid, request.visible, 1)
    db:release()
    if access_err then error(access_err) end
    if visible_err then error(visible_err) end
    return {rows = rows, count = count, denied = denied, allowed = allowed, visible_allowed = visible_allowed}
end

return {run = run}
