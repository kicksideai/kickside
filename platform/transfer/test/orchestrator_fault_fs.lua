local state = require("state")

return { get = function(_id)
    local err = state.failure("storage")
    if err then return nil, err end
    return state.storage(), nil
end }
