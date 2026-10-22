-- The base installation performs no optional post-processing work.
local M = {}
function M.prepare(_output: any): (any?, any?) return nil, nil end
function M.completed(_tx: any, _dbtype: string, _job: any, _output: any, _trace: any, _prepared: any): (boolean?, any?) return true, nil end
function M.prune(_cutoff: string, _limit: integer): (integer?, any?) return 0, nil end
return M
