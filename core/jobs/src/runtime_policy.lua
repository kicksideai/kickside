-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local cfg = require("config")
local overrides = require("policy_overrides")
local funcs = require("funcs")
local security = require("security")
local envelope = require("error_envelope")
local M = {}

-- Out-of-pool readers reuse their own transaction/connection. This path shares
-- the owner resolver and never opens an additional SQL handle.
function M.resolve_from(tx: any): (table?, error?)
    local current, err = overrides.read_from(tx)
    if err then return nil, err end
    return cfg.runtime(current.values)
end

function M.get(): (table?, error?)
    local current, err = overrides.read(cfg.db_id())
    if err then return nil, err end
    local entry, entry_err = cfg.declaration()
    if entry_err then return nil, entry_err end
    local result, resolve_err = cfg.effective(entry.meta, entry.data.defaults, current.values)
    if result then result.revision = current.revision end
    return result, resolve_err
end

-- The Jobs capability protects every caller, including direct library callers.
function M.set(values: any, unset: any?): (table?, error?)
    if security.can("jobs.policy.write", cfg.POLICY) ~= true then
        return nil, errors.new({kind = errors.PERMISSION_DENIED, message = "Jobs policy administration is required"})
    end
    if type(values) ~= "table" or (unset ~= nil and type(unset) ~= "table") then
        return nil, errors.new({kind = errors.INVALID, message = "values must be an object and unset must be a list"})
    end
    for key in pairs(values) do
        if not cfg.editable(key) then return nil, errors.new({kind = errors.INVALID, message = "Unknown policy key: " .. tostring(key)}) end
    end
    for index, key in pairs(unset or {}) do
        if type(index) ~= "number" or index % 1 ~= 0 or index < 1 or index > #(unset or {})
            or not cfg.editable(key) or values[key] ~= nil then
            return nil, errors.new({kind = errors.INVALID, message = "Invalid policy reset key"})
        end
    end
    local entry, entry_err = cfg.declaration()
    if entry_err then return nil, entry_err end
    local result, err = overrides.write(cfg.db_id(), values, unset or {}, function(current: table): (any?, error?)
        return cfg.effective(entry.meta, entry.data.defaults, current)
    end)
    if err then
        if result then
            result.committed = true
            return result, envelope.wrap(err, "Jobs policy is committed but not yet applied",
                {committed = true, revision = result.revision})
        end
        return nil, err
    end
    result.committed = true
    local _, nudge_err = funcs.call("kickside.core.jobs:nudge_workers", {revision = result.revision})
    if nudge_err then
        return result, envelope.wrap(nudge_err, "Jobs policy is committed; owner notification failed",
            {committed = true, revision = result.revision})
    end
    return result, nil
end
return M
