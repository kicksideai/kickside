-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local binding_errors = require("binding_errors")
local component_access = require("component_access")
local M = {}

function M.resolve_owner(component_id: string): (string?, error?)
    local owner, err = component_access.component_owner_record(component_id)
    if err then
        return nil, binding_errors.from(err, errors.UNAVAILABLE, "component_owner_failed", "resolve actor")
    end
    if owner and owner.type == "unresolved" then
        return nil, binding_errors.new(errors.CONFLICT, "upload cleanup requires principal custody proof",
            "custody_unresolved", true)
    end
    return owner and owner.actor_id or nil, nil
end

function M.validate(payload: table): error?
    local _, err = M.resolve_owner(payload.component_id)
    return err
end

return M
