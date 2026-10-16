local state = require("state")

local function get(_id)
    local definition = {}
    function definition:with_actor(_actor) return self end
    function definition:with_scope(_scope) return self end
    function definition:open() return state.open_service() end
    return definition, nil
end

return { get = get }
