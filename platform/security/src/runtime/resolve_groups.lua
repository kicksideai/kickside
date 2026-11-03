-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local groups = require("groups")
local security = require("security")
local funcs = require("funcs")
local M = {}
function M.resolve(request: any): (any?, error?)
    local policies = {}
    for _, id in ipairs({"kickside.security.service:group_set_registry_read", "kickside.security.service:group_set_db"}) do
        local policy, err = security.policy(id)
        if err then return nil, err end
        policies[#policies + 1] = policy
    end
    local scope, scope_err = security.new_scope(policies)
    if scope_err then return nil, scope_err end
    local executor, executor_err = funcs.new()
    if executor_err then return nil, executor_err end
    local bound, bind_err = executor:with_scope(scope)
    if bind_err then return nil, bind_err end
    return bound:call("kickside.security.runtime:read_groups", request)
end
function M.read(request: any): (any?, error?)
    return groups.resolve(type(request) == "table" and request.groups or nil)
end
return M
