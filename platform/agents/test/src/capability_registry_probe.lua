-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local registry = require("registry")
local capability_context = require("capability_context")
local user_agents = require("user_agents")

return {run = function(args)
    if args.operation then
        -- Use the production HTTP-backed binding with only its component boundary
        -- substituted. Registry reads still run with the caller's native scope.
        local writes = 0
        local service = {
            list = function() return {success = true, components = {}} end,
            register = function() writes = writes + 1; return {success = true} end,
            update = function() writes = writes + 1; return {success = true} end,
        }
        local binding = user_agents.new(function() return service end)
        local request = {title = "Capability probe", traits = {args.id}, tools = {}}
        local result, err
        if args.operation == "create" then result, err = binding.create(request)
        else result, err = binding.update("unwritten-agent", request) end
        return {result = result, writes = writes, kind = err and err:kind(),
            message = err and tostring(err)}, nil
    end
    local validation, err = capability_context.validate_trait_contexts({args.id}, {}, registry.get)
    if err then return nil, err end
    return validation, nil
end}
