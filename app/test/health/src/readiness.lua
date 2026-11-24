-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local http = require("http")
local fs = require("fs")
local funcs = require("funcs")

local UI_FS = "app:app_fs"
local UI_ENTRY = "app/main/app.html"
local MODULES = "kickside.hub.first_boot:readiness"

local function ui_present(fs_module): boolean
    local storage, err = fs_module.get(UI_FS)
    if err or not storage then return false end
    local present = storage:exists(UI_ENTRY)
    return present == true
end

-- Returns nil when ready, else the reason. The first-boot module state comes
-- first: a missing UI matters only after setup is done.
local function reason(modules: any, ui: boolean): string?
    if type(modules) ~= "table" then return "installing_modules" end
    if modules.ready ~= true then
        return modules.reason == "setup_failed" and "setup_failed" or "installing_modules"
    end
    if not ui then return "ui_missing" end
    return nil
end

local function handler()
    local res = http.response()
    if not res then return nil, "Failed to get HTTP context" end
    res:set_content_type("application/json")
    res:set_header("Cache-Control", "no-store")
    local modules = funcs.call(MODULES)
    local why = reason(modules, ui_present(fs))
    if why then
        res:set_status(http.STATUS.SERVICE_UNAVAILABLE)
        res:write_json({ ready = false, reason = why })
        return
    end
    res:set_status(http.STATUS.OK)
    res:write_json({ ready = true })
end

return { handler = handler, reason = reason, ui_present = ui_present }
