local component_reader = require("component_reader")
local ops = require("ops")
local sql = require("sql")
local security = require("security")

local function run(request)
    local actor = assert(security.actor())
    local uid = actor:id()
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
    db:release()
    if access_err then error(access_err) end
    return {rows = rows, count = count, denied = denied, allowed = allowed}
end

return {run = run}
