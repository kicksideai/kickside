local fixture = require("fixture")
local completion = require("completion")
local adapter: any = {complete_job = fixture.complete_job, failure_class_for = completion.failure_class_for,
    completion_opts = completion.completion_opts, fail_job = fixture.fail_job}
return adapter
