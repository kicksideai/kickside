-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local component_reader = require("component_reader")
local component_types = require("component_types")
local document = require("secrets_document")

local function query(filter: component_types.QueryFilter?, secrets: boolean): (component_types.ComponentRow[]?, error?)
    local f: component_types.QueryFilter = filter or {}
    local reader = component_reader.new()

    if type(f.component_ids) == "table" and #f.component_ids > 0 then
        reader = reader:with_components(f.component_ids)
    end
    if type(f.impl_ids) == "table" and #f.impl_ids > 0 then
        reader = reader:with_impl_ids(f.impl_ids)
    end
    if f.match_ids ~= nil then
        local selected, match_err = reader:with_id_match(f.match_ids)
        if match_err then return nil, match_err end
        if not selected then return nil, errors.new({kind = errors.INTERNAL, message = "component selector returned no reader"}) end
        reader = selected
    end
    if type(f.meta) == "table" then
        reader = reader:with_meta(f.meta)
    end
    if f.parent_id ~= nil then
        reader = reader:with_parent(f.parent_id :: string)
    end
    if type(f.path_prefix) == "string" and f.path_prefix ~= "" then
        reader = reader:with_path_prefix(f.path_prefix)
    end
    if type(f.include) == "table" then
        local inc = f.include
        reader = reader:include_options({ meta = inc.meta, private_context = inc.private_context, secrets = secrets })
    end
    if type(f.order_by) == "table" and type(f.order_by.field) == "string" then
        reader = reader:order_by(f.order_by.field, f.order_by.direction)
    end
    if type(f.limit) == "number" and f.limit > 0 then
        reader = reader:limit(f.limit, type(f.offset) == "number" and f.offset or 0)
    end

    local rows, err = reader:all()
    if err then return nil, err end
    if secrets and f.include and f.include.private_context == true then
        for _, row in ipairs(rows or {}) do
            local read_err = document.finish_runtime_read(row)
            if read_err then return nil, read_err end
        end
    end
    return rows :: component_types.ComponentRow[]?, err
end

return {
    masked = function(filter: component_types.QueryFilter?): (component_types.ComponentRow[]?, error?)
        return query(filter, false)
    end,
    runtime = function(filter: component_types.QueryFilter?): (component_types.ComponentRow[]?, error?)
        return query(filter, true)
    end,
}
