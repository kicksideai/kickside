-- Test-only projection worker that fails with the error kind and message its
-- declaration's worker_config names.
local M = {}

function M.run(input: any): (any?, error?)
    local projection = type(input) == "table" and input.projection or nil
    local body = type(projection) == "table" and projection.body or nil
    local config = type(body) == "table" and body.worker_config or nil
    if type(config) ~= "table" then
        return nil, errors.new({ message = "failing worker requires worker_config", kind = errors.INVALID })
    end
    return nil, errors.new({ message = tostring(config.message), kind = tostring(config.kind),
        retryable = config.retryable, details = config.details })
end

return M
