-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local contract = require("contract")
local registry = require("registry")
local envelope = require("error_envelope")
local M = {}
function M.run(): (table?, error?)
    local function failed(err: error): (table?, error?)
        return nil, envelope.wrap(err, "Jobs performance notification failed", {})
    end
    local wiring, wiring_err = registry.get("kickside.core.jobs.performance:config")
    if wiring_err then return failed(wiring_err) end
    if type(wiring) == "table" and type(wiring.meta) == "table"
        and (wiring.meta.binding_id == nil or wiring.meta.binding_id == "") then
        return {success = true}, nil
    end
    if type(wiring) ~= "table" or type(wiring.meta) ~= "table"
        or type(wiring.meta.binding_id) ~= "string" then
        return failed(errors.new({kind = errors.UNAVAILABLE, retryable = false,
            message = "Jobs realtime binding is required", details = {code = "jobs_performance_binding_required"}}))
    end
    local definition, err = contract.get("kickside.contract:realtime")
    if err then return failed(err) end
    local instance, open_err = definition:open(wiring.meta.binding_id)
    if open_err then return failed(open_err) end
    local topics = {"kickside.jobs.performance.changed"}
    for _, topic in ipairs(topics) do
        local result, broadcast_err = instance:broadcast({topic = topic, data = {}})
        if broadcast_err then return failed(broadcast_err) end
        if not result or result.success ~= true then
            return failed(errors.new({kind = errors.UNAVAILABLE, retryable = true,
                message = result and result.error or "Jobs performance delivery is refused",
                details = {code = "jobs_performance_delivery", response = result}}))
        end
    end
    return {success = true}, nil
end
return M
