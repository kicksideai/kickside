local fixture = require("fixture")
local adapter: any = {supervise_job_child = fixture.supervise}
return adapter
