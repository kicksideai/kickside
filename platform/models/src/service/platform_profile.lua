-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Creates the platform-managed provider profile once, when the deploying
-- platform supplies a model key and a monthly token cap.
local env = require("env")
local models_repo = require("models_repo")
local model_discovery = require("model_discovery")
local platform_cap = require("platform_cap")

local M = {}

local function ensure()
    local key = env.get(platform_cap.KEY_ENV)
    if type(key) ~= "string" or key == "" then return { status = "success", message = "no platform model key" } end
    if not platform_cap.cap(env.get(platform_cap.CAP_ENV)) then
        return { status = "success", message = "platform model key has no monthly cap; profile not created" }
    end
    local provider_id = platform_cap.provider_for_key(key)
    if not provider_id then return { status = "success", message = "platform model key provider is not recognized" } end

    local snapshot, snapshot_err = models_repo.snapshot()
    if not snapshot then return { status = "success", message = "models snapshot failed: " .. tostring(snapshot_err) } end
    for _, profile in ipairs(snapshot.profiles or {}) do
        if platform_cap.is_platform(profile) then return { status = "success", message = "platform profile exists" } end
    end

    local created, create_err = models_repo.create_profile({
        name = platform_cap.PROFILE_NAME,
        provider_id = provider_id,
        icon = "tabler:sparkles",
        api_key_env = platform_cap.KEY_ENV,
        enabled = true,
    })
    if not created then return { status = "success", message = "platform profile create failed: " .. tostring(create_err) } end
    local _, discover_err = model_discovery.discover(created.id)
    if discover_err then
        return { status = "success", message = "platform profile created; model discovery failed: " .. tostring(discover_err) }
    end
    return { status = "success", message = "platform profile created" }
end

-- A failure leaves the instance without the platform profile; it never stops boot.
function M.run()
    local ok, result = pcall(ensure)
    if not ok then return { status = "success", message = "platform profile skipped: " .. tostring(result) } end
    return result
end

return M
