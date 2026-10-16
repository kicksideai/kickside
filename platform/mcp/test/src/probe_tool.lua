-- Harness tool: reports whether a component id is visible to the CALLING actor,
-- through the public access-filtered component service. The MCP folder-scope e2e
-- suite calls it via the dispatcher so the read runs under the synthesized,
-- whitelist-confined actor -- proving tools/call (not just the actor's metadata)
-- confines a credential to its folder, and is blocked outside it.
local component = require("component")

local function handler(args)
    local id = type(args) == "table" and args.component_id or nil
    if type(id) ~= "string" or id == "" then return nil, errors.new({ message = "component_id required", kind = errors.INVALID }) end

    local svc, svc_err = component.get_service()
    if not svc then return nil, errors.new({ message = "component service unavailable: " .. tostring(svc_err), kind = errors.INTERNAL }) end

    local res, qerr = svc:query({ component_ids = { id }, access_mask = component.ACCESS.READ })
    if qerr or not res or res.success ~= true then
        return nil, errors.new({ message = tostring((res and res.error) or qerr or "query failed"), kind = errors.INTERNAL })
    end

    for _, c in ipairs(res.components or {}) do
        if tostring(c.component_id) == id then return { found = true } end
    end
    return { found = false }
end

return { handler = handler }
