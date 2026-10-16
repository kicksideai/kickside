local shell = require("shell")
local ui_types = require("ui_types")

local M = {}

local SKIP: { [string]: boolean } = {}
SKIP["type"] = true
SKIP["private"] = true
SKIP["comment"] = true
SKIP["module"] = true
SKIP["module_version"] = true

local function contributions_of(meta_type: string, with_id: boolean): (any?, any?)
    local out: { any } = {}
    local entries, err = shell.discover(meta_type)
    if err then return nil, err end
    for _, entry in ipairs(entries) do
        local e = entry :: { id: string, meta: any }
        local meta = e.meta or {}
        if not meta.private then
            local row: { [string]: any } = {}
            for k, v in pairs(meta :: { [string]: any }) do
                if not SKIP[k] then row[k] = v end
            end
            if with_id then
                row.id = e.id or ""
            end
            out[#out + 1] = row
        end
    end
    return out
end

function M.list(_args: any): (any?, any?)
    local items, item_err = contributions_of(ui_types.NAV_ITEM_TYPE, true)
    if item_err then return nil, item_err end
    local categories, category_err = contributions_of(ui_types.NAV_CATEGORY_TYPE, false)
    if category_err then return nil, category_err end
    return {items = items, categories = categories}, nil
end

return M
