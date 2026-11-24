-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Implementation of the kickside.models.profiles:profiles contract.
local profile_service = require("profile_service")

local M = {}

local function message(err: any): string
    if type(err) == "table" and type((err :: any).message) == "function" then return (err :: any):message() end
    return tostring(err)
end

local function respond(profile: any?, err: any?): any
    if not profile then return { success = false, error = message(err) } end
    return { success = true, profile = profile }
end

-- list_profiles({}) -> { success, profiles?, error? }
function M.list_profiles(_args: any): any
    local profiles, err = profile_service.list()
    if not profiles then return { success = false, error = message(err) } end
    return { success = true, profiles = profiles }
end

-- get_profile({ id }) -> { success, profile?, error? }
function M.get_profile(args: any): any
    if type(args) ~= "table" then return { success = false, error = "request must be an object" } end
    return respond(profile_service.get(args.id))
end

-- create_profile(profile) -> { success, profile?, error? }
function M.create_profile(args: any): any
    if type(args) ~= "table" then return { success = false, error = "profile must be an object" } end
    return respond(profile_service.create(args))
end

-- update_profile({ id, profile }) -> { success, profile?, error? }. Omitted fields and secrets keep their saved values.
function M.update_profile(args: any): any
    if type(args) ~= "table" or type(args.profile) ~= "table" then
        return { success = false, error = "profile must be an object" }
    end
    return respond(profile_service.update(args.id, args.profile))
end

-- delete_profile({ id }) -> { success, error? }. Deletes the profile and the cards routed through it.
function M.delete_profile(args: any): any
    if type(args) ~= "table" then return { success = false, error = "request must be an object" } end
    local ok, err = profile_service.delete(args.id)
    if not ok then return { success = false, error = message(err) } end
    return { success = true }
end

return M
