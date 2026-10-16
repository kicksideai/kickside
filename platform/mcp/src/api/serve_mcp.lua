-- The single public MCP endpoint: POST /mcp (streamable-HTTP request/response).
-- It is mounted on an unauthenticated router on purpose -- the dispatcher enforces
-- the bearer token itself. This handler is pure transport: read body + auth header,
-- hand to the stateless dispatcher, write the JSON-RPC envelope back. No session,
-- no per-connection state.

local http = require("http")
local uuid = require("uuid")
local dispatcher = require("mcp_dispatcher")
local public_url = require("public_url")

local function handler()
    local req = http.request()
    local res = http.response()
    if not req or not res then return nil, "no http context" end

    res:set_content_type(http.CONTENT.JSON)

    if not public_url.origin_allowed(req:header("Origin")) then
        res:set_status(403)
        res:write_json({ jsonrpc = "2.0", error = { code = -32001, message = "Origin is not allowed" } })
        return
    end

    local method, method_err = req:method()
    if method_err then return nil, method_err end
    if method ~= "POST" then
        res:set_status(405)
        res:set_header("Allow", "POST")
        res:write_json({ jsonrpc = "2.0", error = { code = -32600, message = "Method is not supported" } })
        return
    end

    local body, body_err = req:body()
    if body_err then return nil, body_err end
    body = body or ""
    local auth = req:header("Authorization")

    local session_id = req:header("Mcp-Session-Id")
    if type(session_id) ~= "string" or #session_id == 0 or #session_id > 128 or session_id:find("[^\33-\126]") then
        session_id = uuid.v7()
    end
    res:set_header("Mcp-Session-Id", session_id)
    local response, status = dispatcher.handle(body, auth, session_id)
    -- Spec-compliant discovery for OAuth-capable clients: a 401 names the
    -- protected-resource metadata so the client can find the authorization
    -- server without probing.
    if status == 401 then
        res:set_header("WWW-Authenticate",
            'Bearer resource_metadata="' .. public_url.resource_metadata_url() .. '"')
    end
    res:set_status(status or 200)
    if response ~= nil then
        res:write_json(response)
    else
        res:write("")
    end
end

return { handler = handler }
