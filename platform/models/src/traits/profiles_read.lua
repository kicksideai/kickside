-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- ModelProfilesRead: provider profiles, one profile by id and the provider models
-- one profile serves, through the
-- kickside.models.profiles:profiles contract. Secret values are never returned.
local profiles_client = require("profiles_client")
local tool_action = require("tool_action")
local tool_result = require("tool_result")

type Map = { [string]: any }

local ACTIONS = {
    list = {},
    get = { required = { "id" } },
    served = { required = { "id" } },
}

local function handler(args: any): (any?, error?)
    local action, action_err = tool_action.check(args, ACTIONS)
    if action_err then return nil, action_err end
    if action == "list" then
        local reply, err = profiles_client.call("list_profiles", {})
        if err or tool_result.is_domain_error(reply) then return reply, err end
        local profiles = (reply :: Map).profiles
        return { success = true, count = #profiles, profiles = profiles }, nil
    end
    if action == "served" then
        local reply, err = profiles_client.call("served_models", { id = (args :: Map).id })
        if err or tool_result.is_domain_error(reply) then return reply, err end
        local models = (reply :: Map).models
        return { success = true, count = #models, models = models }, nil
    end
    local reply, err = profiles_client.call("get_profile", { id = (args :: Map).id })
    if err or tool_result.is_domain_error(reply) then return reply, err end
    return { success = true, profile = (reply :: Map).profile }, nil
end

return { handler = handler }
