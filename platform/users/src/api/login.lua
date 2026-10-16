local http = require("http")
local json = require("json")

local user_repo = require("user_repo")
local user_credentials_repo = require("user_credentials_repo")
local user_repo_support = require("user_repo_support")
local user_groups_repo = require("user_groups_repo")
local consts = require("consts")
local session = require("session")

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
    local password_valid, verify_err = user_credentials_repo.verify_password(identifier, password)
    if not password_valid then
        invalid_credentials()
        return
    end

    if user.status ~= consts.USER_STATUS.ACTIVE then
        invalid_credentials()
        return
    end

    local actor_meta = {
        ip_address = req:remote_addr() or "unknown",
        user_agent = req:header("User-Agent") or "unknown",
    }
    if type(body.metadata) == "table" then
        for key, value in pairs(body.metadata) do
            if key ~= "security_groups" then
                actor_meta[key] = value
            end
        end
    end

    local token_meta = {
        ip = req:remote_addr() or "unknown",
        user_agent = req:header("User-Agent") or "unknown",
    }

    local minted, mint_err = session.mint(user, actor_meta, token_meta)
    if not minted then
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
            user_id = user.user_id,
            email = user.email,
            full_name = user.full_name,
            status = user.status,
            created_at = user.created_at
        },
        actor = {
            id = minted.actor:id(),
            metadata = minted.actor:meta()
        },
        security = {
            groups = user.security_groups,
            scope = minted.scope_id,
            is_admin = minted.is_admin
        },
        expiration = minted.expiration
    }

    res:set_status(http.STATUS.OK)
    res:write_json(response)
end

return {
    handler = handler
}
