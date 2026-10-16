-- The MCP OAuth authorization-server flow, kept free of HTTP so the harness
-- drives it directly: discovery metadata, dynamic client registration
-- (RFC 7591), consent -> authorization code, and PKCE-verified code exchange
-- that mints a normal MCP credential as the access token.

local json = require("json")
local hash = require("hash")
local base64 = require("base64")
local crypto = require("crypto")
local time = require("time")
local security = require("security")
local credential_eligibility = require("credential_eligibility")
local oauth_repo = require("mcp_oauth_repo")
local mcp_repo = require("mcp_repo")
local public_url = require("public_url")

local M = {}

local CODE_TTL = 300
local CODE_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

local function strip_slash(base: string): string
    return (base:gsub("/+$", ""))
end

function M.pkce_challenge(verifier: string): string
    local digest, digest_err = hash.sha256(verifier, true)
    if digest_err or not digest then error(digest_err or "PKCE digest unavailable") end
    local b64, encode_err = base64.encode(digest)
    if encode_err or not b64 then error(encode_err or "PKCE encoding unavailable") end
    return (b64:gsub("+", "-"):gsub("/", "_"):gsub("=", ""))
end

-- Discovery uses the configured public origin or the live request authority.
function M.protected_resource_metadata(base: string): any
    local b = strip_slash(base)
    return {
        resource = b .. "/api/public/mcp",
        authorization_servers = { b .. "/api/public/mcp/oauth" },
        bearer_methods_supported = { "header" },
    }
end

function M.authorization_server_metadata(base: string): any
    local b = strip_slash(base)
    local issuer = b .. "/api/public/mcp/oauth"
    return {
        issuer = issuer,
        authorization_endpoint = issuer .. "/authorize",
        token_endpoint = issuer .. "/token",
        registration_endpoint = issuer .. "/register",
        response_types_supported = { "code" },
        grant_types_supported = { "authorization_code" },
        code_challenge_methods_supported = { "S256" },
        token_endpoint_auth_methods_supported = { "none" },
        scopes_supported = { "mcp" },
    }
end

function M.decode_registration(raw: string): (any?, any?)
    return oauth_repo.decode_registration(raw)
end

function M.register(body: any): (any?, any?)
    return oauth_repo.register_client(body)
end

local function client_allows_redirect(client: any, redirect_uri: string): boolean
    for _, u in ipairs(client.redirect_uris or {}) do
        if u == redirect_uri then return true end
    end
    return false
end

-- validate_authorize_request checks the browser-supplied query before consent
-- is shown, so the page never renders for a bogus client or redirect.
function M.validate_authorize_request(params: any): (any?, string?)
    params = type(params) == "table" and params or {}
    if params.resource ~= nil and not public_url.same_resource(params.resource, public_url.mcp_url()) then
        return nil, "resource must identify this MCP server"
    end
    if params.response_type ~= "code" then return nil, "response_type must be code" end
    if type(params.code_challenge) ~= "string" or params.code_challenge == "" then
        return nil, "code_challenge is required"
    end
    if #params.code_challenge ~= 43 or not params.code_challenge:match("^[%w_%-]+$") then
        return nil, "code_challenge must be 43 unpadded base64url characters"
    end
    if params.code_challenge_method ~= "S256" then return nil, "code_challenge_method must be S256" end
    local client, cerr = oauth_repo.get_client(tostring(params.client_id or ""))
    if not client then return nil, cerr end
    local redirect = tostring(params.redirect_uri or "")
    if not oauth_repo.safe_redirect(redirect) then return nil, "redirect_uri is unsafe" end
    if not client_allows_redirect(client, redirect) then
        return nil, "redirect_uri is not registered for this client"
    end
    return client, nil
end

-- grant runs at consent time under the approving actor's ambient security
-- context: re-validate the request, mint the MCP credential NOW (so the
-- whitelist is validated against the actor's real access, groups included),
-- and seal the grant behind a fresh single-use code. The repo erases it
-- on consume; the database holds no recoverable raw access token.
function M.grant(actor_id: string, params: any, mint_args: any): (any?, any?)
    if type(actor_id) ~= "string" or actor_id == "" then return nil, "actor is required" end
    local actor = security.actor()
    if not actor or actor:id() ~= actor_id then
        return nil, errors.new({kind = errors.PERMISSION_DENIED, retryable = false,
            message = "OAuth grant requires its authenticated owner"})
    end
    local client, verr = M.validate_authorize_request(params)
    if not client then return nil, verr end

    mint_args = type(mint_args) == "table" and mint_args or {}
    local label = tostring(mint_args.label or "")
    if label == "" then
        label = (client.client_name ~= "" and client.client_name or "OAuth client") .. " (oauth)"
    end
    local minted, merr = mcp_repo.mint({
        whitelist_component_ids = mint_args.whitelist_component_ids,
        label = label,
        policy = mint_args.policy,
        context = mint_args.context,
        expires_at = mint_args.expires_at,
        oauth_resource = public_url.mcp_url(),
    })
    if not minted then return nil, merr end

    local code, cerr = crypto.random.string(48, CODE_CHARSET)
    if cerr or not code or code == "" then return nil, "failed to generate code" end

    local perr = oauth_repo.put_code(code :: string, {
        client_id = client.client_id,
        actor_id = actor_id,
        redirect_uri = params.redirect_uri,
        code_challenge = params.code_challenge,
        grant = {
            access_token = minted.token,
            credential_id = minted.credential_id,
            expires_at = minted.expires_at,
        },
        resource = public_url.mcp_url(),
        ttl = CODE_TTL,
    })
    if perr then return nil, perr end

    local location = tostring(params.redirect_uri) .. (tostring(params.redirect_uri):find("?", 1, true) and "&" or "?")
        .. "code=" .. code
    if type(params.state) == "string" and params.state ~= "" then
        local state = (params.state :: string):gsub("[^%w%-._~]", function(ch)
            return string.format("%%%02X", ch:byte())
        end)
        location = location .. "&state=" .. state
    end
    return { code = code, redirect_to = location, client_name = client.client_name }, nil
end

-- exchange verifies client, redirect, and PKCE against the stored code and
-- releases the credential minted at consent. Runs on the public router with no
-- actor context; everything it needs lives in the consumed code row.
function M.exchange(params: any): (any?, any?)
    params = type(params) == "table" and params or {}
    if params.grant_type ~= "authorization_code" then return nil, "unsupported grant_type" end
    local stored, serr = oauth_repo.consume_code(tostring(params.code or ""))
    if not stored then return nil, serr end
    if tostring(params.client_id or "") ~= tostring(stored.client_id) then
        return nil, "client_id does not match the authorization code"
    end
    if tostring(params.redirect_uri or "") ~= tostring(stored.redirect_uri) then
        return nil, "redirect_uri does not match the authorization code"
    end
    local resource = stored.resource ~= "" and stored.resource or public_url.mcp_url()
    if params.resource ~= nil and not public_url.same_resource(params.resource, resource) then
        return nil, "resource does not match the authorization code"
    end
    local verifier = params.code_verifier
    if type(verifier) ~= "string" or #verifier < 43 or #verifier > 128
        or not verifier:match("^[%w%-%._~]+$")
        or not crypto.constant_time_compare(M.pkce_challenge(verifier), tostring(stored.code_challenge)) then
        return nil, "PKCE verification failed"
    end

    local eligible, eligibility_err = credential_eligibility.check(tostring(stored.actor_id or ""))
    if not eligible then return nil, eligibility_err end

    local grant = type(stored.grant) == "table" and stored.grant or {}
    local token = tostring(grant.access_token or "")
    if token == "" then return nil, "authorization grant is no longer available" end

    local out: any = {
        access_token = token,
        token_type = "bearer",
        scope = "mcp",
        credential_id = grant.credential_id,
    }
    local exp = tonumber(grant.expires_at)
    if exp then
        local now = time.now():unix() :: number
        out.expires_in = math.max(0, math.floor(exp - now))
    end
    return out, nil
end

function M.encode_json(v: any): string
    return json.encode(v)
end

return M
