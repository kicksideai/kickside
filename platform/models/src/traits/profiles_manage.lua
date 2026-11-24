-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- ModelProfilesManage: create, update and delete provider profiles through the
-- kickside.models.profiles:profiles contract. Secrets go in; only their names come back.
local profiles_client = require("profiles_client")
local tool_action = require("tool_action")
local tool_result = require("tool_result")

type Map = { [string]: any }

local ACTIONS = {
    create = { required = { "profile" } },
    update = { required = { "id", "profile" } },
    delete = { required = { "id" } },
}

local function handler(args: any): (any?, error?)
    local action, action_err = tool_action.check(args, ACTIONS)
    if action_err then return nil, action_err end
    local input = args :: Map
    if action ~= "delete" and type(input.profile) ~= "table" then
        return tool_result.fail(errors.INVALID, "profile must be an object")
    end
    if action == "create" then
        local reply, err = profiles_client.call("create_profile", input.profile)
        if err or tool_result.is_domain_error(reply) then return reply, err end
        return { success = true, profile = (reply :: Map).profile }, nil
    end
    if action == "update" then
        local reply, err = profiles_client.call("update_profile", { id = input.id, profile = input.profile })
        if err or tool_result.is_domain_error(reply) then return reply, err end
        return { success = true, profile = (reply :: Map).profile }, nil
    end
    local reply, err = profiles_client.call("delete_profile", { id = input.id })
    if err or tool_result.is_domain_error(reply) then return reply, err end
    return { success = true, id = input.id }, nil
end

return { handler = handler }
