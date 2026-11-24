-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Provider profile paths shared by the admin handlers and the profiles contract.
-- Each write is recorded in the module log with its actor, the profile id and the
-- names of the secrets it set, never their values.
local security = require("security")
local logger = require("logger")
local models_repo = require("models_repo")

local M = {}
local log = logger:named("kickside.models.profiles")

local function record(action: string, id: any, profile: any?)
    local actor = security.actor()
    log:info("provider profile " .. action, {
        action = action,
        actor = actor and actor:id() or nil,
        profile_id = id,
        provider_id = profile and profile.provider_id or nil,
        secret_fields = profile and profile.secret_fields or nil,
    })
end

-- The public profile named id: settings, enabled state and the names of stored secrets.
function M.get(id: any): (any?, any?)
    if type(id) ~= "string" or id == "" then return nil, "Profile id is required" end
    local profile, err = models_repo.get_profile_public(id)
    if err then return nil, err end
    if not profile then return nil, "profile not found" end
    return profile
end

function M.list(): ({ any }?, any?)
    return models_repo.list_profiles_public()
end

function M.create(input: any): (any?, any?)
    local profile, err = models_repo.create_profile(input)
    if not profile then return nil, err end
    record("created", profile.id, profile)
    return profile
end

function M.update(id: any, input: any): (any?, any?)
    if type(id) ~= "string" or id == "" then return nil, "Profile id is required" end
    local profile, err = models_repo.update_profile(id, input)
    if not profile then return nil, err end
    record("updated", id, profile)
    return profile
end

function M.delete(id: any): (boolean, any?)
    if type(id) ~= "string" or id == "" then return false, "Profile id is required" end
    local ok, err = models_repo.delete_profile(id)
    if not ok then return false, err end
    record("deleted", id)
    return true
end

return M
