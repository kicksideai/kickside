local registry = require("registry")
local security = require("security")
local reflection = require("reflection")

local GATE = "kickside.self_reflection.traits:self_reflection_tool"

local function registry_port(): any
    return {
        find = function(query: any): (any, any)
            return registry.find(query)
        end,
        get = function(id: string): (any, any)
            return registry.get(id)
        end,
    }
end

local function handler(args: any): (any, error?)
    if not security.actor() or security.can("access", GATE) ~= true then
        return nil, errors.new({ message = "access denied", kind = errors.PERMISSION_DENIED })
    end
    return reflection.execute(registry_port(), args)
end

return { handler = handler }
