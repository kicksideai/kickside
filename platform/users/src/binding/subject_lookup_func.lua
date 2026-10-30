local user_groups_repo = require("user_groups_repo")
local consts = require("consts")
local bot_accounts = require("bot_accounts_repo")

-- Privileged half of kickside.contract:scope_resolver. The resolver decides
-- whether a caller may reach a subject; this reads that subject. It runs under
-- the Users-owned runtime identity because app_users belongs to this module,
-- not to whichever product process happens to be reconstructing an identity.
local user_authority = require("user_authority")
local session_metadata = require("session_metadata")
local M = {}

local function repository()
    return (M :: any)._repo or user_groups_repo
end

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function failure(subject_id: string, message: string, kind: string, error_kind: string, retriable: boolean): any
    return {
        success = false,
        subject_id = subject_id,
        groups = {},
        error = { message = message, kind = kind },
        error_kind = error_kind,
        retriable = retriable,
    }
end

local function lookup(args: any, credential: boolean?): any
    local subject_id = trim(type(args) == "table" and (args :: any).subject_id or nil)
    if subject_id == "" then
        return failure("", "subject_id is required", errors.INVALID, "declaration", false)
    end

    local user, err = repository().get_user_with_groups(subject_id)
    if err then
        local missing = err == consts.ERROR.USER_NOT_FOUND
        return failure(subject_id, tostring(err), missing and errors.NOT_FOUND or errors.UNAVAILABLE,
            missing and "subject" or "infrastructure", not missing)
    end
    if not user then
        return failure(subject_id, consts.ERROR.USER_NOT_FOUND, errors.NOT_FOUND, "subject", false)
    end
    if user.status ~= consts.USER_STATUS.ACTIVE then
        return failure(subject_id, "execution subject is inactive", errors.PERMISSION_DENIED, "subject", false)
    end

    local authority_epochs, authority_err = user_authority.epochs(user)
    if authority_err then return failure(subject_id, tostring(authority_err), errors.UNAVAILABLE, "infrastructure", true) end
    local config = consts.get_config()
    local authority_only = type(args) == "table" and args.authority_only == true
    -- Deferred user frames keep signed-in sharing identities. An authority-only
    -- bot lookup carries only its explicitly selected groups.
    local include_baseline = credential == true or not authority_only or not bot_accounts.is_bot(user)
    local scope_name, _, effective_groups, scope_err, resolved = consts.resolve_scope(config, user.security_groups, true, include_baseline)
    if scope_err then
        if errors.is(scope_err, errors.NOT_FOUND) then
            return failure(subject_id, tostring(scope_err), errors.NOT_FOUND, "subject", false)
        end
        if errors.is(scope_err, errors.PERMISSION_DENIED) then
            return failure(subject_id, tostring(scope_err), errors.PERMISSION_DENIED, "subject", false)
        end
        return failure(subject_id, tostring(scope_err), errors.UNAVAILABLE, "infrastructure", true)
    end

    local stored_meta = type(args.actor_meta) == "table" and args.actor_meta or {}
    local live_groups = effective_groups
    local metadata = session_metadata.actor(user, authority_epochs, stored_meta.scope_id or scope_name,
        live_groups, stored_meta.login_time, stored_meta)

    return {
        authority_epochs = authority_epochs,
        initial_authority_epochs = user_authority.initial_epochs(user),
        subject_id = subject_id,
        groups = live_groups,
        scope_name = scope_name,
        scope_groups = resolved.groups,
        scope_policy_ids = resolved.policy_ids,
        meta = metadata,
    }
end

function M.lookup(args: any): any
    return lookup(args, false)
end

function M.lookup_credential(args: any): (any?, error?)
    local eligibility = require("credential_eligibility")
    local subject_id = trim(type(args) == "table" and args.subject_id or nil)
    local eligible, eligibility_err = eligibility.check(subject_id)
    if eligibility_err then return nil, eligibility_err end
    if eligible ~= true then
        return nil, (errors.new({kind = errors.INTERNAL, retryable = false,
            message = "credential eligibility lookup returns no decision"}) :: error)
    end
    -- Live credentials keep signed-in access and retired-role ACL references,
    -- but never inherit the session-mint default when membership is empty.
    local result = lookup(args, true)
    if result.success ~= false then
        -- Runtime's trusted subject lookup consumes groups and policies.
        -- Keep the scope descriptor used by KickSide's resolver separate.
        result.groups = result.scope_groups
        result.policies = result.scope_policy_ids
    end
    return result, nil
end

return M
