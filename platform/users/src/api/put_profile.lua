-- PUT /profile — set one or many of the authenticated actor's profile values.
-- Body is a single { namespace, key, value } or { values: [ ... ] }; a null
-- value clears the value (revert to default). Authn is enforced by the router
-- firewall; writes always target the actor's own profile via the contract.

local http = require("http")
local json = require("json")
local security = require("security")
local contract = require("contract")

local CONTRACT_ID = "kickside.users.profile:profile"

local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    local actor = security.actor()
    local scope = security.scope()
    if not actor or not scope then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end

    local raw, raw_err = req:body()
    if raw_err or type(raw) ~= "string" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "invalid request body" })
        return
    end
    local body, perr = json.decode(raw)
    if perr or type(body) ~= "table" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "invalid json" })
        return
    end

    local def, derr = contract.get(CONTRACT_ID)
    if derr or not def then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "profile contract: " .. tostring(derr) })
        return
    end
    local inst, oerr = def:with_actor(actor):with_scope(scope):open()
    if oerr or not inst then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "profile open: " .. tostring(oerr) })
        return
    end

    local items = (body :: any).values
    if type(items) ~= "table" then items = { body } end

    local updated = {}
    for _, item in ipairs(items :: { any }) do
        local it = item :: { namespace: any, key: any, value: any }
        if type(it.namespace) ~= "string" or type(it.key) ~= "string" then
            res:set_status(http.STATUS.BAD_REQUEST)
            res:write_json({ success = false, error = "namespace and key are required" })
            return
        end
        local r
        if it.value == nil then
            r = inst:unset({ namespace = it.namespace, key = it.key })
        else
            r = inst:set({ namespace = it.namespace, key = it.key, value = it.value })
        end
        if not r or not r.success then
            res:set_status(http.STATUS.BAD_REQUEST)
            res:write_json({ success = false, error = tostring(it.namespace) .. ":" .. tostring(it.key) .. ": " .. tostring(r and r.error) })
            return
        end
        updated[#updated + 1] = { namespace = it.namespace, key = it.key }
    end

    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, updated = updated })
end

return { handler = handler }
