local security = require("security")

return {mint = function()
    local store, err = security.token_store("kickside.users.security:tokens")
    if err then return nil, err end
    local token, create_err = store:create(assert(security.actor()), assert(security.scope()), {expiration = "1h"})
    store:close()
    return token, create_err
end}
