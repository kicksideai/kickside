local M = {values = {}}
M.failure = errors.new({kind = errors.UNAVAILABLE, message = "login theme config unavailable"})
function M.get(id): (any?, any?)
    if M.failure then return nil, M.failure end
    return {data = {default = M.values[id]}}, nil
end
return M
