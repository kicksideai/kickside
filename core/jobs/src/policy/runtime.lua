-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Committed Jobs runtime policy: the registry/host policy with the admin
-- overrides an administrator saved in Settings. Settings is optional; without
-- it the registry/host policy applies.
local cfg = require("config")
local funcs = require("funcs")
local pg = require("pg")
local registry = require("registry")
local process = require("process")
local M = {}

-- Change delivery published by kickside/settings: each node's keeper tells this
-- group's local members once its cache holds a committed revision.
local CHANGES_SCOPE = "kickside.settings:changes"
local CHANGE_SUBSCRIBERS = "kickside.settings.subscribers"
M.CHANGE_TOPIC = "kickside.settings.changed"

-- overrides returns the admin overrides of the editable policy paths.
function M.overrides(): (table?, error?)
    local result, err = funcs.call("kickside.core.jobs.policy:settings_overrides")
    if err then return nil, errors.wrap(err, "Jobs policy settings read failed") end
    if type(result) ~= "table" then
        return nil, errors.new({kind = errors.INTERNAL, retryable = false, message = "Jobs policy settings response is invalid"})
    end
    return result, nil
end

-- resolve returns the committed runtime snapshot.
function M.resolve(): (table?, error?)
    local values, err = M.overrides()
    if err then return nil, err end
    return cfg.runtime(values :: table)
end

-- subscribe joins the calling process to this node's settings change
-- subscribers and returns the channel that receives each committed revision,
-- or nil when Settings is not installed.
function M.subscribe(): (any?, error?)
    local entry, lookup_err = registry.get(CHANGES_SCOPE)
    if lookup_err and not errors.is(lookup_err, errors.NOT_FOUND) then
        return nil, errors.wrap(lookup_err, "Jobs settings change scope lookup failed")
    end
    if not entry then return nil, nil end
    local scope, err = pg.open(CHANGES_SCOPE)
    if err then return nil, errors.wrap(err, "Jobs settings change scope unavailable") end
    if not scope then
        return nil, errors.new({kind = errors.UNAVAILABLE, retryable = true, message = "Jobs settings change scope unavailable"})
    end
    local _, join_err = scope:join(CHANGE_SUBSCRIBERS)
    if join_err then return nil, errors.wrap(join_err, "Jobs settings change subscription failed") end
    return process.listen(M.CHANGE_TOPIC), nil
end

return M
