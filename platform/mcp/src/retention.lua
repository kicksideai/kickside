-- MCP owns its persistence cleanup. The existing core retention tick invokes
-- this callback once per sweep; no MCP scheduler or second cleanup lane exists.
local oauth_repo = require("mcp_oauth_repo")
local mcp_repo = require("mcp_repo")

local M = {}

function M.run(): any
    local codes, code_err = oauth_repo.prune_expired_codes(500)
    if code_err then return { success = false, error = code_err } end
    if type(codes) ~= "number" then return { success = false, error = errors.new({
        message = "OAuth code prune returned no count", kind = errors.INTERNAL, retryable = true }) } end
    local clients, client_err = oauth_repo.prune_idle_clients(500)
    if client_err then return { success = false, error = client_err } end
    if type(clients) ~= "number" then return { success = false, error = errors.new({
        message = "OAuth client prune returned no count", kind = errors.INTERNAL, retryable = true }) } end
    local credentials, credential_err = mcp_repo.prune_retired(500)
    if credential_err then return { success = false, error = credential_err } end
    if type(credentials) ~= "number" then return { success = false, error = errors.new({
        message = "credential prune returned no count", kind = errors.INTERNAL, retryable = true }) } end
    return { success = true, deleted = codes + clients + credentials }
end

return M
