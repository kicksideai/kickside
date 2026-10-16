local M = {}
function M.handle(body: string, auth: string, session_id: any): any
    return { body = body, auth = auth, session_id = session_id }, 200
end
function M.resource_metadata_url(): string return "https://fixture.invalid/oauth" end
function M.mcp_url(): string return "https://fixture.invalid/api/public/mcp" end
function M.origin_allowed(origin: any): boolean
    return origin == nil or origin == "https://fixture.invalid"
end
return M
