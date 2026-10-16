local ctx = require("ctx")
local http_client = require("http_client")
local json = require("json")
local form = require("form")
local logger = require("logger"):named("kickside.oauth.refresh")
local creds = require("creds")
local provider_errors = require("provider_errors")

-- Constants
local VALIDATION_ERRORS = {
    INVALID_REQUEST = "Invalid request: must be a table",
    MISSING_REFRESH_TOKEN = "refresh_token is required",
    INVALID_REFRESH_TOKEN = "refresh_token must be a string no longer than 8192 bytes",
    MISSING_TOKEN_ENDPOINT = "oauth_token_endpoint context is required",
    MISSING_CLIENT_ID = "oauth_client_id_env context is required",
    TOKEN_REFRESH_FAILED = "Failed to refresh access token"
}

local function handle(request_dto)
    -- Input validation
    if not request_dto or type(request_dto) ~= "table" then
        return {
            success = false,
            error = VALIDATION_ERRORS.INVALID_REQUEST,
            response_received = false
        }
    end

    -- Validate required fields
    if request_dto.refresh_token == nil or request_dto.refresh_token == "" then
        return {
            success = false,
            error = VALIDATION_ERRORS.MISSING_REFRESH_TOKEN,
            response_received = false
        }
    end
    if type(request_dto.refresh_token) ~= "string" or #request_dto.refresh_token > provider_errors.MAX_TOKEN_LENGTH then
        return {
            success = false,
            error = VALIDATION_ERRORS.INVALID_REFRESH_TOKEN,
            response_received = false
        }
    end

    -- Get required OAuth configuration from context
    local token_endpoint, err = ctx.get("oauth_token_endpoint")
    if err then
        return {
            success = false,
            error = "Failed to get token endpoint: " .. err,
            response_received = false
        }
    end
    if not token_endpoint or token_endpoint == "" then
        return {
            success = false,
            error = VALIDATION_ERRORS.MISSING_TOKEN_ENDPOINT,
            response_received = false
        }
    end

    -- Resolve client ID — settings (preferred) or environment.
    local client_id = creds.resolve("id")
    if not client_id or client_id == "" then
        return {
            success = false,
            error = VALIDATION_ERRORS.MISSING_CLIENT_ID,
            response_received = false
        }
    end

    -- Resolve client secret (optional — settings preferred, env fallback).
    local client_secret = creds.resolve("secret")

    logger:debug("OAuth token refresh started", {
        token_endpoint = token_endpoint,
        has_client_secret = client_secret ~= nil
    })

    -- Prepare token refresh request
    local token_request_body = {
        grant_type = "refresh_token",
        refresh_token = request_dto.refresh_token,
        client_id = client_id
    }

    -- Include client secret if available
    if client_secret and client_secret ~= "" then
        token_request_body.client_secret = client_secret
    end

    -- Percent-encoded form body (reserved chars in a secret/refresh token would
    -- otherwise corrupt the request).
    local request_body = form.encode(token_request_body)

    -- Make token refresh request
    local token_response, err = http_client.post(token_endpoint :: string, {
        headers = {
            ["Content-Type"] = "application/x-www-form-urlencoded",
            ["Accept"] = "application/json"
        },
        body = request_body
    })

    if err then
        logger:debug("Token refresh HTTP request failed", { error = err })
        return {
            success = false,
            error = VALIDATION_ERRORS.TOKEN_REFRESH_FAILED .. ": request failed",
            response_received = false  -- Network error - no response received
        }
    end

    -- We received an HTTP response (even if it's an error status)
    local response_received = true

    if token_response.status_code >= 400 then
        local provider_code = provider_errors.from_body(token_response.body)
        logger:debug("Token refresh failed", {
            status_code = token_response.status_code,
            provider_error = provider_code,
            response_body_len = provider_errors.response_body_len(token_response)
        })
        return {
            success = false,
            error = provider_errors.http_failure(VALIDATION_ERRORS.TOKEN_REFRESH_FAILED, token_response.status_code, provider_code),
            response_received = response_received,
            requires_reauth = provider_errors.requires_reauth(token_response.status_code, provider_code)
        }
    end

    -- Parse token response
    local token_data, err = json.decode(token_response.body or "")
    if err then
        logger:debug("Failed to parse token refresh response", {
            error = err,
            response_body_len = provider_errors.response_body_len(token_response)
        })
        return {
            success = false,
            error = "Failed to parse token response",
            response_received = response_received
        }
    end

    if not token_data.access_token then
        if token_data.error then
            local provider_code = provider_errors.safe_code(token_data.error)
            logger:debug("OAuth provider returned error in refresh response", {
                error = provider_code,
                has_error_description = type(token_data.error_description) == "string" and token_data.error_description ~= ""
            })
            return {
                success = false,
                error = "OAuth provider error" .. (provider_code and (": " .. provider_code) or ""),
                response_received = response_received,
                requires_reauth = provider_errors.requires_reauth(token_response.status_code, provider_code)
            }
        end
        return {
            success = false,
            error = "No access token in refresh response",
            response_received = response_received
        }
    end

    logger:debug("Token refresh successful", {
        token_type = token_data.token_type,
        expires_in = token_data.expires_in,
        has_new_refresh_token = token_data.refresh_token ~= nil,
        scope = token_data.scope
    })

    -- Return simple token response (let caller handle timestamps, storage, etc.)
    return {
        success = true,
        access_token = token_data.access_token,
        refresh_token = token_data.refresh_token, -- May be nil if provider doesn't rotate
        token_type = token_data.token_type or "Bearer",
        expires_in = token_data.expires_in,
        scope = token_data.scope,
        response_received = response_received
    }
end

return { handle = handle }
