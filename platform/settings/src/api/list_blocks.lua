-- GET /settings/blocks — the Settings page's left-nav catalog: declared
-- kickside.settings:block entries plus auto-blocks for every settings namespace
-- that has a visible definition and no explicit block. Admin authz + visibility
-- are grounded in the settings contract's list (the same call GET /settings
-- makes), so the block catalog and the settings listing agree.

local http = require("http")
local contract = require("contract")
local security = require("security")
local blocks = require("settings_blocks")

local CONTRACT_ID = "kickside.settings:settings"

local function handler()
    local res = http.response()
    if not res then return nil, "no http context" end
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

    -- The contract list enforces the admin boundary and applies the visibility
    -- rule; its rows give the set of namespaces that have a visible definition.
    local listed = inst:list({})
    if not listed or listed.success ~= true then
        res:set_status(http.STATUS.FORBIDDEN)
        res:write_json(listed or { success = false, error = "settings list denied" })
        return
    end

    local visible_ns: { [string]: boolean } = {}
    for _, s in ipairs(listed.settings or {}) do
        if type(s.namespace) == "string" then visible_ns[s.namespace] = true end
    end

    local catalog = blocks.build(blocks.declared(), visible_ns)

    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, blocks = catalog })
end

return { handler = handler }
