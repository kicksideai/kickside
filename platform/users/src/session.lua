local eligibility = require("credential_eligibility")
-- Session token minting shared by password login (kickside.users.api:login) and
-- SSO provisioning (the user_provisioning contract's mint_session). One actor
-- metadata shape, one group->scope derivation, one token store, so a password
-- session and an SSO session are indistinguishable to /user/me, groups, sharing,
-- and token_auth.

local security = require("security")
local execution_identity = require("execution_identity")
local time = require("time")
local contract = require("contract")
local logger = require("logger")
local consts = require("user_consts")
local session_index = require("session_index")
local user_groups_repo = require("user_groups_repo")

local user_authority = require("user_authority")
local session_metadata = require("session_metadata")
local M = {}

local log = logger:named("session")

local SETTINGS_CONTRACT = "kickside.settings:settings"
local SETTINGS_NS = "kickside.users"
local TOKEN_EXPIRATION_KEY = "token_expiration"

local function token_expiration(env_value)
    local def, get_err = contract.get(SETTINGS_CONTRACT)
    if get_err then return nil, get_err end
    local inst, open_err = def:open()
    if open_err then return nil, open_err end
    local result, read_err = inst:get({namespace = SETTINGS_NS, key = TOKEN_EXPIRATION_KEY})
    if read_err then return nil, read_err end
    if not result.success then return nil, result.error end
    if result.value == nil then return env_value, nil end
    return result.value, nil
end

local function expires_at(expiration)
    local parsed, err = time.parse_duration(expiration)
    if err then return nil, err end
    return time.now():utc():add(parsed):format_rfc3339(), nil
end

-- mint creates a session token for a user already loaded with security_groups.
-- actor_meta is merged into the actor metadata, except for canonical identity
-- fields which are always derived from the freshly loaded user and group state;
-- token_meta is merged into the stored token meta. Returns
-- { token, actor, scope, scope_id, is_admin, expiration, security_groups } or
-- (nil, err).
local function mint_current(user, actor_meta_extra, token_meta)
    local config = consts.get_config()
    local expiration, expiration_err = token_expiration(config.token_expiration)
    if expiration_err then return nil, expiration_err end
    local expiry, expiry_err = expires_at(expiration)
    if expiry_err then return nil, expiry_err end
    local groups = user.security_groups or {}

    local authority_epochs, authority_err = user_authority.epochs(user)
    if authority_err then return nil, authority_err end
    local scope_id, is_admin, scope_groups, resolve_err, resolved = consts.resolve_scope(config, groups)
    if resolve_err then return nil, resolve_err end
    local actor_meta = session_metadata.actor(user, authority_epochs, scope_id, scope_groups,
        {
            login_time = time.now():format_rfc3339(),
            ip_address = type(actor_meta_extra) == "table" and actor_meta_extra.ip_address or nil,
            user_agent = type(actor_meta_extra) == "table" and actor_meta_extra.user_agent or nil,
        }, actor_meta_extra)

    local actor = security.new_actor(tostring(user.user_id), actor_meta)

    local scope, serr = execution_identity.scope_from_groups(resolved.groups, resolved.policy_ids)
    if not scope then
        return nil, serr
    end

    local token_store, terr = security.token_store(tostring(config.token_store))
    if not token_store then
        return nil, terr
    end

    local meta = {
        created_at = time.now():utc():format_rfc3339(),
        security_groups = scope_groups,
        is_admin = is_admin,
    }
    session_metadata.merge(meta, token_meta)

    local token, cerr = token_store:create(actor, scope, {
        expiration = expiration,
        meta = meta,
    })
    token_store:close()

    if not token then
        return nil, cerr
    end

    -- The ownership row is a security precondition, not telemetry. It verifies the
    -- authentication generation under an account lock and records only the token
    -- store key; on any failure the exact just-created store entry is deleted and
    -- the bearer token is never returned.
    local _, index_err = session_index.record_minted(
        token, tostring(user.user_id), user.auth_generation, expiry)
    if index_err then
        local _, discard_err = session_index.discard_minted(token)
        if discard_err then return nil, discard_err end
        if index_err == consts.ERROR.SESSION_GENERATION_CHANGED then
            return nil, index_err
        end
        log:error("session mint discarded because it could not be indexed atomically", {
            user_id = tostring(user.user_id),
            error = tostring(index_err),
            discard_error = discard_err and tostring(discard_err) or nil,
        })
        return nil, index_err
    end

    return {
        token = token,
        actor = actor,
        scope = scope,
        scope_id = scope_id,
        is_admin = is_admin,
        expiration = expiration,
        security_groups = groups,
    }
end

function M.mint(user, actor_meta_extra, token_meta)
    while true do
        local current, read_err = user_groups_repo.get_user_with_groups(user.user_id)
        if read_err then return nil, read_err end
        local eligible, eligibility_err = eligibility.check(current.user_id)
        if not eligible then return nil, eligibility_err end
        if current.status ~= consts.USER_STATUS.ACTIVE or current.password_hash ~= user.password_hash then
            return nil, consts.ERROR.AUTHENTICATION_FAILED
        end
        local minted, mint_err = mint_current(current, actor_meta_extra, token_meta)
        if mint_err ~= consts.ERROR.SESSION_GENERATION_CHANGED then return minted, mint_err end
    end
end

return M
