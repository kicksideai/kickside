local M = {}
function M.fingerprint(_policy)
    return nil, errors.new({kind = errors.RATE_LIMITED, retryable = false, message = "policy fingerprint dependency",
        details = {code = "fingerprint_dependency", nested = {marker = "kept"}}})
end
return M
