local http = require("http")
local env = require("env")
local installer = require("installer")
local state = require("state")

local function handler()
    local res = http.response()
    if not res then return nil, "HTTP context unavailable" end
    res:set_content_type(http.CONTENT.JSON)
    local modules = installer.parse(env.get("kickside.hub.first_boot:install_modules"))
    if not modules or #modules == 0 then
        res:set_status(http.STATUS.OK)
        res:write_json({ success = true, configured = false, modules = {} })
        return
    end
    local value, err = state.read()
    if err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "first boot install state is unavailable" })
        return
    end
    local items = value.modules or {}
    if value.source ~= table.concat(modules, ",") then
        items = {}
        for index, component in ipairs(modules) do items[index] = { component = component, status = "pending" } end
    end
    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        configured = true,
        status = value.source == table.concat(modules, ",") and value.status or "pending",
        message = value.message,
        updated_at = value.updated_at,
        modules = items,
    })
end

return { handler = handler }
