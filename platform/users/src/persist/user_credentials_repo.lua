local eligibility = require("credential_eligibility")
-- Password verification and self-service credential rotation.
local sql = require("sql")
local time = require("time")
local consts = require("user_consts")
local session_index = require("session_index")
local user_repo = require("user_repo")
local support = require("user_repo_support")
local get_db = support.get_db
local check_password = support.check_password
local hash_password = support.hash_password
local M = {}

function M.verify_password(identifier, password)
    if type(password) ~= "string" or password == ""
        or #password > consts.LIMITS.MAX_PASSWORD_LENGTH then
        return false, consts.ERROR.INVALID_PASSWORD
    end
    local user, err = user_repo.get(identifier)
    if err then
        return false, err
    end

    local eligible, eligibility_err = eligibility.check(user.user_id)
    if not eligible then
        local _, timing_err = check_password(consts.NO_PASSWORD, password)
        if timing_err then return false, timing_err end
        return false, eligibility_err
    end
    local is_valid, cerr, needs_upgrade = check_password(tostring(user.password_hash), password)
    if cerr then
        return false, cerr
    end
    if not is_valid then
        return false, consts.ERROR.INVALID_PASSWORD
    end

    if needs_upgrade then
        local replacement, hash_err = hash_password(password)
        if hash_err then return false, hash_err end
        local db, db_err = get_db()
        if db_err then return false, db_err end
        local changed, change_err = sql.builder.update("app_users")
            :where("user_id = ? AND password_hash = ? AND auth_generation = ? AND NOT " .. support.BOT_ACCOUNT_PREDICATE,
                user.user_id, user.password_hash, tonumber(user.auth_generation) or 0)
            :set("password_hash", replacement)
            :set("updated_at", time.now():utc():format_rfc3339())
            :run_with(db):exec()
        db:release()
        if change_err then return false, change_err end
        if not changed or changed.rows_affected ~= 1 then return false, consts.ERROR.INVALID_PASSWORD end
        user.password_hash = replacement
    end
    return true, user
end

function M.update_self_password(user_id, current_password, update_data)
    if not user_id or user_id == "" then
        return nil, consts.ERROR.MISSING_REQUIRED_FIELD .. "user_id"
    end
    if type(current_password) ~= "string" or current_password == ""
        or #current_password > consts.LIMITS.MAX_PASSWORD_LENGTH then
        return nil, consts.ERROR.INVALID_PASSWORD
    end
    if type(update_data) ~= "table" or type(update_data.password) ~= "string" then
        return nil, consts.ERROR.MISSING_REQUIRED_FIELD .. "password"
    end

    local pass_valid, pass_err = consts.validate_password(update_data.password)
    if not pass_valid then return nil, pass_err end
    if update_data.full_name ~= nil then
        local name_valid, name_err = consts.validate_full_name(update_data.full_name)
        if not name_valid then return nil, name_err end
    end

    local observed, get_err = user_repo.get(user_id)
    if get_err or not observed then return nil, get_err end
    local eligible, eligibility_err = eligibility.check(user_id)
    if not eligible then return nil, eligibility_err end
    local current_valid, verify_err = check_password(
        tostring(observed.password_hash), current_password)
    if verify_err then return nil, verify_err end
    if not current_valid then return nil, consts.ERROR.INVALID_PASSWORD end

    local replacement, hash_err = hash_password(update_data.password)
    if hash_err or not replacement then return nil, hash_err end

    local db, db_err = get_db()
    if db_err or not db then return nil, db_err end
    local tx, tx_err = db:begin()
    if tx_err or not tx then
        db:release()
        return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(tx_err)
    end

    local query = sql.builder.update("app_users")
        :where("user_id = ? AND password_hash = ? AND auth_generation = ? AND NOT " .. support.BOT_ACCOUNT_PREDICATE,
            user_id, tostring(observed.password_hash), tonumber(observed.auth_generation) or 0)
        :set("password_hash", replacement)
        :set("updated_at", time.now():utc():format_rfc3339())
    if update_data.full_name ~= nil then
        query = query:set("full_name", update_data.full_name)
    end
    local changed, change_err = query:run_with(tx):exec()
    if change_err then
        tx:rollback(); db:release()
        return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(change_err)
    end
    if not changed or changed.rows_affected == 0 then
        tx:rollback(); db:release()
        return nil, consts.ERROR.INVALID_PASSWORD
    end

    local invalidated, invalidate_err = session_index.invalidate_user_in(tx, user_id, {revoke_delegations = true})
    if invalidate_err then
        tx:rollback(); db:release()
        return nil, invalidate_err
    end
    local _, commit_err = tx:commit()
    if commit_err then
        tx:rollback(); db:release()
        return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(commit_err)
    end
    db:release()
    return {
        user_id = user_id,
        updated = true,
        rows_affected = changed.rows_affected,
        sessions_revoked = invalidated.revoked,
    }, nil
end

-- Idempotent account removal for durable lifecycle consumers. The lifecycle
-- reaper can replay an event after a worker failure, so an already-removed row
-- is a successful no-op rather than USER_NOT_FOUND.

return M
