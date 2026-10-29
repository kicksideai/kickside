-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local security = require("security")
local funcs = require("funcs")
local component_reader = require("component_reader")
local M = {}

-- A trusted caller grants dispatch to exists, not access to Component's DB.
-- Only the owner policies cross into the reader; caller inspection denials and
-- database grants remain on the caller's frame.
function M.exists(component_id: string): (boolean?, error?)
    local policies = {}
    for _, id in ipairs({"kickside.component.system:read_config", "kickside.component.system:read_db"}) do
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
    return bound:call("kickside.component.system:read_exists", component_id)
end

function M.read(component_id: string): (boolean?, error?)
    if type(component_id) ~= "string" or component_id == "" then
        return nil, (errors.new({kind = errors.INVALID, message = "component ID is required"}) :: error)
    end
    return component_reader.new():with_components(component_id):exists()
end

return M
