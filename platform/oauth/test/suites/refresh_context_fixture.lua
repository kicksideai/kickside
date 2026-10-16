local M = {}
function M.get(key: string): (any, any)
    if key == "oauth_token_endpoint" then return "https://oauth.invalid/test-token", nil end
    return nil, "unexpected fixture context key"
end
return M
