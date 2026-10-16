-- GET /knowledge/engines — the installed KB engines, registry-discovered.
--
-- The knowledge page renders these as the create-type choices and mounts an
-- engine's returned create_ui_id / manage_ui_id web component by tag. An empty list
-- means no engine module is installed; the UI shows a "no engine installed"
-- state and offers no type options.

local http = require("http")
local security = require("security")
local engines = require("engines")

local function handler()
    local res = http.response()
    if not res then return nil, "failed to get http context" end
    res:set_content_type(http.CONTENT.JSON)

    local actor = security.actor()
    if not actor then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end

    local list, err = engines.list()
    if err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = tostring(err) })
        return
    end

    -- Only the fields the UI needs to render type choices and mount engine WCs.
    local items = {}
    for _, e in ipairs(list) do
        items[#items + 1] = {
            kb_type = e.kb_type,
            label = e.label,
            description = e.description,
            icon = e.icon,
            badge = e.badge,
            stats_spec = e.stats_spec,
            create_ui_id = e.create_ui_id,
            manage_ui_id = e.manage_ui_id,
            manage_views = e.manage_views,
            default_config = e.default_config,
            config_schema = e.config_schema,
        }
    end

    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, engines = items, count = #items })
end

return { handler = handler }
