local M = {calls = 0}
function M.get(_id): (any?, error?)
    M.calls = M.calls + 1
    return nil, errors.new({kind = errors.NOT_FOUND, message = "login template unavailable"})
end
return M
