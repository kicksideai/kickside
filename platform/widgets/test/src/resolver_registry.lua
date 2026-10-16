local M = {}
M.failure = errors.new({kind = errors.UNAVAILABLE, message = "view declarations unavailable", retryable = true})
function M.find(_query): (any?, error?)
    if M.entries then return M.entries, nil end
    return nil, M.failure
end
function M.get(_id): (any?, error?) return nil, M.failure end
return M
