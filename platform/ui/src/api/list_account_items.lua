-- GET /account/items — the avatar dropdown's entries, discovered from
-- ui.account_item registry entries and ordered. Owned by the shell (kickside.ui):
-- a module contributes an account-menu item (e.g. Linked accounts) by declaring a
-- registry.entry. Each item opens its own web-component modal by tag. registry.find
-- runs as the caller, so an item the user cannot read is absent.
local http = require("http")
local shell = require("shell")

local function handler()
    local res = http.response()
    if not res then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    local entries, err = shell.discover("ui.account_item")
    if err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "failed to load account menu" })
        return
    end

    local items = {}
    for _, entry in ipairs(entries) do
        local e = (type(entry.data) == "table") and entry.data or entry
        -- An account item opens a web component (its own modal) by tag.
        if shell.is_key(e.key) and shell.is_component_tag(e.component_tag) then
            items[#items + 1] = {
                key = e.key,
                label = shell.as_string(e.label, e.key, 80),
                icon = shell.is_icon(e.icon) and e.icon or "tabler:link",
                order = tonumber(e.order) or 100,
                component_tag = e.component_tag,
            }
        end
    end
    shell.sort_by_order(items)

    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, items = items })
end

return { handler = handler }
