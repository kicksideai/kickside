local sql = require("sql")
local consts = require("user_consts")
local user_repo = require("user_repo")
local user_lifecycle_repo = require("user_lifecycle_repo")
local user_group_sources_repo = require("user_group_sources_repo")
local session_index = require("session_index")
local bot_accounts = require("bot_accounts_repo")
local security = require("security")
local uuid = require("uuid")
local time = require("time")
local support = require("user_groups_support")

local M = {}

local function preflight_groups(identifier, groups)
    local db, db_err = sql.get(consts.get_db_resource())
    if db_err or not db then return nil, nil, consts.propagate_error(db_err, consts.ERROR_CODE.DB_CONNECTION_FAILED, consts.ERROR.DB_CONNECTION_FAILED) end
    local user, user_err = user_repo.get_in(db, identifier)
    if user_err or not user then db:release(); return nil, nil, user_err or consts.new_error(consts.ERROR_CODE.USER_NOT_FOUND) end
    local preflight, preflight_err = user_group_sources_repo.preflight_replace(db, user.user_id, groups)
    db:release()
    if preflight_err then return nil, nil, preflight_err end
    return user.user_id, preflight, nil
end

local function begin()
    local db, db_err = sql.get(consts.get_db_resource())
    if db_err or not db then
        return nil, nil, consts.propagate_error(db_err, consts.ERROR_CODE.DB_CONNECTION_FAILED, consts.ERROR.DB_CONNECTION_FAILED)
    end
    local tx, tx_err = db:begin()
    if tx_err or not tx then
        db:release()
        return nil, nil, consts.propagate_error(tx_err, consts.ERROR_CODE.DB_OPERATION_FAILED, consts.ERROR.DB_OPERATION_FAILED)
    end
    return db, tx, nil
end

local function abort(db, tx, err)
    if tx then tx:rollback() end
    if db then db:release() end
    return nil, err
end

local function finish(db, tx)
    if not db or not tx then
        return nil, consts.new_error(consts.ERROR_CODE.DB_OPERATION_FAILED, { message = consts.ERROR.DB_OPERATION_FAILED .. ": transaction unavailable" })
    end
    local _, commit_err = tx:commit()
    if commit_err then
        tx:rollback()
        db:release()
        return nil, consts.propagate_error(commit_err, consts.ERROR_CODE.DB_OPERATION_FAILED, consts.ERROR.DB_OPERATION_FAILED)
    end
    db:release()
    return true, nil
end

-- Create the account and its complete manual group set as one unit. The caller
-- validates assignable group ids before entering persistence.
function M.create(user_data, groups)
    if type(groups) ~= "table" then
        return nil, consts.new_error(consts.ERROR_CODE.INVALID_FIELD_VALUE, { message = consts.ERROR.INVALID_FIELD_VALUE .. "groups must be an array" })
    end
    local db, tx, begin_err = begin()
    if begin_err then return nil, begin_err end

    local user, create_err = user_repo.create_in(tx, user_data)
    if create_err or not user then return abort(db, tx, create_err or consts.new_error(consts.ERROR_CODE.DB_OPERATION_FAILED, { message = "user create failed" })) end
    local group_result, group_err = user_group_sources_repo.replace_new_in(tx, user.user_id, groups)
    if group_err then return abort(db, tx, group_err) end

    local ok, commit_err = finish(db, tx)
    if not ok then return nil, commit_err end
    user.security_groups = group_result.security_groups
    return user, nil
end

function M.create_bot(full_name, groups)
    local actor = security.actor()
    if not actor then
        return nil, errors.new({kind = errors.PERMISSION_DENIED, retryable = false, message = "bot creation requires an initiating actor"})
    end
    local id = uuid.v4()
    local db, tx, begin_err = begin()
    if begin_err then return nil, begin_err end
    local user, create_err = user_repo.create_passwordless_in(tx, {
        user_id = id, email = id .. "@bots.invalid", full_name = full_name, status = consts.USER_STATUS.ACTIVE,
    })
    if create_err then return abort(db, tx, create_err) end
    local _, marker_err = sql.builder.insert("app_user_bot_accounts"):set_map({
        user_id = id, created_by = actor:id(), created_at = time.now():utc():format_rfc3339(),
    }):run_with(tx):exec()
    if marker_err then return abort(db, tx, marker_err) end
    local membership, membership_err = user_group_sources_repo.replace_new_in(tx, id, groups)
    if membership_err then return abort(db, tx, membership_err) end
    local _, audit_err = bot_accounts.record_in(tx, id, "create", {full_name = full_name, groups = membership.security_groups})
    if audit_err then return abort(db, tx, audit_err) end
    local committed, commit_err = finish(db, tx)
    if not committed then return nil, commit_err end
    user.bot_account = true
    user.security_groups = membership.security_groups
    return user, nil
end

-- Patch account fields and, when supplied, replace the complete manual group set
-- in the same transaction. Omitted groups leave memberships untouched.
function M.update(identifier, update_data, groups)
    return support.retry_membership_change(function()
        if type(update_data) ~= "table" then
            return nil, consts.new_error(consts.ERROR_CODE.INVALID_FIELD_VALUE, { message = consts.ERROR.INVALID_FIELD_VALUE .. "update_data must be an object" })
        end
        if groups ~= nil and type(groups) ~= "table" then
            return nil, consts.new_error(consts.ERROR_CODE.INVALID_FIELD_VALUE, { message = consts.ERROR.INVALID_FIELD_VALUE .. "groups must be an array" })
        end
        if next(update_data) == nil and groups == nil then
            return nil, consts.new_error(consts.ERROR_CODE.MISSING_REQUIRED_FIELD, { message = consts.ERROR.MISSING_REQUIRED_FIELD .. "update_data or groups" })
        end

        local expected_user_id, group_preflight, preflight_err
        if groups ~= nil then
            expected_user_id, group_preflight, preflight_err = preflight_groups(identifier, groups)
            if preflight_err then return nil, preflight_err end
        end
        local db, tx, begin_err = begin()
        if begin_err then return nil, begin_err end
        local current, get_err = user_repo.get_in(tx, identifier)
        if get_err or not current then return abort(db, tx, get_err or consts.new_error(consts.ERROR_CODE.USER_NOT_FOUND)) end
        if expected_user_id and current.user_id ~= expected_user_id then
            return abort(db, tx, consts.new_error(consts.ERROR_CODE.DB_OPERATION_FAILED, { message = consts.ERROR.DB_OPERATION_FAILED .. ": account changed during membership classification" }))
        end

        if next(update_data) ~= nil then
            local _, update_err = user_lifecycle_repo.update_in(tx, current.user_id, update_data)
            if update_err then return abort(db, tx, update_err) end
        end
        local group_result = nil
        if groups ~= nil then
            local replace_err
            group_result, replace_err = user_group_sources_repo.replace_in(tx, current.user_id, groups, group_preflight)
            if replace_err then return abort(db, tx, replace_err) end
            current.sessions_revoked = group_result.sessions_revoked
        end

        if (update_data.password or update_data.status)
            and not (group_result and group_result.membership_effect == "reduction") then
            local invalidated, invalidate_err = session_index.invalidate_user_in(tx, current.user_id, {revoke_delegations = true})
            if invalidate_err then return abort(db, tx, invalidate_err) end
            current.sessions_revoked = invalidated.revoked
        elseif group_result and group_result.membership_effect == "reduction" then
            current.sessions_revoked = group_result.sessions_revoked
        end

        local ok, commit_err = finish(db, tx)
        if not ok then return nil, commit_err end
        return {
            user_id = current.user_id,
            updated = true,
            security_groups = group_result and group_result.security_groups or nil,
            sessions_revoked = current.sessions_revoked,
        }, nil
    end)
end

return M
