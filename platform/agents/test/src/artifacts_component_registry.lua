local state = require("state")
return {
    get = function() return state.components[1], state.component_error end,
    find_all = function() return state.components, state.component_error end,
    resolve_base_url = function() return "/" end,
}
