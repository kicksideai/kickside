local process = require("process")
local worker = require("worker")

local function run(args: table): ()
    local _, cancel_err = process.cancel(tostring(process.pid()), "test cancellation before the first idle report")
    if cancel_err then error(cancel_err) end
    worker.run_loop(args)
end

return { run = run }
