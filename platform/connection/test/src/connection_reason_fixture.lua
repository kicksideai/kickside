local http = require("http")
local M: any = { CONTENT = http.CONTENT, STATUS = http.STATUS }
function M.request(): any return { query = function() return nil end } end
function M.response(): any return {
    set_content_type = function() end, set_status = function() end,
    write_json = function(_, value) M.result = value end,
} end
function M.actor(): any return {} end
function M.scope(): any return {} end
function M.find(query: any): any
    local entries = {}
    for _, entry in ipairs(M.bindings or {}) do
        if entry.meta.provider == query["meta.provider"] then entries[#entries + 1] = entry end
    end
    return entries
end
function M.get(): (any, any)
    local def: any = {}
    def.with_actor = function(self) return self end
    def.with_scope = function(self) return self end
    def.open = function() return { list = function() return {
        connections = M.connections or { { component_id = "reason-test", meta = {
            title = "Google Mail", provider = "google", connection_state = "needs_reauth",
            reauth_reason = "Failed to refresh access token: HTTP 400 (invalid_grant)",
            oauth_connection = true }, private_context = { refresh_token = "private-test-token" } } },
        total_count = 1, has_more = false,
    }, nil end }, nil end
    return def, nil
end
return M
