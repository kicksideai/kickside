local fixture = require("fixture")
local real = require("real")
return {list_system = fixture.list_system, validate_access = real.validate_access, component_owner_record = real.component_owner_record}
