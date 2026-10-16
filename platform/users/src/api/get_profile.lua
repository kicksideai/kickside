-- GET /profile[?namespace=&key=] — one exact declared value when key is present,
-- otherwise every visible declared field for the profile editor.

local http = require("http")
local contract = require("contract")
local security = require("security")

local CONTRACT_ID = "kickside.users.profile:profile"
local M = {}

function M.read(inst: any, args: any): any
    if args.key then return inst:get(args) end
    return inst:list(args)
end

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

    local args = {}
    local ns = req:query("namespace")
    if ns and ns ~= "" then args.namespace = ns end
    local key = req:query("key")
    if key and key ~= "" then args.key = key end

    local result = M.read(inst, args)
    if not result or result.success ~= true then
        res:set_status(http.STATUS.FORBIDDEN)
        res:write_json(result or { success = false, error = args.key and "profile read denied" or "profile list denied" })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json(result)
end

M.handler = handler
return M
