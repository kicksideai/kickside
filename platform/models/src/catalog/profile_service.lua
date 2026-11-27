-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Provider profile paths shared by the admin handlers and the profiles contract.
-- Each write is recorded in the module log with its actor, the profile id and the
-- names of the secrets it set, never their values.
local security = require("security")
local logger = require("logger")
local contract = require("contract")
local models_repo = require("models_repo")
local model_discovery = require("model_discovery")

local HOLDER_CONTRACT = "kickside.models.profiles:profile_holder"

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

-- create saves a profile and, when it is enabled, tests it (every *_env reference, then the
-- provider probe), so its status is the test's outcome; the test failing leaves the profile
-- saved and unhealthy with the reason.
function M.create(input: any): (any?, any?)
    local profile, err = models_repo.create_profile(input)
    if not profile then return nil, err end
    record("created", profile.id, profile)
    if profile.enabled == false then return profile end
    model_discovery.test(profile.id, {})
    return M.get(profile.id)
end

function M.update(id: any, input: any): (any?, any?)
    if type(id) ~= "string" or id == "" then return nil, "Profile id is required" end
    local profile, err = models_repo.update_profile(id, input)
    if not profile then return nil, err end
    record("updated", id, profile)
    return profile
end

-- The records naming the profile id, across every implementation of the
-- profile holder contract.
function M.holders(id: string): ({ any }?, any?)
    local bindings, find_err = contract.find_implementations(HOLDER_CONTRACT)
    if find_err then return nil, find_err end
    if #(bindings or {}) == 0 then return {} end
    local def, def_err = contract.get(HOLDER_CONTRACT)
    if def_err then return nil, def_err end
    local out = {}
    for _, binding in ipairs(bindings or {}) do
        local holder, open_err = (def :: any):open(binding)
        if open_err then return nil, open_err end
        local reply, call_err = holder:holders({ profile_id = id })
        if call_err then return nil, call_err end
        for _, h in ipairs(type(reply) == "table" and reply.holders or {}) do out[#out + 1] = h end
    end
    return out
end

-- Deletes the profile id and the cards routed through it, refused with code
-- profile_in_use while a holder names it.
function M.delete(id: any): (boolean, any?)
    if type(id) ~= "string" or id == "" then return false, "Profile id is required" end
    local holders, holders_err = M.holders(id)
    if not holders then return false, holders_err end
    if #holders > 0 then
        local names = {}
        for i, h in ipairs(holders) do names[i] = tostring(h.kind) .. " " .. tostring(h.id) end
        return false, errors.new({ kind = errors.CONFLICT, retryable = false,
            message = "provider profile " .. id .. " is in use by " .. table.concat(names, ", ") .. "; remove them first, then delete the profile",
            details = { code = "profile_in_use", holders = holders } })
    end
    local ok, err = models_repo.delete_profile(id)
    if not ok then return false, err end
    record("deleted", id)
    return true
end

-- Tests the profile id: its environment references resolve and its provider
-- answers. An unscoped test records the profile status (healthy, unhealthy);
-- a model-scoped test leaves that status unchanged.
-- served answers the provider models the profile serves now (the provider's model list); a
-- list the provider does not answer is profile_unavailable with the reason.
function M.served(id: any): ({ string }?, any?)
    if type(id) ~= "string" or id == "" then return nil, "Profile id is required" end
    local models, err = model_discovery.served(id)
    if not models then
        return nil, errors.new({ kind = errors.UNAVAILABLE, retryable = true, message = tostring(err),
            details = { code = "profile_unavailable" } })
    end
    return models
end

function M.test(id: any, opts: any?): (any?, any?)
    if type(id) ~= "string" or id == "" then return nil, "Profile id is required" end
    local profile, get_err = models_repo.get_profile(id)
    if get_err then return nil, get_err end
    if not profile then return nil, "profile not found" end
    local result, err = model_discovery.test(id, opts or {})
    if not result then
        return nil, errors.new({ kind = errors.UNAVAILABLE, retryable = true, message = tostring(err),
            details = { code = "profile_unhealthy" } })
    end
    return result
end

return M
