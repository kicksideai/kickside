-- GET /settings/tabs — the System surface's tabs, discovered from ui.settings_tab
-- registry entries and ordered. Owned by the shell (kickside.ui): a module
-- contributes a tab by declaring a registry.entry, not by editing the shell. The
-- shell discovers caller-visible tabs through their declared access capabilities.
local http = require("http")
local shell = require("shell")

local function handler()
    local res = http.response()
    if not res then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    local entries, err = shell.discover("ui.settings_tab")
    if err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "failed to load system tabs" })
        return
    end

    local tabs = {}
    for _, entry in ipairs(entries) do
        -- Custom fields on a registry.entry live under .data.
        local e = (type(entry.data) == "table") and entry.data or entry
        if shell.is_key(e.key) then
            local render = e.render
            if render ~= "component" and render ~= "link" then render = "surface" end
            local component_tag = shell.is_component_tag(e.component_tag) and e.component_tag or nil
            local url = shell.is_url(e.url) and e.url or nil
            -- A component tab needs a tag; a link tab needs a url. Skip malformed.
            if (render ~= "component" or component_tag) and (render ~= "link" or url) then
                tabs[#tabs + 1] = {
                    key = e.key,
                    label = shell.as_string(e.label, e.key, 80),
                    icon = shell.is_icon(e.icon) and e.icon or "tabler:square",
                    order = tonumber(e.order) or 100,
                    render = render,
                    surface = shell.is_key(e.surface) and e.surface or nil,
                    component_tag = component_tag,
                    url = url,
                }
            end
        end
    end
    shell.sort_by_order(tabs)

    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, tabs = tabs })
end

return { handler = handler }
