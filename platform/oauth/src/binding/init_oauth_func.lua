local ctx = require("ctx")
local time = require("time")
local hash = require("hash")
local crypto = require("crypto")
local base64 = require("base64")
local logger = require("logger"):named("kickside.oauth.init")
local creds = require("creds")

-- Percent-encode everything outside the RFC 3986 unreserved set
-- (A-Z a-z 0-9 - . _ ~).
local function url_encode(str)
    if not str then return nil end
    return (string.gsub(str, "[^%w%-%._~]", function(char)
        return string.format("%%%02X", string.byte(char))
    end))
end

-- URL-safe base64: + -> -, / -> _, padding stripped.
local function base64_url_encode(str)
    if not str then return nil end
    local encoded = base64.encode(str)
    if not encoded then return nil end
    return encoded:gsub("+", "-"):gsub("/", "_"):gsub("=", "")
end

-- Optional context value with a default when the key is missing or unset.
local function ctx_or(key: string, default: any): any
    local value, err = ctx.get(key)
    if err then return default end
    return value or default
end

local function handle(request_dto)
    if not request_dto or type(request_dto) ~= "table" then
        return { success = false, error = "Invalid request: must be a table" }
    end
    if not request_dto.redirect_uri or request_dto.redirect_uri == "" then
        return { success = false, error = "redirect_uri is required" }
    end

    local authorization_endpoint, err = ctx.get("oauth_authorization_endpoint")
    if err then
        return { success = false, error = "Failed to get authorization endpoint: " .. err }
    end
    if not authorization_endpoint or authorization_endpoint == "" then
        return { success = false, error = "oauth_authorization_endpoint context is required" }
    end

    -- Resolve client ID — settings (preferred) or environment.
    local client_id = creds.resolve("id")
    if not client_id or client_id == "" then
        return { success = false, error = "oauth_client_id_env context is required" }
    end

    local use_pkce = ctx_or("oauth_use_pkce", false)
    local pkce_method = ctx_or("oauth_pkce_method", "S256")
    local response_type = ctx_or("oauth_response_type", "code")

    logger:debug("OAuth initialization started", {
        authorization_endpoint = authorization_endpoint,
        redirect_uri = request_dto.redirect_uri,
        scopes_count = #(request_dto.scopes or {}),
        use_pkce = use_pkce,
        pkce_method = pkce_method,
        response_type = response_type
    })

    local state_token, err = crypto.random.string(32)
    if err then
        return { success = false, error = "Failed to generate state token: " .. err }
    end

    -- The caller persists this payload against the state token and replays it
    -- on the authorization callback.
    local storage_payload = {
        redirect_uri = request_dto.redirect_uri,
        scopes = request_dto.scopes or {},
        created_at = time.now():utc():format_rfc3339()
    }

    local code_challenge = nil
    if use_pkce then
        local code_verifier, err = crypto.random.string(64,
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~")
        if err then
            return { success = false, error = "Failed to generate code verifier: " .. err }
        end

        -- The callback needs the verifier to complete the token exchange.
        storage_payload.code_verifier = code_verifier

        if pkce_method == "S256" then
            local challenge_raw, err = hash.sha256(code_verifier, true)
            if err then
                return { success = false, error = "Failed to generate code challenge: " .. err }
            end
            code_challenge = base64_url_encode(challenge_raw)
        else
            code_challenge = code_verifier
        end

        logger:debug("PKCE challenge generated", { method = pkce_method })
    end

    local url_params = {
        "client_id=" .. url_encode(client_id),
        "redirect_uri=" .. url_encode(request_dto.redirect_uri),
        "state=" .. url_encode(state_token)
    }

    -- Some providers (GitHub) reject an explicit response_type, so an empty
    -- value omits the parameter.
    if response_type and response_type ~= "" then
        table.insert(url_params, 1, "response_type=" .. url_encode(response_type))
    end

    if request_dto.scopes and #request_dto.scopes > 0 then
        table.insert(url_params, "scope=" .. url_encode(table.concat(request_dto.scopes, " ")))
    end

    local extra_auth_params, extra_err = ctx.get("oauth_extra_auth_params")
    if extra_err and not errors.is(extra_err, errors.NOT_FOUND) then
        return { success = false, error = "Failed to read oauth_extra_auth_params: " .. tostring(extra_err) }
    end
    if extra_auth_params ~= nil then
        if type(extra_auth_params) ~= "table" then
            return { success = false, error = "oauth_extra_auth_params must be a table" }
        end
        local reserved = { client_id = true, redirect_uri = true, state = true, scope = true,
            response_type = true, code_challenge = true, code_challenge_method = true }
        for key, value in pairs(extra_auth_params) do
            if type(key) ~= "string" or key == "" or reserved[key] then
                return { success = false, error = "oauth_extra_auth_params contains an invalid or reserved parameter" }
            end
            if type(value) ~= "string" and type(value) ~= "number" and type(value) ~= "boolean" then
                return { success = false, error = "oauth_extra_auth_params values must be strings, numbers or booleans" }
            end
            table.insert(url_params, url_encode(key) .. "=" .. url_encode(tostring(value)))
        end
    end

    if use_pkce and code_challenge then
        table.insert(url_params, "code_challenge=" .. url_encode(code_challenge))
        table.insert(url_params, "code_challenge_method=" .. url_encode(pkce_method))
    end

    local authorization_url = authorization_endpoint .. "?" .. table.concat(url_params, "&")

    logger:debug("OAuth initialization completed", {
        state_token = state_token,
        expires_in = 600
    })

    return {
        success = true,
        authorization_url = authorization_url,
        state_token = state_token,
        storage_payload = storage_payload,
        expires_in = 600
    }
end

return { handle = handle }
