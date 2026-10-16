local M = {}
M.failure = errors.new({kind = errors.UNAVAILABLE, message = "navigation settings unavailable", retryable = true})
function M.get(_id): (any?, error?) return nil, M.failure end
function M.discover(_type): (any?, error?) return nil, M.failure end
function M.find(_query): (any?, error?) return nil, M.failure end
return M
