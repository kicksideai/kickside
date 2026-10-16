local fixture = require("fixture")
local execution = require("execution")
local function principal_of_key(key: any): (any, error?)
    if key == nil or key == "" or execution.is_maintenance_key(key) then
        fixture.key_reads = fixture.key_reads + 1
        return execution.principal_of_key(key)
    end
    return fixture.principal_of_key(key)
end
return {principal_of_key = principal_of_key, check_principal = fixture.check_principal,
    is_maintenance_key = execution.is_maintenance_key}
