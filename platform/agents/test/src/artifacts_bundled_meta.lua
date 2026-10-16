local state = require("state")
return {
    fetch_for_component = function() return {}, state.metadata_error end,
    fetch_for_page = function() return {}, state.metadata_error end,
    project_component_response = function() return { wippy = { tagName = "fixture-card" } }, state.projection_error end,
    project_page_response = function() return { wippy = { path = "/fixture" } }, state.projection_error end,
}
