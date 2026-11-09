-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Settings validate_func for Jobs policy values: a candidate is accepted only
-- when the policy it produces with the other current overrides resolves, which
-- enforces cross-field rules such as a heartbeat shorter than the lease.
local cfg = require("config")
local overrides = require("policy_settings_overrides")

local function run(input: any): table
    if type(input) ~= "table" or not cfg.editable(input.key) then
        return {valid = false, error = "Unknown Jobs policy value"}
    end
    local current, read_err = overrides.run()
    if read_err or not current then
        return {valid = false, error = "Jobs policy is unavailable: " .. tostring(read_err)}
    end
    current[input.key] = input.value
    local _, resolve_err = cfg.runtime(current)
    if resolve_err then return {valid = false, error = tostring(resolve_err)} end
    return {valid = true}
end

return { run = run }
