local ctx = require("ctx")
local component = require("component")

local function public_meta(component_id: string?): any?
    if not component_id or component_id == "" then return nil end
    local rows = component.list_system({
        component_ids = { component_id },
        include = { meta = true },
        limit = 1,
    })
    local row = rows and rows[1]
    if type(row) ~= "table" then return nil end
    return row.meta
end

local function handle(request_dto)
    local context = type(request_dto) == "table" and (request_dto.context or {}) or {}
    local component_id: string? = nil
    if type(context.component_id) == "string" and context.component_id ~= "" then
        component_id = context.component_id
    else
        local ambient_id = ctx.get("component_id")
        if type(ambient_id) == "string" then component_id = ambient_id end
    end
    local meta = public_meta(component_id) or context
    local status = meta.status
    if type(status) ~= "string" or status == "" then
        status = "active"
    end
    return {
        success = true,
        status = status,
        title = meta.title or context.title or "User Agent",
    }
end

return { handle = handle }
