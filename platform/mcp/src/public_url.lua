-- The one answer to "what URL does an external agent connect to?".
--
-- The configured public domain wins, because the admin UI may be served from a
-- different host than the public API. Without it the request the caller is
-- already making names the host, honoring the proxy's forwarded scheme. Callers
-- never derive this from the browser: the SPA runs in a sandboxed iframe whose
-- window.location.origin is the literal string "null".

local http = require("http")
local env = require("env")

local M = {}

M._http = nil
M._env = nil

local function http_mod(): any
    return M._http or http
end

local function env_mod(): any
    return M._env or env
end

local function configured_url(): any
    local value, err = env_mod().get("PUBLIC_API_URL")
    if err and not errors.is(err, errors.NOT_FOUND) then error(err) end
    return value
end

-- The scheme+host the public API answers on, without a trailing slash. Empty
-- when neither the configuration nor a live request can name it.
function M.base_url(): string
    local configured = configured_url()
    if type(configured) == "string" and configured ~= "" then
        return (configured:gsub("/+$", ""))
    end
    local req = http_mod().request()
    local host = req and req:host() or nil
    if type(host) == "string" and host ~= "" then
        local proto = req and req:header("X-Forwarded-Proto") or nil
        proto = (type(proto) == "string" and proto ~= "") and proto or "http"
        return tostring(proto) .. "://" .. tostring(host)
    end
    return ""
end

-- The public streamable-HTTP MCP endpoint an agent registers.
function M.mcp_url(): string
    return M.base_url() .. "/api/public/mcp"
end

function M.resource_metadata_url(): string
    return M.base_url() .. "/.well-known/oauth-protected-resource/api/public/mcp"
end

local function http_origin(value: any): string?
    if type(value) ~= "string" or value:find("[%s\\@]") then return nil end
    local scheme, authority = value:match("^([%a]+)://([^/?#]+)")
    if not scheme or not authority then return nil end
    scheme, authority = scheme:lower(), authority:lower()
    if scheme ~= "http" and scheme ~= "https" then return nil end
    if scheme == "https" then authority = authority:gsub(":443$", "") end
    if scheme == "http" then authority = authority:gsub(":80$", "") end
    return scheme .. "://" .. authority
end

function M.same_resource(first: any, second: any): boolean
    if type(first) ~= "string" or first == "" or type(second) ~= "string" or second == "" then return false end
    local function canonical(value: string): string?
        if value:find("[%s\\#]") then return nil end
        local origin = http_origin(value)
        if not origin then return value end
        return origin .. (value:match("^%a+://[^/?#]+(.*)$") or "")
    end
    local normalized = canonical(first)
    return normalized ~= nil and normalized == canonical(second)
end

function M.origin_allowed(origin: any): boolean
    if origin == nil then return true end
    local supplied = http_origin(origin)
    if not supplied or origin:find("[/?#]", (origin:find("://", 1, true) or 0) + 3) then return false end
    local configured = configured_url()
    if type(configured) == "string" and configured ~= "" then
        return supplied == http_origin(configured)
    end
    -- Without configured authority, a browser may only address the loopback
    -- host. A request-controlled DNS name cannot authorize its own Origin.
    local req = http_mod().request()
    local host = req and req:host() or nil
    if type(host) ~= "string" then return false end
    local hostname = host:gsub(":%d+$", "")
    if hostname ~= "localhost" and hostname ~= "127.0.0.1" and hostname ~= "[::1]" then return false end
    return supplied == http_origin(M.base_url())
end

return M
