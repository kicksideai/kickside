-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Shared actor-filtered KB lookup. Callers choose their existing missing-row error.
local component = require("component")
local kb_types = require("kb_types")

local M = {}

function M.is_kb(meta: any): boolean
    return type(meta) == "table" and meta.class == kb_types.COMPONENT_CLASS
end

function M.get(kb_id: string, access_mask: any, missing_error: any?): (any?, any?)
    local rows, err = component.query({ component_ids = { kb_id }, access_mask = access_mask,
        include = { meta = true } })
    if err then return nil, err end
    local comp = rows and rows[1]
    if not comp then
        return nil, missing_error or errors.new({ kind = errors.NOT_FOUND, message = "knowledge base not found" })
    end
    if not M.is_kb(comp.meta) then
        return nil, errors.new({ kind = errors.INVALID, message = "component is not a knowledge base" })
    end
    return comp, nil
end

return M
