local job_health = require("job_health")

local function run(): { health: any, kind: string?, message: string? }
    local health, err = job_health.read()
    if err then return { kind = err:kind(), message = err:message() } end
    return { health = health }
end

return { run = run }
