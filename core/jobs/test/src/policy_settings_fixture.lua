-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Writes Jobs policy overrides the way an administrator does: through the
-- Settings contract under an administrator scope.
local contract = require("contract")
local security = require("security")

local NAMESPACE = "kickside.core.jobs"
local M = {}

local function settings(): any
    local policy = assert(security.policy("app:jobs_settings_admin"))
    local definition = assert(contract.get("kickside.settings:settings"))
    return assert((definition :: any)
        :with_actor(security.new_actor("jobs-policy-admin", {}))
        :with_scope(security.new_scope({ policy }))
        :open())
end

-- set writes every key/value. Settings validates each write against the other
-- current values, so keys apply in passes until each is accepted, the way an
-- administrator orders related edits. It returns the remaining refusal.
function M.set(values: table): string?
    local instance = settings()
    local pending: { string } = {}
    for key in pairs(values) do pending[#pending + 1] = key end
    table.sort(pending)
    local refusal: string? = nil
    while #pending > 0 do
        local remaining: { string } = {}
        for _, key in ipairs(pending) do
            local response = instance:set({ namespace = NAMESPACE, key = key, value = values[key] })
            if response.success ~= true then
                remaining[#remaining + 1] = key
                refusal = tostring(response.error)
            end
        end
        if #remaining == #pending then return refusal end
        pending = remaining
    end
    return nil
end

-- reset clears each key's override.
function M.reset(keys: { string }): ()
    local instance = settings()
    for _, key in ipairs(keys) do
        local response = instance:unset({ namespace = NAMESPACE, key = key })
        assert(response.success == true, tostring(response.error))
    end
end

return M
