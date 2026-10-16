local jobs = require("jobs")
local fixture = require("fixture")
local function run(): (table?, error?)
    local source = errors.new({kind = errors.UNAVAILABLE, retryable = true,
        message = "scope release refusal", details = {code = "scope_dependency", nested = {marker = "kept"}}})
    fixture.reset("sweep", "release", source, nil)
    fixture.durable = true
    return jobs.retention_sweep()
end
return {run = run}
