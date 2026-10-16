local state = require("state")
return {
    get = function() return state.pages[1], state.page_error end,
    find_all = function() return state.pages, state.page_error end,
    resolve_base_url = function() return "/" end,
}
