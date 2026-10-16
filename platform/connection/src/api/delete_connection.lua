local http = require("http")
local contract = require("contract")
local http_errors = require("http_errors")

-- DELETE /api/v1/connections/{id}. Routes through the connections orchestration
-- contract (kickside.connection:connections) rather than the raw component service
-- so the single delete path runs provider cleanup before removing the component.
-- Authn + endpoint authz are enforced by the router firewall; per-component DELETE
-- access is enforced inside the contract's delete (component.delete_component).
local CONNECTIONS_CONTRACT = "kickside.connection:connections"

local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then
        return nil, "failed to get http context"
    end

    res:set_content_type(http.CONTENT.JSON)

    local component_id = req:param("id")
    if not component_id or component_id == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "id is required" })
        return
    end

    local def, gerr = contract.get(CONNECTIONS_CONTRACT)
    if gerr or not def then
        res:set_status((http_errors.classify(gerr)))
        res:write_json({ success = false, error = "connections contract unavailable: " .. tostring(gerr) })
        return
    end
    local inst, oerr = (def :: any):open()
    if oerr or not inst then
        res:set_status((http_errors.classify(oerr)))
        res:write_json({ success = false, error = "connections contract open failed: " .. tostring(oerr) })
        return
    end

    local result, err = inst:delete({ component_id = component_id })
    if err or not result then
        local status = http_errors.classify(err)
        local message = tostring(err or "delete failed")
        res:set_status(status)
        res:write_json({ success = false, error = message })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, deleted = true })
end

return { handler = handler }
