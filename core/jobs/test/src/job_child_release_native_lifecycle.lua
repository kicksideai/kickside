local fixture = require("fixture")
local adapter: any = {finalize_job_run = fixture.finalize, start_job_run = fixture.run_start, fail_job = fixture.fail_job}
return adapter
