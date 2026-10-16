-- Response envelope of POST /connections/{id}/discover_resources.
--
-- It returns the provider's rows unchanged, one canonical picker item per row,
-- and the provider's next_cursor so a caller can request the following page.
-- selectable/drillable are taken straight from the provider row; an undeclared
-- flag means false (not a pickable target / not a drill-in container), so the
-- picker never re-guesses the shape.

local M = {}

type PickerItem = {
    id: any,
    label: any,
    icon: string,
    parent_id: any,
    selectable: boolean,
    drillable: boolean,
}

type Envelope = {
    success: boolean,
    component_id: string,
    resources: { any },
    items: { PickerItem },
    next_cursor: string?,
}

function M.build(component_id: string, result: any): Envelope
    local resources: { any } = {}
    if type(result) == "table" and type(result.resources) == "table" then
        resources = result.resources :: { any }
    end
    local items: { PickerItem } = {}
    for _, r in ipairs(resources) do
        local row = r :: { [string]: any }
        items[#items + 1] = {
            id = row.id or "",
            label = row.name or row.title or row.id or "",
            icon = type(row.icon) == "string" and row.icon or "",
            parent_id = row.parent_id,
            selectable = row.selectable == true,
            drillable = row.drillable == true,
        }
    end

    local next_cursor: string? = nil
    if type(result) == "table" and type(result.next_cursor) == "string" and result.next_cursor ~= "" then
        next_cursor = result.next_cursor
    end

    return {
        success = true,
        component_id = component_id,
        resources = resources,
        items = items,
        next_cursor = next_cursor,
    }
end

return M
