local maintenance_wake = require("maintenance_wake")

local function run(): (any?, any?)
    return maintenance_wake.notify()
end

return { run = run }
