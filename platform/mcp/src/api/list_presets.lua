-- GET /mcp/presets — the declared preset bundles a credential can be minted with,
-- for the create UI's trait picker.

local http = require("http")
local security = require("security")
local presets = require("mcp_presets")

local function handler()
    local req = http.request()
    local res = http.response()
    if not req or not res then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    if not security.actor() then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end

    local catalog, err = presets.list()
    if err or not catalog then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "preset discovery failed: " .. tostring(err or "catalog returned no result") })
        return
    end
    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, presets = catalog })
end

return { handler = handler }
