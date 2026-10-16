local http = require("http")
local security = require("security")
local contract = require("contract")

-- GET /users/assignable-scopes — the normalized scope/role catalog the user
-- editor assigns from. The users module depends on the security_scopes PORT, not
-- on the security module's own endpoints, so the catalog implementation is
-- swappable. Returns built-in roles AND custom scopes. Admin-gated, like the rest of user mgmt.
local SCOPES_CONTRACT = "kickside.contract:security_scopes"
local GATE = "kickside.users.api:list_users.endpoint"

local function handler()
    local res = http.response()
    if not res then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    if not security.actor() or not security.can("access", GATE) then
        res:set_status(http.STATUS.FORBIDDEN)
        res:write_json({ success = false, error = "access denied" })
        return
    end

    local def = contract.get(SCOPES_CONTRACT)
    if not def then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "security scope catalog unavailable" })
        return
    end
    -- Propagate the caller's actor/scope into the binding; a bare :open() does not
    -- carry them, so the impl's admin check would see no actor and return nothing.
    local inst = def:with_actor(security.actor()):with_scope(security.scope()):open()
    if not inst then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "security scope catalog open failed" })
        return
    end

    local r: any = inst:list({ include_internal = false })
    local scopes = (type(r) == "table" and type(r.scopes) == "table") and r.scopes or {}
    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, scopes = scopes })
end

return { handler = handler }
