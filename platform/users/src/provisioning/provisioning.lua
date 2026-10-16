local eligibility = require("credential_eligibility")
-- kickside.users:user_provisioning implementation, owned by the users module.
-- It is the seam through which external identity providers (SSO) provision and
-- mount local accounts without reaching into the user/group repositories: every
-- method takes a single table arg and returns an envelope { ok, error?, ... }.
-- The users module keeps ownership of its password sentinel, schema, and session
-- minting; consumers depend only on this contract.

local consts = require("user_consts")
local user_repo = require("user_repo")
local user_groups_repo = require("user_groups_repo")
local user_group_sources_repo = require("user_group_sources_repo")
local session = require("session")

local M = {}

-- present_user shapes a stored row (loaded with security_groups) into the
-- contract's user view. has_password is true only for a real, settable password,
-- never the locked passwordless sentinel.
local function present_user(user)
    return {
        user_id = user.user_id,
        email = user.email,
        full_name = user.full_name,
        status = user.status,
        has_password = user.password_hash ~= nil and user.password_hash ~= consts.NO_PASSWORD,
        provisioning_pending = user.status == consts.USER_STATUS.PENDING
            and user.password_hash == consts.NO_PASSWORD,
        security_groups = user.security_groups or {},
    }
end

-- get_user loads a user by id-or-email with their security groups, status, and
-- whether they hold a real password (for the SSO last-credential guard).
function M.get_user(args)
    local identifier = type(args) == "table" and args.identifier or nil
    if not identifier or identifier == "" then
        return { ok = false, error = consts.ERROR.MISSING_REQUIRED_FIELD .. "identifier" }
    end

    local user, err = user_groups_repo.get_user_with_groups(identifier)
    if err then
        return { ok = false, error = tostring(err) }
    end

    local eligible, eligibility_err = eligibility.check(user.user_id)
    if not eligible then return {ok = false, error = tostring(eligibility_err)} end
    return { ok = true, user = present_user(user) }
end

-- create_passwordless_user inserts a pending account carrying the locked-password
-- sentinel through the users repository, not direct SQL.
function M.create_passwordless_user(args)
    local email = type(args) == "table" and args.email or nil
    if not email or email == "" then
        return { ok = false, error = consts.ERROR.MISSING_REQUIRED_FIELD .. "email" }
    end

    local valid, verr = consts.validate_email(email:lower())
    if not valid then
        return { ok = false, error = verr }
    end

    local created, cerr = user_repo.create_passwordless({
        email = email,
        full_name = args.full_name,
        status = consts.USER_STATUS.PENDING,
    })
    if not created then
        return { ok = false, error = tostring(cerr) }
    end

    return { ok = true, user_id = created.user_id }
end

-- complete_passwordless_user atomically applies the Users-owned portion of SSO
-- provisioning and activates the pending account. It is replay-safe after a
-- transient or ambiguous failure.
function M.complete_passwordless_user(args)
    local identifier = type(args) == "table" and args.identifier or nil
    local source = type(args) == "table" and args.source or nil
    local group_ids = type(args) == "table" and args.group_ids or nil
    local default_group = type(args) == "table" and args.default_group or nil
    local result, err = user_group_sources_repo.complete_passwordless_provisioning(
        identifier, default_group, source, group_ids)
    if err or not result then
        return { ok = false, error = tostring(err or "provisioning completion failed") }
    end
    return {
        ok = true,
        user_id = result.user_id,
        groups_added = result.groups_added,
        groups_removed = result.groups_removed,
    }
end

-- assign_group grants a single security group to a user (the default group on
-- provision). Idempotent: re-assigning an existing membership is not an error.
function M.assign_group(args)
    local identifier = type(args) == "table" and args.identifier or nil
    local group_id = type(args) == "table" and args.group_id or nil
    if not identifier or identifier == "" then
        return { ok = false, error = consts.ERROR.MISSING_REQUIRED_FIELD .. "identifier" }
    end
    if not group_id or group_id == "" then
        return { ok = false, error = consts.ERROR.MISSING_REQUIRED_FIELD .. "group_id" }
    end

    local eligible, eligibility_err = eligibility.check(identifier)
    if not eligible then return {ok = false, error = tostring(eligibility_err)} end
    local _, err = user_groups_repo.assign_user_to_group(identifier, group_id)
    if err then
        return { ok = false, error = tostring(err) }
    end

    return { ok = true }
end

-- reconcile_sourced_groups reconciles the memberships owned by a single source (an
-- external identity provider) against a desired set, without touching rows owned by
-- any other source. It removes only this source's rows whose group is no longer
-- desired, and adds a desired group only when the user has no row for it under any
-- source -- so a manual grant for the same group is preserved (it is never replaced
-- or shadowed). This is the reconciliation policy: it reads the current membership
-- snapshot and computes the add/remove plan, delegating the row I/O to the repo.
-- Returns a summary { user_id, source, groups_added, groups_removed, security_groups }.
function M.reconcile_sourced_groups(identifier, source, group_ids)
    if not identifier or identifier == "" then
        return nil, consts.ERROR.MISSING_REQUIRED_FIELD .. "identifier"
    end
    if not source or source == "" then
        return nil, consts.ERROR.MISSING_REQUIRED_FIELD .. "source"
    end
    if type(group_ids) ~= "table" then
        return nil, consts.ERROR.INVALID_FIELD_VALUE .. "group_ids must be an array"
    end

    local eligible, eligibility_err = eligibility.check(identifier)
    if not eligible then return nil, eligibility_err end
    local state, err = user_group_sources_repo.read_sourced_state(identifier, source)
    if err then
        return nil, err
    end

    -- Dedupe the desired set and index it for membership tests.
    local desired, want = {}, {}
    for _, gid in ipairs(group_ids) do
        if type(gid) == "string" and gid ~= "" and not want[gid] then
            want[gid] = true
            desired[#desired + 1] = gid
        end
    end

    -- Remove this source's rows whose group is no longer desired.
    local to_remove = {}
    for _, gid in ipairs(state.sourced) do
        if not want[gid] then
            to_remove[#to_remove + 1] = gid
        end
    end

    -- Add a desired group only when the user holds no row for it under any source.
    local to_add = {}
    for _, gid in ipairs(desired) do
        if not state.present[gid] then
            to_add[#to_add + 1] = gid
        end
    end

    local result, werr = user_group_sources_repo.write_sourced_plan(state.user_id, source, to_add, to_remove)
    if werr then
        return nil, werr
    end

    return {
        user_id = state.user_id,
        source = source,
        groups_added = result.groups_added,
        groups_removed = result.groups_removed,
        security_groups = desired,
    }
end

-- apply_sourced_groups is the contract seam over the reconciliation policy: it
-- normalizes the request envelope and wraps the summary in { ok, ... }.
function M.apply_sourced_groups(args)
    local identifier = type(args) == "table" and args.identifier or nil
    local source = type(args) == "table" and args.source or nil
    local group_ids = type(args) == "table" and args.group_ids or nil
    if not identifier or identifier == "" then
        return { ok = false, error = consts.ERROR.MISSING_REQUIRED_FIELD .. "identifier" }
    end
    if not source or source == "" then
        return { ok = false, error = consts.ERROR.MISSING_REQUIRED_FIELD .. "source" }
    end
    if type(group_ids) ~= "table" then
        group_ids = {}
    end

    local res, err = M.reconcile_sourced_groups(identifier, source, group_ids)
    if err then
        return { ok = false, error = tostring(err) }
    end

    return {
        ok = true,
        groups_added = res.groups_added,
        groups_removed = res.groups_removed,
    }
end

-- mint_session reloads the user fresh (so the token reflects current groups) and
-- mints a session token through the shared session helper, identical to password
-- login's actor metadata, group->scope derivation, and token store.
function M.mint_session(args)
    local identifier = type(args) == "table" and args.identifier or nil
    if not identifier or identifier == "" then
        return { ok = false, error = consts.ERROR.MISSING_REQUIRED_FIELD .. "identifier" }
    end

    local user, err = user_groups_repo.get_user_with_groups(identifier)
    if err then
        return { ok = false, error = tostring(err) }
    end
    if user.status ~= consts.USER_STATUS.ACTIVE then
        return { ok = false, error = consts.ERROR.AUTHENTICATION_FAILED }
    end

    local actor_meta, token_meta
    if type(args.meta) == "table" then
        actor_meta = args.meta
        token_meta = { auth_method = args.meta.auth_method or "sso" }
        for k, v in pairs(args.meta) do token_meta[k] = v end
    else
        actor_meta = {}
        token_meta = { auth_method = "sso" }
    end

    local minted, merr = session.mint(user, actor_meta, token_meta)
    if not minted then
        return { ok = false, error = tostring(merr) }
    end

    return {
        ok = true,
        token = minted.token,
        is_admin = minted.is_admin,
        scope = minted.scope_id,
        expiration = minted.expiration,
    }
end

return M
