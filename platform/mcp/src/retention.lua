-- MCP owns its persistence cleanup. The existing core retention tick invokes
-- this callback once per sweep; no MCP scheduler or second cleanup lane exists.
local oauth_repo = require("mcp_oauth_repo")
local mcp_repo = require("mcp_repo")

local M = {}

function M.run(): any
    local codes, code_err, code_progress = oauth_repo.prune_expired_codes(500)
    if code_err then return { success = false, error = code_err } end
    if type(codes) ~= "number" then return { success = false, error = errors.new({
        message = "OAuth code prune returned no count", kind = errors.INTERNAL, retryable = true }) } end
    local clients, client_err, client_progress = oauth_repo.prune_idle_clients(500)
    if client_err then return { success = false, error = client_err } end
    if type(clients) ~= "number" then return { success = false, error = errors.new({
        message = "OAuth client prune returned no count", kind = errors.INTERNAL, retryable = true }) } end
    local credentials, credential_err, credential_progress = mcp_repo.prune_retired(500)
    if credential_err then return { success = false, error = credential_err } end
    if type(credentials) ~= "number" then return { success = false, error = errors.new({
        message = "credential prune returned no count", kind = errors.INTERNAL, retryable = true }) } end
    local deadline: number? = nil
    local needs_continue = false
    for _, progress in ipairs({ code_progress, client_progress, credential_progress }) do
        needs_continue = needs_continue or progress.needs_continue
        if progress.deadline_ms ~= nil then
            deadline = deadline == nil and progress.deadline_ms or math.min(deadline, progress.deadline_ms)
        end
    end
    return { success = true, deleted = codes + clients + credentials,
        needs_continue = needs_continue, deadline_ms = deadline }
end

return M
