local M: { [string]: any } = {}
function M.delete(): (any?, any?) return nil, M.failure end
function M.apply(): (any?, any?) return nil, M.failure end
return M
