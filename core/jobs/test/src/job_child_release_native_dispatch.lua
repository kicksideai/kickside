local fixture = require("fixture")
local adapter: any = {proc_binding_for = function(...): any return fixture.proc_binding end, execute_job = fixture.execute, run_supervised_proc = fixture.supervised}
return adapter
