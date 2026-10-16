-- GET /mcp/components — browse the canonical component tree the actor can see, so
-- the scope picker can target ANY accessible component (knowledge base, agent,
-- folder, ...), not just workspace-class entries. The workspace endpoint is one
-- class-filtered projection of this tree; the scope picker must see the whole tree
-- so a credential can be bound to anything the user can share.
--
-- parent_id omitted lists root-level components. Access-filtered via the component
-- service for the current actor; returns id + display name + class + drill hint.

local http = require("http")
local security = require("security")
local component = require("component")

-- A component carries its meta as a flat key->value map (title, class, icon, ...).
local function display_name(comp: any): string
    local meta: any = comp.meta or {}
    if type(meta.title) == "string" and meta.title ~= "" then return meta.title :: string end
    local id = tostring(comp.component_id or "")
    return (id:match("[^:%.]+$") or id)
end

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

    local parent_id = req:query("parent_id")
    if parent_id == "" then parent_id = nil end

    local svc, svc_err = component.get_service()
    if not svc then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "component service unavailable: " .. tostring(svc_err) })
        return
    end

    local result, err = (svc :: any):list_children({ parent_id = parent_id })
    if err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "list_children: " .. tostring(err) })
        return
    end

    local components = {}
    for _, comp in ipairs((result and result.components) or {}) do
        local meta: any = comp.meta or {}
        components[#components + 1] = {
            id = tostring(comp.component_id),
            name = display_name(comp),
            class = meta.class or "",
            icon = meta.icon or "",
        }
    end

    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        components = components,
        parent_id = parent_id,
        has_more = (result and result.has_more) or false,
    })
end

return { handler = handler }
