local http = require("http")
local registry = require("registry")
local templates = require("templates")

local TEMPLATE_SET = "app.login:templates"

local function facade_requirement(name: string): (string?, any?)
    local entry, err = registry.get("wippy.facade:" .. name)
    if err then return nil, err end
    local value = entry.data.default
    if type(value) ~= "string" or value == "" then
        return nil, errors.new({kind = errors.INVALID, message = "facade " .. name .. " must be a nonempty string"})
    end
    return value, nil
end

local function cookie_value(header: string?, name: string): string?
    if not header or header == "" then
        return nil
    end
    for pair in header:gmatch("[^;]+") do
        local key, value = pair:match("^%s*(.-)%s*=%s*(.*)$")
        if key == name then
            return value
        end
    end
    return nil
end

local function handler()
    local req = http.request()
    local res = http.response()

    local persistence, persistence_err = facade_requirement("theme_persist")
    if persistence_err then return nil, persistence_err end
    local storage_key, key_err = facade_requirement("theme_storage_key")
    if key_err then return nil, key_err end

    local has_theme = false
    local theme_class = ""
    local color_scheme = ""
    if persistence == "cookie" and req then
        local stored = cookie_value(req:header("Cookie"), storage_key :: string)
        if stored == "dark" then
            has_theme = true
            theme_class = "w-theme-dark"
            color_scheme = "dark"
        elseif stored == "light" then
            has_theme = true
            theme_class = "w-theme-light"
            color_scheme = "light"
        end
    end

    local set, get_err = templates.get(TEMPLATE_SET)
    if not set then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:set_content_type("text/html")
        res:write("Failed to load login template")
        return nil, get_err
    end

    local html, render_err = set:render("page", {
        hasTheme = has_theme,
        themeClass = theme_class,
        colorScheme = color_scheme,
    })
    if render_err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:set_content_type("text/html")
        res:write("Failed to render login page")
        set:release()
        return nil, render_err
    end

    res:set_content_type("text/html")
    res:set_header("Cache-Control", "no-store")
    res:set_status(http.STATUS.OK)
    res:write(html)
    set:release()
end

return { handler = handler }
