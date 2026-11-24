-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Implementation of the kickside.models.profiles:profiles contract.
local profile_service = require("profile_service")

local M = {}

local function message(err: any): string
    if (type(err) == "table" or type(err) == "userdata") and type((err :: any).message) == "function" then return (err :: any):message() end
    return tostring(err)
end

local function refusal(err: any): any
    local out: any = { success = false, error = message(err) }
    if type(err) == "userdata" then
        local details = (err :: any):details()
        if type(details) == "table" then
            out.code = details.code
            out.holders = details.holders
        end
    end
    return out
end

local function respond(profile: any?, err: any?): any
    if not profile then return refusal(err) end
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
    if not ok then return refusal(err) end
    return { success = true }
end

-- test_profile({ id, model? }) -> { success, result?, error?, code? }. An unscoped
-- probe records the profile status; a model-scoped probe leaves it unchanged.
function M.test_profile(args: any): any
    if type(args) ~= "table" then return { success = false, error = "request must be an object" } end
    local result, err = profile_service.test(args.id, { model = args.model })
    if not result then return refusal(err) end
    return { success = true, result = result }
end

-- served_models({ id }) -> { success, models?, error?, code? }. The provider models the
-- profile serves now, from the provider's model list.
function M.served_models(args: any): any
    if type(args) ~= "table" then return { success = false, error = "request must be an object" } end
    local models, err = profile_service.served(args.id)
    if not models then return refusal(err) end
    return { success = true, models = models }
end

return M
