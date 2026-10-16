-- Deterministic transport adapter for the production generic OAuth connector.
local M = {}
M.response = { status_code = 503, body = '{"error":"temporarily_unavailable"}' }
M.request = nil
function M.post(endpoint: string, request: any): (any, any)
    if endpoint ~= "https://oauth.invalid/test-token" then error("unexpected fixture endpoint") end
    M.request = request
    return M.response, nil
end
return M
