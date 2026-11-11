-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local security = require("security")
local component = require("component")
local access_policy = require("access_policy")
local execution_identity = require("execution_identity")
local types = require("types")

local M = {}

function M.authorize(upload: types.UploadReadRef): (boolean?, error?)
    local actor = security.actor()
    if not actor then
        return nil, errors.new({kind = errors.PERMISSION_DENIED, message = "Authentication required",
            retryable = false, details = {code = "authentication_required"}})
    end
    if upload.actor_id == actor:id() then return true, nil end
    local container_id = types.component_id_for_owner(upload.actor_id)
    if not container_id then
        return nil, errors.new({kind = errors.INTERNAL, message = "Upload owner is invalid", retryable = false})
    end
    local _, container_err = component.validate_access(container_id, component.ACCESS.READ)
    if not container_err then return true, nil end
    if not errors.is(container_err, errors.PERMISSION_DENIED) and not errors.is(container_err, errors.NOT_FOUND) then
        return nil, container_err
    end
    local references, reference_err = component.query({meta = {upload_id = upload.uuid},
        access_mask = component.ACCESS.READ, limit = 16, include = {meta = false}})
    if reference_err then return nil, reference_err end
    local checked: {[string]: boolean} = {}
    for _, reference in ipairs(references or {}) do
        local context, context_err = component.get_private_context(reference.component_id)
        if context_err then return nil, context_err end
        local captured = context and context._execution_identity
        if captured and captured.principal then
            local principal, principal_err = execution_identity.check_principal(captured.principal, "reference creator")
            if principal_err then return nil, principal_err end
            local principal_key = execution_identity.actor_key(principal)
            if not checked[principal_key] then
                checked[principal_key] = true
                if principal_key == upload.actor_id then return true, nil end
                local masks, masks_err = component.principal_masks_system(principal, {container_id})
                if masks_err then return nil, masks_err end
                if access_policy.has_all((masks or {})[container_id] or 0, component.ACCESS.READ) then return true, nil end
            end
        end
    end
    return nil, errors.new({kind = errors.NOT_FOUND, message = "Upload not found",
        retryable = false, details = {code = "upload_not_found"}})
end

return M
