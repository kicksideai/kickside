local worker = require("projection_worker")
local process = require("process")
local function run(input: table): (table?, error?)
    local binding = {
        worker_ref = "proc://app:supervision_child",
        worker_runtime = "proc",
        target_id = "app:supervision_child",
    }
    local result, err = worker.run_proc_supervised(binding, input, { proc_host = "app:processes" })
    return { output = result, error = err and tostring(err), options = process.get_options() }, nil
end
return { run = run }
