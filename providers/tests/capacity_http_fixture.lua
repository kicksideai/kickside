local M = {calls = 0}
function M.request(): (any?, error?)
    M.calls = M.calls + 1
    return {status_code = 429, headers = {["Retry-After"] = "2"},
        body = '{"ok":false,"description":"paced","message":"paced","retry_after":2,"parameters":{"retry_after":2}}'}, nil
end
return M
