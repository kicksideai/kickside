local security = require("security")
local crypto = require("crypto")
local users = require("user_repo")
local groups = require("user_groups_repo")
local M = {}

function M.token(group_id: string): string
    local id = assert(crypto.random.uuid())
    local user, user_err = users.create({user_id = id, email = id .. "@fixture.local",
        password = "ui-fixture-password", status = "active"})
    assert(user, tostring(user_err))
    local assigned, group_err = groups.assign_user_to_group(id, group_id)
    assert(assigned, tostring(group_err))
    local scope, scope_err = security.named_scope(group_id)
    assert(scope, tostring(scope_err))
    local store, store_err = security.token_store("kickside.users.security:tokens")
    assert(store, tostring(store_err))
    local token, token_err = store:create(security.new_actor(id, {}),
        scope, {expiration = "5m"})
    store:close()
    assert(token, tostring(token_err))
    return tostring(token)
end

return M
