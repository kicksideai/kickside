local http = require("http")
local json = require("json")
local env = require("env")
local time = require("time")

local user_credentials_repo = require("user_credentials_repo")
local user_repo_support = require("user_repo_support")
local user_groups_repo = require("user_groups_repo")
local consts = require("consts")
local session = require("session")
local handoff_token = require("handoff_token")
local handoff_nonce_repo = require("handoff_nonce_repo")

local function respond_with_session(req, res, verified, handoff)
    local actor_meta = {
        ip_address = req:remote_addr() or "unknown",
        user_agent = req:header("User-Agent") or "unknown",
    }
    local token_meta = {
        ip = req:remote_addr() or "unknown",
        user_agent = req:header("User-Agent") or "unknown",
    }

    local minted, mint_err = session.mint(verified, actor_meta, token_meta, handoff)
    if not minted then
        if handoff and mint_err == consts.ERROR.HANDOFF_REJECTED then
            res:set_status(http.STATUS.UNAUTHORIZED)
            res:write_json({success = false, error = consts.ERROR.HANDOFF_REJECTED})
            return
        end
        local kind, retryable
        if type(mint_err) == "userdata" then
            local native = mint_err :: error
            kind, retryable = native:kind(), native:retryable()
        end
        local missing_group = kind ~= nil and errors.is(mint_err, errors.NOT_FOUND)
        res:set_status(missing_group and http.STATUS.FORBIDDEN or http.STATUS.INTERNAL_ERROR)
        res:write_json({
            success = false,
            error = consts.ERROR.TOKEN_CREATION_FAILED,
            details = tostring(mint_err or "Unknown error"),
            kind = kind,
            retryable = retryable,
        })
        return
    end

    local response = {
        success = true,
        message = "Authentication successful",
        token = minted.token,
        user = {
            user_id = verified.user_id,
            email = verified.email,
            full_name = verified.full_name,
            status = verified.status,
            created_at = verified.created_at
        },
        actor = {
            id = minted.actor:id(),
            metadata = minted.actor:meta()
        },
        security = {
            groups = minted.security_groups,
            scope = minted.scope_id,
            is_admin = minted.is_admin
        },
        expiration = minted.expiration
    }

    res:set_status(http.STATUS.OK)
    res:write_json(response)
end

local function handler()
    local res = http.response()
    local req = http.request()

    if not req or not res then
        return nil, "Failed to get HTTP context"
    end

    res:set_content_type(http.CONTENT.JSON)

    local body, err = req:body_json()
    if err then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({
            success = false,
            error = "Invalid JSON request",
            details = err
        })
        return
    end

    local identifier = body.user_id or body.email
    if not identifier or identifier == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({
            success = false,
            error = "Missing user_id or email field"
        })
        return
    end

    local password = body.password
    if type(password) ~= "string" or password == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({
            success = false,
            error = "Missing password field"
        })
        return
    end

    local function invalid_credentials()
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({
            success = false,
            error = "Invalid credentials"
        })
    end

    -- Reject oversized candidates before either account lookup or cryptographic
    -- work. This bounds unauthenticated CPU/input cost without creating an
    -- account-existence distinction because the path is identical for all users.
    if #password > consts.LIMITS.MAX_PASSWORD_LENGTH then
        invalid_credentials()
        return
    end

    local user, err = user_groups_repo.get_user_with_groups(identifier)
    if err then
        if err == consts.ERROR.USER_NOT_FOUND then
            -- Burn the KDF cost the real path would have paid. Returning early here
            -- is what makes account existence measurable by response time.
            user_repo_support.equalize_password_timing(password)
            invalid_credentials()
            return
        end

        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({
            success = false,
            error = "Authentication system error",
            details = err
        })
        return
    end

    -- Password first, then status. Checking status first discloses the account's
    -- lifecycle state to a caller who has proven nothing.
    local password_valid, verified = user_credentials_repo.verify_password(user.user_id, password)
    if not password_valid then
        invalid_credentials()
        return
    end

    if verified.status ~= consts.USER_STATUS.ACTIVE then
        invalid_credentials()
        return
    end

    -- Successful verification may have upgraded a legacy password hash. Mint
    -- against the verified hash so a concurrent reset still fences this login.
    respond_with_session(req, res, verified)
end

local function handoff()
    local res = http.response()
    local req = http.request()
    if not req or not res then
        return nil, "Failed to get HTTP context"
    end
    res:set_content_type(http.CONTENT.JSON)

    local function rejected()
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "Invalid or expired sign-in link" })
    end

    local body, err = req:body_json()
    if err or type(body) ~= "table" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "Invalid JSON request" })
        return
    end

    local secret = env.get(consts.ENV_IDS.HANDOFF_SECRET)
    local now = time.now():unix()
    local claims = handoff_token.verify(body.token, secret, now)
    if not claims then
        rejected()
        return
    end

    local user, lookup_err = user_groups_repo.get_user_with_groups(claims.email)
    if lookup_err and lookup_err ~= consts.ERROR.USER_NOT_FOUND then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "Authentication system error" })
        return
    end
    if not user or user.status ~= consts.USER_STATUS.ACTIVE
        or user.bot_account == true or tonumber(user.bot_account) == 1 then
        local _, claim_err = handoff_nonce_repo.claim(claims.nonce, claims.exp)
        if claim_err then
            res:set_status(http.STATUS.INTERNAL_ERROR)
            res:write_json({ success = false, error = "Authentication system error" })
            return
        end
        rejected()
        return
    end

    respond_with_session(req, res, user, claims)
end

return {
    handler = handler,
    handoff = handoff
}
