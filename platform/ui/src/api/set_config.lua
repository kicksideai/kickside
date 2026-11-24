-- PUT /nav/config updates editable navigation and appearance settings through
-- the kickside/settings contract. The router enforces administrator access, and
-- the writer uses the current actor for audit records.

local http = require("http")
local json = require("json")
local security = require("security")
local contract = require("contract")
local ui_types = require("ui_types")
local chat_appearance = require("chat_appearance")

local SETTINGS_CONTRACT = ui_types.CONTRACT.SETTINGS
local REALTIME_CONTRACT = ui_types.CONTRACT.REALTIME

-- After a config change, fan out the nav.changed topic to every connected client
-- via the centralized realtime contract so all open UIs re-fetch /nav/list. The
-- broadcast authority is the UI's own nav_changed_broadcast policy declared on
-- this handler, so an administrator needs no realtime authority of its own. A
-- missing realtime binding leaves nothing to notify; a refused broadcast is
-- returned.
local function broadcast_changed(actor: any, scope: any): string?
    local def = contract.get(REALTIME_CONTRACT)
    if not def then return nil end
    local inst, open_err = def:with_actor(actor):with_scope(scope):open()
    if open_err or not inst then return "realtime open: " .. tostring(open_err) end
    local result, broadcast_err = inst:broadcast({ topic = "nav.changed", data = {} })
    if broadcast_err then return tostring(broadcast_err) end
    if type(result) ~= "table" or result.success ~= true then
        return tostring(type(result) == "table" and result.error or "no broadcast result")
    end
    return nil
end

-- The settable controls and the Lua type a valid body carries, so a malformed
-- body is rejected before it reaches the writer.
local SETTABLE: { [string]: string } = {}
SETTABLE[ui_types.KEY.LAYOUT] = "string"
SETTABLE[ui_types.KEY.OVERRIDES] = "table"
SETTABLE[ui_types.KEY.CATEGORIES] = "table"
SETTABLE[ui_types.KEY.CUSTOM_ITEMS] = "table"
SETTABLE[ui_types.KEY.TITLE] = "string"
SETTABLE[ui_types.KEY.LOGO_URL] = "string"
SETTABLE[ui_types.KEY.HOME] = "string"
SETTABLE[ui_types.KEY.PRIMARY_COLOR] = "string"

local CHAT_APPEARANCE_RESET_SCHEMA = {
    type = "object",
    required = { "chat_appearance" },
    properties = { chat_appearance = { type = "object", maxProperties = 0 } },
}

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

    local def, derr = contract.get(SETTINGS_CONTRACT)
    if derr or not def then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "settings contract: " .. tostring(derr) })
        return
    end
    local inst, oerr = def:with_actor(actor):with_scope(scope):open()
    if oerr or not inst then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "settings open: " .. tostring(oerr) })
        return
    end

    local b = body :: { [string]: any }
    local appearance = b.chat_appearance
    -- An empty object is the inherited value returned by GET /nav/list.
    -- Check the wire shape so arrays and null-valued fields cannot trigger a reset.
    local reset_appearance = type(appearance) == "table" and next(appearance) == nil
        and json.validate_string(CHAT_APPEARANCE_RESET_SCHEMA, raw)
    if appearance ~= nil and not reset_appearance then
        local result = chat_appearance.validate({ value = appearance })
        if not result.valid then
            res:set_status(http.STATUS.BAD_REQUEST)
            res:write_json({ success = false, error = result.error })
            return
        end
    end
    local updated = {}
    for key, want in pairs(SETTABLE) do
        local v = b[key]
        if v ~= nil then
            if type(v) ~= want then
                res:set_status(http.STATUS.BAD_REQUEST)
                res:write_json({ success = false, error = key .. " must be a " .. want })
                return
            end
            if key == ui_types.KEY.LOGO_URL and ui_types.safe_logo_url(v) ~= v then
                res:set_status(http.STATUS.BAD_REQUEST)
                res:write_json({ success = false, error = key .. " must be a same-origin app or branding URL" })
                return
            end
            if key == ui_types.KEY.HOME and v ~= "" and ui_types.safe_home_path(v) ~= v then
                res:set_status(http.STATUS.BAD_REQUEST)
                res:write_json({ success = false, error = key .. " must be an in-app path starting with /" })
                return
            end
            if key == ui_types.KEY.PRIMARY_COLOR then
                v = ui_types.safe_primary_color(v)
            end
            local r = inst:set({ namespace = ui_types.SETTINGS_NS, key = key, value = v })
            if not r or not r.success then
                res:set_status(http.STATUS.BAD_REQUEST)
                res:write_json({ success = false, error = key .. ": " .. tostring(r and r.error) })
                return
            end
            updated[#updated + 1] = key
        end
    end

    if appearance ~= nil then
        local r
        if reset_appearance then
            r = inst:unset({ namespace = ui_types.SETTINGS_NS, key = "chat_appearance" })
        else
            r = inst:set({ namespace = ui_types.SETTINGS_NS, key = "chat_appearance", value = appearance })
        end
        if not r or not r.success then
            res:set_status(http.STATUS.BAD_REQUEST)
            res:write_json({ success = false, error = "chat_appearance: " .. tostring(r and r.error) })
            return
        end
        updated[#updated + 1] = "chat_appearance"
    end

    if #updated > 0 then
        local broadcast_err = broadcast_changed(actor, scope)
        if broadcast_err then
            res:set_status(http.STATUS.INTERNAL_ERROR)
            res:write_json({ success = false, updated = updated, error = "nav.changed broadcast: " .. broadcast_err })
            return
        end
    end

    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, updated = updated })
end

return { handler = handler }
