local env = require("env")
local logger = require("logger"):named("app.security.encryption_key")

local function env_string(name: string): string
    local value, _ = env.get(name)
    return type(value) == "string" and value or ""
end

local function is_production(): boolean
    return string.lower(env_string("KICKSIDE_ENV")) == "production"
        or string.lower(env_string("APP_ENV")) == "production"
        or string.lower(env_string("NODE_ENV")) == "production"
end

local function validate_production_bootstrap(): table?
    if not is_production() then return nil end

    if env_string("KICKSIDE_USERS_DEFAULT_ADMIN_EMAIL") == ""
        or env_string("KICKSIDE_USERS_DEFAULT_ADMIN_PASSWORD") == "" then
        logger:error("production bootstrap credentials are missing")
        return {
            status = "error",
            message = "production requires explicit bootstrap admin credentials",
        }
    end

    return nil
end

local function run(options: any?): table
    local key, err = env.get("ENCRYPTION_KEY")
    if err or type(key) ~= "string" or key == "" then
        logger:error("ENCRYPTION_KEY is missing")
        return {
            status = "error",
            message = "ENCRYPTION_KEY is required for token signing",
        }
    end

    if #key ~= 64 or string.match(key, "^[0-9a-fA-F]+$") == nil then
        logger:error("ENCRYPTION_KEY has invalid format")
        return {
            status = "error",
            message = "ENCRYPTION_KEY must be a 64-character hex string",
        }
    end

    local prod_error = validate_production_bootstrap()
    if prod_error then return prod_error end

    return {
        status = "success",
        message = "ENCRYPTION_KEY is present and valid",
    }
end

return { run = run }
