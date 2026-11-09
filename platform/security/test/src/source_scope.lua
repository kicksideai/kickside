-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local scopes = require("group_resolver")
local execution = require("execution_identity")
local M = {}
function M.resolve(group)
    local selected, err = scopes.resolve({group})
    if not selected then return nil, err end
    return execution.scope_from_groups(selected.groups, selected.policy_ids)
end
return M
