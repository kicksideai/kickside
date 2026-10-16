-- GET /branding (public, unauthenticated) — the site title + logo URL, so the
-- login page and the app shell can brand themselves before a session exists.
-- Reads the kickside.ui settings (cached); degrades to defaults on any outage.

local http = require("http")
local contract = require("contract")
local ui_types = require("ui_types")
local branding = require("branding")

local function handler()
    local res = http.response()
    if not res then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    local title = ui_types.DEFAULT_TITLE
    local logo_url = ""

    local def = contract.get(ui_types.CONTRACT.SETTINGS)
    if def then
        local inst = def:open()
        if inst then
            local r = inst:get_namespace({ namespace = ui_types.SETTINGS_NS })
            if r and r.success and type(r.values) == "table" then
                local v: any = r.values
                if type(v.title) == "string" and v.title ~= "" then title = v.title end
                logo_url = branding.resolve_url(v.logo_url)
            end
        end
    end

    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, title = title, logo_url = logo_url })
end

return { handler = handler }
