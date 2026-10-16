local base64 = require("base64")
local crypto = require("crypto")
local env = require("env")
local hash = require("hash")
local http = require("http_client")
local json = require("json")
local logger = require("logger")
local store = require("store")
local time = require("time")

local models_repo = require("models_repo")
local catalog_policy = require("catalog_policy")
local models_types = require("models_types")

local M = {}

local log = logger:named("kickside.models.vertex_tokens")

local PROVIDER_ID = "wippy.llm.google.vertex:provider"
local FAILURE_RETRY_SECONDS = 30
local TOKEN_REFRESH_MARGIN_SECONDS = 60
local TOKEN_CACHE_KEY = "google_oauth2_token"
local DEFAULT_CACHE_ID = "kickside.models:cache"
local DIRECT_TOKEN_TTL_SECONDS = 600
local GRANT_TYPE = "urn:ietf:params:oauth:grant-type:jwt-bearer"
local SCOPE = "https://www.googleapis.com/auth/cloud-platform"
local TOKEN_TIMEOUT_SECONDS = 300

local function trim(value)
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function resolve_value(context: any, key: string): string?
    context = type(context) == "table" and context or {}
    local direct = context[key]
    if type(direct) == "string" and direct ~= "" then return direct end

    local env_key = context[key .. "_env"]
    if type(env_key) == "string" and env_key ~= "" then
        local value = env.get(env_key)
        if value and value ~= "" then return value end
    end

    return nil
end

local function decode_credentials(raw: string): (any?, string?)
    raw = trim(raw)
    if raw == "" then return nil, "Google service account credentials are missing" end

    local decoded = raw
    if not decoded:match("^%s*{") then
        local result, decode_err = base64.decode(decoded)
        if decode_err or not result or result == "" then
            return nil, "Failed to decode Google service account credentials from base64"
        end
        decoded = result
    end

    local parsed, err = json.decode(decoded)
    if err or type(parsed) ~= "table" then
        return nil, "Failed to parse Google service account credentials JSON: " .. tostring(err)
    end

    return parsed
end

local function credentials_for_context(context: any): (any?, string?)
    local raw = resolve_value(context, "google_credentials")
    if not raw then return nil, "Google service account credentials are missing" end
    return decode_credentials(raw)
end

local function credential_fingerprint(kind: string, raw: any, fallback_salt: any): string?
    raw = trim(raw)
    if raw == "" then return nil end

    local digest, err = hash.sha256(raw)
    if type(digest) == "string" and digest ~= "" then
        return kind .. ":" .. digest
    end

    -- Conservative fallback: do not collapse distinct profiles if hashing fails.
    log:warn("vertex credential fingerprint failed", { error = tostring(err) })
    return kind .. ":unfingerprinted:" .. tostring(fallback_salt or "")
end

local function open_cache()
    local cache, err = store.get(env.get("APP_CACHE") or DEFAULT_CACHE_ID)
    if err then return nil, "Failed to access cache store: " .. tostring(err) end
    return cache
end

local function auth_cache_key(profile_id, auth_kind, context): string?
    local field = auth_kind == "direct" and "access_token" or "google_credentials"
    return credential_fingerprint(auth_kind, resolve_value(context, field), profile_id)
end

local function cached_token(profile_id, auth_kind, context)
    local cache, err = open_cache()
    if not cache then return nil, err end

    local token = cache:get(TOKEN_CACHE_KEY)
    cache:release()

    if type(token) ~= "table" or type(token.access_token) ~= "string" or token.access_token == "" then
        return nil
    end
    local shared_service_token = token.profile_id == nil and auth_kind == "service_account"
    if token.profile_id ~= nil and token.profile_id ~= profile_id then
        return nil
    end
    if shared_service_token then
        local global_credentials = trim(env.get("GOOGLE_CREDENTIALS") or "")
        local profile_credentials = trim(resolve_value(context, "google_credentials") or "")
        if global_credentials == "" or profile_credentials == "" or global_credentials ~= profile_credentials then
            return nil
        end
    elseif token.profile_id == nil then
        return nil
    end
    if not shared_service_token and token.auth_key ~= auth_cache_key(profile_id, auth_kind, context) then
        return nil, "cached token does not match the current profile credentials"
    end
    local expires_at = tonumber(token.expires_at)
    if expires_at and time.now():unix() >= expires_at then
        return nil, "cached token is expired"
    end

    return token
end

local function store_token(profile_id: string, access_token: any, expires_in: any, source: string,
    auth_key: string?): (any?, string?)
    if type(access_token) ~= "string" or access_token == "" then
        return nil, "token response did not include an access token"
    end

    local ttl = tonumber(expires_in) or 3600
    if ttl <= 0 then ttl = 3600 end
    if source ~= "direct" then
        ttl = ttl - 300
        if ttl < 60 then ttl = 60 end
    end

    -- Store the actual refresh deadline in expires_at. The previous cache
    -- lookup applied this same margin implicitly, which left an exact-expiry
    -- timer up to a minute late.
    local cache_ttl = math.max(1, ttl - TOKEN_REFRESH_MARGIN_SECONDS)

    local token = {
        access_token = access_token,
        expires_at = time.now():unix() + cache_ttl,
        profile_id = profile_id,
        source = source,
        auth_key = auth_key,
    }

    local cache, err = open_cache()
    if not cache then return nil, err end
    local _, set_err = cache:set(TOKEN_CACHE_KEY, token, cache_ttl)
    cache:release()
    if set_err then return nil, "Failed to store token in cache: " .. tostring(set_err) end
    return token
end

local function fetch_service_account_token(context: any): (any?, string?)
    local credentials, cerr = credentials_for_context(context)
    if not credentials then return nil, cerr end

    local token_uri = credentials.token_uri
    local time_now = time.now()
    local signature, sign_err = crypto.jwt.encode({
        iss = credentials.client_email,
        scope = SCOPE,
        aud = token_uri,
        exp = time_now:unix() + 3600,
        iat = time_now:unix(),
        _header = {
            alg = "RS256",
            typ = "JWT",
            kid = credentials.private_key_id,
        },
    }, tostring(credentials.private_key), "RS256")

    if sign_err then
        return nil, "Failed to sign Google service account JWT: " .. tostring(sign_err)
    end

    local response, request_err = http.post(tostring(token_uri), {
        headers = { ["Content-Type"] = "application/json" },
        body = json.encode({
            grant_type = GRANT_TYPE,
            assertion = signature,
        }),
        timeout = TOKEN_TIMEOUT_SECONDS,
    })
    if request_err then
        return nil, "Failed to retrieve Google OAuth2 token: " .. tostring(request_err)
    end
    if not response or tonumber(response.status_code) ~= 200 then
        return nil, "Google OAuth2 token endpoint returned status " ..
            tostring(response and response.status_code or "unknown")
    end

    local parsed, parse_err = json.decode(response.body or "")
    if parse_err or type(parsed) ~= "table" then
        return nil, "Failed to parse Google OAuth2 token response: " .. tostring(parse_err)
    end
    return parsed
end

local function profile_auth_kind(profile): (string?, any)
    local context = catalog_policy.provider_context(profile)
    local direct_token = resolve_value(context, "access_token")
    if direct_token and direct_token ~= "" then return "direct", context end

    local credentials = credentials_for_context(context)
    if credentials then return "service_account", context end

    return nil, context
end

local function profile_auth_cache_key(profile): string?
    local kind, context = profile_auth_kind(profile)
    if not kind then return nil end
    return auth_cache_key(profile and profile.id, kind, context)
end

local function refreshable_vertex_profiles(snapshot)
    local out = {}
    for _, profile in ipairs(snapshot.profiles or {}) do
        if type(profile) == "table" and profile.provider_id == PROVIDER_ID and profile.enabled ~= false then
            local kind = profile_auth_kind(profile)
            if kind then
                table.insert(out, profile)
            end
        end
    end
    return out
end

local function skip_unsafe_cache_topology(profiles, defer_reload)
    if #profiles == 0 then return false end

    local keys = {}
    local unique = 0
    for _, profile in ipairs(profiles) do
        local key = profile_auth_cache_key(profile)
        if key and not keys[key] then
            keys[key] = true
            unique = unique + 1
        end
    end

    local global_credentials = trim(env.get("GOOGLE_CREDENTIALS") or "")
    if global_credentials ~= "" then
        local global_key = credential_fingerprint("service_account", global_credentials, "global")
        for key, _ in pairs(keys) do
            if key ~= global_key then
                local message = "Existing wippy.llm Google token refresher is configured through GOOGLE_CREDENTIALS; models supervisor skipped a different Vertex token to avoid overwriting the global driver cache"
                for _, profile in ipairs(profiles) do
                    local _, status_err = models_repo.set_profile_status(tostring(profile.id or ""), "unhealthy", message, nil, defer_reload ~= true)
                    if status_err then return nil, status_err end
                end
                log:warn("vertex token supervisor skipped global cache conflict", { profiles = #profiles })
                return true
            end
        end
    end

    if unique <= 1 then return false end

    local message = "Multiple enabled Vertex profiles use different live credentials; current Vertex driver token cache is global, so token refresh is skipped to avoid cross-profile token reuse"
    for _, profile in ipairs(profiles) do
        local _, status_err = models_repo.set_profile_status(tostring(profile.id or ""), "unhealthy", message, nil, defer_reload ~= true)
        if status_err then return nil, status_err end
    end
    log:warn("vertex token supervisor skipped unsafe multi-credential refresh", { profiles = #profiles })
    return true
end

local function refresh_profile(profile: any, defer_reload: boolean?): (string?, number?, string?)
    if type(profile) ~= "table" then return "skipped" end
    if profile.enabled == false or profile.provider_id ~= PROVIDER_ID then return "skipped" end

    local profile_id = tostring(profile.id or "")
    local auth_kind, context = profile_auth_kind(profile)

    if auth_kind == "direct" then
        local direct_token = resolve_value(context, "access_token")
        local cached = cached_token(profile_id, auth_kind, context)
        if cached and cached.access_token == direct_token then return "cached", tonumber(cached.expires_at) end
        local token, cache_err = store_token(profile_id, direct_token, DIRECT_TOKEN_TTL_SECONDS, "direct",
            auth_cache_key(profile_id, auth_kind, context))
        if cache_err then
            local _, status_err = models_repo.set_profile_status(profile_id, "unhealthy", "Vertex direct token cache failed: " .. tostring(cache_err), nil, defer_reload ~= true)
            if status_err then return nil, nil, status_err end
            return nil, nil, cache_err
        end
        local _, status_err = models_repo.set_profile_status(profile_id, "healthy", "Vertex direct access token cached", nil, defer_reload ~= true)
        if status_err then return nil, nil, status_err end
        return "external", token.expires_at
    end

    if auth_kind ~= "service_account" then
        log:debug("vertex profile has no service account credentials", { profile_id = profile_id })
        return "missing_credentials"
    end

    local cached = cached_token(profile_id, auth_kind, context)
    if cached and cached.access_token then
        return "cached", tonumber(cached.expires_at)
    end

    local response, refresh_err = fetch_service_account_token(context)
    if refresh_err then
        local _, status_err = models_repo.set_profile_status(profile_id, "unhealthy", "Vertex token refresh failed: " .. tostring(refresh_err), nil, defer_reload ~= true)
        if status_err then return nil, nil, status_err end
        return nil, nil, refresh_err
    end

    local token, cache_err = store_token(profile_id, response.access_token, response.expires_in, "service_account",
        auth_cache_key(profile_id, auth_kind, context))
    if cache_err then
        local _, status_err = models_repo.set_profile_status(profile_id, "unhealthy", "Vertex token cache failed: " .. tostring(cache_err), nil, defer_reload ~= true)
        if status_err then return nil, nil, status_err end
        return nil, nil, cache_err
    end

    local _, status_err = models_repo.set_profile_status(profile_id, "healthy", "Vertex service account token refreshed", nil, defer_reload ~= true)
    if status_err then return nil, nil, status_err end
    return "refreshed", token.expires_at
end

local function retry_at_for_status(status: string?, expires_at: number?): integer?
    if type(expires_at) == "number" and expires_at > 0 then return math.floor(expires_at) end
    if status == nil then return time.now():unix() + FAILURE_RETRY_SECONDS end
    return nil
end

function M.refresh_once()
    local snapshot, snapshot_err = models_repo.snapshot()
    if snapshot_err then return nil, snapshot_err end
    local refreshable_profiles = refreshable_vertex_profiles(snapshot)
    local unsafe, topology_err = skip_unsafe_cache_topology(refreshable_profiles, true)
    if topology_err then return nil, topology_err end
    if unsafe then
        local _, reload_err = models_repo.reload()
        if reload_err then return nil, reload_err end
        return {
            scanned = #refreshable_profiles,
            refreshed = 0,
            cached = 0,
            external = 0,
            skipped = #refreshable_profiles,
            failed = #refreshable_profiles,
            deadlines = {},
        }
    end

    local scanned = 0
    local refreshed = 0
    local cached = 0
    local external = 0
    local skipped = 0
    local failed = 0
    local deadlines: { [string]: integer } = {}

    for _, profile in ipairs(snapshot.profiles or {}) do
        if type(profile) == "table" and profile.provider_id == PROVIDER_ID and profile.enabled ~= false then
            scanned = scanned + 1
            local status, expires_at, err = refresh_profile(profile, true)
            local profile_id = tostring(profile.id or "")
            local due = retry_at_for_status(status, expires_at)
            if due and profile_id ~= "" then deadlines[profile_id] = due end
            if status == "refreshed" then
                refreshed = refreshed + 1
            elseif status == "cached" then
                cached = cached + 1
            elseif status == "external" then
                external = external + 1
            elseif status == nil then
                failed = failed + 1
                log:warn("vertex token refresh failed", {
                    profile_id = profile_id,
                    error = tostring(err),
                })
            else
                skipped = skipped + 1
            end
        end
    end

    if scanned > 0 then
        if refreshed > 0 or failed > 0 then
            local _, reload_err = models_repo.reload()
            if reload_err then return nil, reload_err end
        end

        log:info("vertex token supervisor scan complete", {
            scanned = scanned,
            refreshed = refreshed,
            cached = cached,
            external = external,
            skipped = skipped,
            failed = failed,
        })
    end

    return {
        scanned = scanned,
        refreshed = refreshed,
        cached = cached,
        external = external,
        skipped = skipped,
        failed = failed,
        deadlines = deadlines,
    }
end

-- The cache is shared by all Vertex profiles, so every committed profile change
-- rechecks the full credential topology before it writes a token.
function M.handle_profile_changed(data: any): (any?, any?)
    local profile_id = type(data) == "table" and data.profile_id or nil
    if type(profile_id) ~= "string" or profile_id == "" then
        return { status = "ignored", error = "profile_id is required" }
    end
    local provider_id = type(data.provider_id) == "string" and data.provider_id or nil
    local previous_provider_id = type(data.previous_provider_id) == "string"
        and data.previous_provider_id or nil
    if provider_id ~= nil and provider_id ~= PROVIDER_ID
        and previous_provider_id ~= PROVIDER_ID then
        return { status = "skipped" }
    end
    return M.refresh_once()
end

function M.refresh_due(profile_ids: { string }): ({ [string]: integer }?, boolean?, any?)
    local snapshot, snapshot_err = models_repo.snapshot()
    if snapshot_err then return nil, nil, snapshot_err end
    local profiles = refreshable_vertex_profiles(snapshot)
    local unsafe, topology_err = skip_unsafe_cache_topology(profiles, false)
    if topology_err then return nil, nil, topology_err end
    if unsafe then return {}, false end

    local deadlines: { [string]: integer } = {}
    for _, profile_id in ipairs(profile_ids) do
        local profile, profile_err = models_repo.get_profile(profile_id)
        if profile_err then return nil, nil, profile_err end
        if profile then
            local status, expires_at, err = refresh_profile(profile)
            if status == nil then
                log:warn("vertex token deadline refresh failed", {
                    profile_id = profile_id, error = tostring(err),
                })
            end
            local due = retry_at_for_status(status, expires_at)
            if due then deadlines[profile_id] = due end
        end
    end
    return deadlines, true
end

return M
