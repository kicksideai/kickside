-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local identity = require("identity")
local registry = require("registry")
local security = require("security")
return {run = function(id)
    local entries, read_err = registry.find({["meta.type"] = "kickside.execution.maintenance_actor"})
    local maintenance = identity.is_maintenance_key(id)
    local after = registry.find({["meta.type"] = "kickside.execution.maintenance_actor"})
    return {maintenance = maintenance, visible = #(entries or {}), visible_after = #(after or {}),
        denied = read_err ~= nil, actor = security.actor():id()}
end}
