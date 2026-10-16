-- GET /settings[?namespace=] — every declared setting merged with its override
-- and provenance, for the admin UI. Authn + admin authz are enforced by the
-- router firewall + app.security's positive allowlist; the settings contract
-- repeats the admin boundary so direct contract calls cannot bypass it.

local http = require("http")
local contract = require("contract")
local security = require("security")

local CONTRACT_ID = "kickside.settings:settings"

local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    local actor = security.actor()
    if not actor then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end

    local def, derr = contract.get(CONTRACT_ID)
    if derr or not def then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "settings contract: " .. tostring(derr) })
        return
    end
    local inst, oerr = def:open()
    if oerr or not inst then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "settings open: " .. tostring(oerr) })
        return
    end

    local args = {}
    local ns = req:query("namespace")
    if ns and ns ~= "" then args.namespace = ns end

    local result = inst:list(args)
    if not result or result.success ~= true then
        res:set_status(http.STATUS.FORBIDDEN)
        res:write_json(result or { success = false, error = "settings list denied" })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json(result)
end

return { handler = handler }
