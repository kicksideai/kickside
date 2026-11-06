-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local runtime_policy = require("runtime_policy")
local jobs = require("jobs")

local function resolve(): (table?, error?)
    return runtime_policy.resolve()
end

local function enqueue(): (table?, error?)
    return jobs.enqueue({namespace = "policy-settings", scope = "restricted", key = "committed-policy",
        owner_locator = {kind = "test", id = "restricted"}, job_type = "app:generic_job_target",
        immutable_payload = {}, slot = true, parked = true})
end

return {resolve = resolve, enqueue = enqueue}
