-- Provider-declared profile validation for Google Vertex. Declared on the Vertex
-- provider editor entry (validate_func); the generic store validate path invokes
-- it via funcs.call with { provider_id, config, secret_config }.
local function handler(args: any): any
    args = type(args) == "table" and args or {}
    local config = type(args.config) == "table" and args.config or {}
    local secret_config = type(args.secret_config) == "table" and args.secret_config or {}

    local has_service_account = (type(secret_config.google_credentials) == "string" and secret_config.google_credentials ~= "")
        or (type(config.google_credentials_env) == "string" and config.google_credentials_env ~= "")
    local has_direct_token = (type(secret_config.access_token) == "string" and secret_config.access_token ~= "")
        or (type(config.access_token_env) == "string" and config.access_token_env ~= "")

    if has_service_account and has_direct_token then
        return {
            valid = false,
            error = "Google Vertex profiles must use either service account credentials or a direct access token, not both",
        }
    end

    return { valid = true }
end

return { handler = handler }
