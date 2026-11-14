-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local autoinit = require("autoinit")
local security = require("security")

local M = {}

function M.check(impl_id: string, operation: string): error?
    local entry, lookup_err = autoinit.kind_for_impl(impl_id)
    if lookup_err and not errors.is(lookup_err, errors.NOT_FOUND) then return lookup_err end
    if not entry then return nil end
    local mode = entry.meta and entry.meta.mutation
    if mode == nil or mode == "open" then return nil end
    if mode ~= "closed" then
        return errors.new({kind = errors.INVALID, message = "component kind mutation must be open or closed: " .. impl_id,
            details = {code = "component_kind_mutation_invalid", impl_id = impl_id}})
    end
    local allowed, permission_err = security.can("component.kind." .. operation, impl_id)
    if permission_err then return permission_err end
    if allowed == true then return nil end
    return errors.new({kind = errors.PERMISSION_DENIED, retryable = false,
        message = "component kind " .. operation .. " requires admission: " .. impl_id,
        details = {code = "component_kind_mutation_denied", impl_id = impl_id, operation = operation}})
end

return M
