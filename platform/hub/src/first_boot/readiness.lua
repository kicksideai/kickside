-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local env = require("env")
local installer = require("installer")
local state = require("state")

-- Returns { ready, reason? } for the public readiness probe. Reads only the
-- stored first-boot state.
local function readiness(): any
    local raw = env.get("kickside.hub.first_boot:install_modules")
    local modules = installer.parse(raw)
    local stored = nil
    if modules and #modules > 0 then
        local value, err = state.read()
        if err then return { ready = false, reason = "installing_modules" } end
        stored = value
    end
    local reason = installer.readiness(raw, stored)
    return { ready = reason == nil, reason = reason }
end

return { readiness = readiness }
