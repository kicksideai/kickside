-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local upload_query_repo = require("upload_query_repo")
local component = require("component")
local access_policy = require("access_policy")
local execution_identity = require("execution_identity")
local types = require("types")

local function denied(): error
    return errors.new({kind = errors.PERMISSION_DENIED, message = "Upload reference is not readable"})
end

local function validate(change: any): (boolean?, error?)
    -- Removing a reference grants no authority over its former upload.
    if change.new_value == nil then return true, nil end
    if type(change.new_value) ~= "string" or change.new_value == "" then return nil, denied() end
    local principal, principal_err = execution_identity.check_principal(change.principal, "metadata writer")
    if principal_err then return nil, denied() end
    local upload, lookup_err = upload_query_repo.get(change.new_value)
    if lookup_err and not errors.is(lookup_err, errors.NOT_FOUND) then return nil, lookup_err end
    if not upload then return nil, denied() end
    if execution_identity.actor_key(principal) == upload.actor_id then return true, nil end
    local container_id = types.component_id_for_owner(upload.actor_id)
    if not container_id then return nil, errors.new({kind = errors.INTERNAL, message = "Upload owner is invalid"}) end
    local masks, masks_err = component.principal_masks_system(principal, {container_id})
    if masks_err then return nil, masks_err end
    if not access_policy.has_all((masks or {})[container_id] or 0, component.ACCESS.READ) then return nil, denied() end
    return true, nil
end

return {validate = validate}
