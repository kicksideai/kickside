-- Domain policy for model provider profiles and cards: input cleaning,
-- config/secret separation, sensitive-field scrubbing, provider validation and
-- normalization hooks, and the public/read projections. Pure over its inputs --
-- no SQL, no cache. The persistence layer composes these before it writes.

local json = require("json")
local registry = require("registry")
local models_types = require("models_types")
local models_secrets = require("models_secrets")

local M = {}

local function decode_json(raw: any, fallback: any): (any?, any?)
    if raw == nil or raw == "" then return fallback end
    local decoded, err = json.decode(tostring(raw))
    if err then return nil, err end
    if type(decoded) ~= "table" then return nil, "stored model configuration must be a table" end
    return decoded
end

local function encode_json(value: any): string
    return json.encode(value or {})
end

local function bool_int(value: any): integer
    if value == false or value == 0 or value == "0" then return 0 end
    return 1
end

local function table_has(list: any, value: string): boolean
    if type(list) ~= "table" then return false end
    for _, item in ipairs(list) do
        if item == value then return true end
    end
    return false
end

local function normalize_list(value: any, fallback: { string }): { string }
    if type(value) == "string" and value ~= "" then return { value } end
    if type(value) ~= "table" then return fallback end
    local out: { string } = {}
    for _, item in ipairs(value) do
        if type(item) == "string" and item ~= "" and not table_has(out, item) then
            table.insert(out, item)
        end
    end
    if #out == 0 then return fallback end
    return out
end

-- Like normalize_list, but an explicitly provided table (even empty) is honored
-- rather than falling back -- so a caller can clear a list (e.g. remove the last
-- class) instead of having the previous value merged back in.
local function explicit_list(value: any, fallback: { string }): { string }
    if type(value) == "string" and value ~= "" then return { value } end
    if type(value) ~= "table" then return fallback end
    local out: { string } = {}
    for _, item in ipairs(value) do
        if type(item) == "string" and item ~= "" and not table_has(out, item) then
            table.insert(out, item)
        end
    end
    return out
end

local function sensitive_key(key: any): boolean
    local k = tostring(key or ""):lower()
    return k == "headers"
        or k:find("secret", 1, true) ~= nil
        or k:find("token", 1, true) ~= nil
        or k:find("api_key", 1, true) ~= nil
        or k:find("api-key", 1, true) ~= nil
        or k:find("apikey", 1, true) ~= nil
        or k:find("authorization", 1, true) ~= nil
        or k:find("password", 1, true) ~= nil
        or k:find("credential", 1, true) ~= nil
end

local function env_ref_key(key: any): boolean
    return tostring(key or ""):lower():match("_env$") ~= nil
end

local function sensitive_config_key(key: any): boolean
    return sensitive_key(key) and not env_ref_key(key)
end

local function scrub_sensitive(value: any): any
    if type(value) ~= "table" then return value end
    local out = {}
    for k, v in pairs(value) do
        if not sensitive_key(k) then
            out[k] = scrub_sensitive(v)
        end
    end
    return out
end

local function has_fields(value: any): boolean
    if type(value) ~= "table" then return false end
    for _, _ in pairs(value) do
        return true
    end
    return false
end

local function public_config(config: any): any
    if type(config) ~= "table" then return {} end
    local out = {}
    for k, v in pairs(config) do
        if tostring(k) ~= "headers" and not sensitive_config_key(k) then
            out[k] = v
        end
    end
    return out
end

local function public_profile(profile: any): any
    local config = public_config(profile.config)
    local secret_fields = {}
    if type(profile.secret_config) == "table" then
        for k, v in pairs(profile.secret_config) do
            local present = v ~= nil
                and not (type(v) == "string" and v == "")
                and not (type(v) == "table" and not has_fields(v))
            if present then
                table.insert(secret_fields, tostring(k))
            end
        end
        table.sort(secret_fields)
    end
    return {
        id = profile.id,
        name = profile.name,
        provider_id = profile.provider_id,
        config = config,
        enabled = profile.enabled ~= false,
        error = profile.error,
        status = profile.status or "unknown",
        message = profile.message or "",
        last_discovered_at = profile.last_discovered_at,
        created_at = profile.created_at,
        updated_at = profile.updated_at,
        has_api_key = type(profile.secret_config) == "table" and type(profile.secret_config.api_key) == "string" and profile.secret_config.api_key ~= "",
        has_api_key_env = type(config.api_key_env) == "string" and config.api_key_env ~= "",
        secret_fields = secret_fields,
    }
end

local function decrypt_secret(raw: any): (any?, any?)
    if raw == nil or raw == "" then return {} end
    local plain, err = models_secrets.decrypt(raw)
    if err then return nil, err end
    local secret, decode_err = json.decode(plain)
    if decode_err then return nil, decode_err end
    if type(secret) ~= "table" then return nil, "model provider secret must be an object" end
    return secret
end

local function encrypt_secret(secret_config: any): (string?, string?)
    if type(secret_config) ~= "table" or not has_fields(secret_config) then return "" end
    return models_secrets.encrypt(encode_json(secret_config))
end

local CONFIG_KEYS = {
    "base_url",
    "organization",
    "timeout",
    "api_key_env",
    "headers",
    "retry",
    "api_version",
    "beta_features",
    "region",
    "region_env",
    "access_key_env",
    "secret_key_env",
    "session_token_env",
    "project",
    "project_env",
    "location",
    "location_env",
    "google_credentials_env",
    "access_token_env",
    "client_id",
    "model_list_url",
    "test_model",
    "bedrock_provider",
    "discovery_method",
}

local function normalize_retry_config(raw: any): any?
    if type(raw) ~= "table" then return nil end

    local attempts = math.floor(tonumber(raw.attempts) or 0)
    if attempts <= 0 then return nil end
    if attempts > 10 then attempts = 10 end

    local retry: any = { attempts = attempts }
    local backoff_ms = tonumber(raw.backoff_ms)
    if backoff_ms ~= nil then
        backoff_ms = math.floor(backoff_ms)
        if backoff_ms < 0 then backoff_ms = 0 end
        if backoff_ms > 60000 then backoff_ms = 60000 end
        retry.backoff_ms = backoff_ms
    end

    return retry
end

local SECRET_KEYS = {
    api_key = true,
    access_key = true,
    secret_key = true,
    session_token = true,
    google_credentials = true,
    access_token = true,
}

local function secret_value(value: any): any
    if type(value) == "string" then
        if value ~= "" then return value end
        return nil
    end
    if type(value) == "table" and has_fields(value) then
        return value
    end
    return nil
end

local function copy_config(input: any, existing_config: any?): any
    local config = {}
    if type(existing_config) == "table" then
        for k, v in pairs(existing_config) do
            config[k] = v
        end
    end
    if type(input.config) == "table" then
        for k, v in pairs(input.config) do
            local key = tostring(k)
            if not SECRET_KEYS[key] and not sensitive_config_key(key) then
                config[key] = v
            end
        end
    end
    for _, key in ipairs(CONFIG_KEYS) do
        if input[key] ~= nil and not SECRET_KEYS[key] and not sensitive_config_key(key) then
            config[key] = input[key]
        end
    end
    for k, v in pairs(config) do
        if v == "" or v == nil then config[k] = nil end
    end
    config.retry = normalize_retry_config(config.retry)
    return config
end

local function copy_secret_config(input: any, existing_secret: any?): any
    local secret_config = {}
    if type(existing_secret) == "table" then
        for k, v in pairs(existing_secret) do
            secret_config[k] = v
        end
    end
    for key, _ in pairs(SECRET_KEYS) do
        local clear_key = "clear_" .. key
        if input[clear_key] == true then
            secret_config[key] = nil
        else
            local direct = secret_value(input[key])
            local nested = type(input.config) == "table" and secret_value(input.config[key]) or nil
            if direct ~= nil then
                secret_config[key] = direct
            elseif nested ~= nil then
                secret_config[key] = nested
            end
        end
    end
    return secret_config
end

local function provider_exists(provider_id: string): boolean
    local entry, err = registry.get(provider_id)
    if err or not entry then return false end
    local meta = entry.meta or {}
    return meta.type == models_types.PROVIDER_TYPE
end

-- A provider declares custom server-side profile behavior on its editor entry
-- (kickside.models:provider_profile_editor). provider_hook returns the declared
-- function id for a hook key (validate_func / on_change_func), or nil when the
-- provider declares none -- generic machinery then does nothing provider-specific.
local function provider_hook(provider_id: string, key: string): string?
    local entries = registry.find({
        [".kind"] = "registry.entry",
        ["meta.type"] = models_types.PROVIDER_EDITOR_TYPE,
    }) or {}
    for _, entry in ipairs(entries) do
        local data = entry.data or {}
        if data.provider_id == provider_id then
            local fn = data[key]
            if type(fn) == "string" and fn ~= "" then return fn :: string end
            return nil
        end
    end
    return nil
end

-- Run a provider's declared on_change hook before a profile is persisted. The
-- hook receives the resolved config/secret_config and may return a { config = {} }
-- patch of derived values (e.g. Vertex deriving project from service-account
-- credentials); the patch is merged into config.
local function apply_provider_normalization(provider_id: string, config: any, secret_config: any): any
    local fn = provider_hook(provider_id, "on_change_func")
    if not fn then return config end
    local funcs = require("funcs")
    local res, cerr = funcs.call(fn, {
        provider_id = provider_id, config = config, secret_config = secret_config })
    if cerr or type(res) ~= "table" then return config end
    local patch = (res :: any).config
    if type(patch) == "table" then
        for k, v in pairs(patch) do
            if v ~= nil and v ~= "" then config[k] = v end
        end
    end
    return config
end

local function validate_profile_config(provider_id: string, config: any, secret_config: any): string?
    if not provider_exists(provider_id) then
        return "provider_id is not a registered llm.provider"
    end

    local fn = provider_hook(provider_id, "validate_func")
    if fn then
        local funcs = require("funcs")
        local res, cerr = funcs.call(fn, {
            provider_id = provider_id, config = config, secret_config = secret_config })
        if cerr then return "validation failed: " .. tostring(cerr) end
        if type(res) == "table" then
            local r = res :: { valid: any, error: any }
            if r.valid == false then
                return (type(r.error) == "string") and (r.error :: string) or "invalid provider configuration"
            end
        end
    end

    return nil
end

local function provider_context(profile: any): any
    if type(profile) ~= "table" then return {} end
    local config = profile.config or {}
    local secret = profile.secret_config or {}
    local ctx: any = {}
    for k, v in pairs(config) do
        ctx[k] = v
    end
    for key, _ in pairs(SECRET_KEYS) do
        if secret_value(secret[key]) ~= nil then
            ctx[key] = secret[key]
        end
    end
    return ctx
end

local function clean_profile_input(input: any, existing: any?): (any?, string?)
    if type(input) ~= "table" then return nil, "profile body must be an object" end
    local name = input.name or (existing and existing.name)
    if type(name) ~= "string" or name == "" then return nil, "name is required" end
    local provider_id = input.provider_id or (existing and existing.provider_id) or models_types.DEFAULT_PROVIDER
    if type(provider_id) ~= "string" or provider_id == "" then return nil, "provider_id is required" end

    local config = copy_config(input, existing and existing.config or {})
    local secret_config = copy_secret_config(input, existing and existing.secret_config or {})
    config = apply_provider_normalization(provider_id, config, secret_config)
    local verr = validate_profile_config(provider_id, config, secret_config)
    if verr then return nil, verr end

    -- Explicit branch: `a ~= nil and a or b` would turn a literal `false` into the
    -- fallback, so a disabled profile could never be saved.
    local enabled: boolean
    if input.enabled ~= nil then
        enabled = input.enabled == true
    elseif existing ~= nil then
        enabled = existing.enabled ~= false
    else
        enabled = true
    end

    return {
        name = name,
        provider_id = provider_id,
        config = config,
        secret_config = secret_config,
        enabled = enabled,
    }
end


M.decode_json = decode_json
M.normalize_list = normalize_list
M.explicit_list = explicit_list
M.scrub_sensitive = scrub_sensitive
M.normalize_retry_config = normalize_retry_config
M.encode_json = encode_json
M.bool_int = bool_int
M.encrypt_secret = encrypt_secret
M.decrypt_secret = decrypt_secret
M.provider_context = provider_context
M.public_profile = public_profile
M.clean_profile_input = clean_profile_input

return M
