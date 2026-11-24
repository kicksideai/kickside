-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Reads the Jobs policy values an administrator overrode in Settings. Keys
-- without an override take the registry/host policy, not the Settings default.
-- Runs under this entry's policies, so any Jobs caller can resolve the
-- committed policy without Settings access of its own.
local registry = require("registry")
local contract = require("contract")
local cfg = require("config")

local NAMESPACE = "kickside.core.jobs"
local SETTINGS = "kickside.settings:settings"

local function unavailable(message: string, cause: any?): error
    if cause then return errors.wrap(cause, message) end
    return errors.new({kind = errors.UNAVAILABLE, retryable = true, message = message})
end

local function legacy_overrides(instance: any): (table?, error?)
    -- Older Settings reports provenance only in its admin list. Use the value
    -- from the same row so a concurrent write cannot pair it with stale provenance.
    local response, err = instance:list({namespace = NAMESPACE})
    if err then return nil, unavailable("Jobs policy legacy Settings read failed", err) end
    if type(response) ~= "table" or response.success ~= true or type(response.settings) ~= "table" then
        return nil, unavailable("Jobs policy legacy Settings read failed: " .. tostring(type(response) == "table" and response.error or "invalid response"))
    end
    local values: table = {}
    for _, row in ipairs(response.settings) do
        if row.namespace == NAMESPACE and cfg.editable(row.key) and row.is_default == false then
            if row.error or row.value == nil then
                return nil, unavailable("Jobs policy legacy Settings override is invalid: " .. row.key)
            end
            values[row.key] = row.value
        end
    end
    return values, nil
end

local function run(): (table?, error?)
    local declared, lookup_err = registry.get(SETTINGS)
    if lookup_err and not errors.is(lookup_err, errors.NOT_FOUND) then
        return nil, unavailable("Jobs policy Settings lookup failed", lookup_err)
    end
    if not declared then return {}, nil end
    local definition, definition_err = contract.get(SETTINGS)
    if definition_err or not definition then return nil, unavailable("Jobs policy Settings contract unavailable", definition_err) end
    local instance, open_err = definition:open()
    if open_err or not instance then return nil, unavailable("Jobs policy Settings contract open failed", open_err) end
    local response, read_err = instance:get_namespace({namespace = NAMESPACE})
    if read_err then return nil, unavailable("Jobs policy Settings read failed", read_err) end
    if type(response) ~= "table" or response.success ~= true or type(response.values) ~= "table" then
        return nil, unavailable("Jobs policy Settings read failed: " .. tostring(type(response) == "table" and response.error or "invalid response"))
    end
    if response.overridden == nil then return legacy_overrides(instance) end
    if type(response.overridden) ~= "table" then
        return nil, unavailable("Jobs policy Settings override list is invalid")
    end
    local values: table = {}
    for _, key in ipairs(response.overridden) do
        if cfg.editable(key) then values[key] = response.values[key] end
    end
    return values, nil
end

return { run = run }
