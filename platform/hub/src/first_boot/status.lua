-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local http = require("http")
local env = require("env")
local installer = require("installer")
local state = require("state")

local function handler()
    local res = http.response()
    if not res then return nil, "HTTP context unavailable" end
    res:set_content_type(http.CONTENT.JSON)
    local status = installer.status(env.get("kickside.hub.first_boot:install_modules"), state.read)
    if not status then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "first boot install state is unavailable" })
        return
    end
    res:set_status(http.STATUS.OK)
    res:write_json(status)
end

return { handler = handler }
