-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local registry = require("registry")
local capability_context = require("capability_context")

return {run = function(args)
    local validation, err = capability_context.validate_trait_contexts({args.id}, {}, registry.get)
    if err then return nil, err end
    return validation, nil
end}
