local fixture = require("fixture")
local adapter: any = {validate_for_dispatch = fixture.lease_validate, start = fixture.lease_start, stop = fixture.lease_stop}
return adapter
