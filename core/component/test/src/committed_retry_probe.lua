local register = require("register")
local fixture = require("fixture")
local envelope = require("envelope")
local function run(stage: string): (any?, error?)
    fixture.reset(stage)
    local result = register.handle({impl_id = "implementation"})
    local err = envelope.error_of(result, "register")
    if err then return nil, err end
    return result, nil
end
return {run = run}
