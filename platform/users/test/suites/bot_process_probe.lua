local worker = require("projection_worker")

return {run = function(binding)
    return worker.run_proc_supervised(binding, {}, {proc_host = "app:processes"})
end}
