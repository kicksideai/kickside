local session_index = require("session_index")
local consts = require("user_consts")
local log = require("logger"):named("delegation_fencer")
local M = {}
function M.run(request)
    if type(request) ~= "table" then
        return nil, consts.new_error(consts.ERROR_CODE.MISSING_REQUIRED_FIELD, {details = {field = "request"}})
    end
    local result, err = session_index.fence_groups(request.group_ids, {
        previous_group_rules = request.previous_group_rules,
    })
    if err then return nil, err end
    log:info("delegations fenced", {users_invalidated = result.users_invalidated,
        reason = tostring(request.reason or "unspecified")})
    return {success = true, revoked = 0, users_invalidated = result.users_invalidated}
end
return M
