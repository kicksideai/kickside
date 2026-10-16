local process = require("process")
local subject = {}
for key, value in pairs(process) do subject[key] = value end
local names = {}
for key, value in pairs(process.registry) do names[key] = value end
names.register = function(_name, _owner, _scope)
    return false, errors.new({ kind = errors.PERMISSION_DENIED, message = "registry policy denies registration" })
end
subject.registry = names
return subject
