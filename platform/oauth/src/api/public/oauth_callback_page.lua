-- oauth_callback_page.lua
local http = require("http")
local registry = require("registry")
local renderer = require("renderer")

-- Constants
local STATUS = http.STATUS
local CONTENT = http.CONTENT
local VIEW_ID = "kickside.oauth.views:oauth_callback"
local THEME_ID = "kickside.oauth.views:theme"

-- Declared theme (kickside.oauth.views:theme) the callback page renders so the
-- popup matches the host app. Falls back to the KickSide brand if unset.
local function load_theme(): any
    local theme = { product = "KickSide", primary = "#e85d1a", primary_dark = "#f97a3b", radius = "14px" }
    local entry = registry.get(THEME_ID)
    local meta = entry and (entry :: { meta: any }).meta
    if type(meta) == "table" then
        for k, v in pairs(meta :: { [string]: any }) do
            if type(v) == "string" and (v :: string) ~= "" then theme[k] = v end
        end
    end
    return theme
end

local function handler()
    local res = http.response()
    local req = http.request()

    if not res or not req then
        return nil, "Failed to get HTTP context"
    end

    -- Set HTML content type
    res:set_content_type("text/html")

    local params = {}
    local query = {}
    local code = req:query("code")
    local state = req:query("state")
    local error_param = req:query("error")
    local error_description = req:query("error_description")
    local provider = req:query("provider")

    if code then query.code = code end
    if state then query.state = state end
    if error_param then query.error = error_param end
    if error_description then query.error_description = error_description end
    if provider then query.provider = provider end

    -- Render the OAuth callback page using the renderer. The theme is passed as
    -- params (-> route_params in the jet) so the popup matches the host app.
    params.theme = load_theme()
    local content, err = renderer.render(VIEW_ID, params, query)

    if err then
        res:set_status(STATUS.INTERNAL_ERROR)
        res:write("View not found: " .. err)
        return
    end
    if type(content) ~= "string" then
        res:set_status(STATUS.INTERNAL_ERROR)
        res:write("View did not render text content")
        return
    end

    -- Return the rendered content
    res:set_status(STATUS.OK)
    res:write(content)
end

return {
    handler = handler
}
