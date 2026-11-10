-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local execution_identity = require("execution_identity")

local function validate(change)
    if change.key ~= "test.validated" or type(change.component_id) ~= "string"
        or not change.principal or execution_identity.actor_key(change.principal) ~= "11111111-1111-4111-8111-111111111111" then
        return nil, errors.new({kind = errors.PERMISSION_DENIED, message = "unexpected metadata actor"})
    end
    if (change.old_value == nil and change.new_value == "created")
        or (change.old_value == "created" and change.new_value == "updated")
        or (change.old_value == "updated" and change.new_value == nil) then
        return true, nil
    end
    return nil, errors.new({kind = errors.PERMISSION_DENIED, message = "metadata transition refused",
        retryable = false, details = {code = "test_metadata_transition"}})
end

return {validate = validate}
