-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local http = require("http")
local security = require("security")
local api_errors = require("api_errors")
local groups = require("groups")
local execution = require("execution_identity")
local group_sets = require("group_sets")

local function handler()
    local res, _, context_err = api_errors.context()
    if context_err then return nil, context_err end
    local header_err = api_errors.prepare(res)
    if header_err then return nil, header_err end

    local actor = security.actor()
    if not actor or not security.can("access", "kickside.security.api:projection_status.endpoint") then
        return api_errors.write(res, http.STATUS.FORBIDDEN, api_errors.denied())
    end
    local selected = actor:meta().security_groups
    local name, name_err = group_sets.name_for(selected)
    if not name then return api_errors.write(res, http.STATUS.INTERNAL_ERROR, name_err) end
    local resolved, resolve_err = groups.resolve(selected)
    if resolve_err then return api_errors.write(res, http.STATUS.INTERNAL_ERROR, resolve_err) end
    local scope, scope_err = execution.scope_from_groups(resolved.groups, resolved.policy_ids)
    if scope_err then
        return api_errors.write(res, http.STATUS.INTERNAL_ERROR, scope_err)
    end
    return api_errors.respond(res, http.STATUS.OK, {scope_name = name, current = scope ~= nil})
end

return {handler = handler}
