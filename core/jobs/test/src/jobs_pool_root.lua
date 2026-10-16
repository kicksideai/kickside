-- Test-owned process.service target running the real jobs worker pool root.
local worker_pool = require("worker_pool")

local function run(handover: any?): (any?, error?)
    return worker_pool.main(handover)
end

return { run = run }
