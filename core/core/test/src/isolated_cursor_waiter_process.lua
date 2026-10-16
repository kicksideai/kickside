-- Exercise the production broker with real process channels and an isolated name.
local process = require("process")
local isolated = {}
for key, value in pairs(process) do isolated[key] = value end
local names = {}
for key, value in pairs(process.registry) do names[key] = value end
names.register = function(name, owner, scope)
    return process.registry.register(name .. ":test:" .. tostring(process.pid()), owner, scope)
end
names.unregister = function(name, scope)
    return process.registry.unregister(name .. ":test:" .. tostring(process.pid()), scope)
end
names.lookup = function(name, scope, options)
    return process.registry.lookup(name .. ":test:" .. tostring(process.pid()), scope, options)
end
isolated.registry = names
return isolated
