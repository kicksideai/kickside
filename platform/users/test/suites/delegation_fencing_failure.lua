local M = {}
function M.fence_groups()
    return nil, errors.new({kind = errors.RATE_LIMITED, retryable = false,
        message = "delegation transaction unavailable", details = {code = "fencing_dependency", nested = {marker = "kept"}}})
end
return M
