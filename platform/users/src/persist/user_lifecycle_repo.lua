local eligibility = require("credential_eligibility")
-- User account updates and deletion lifecycle persistence.
local sql = require("sql")
local time = require("time")
local consts = require("user_consts")
local session_index = require("session_index")
local support = require("user_repo_support")
local bot_accounts = require("bot_accounts_repo")
local get_db = support.get_db
local hash_password = support.hash_password
local M = {}

function M.update_in(db, user_id, update_data)
    if not db then return nil, consts.new_error(consts.ERROR_CODE.DB_CONNECTION_FAILED) end
    if not user_id or user_id == "" then
        return nil, consts.new_error(consts.ERROR_CODE.MISSING_REQUIRED_FIELD, { message = consts.ERROR.MISSING_REQUIRED_FIELD .. "user_id", details = { field = "user_id" } })
    end

    if not update_data or next(update_data) == nil then
        return nil, consts.new_error(consts.ERROR_CODE.MISSING_REQUIRED_FIELD, { message = consts.ERROR.MISSING_REQUIRED_FIELD .. "update_data", details = { field = "update_data" } })
    end

    local query = sql.builder.update("app_users")
        :where("user_id = ?", user_id)

    if update_data.email then
        local email_valid, email_err = consts.validate_email(update_data.email)
        if not email_valid then
            return nil, consts.new_error(consts.ERROR_CODE.INVALID_FIELD_VALUE, { message = email_err, details = { field = "email" } })
        end
        query = query:set("email", update_data.email)
    end

    if update_data.full_name then
        local name_valid, name_err = consts.validate_full_name(update_data.full_name)
        if not name_valid then
            return nil, consts.new_error(consts.ERROR_CODE.INVALID_FIELD_VALUE, { message = name_err, details = { field = "full_name" } })
        end
        query = query:set("full_name", update_data.full_name)
    end

    if update_data.password then
        local eligible, eligibility_err = eligibility.check_in(db, user_id)
        if not eligible then return nil, eligibility_err end
        local pass_valid, pass_err = consts.validate_password(update_data.password)
        if not pass_valid then
            return nil, consts.new_error(consts.ERROR_CODE.INVALID_FIELD_VALUE, { message = pass_err, details = { field = "password" } })
        end

        local password_hash, err = hash_password(tostring(update_data.password))
        if err then
            return nil, consts.propagate_error(err, consts.ERROR_CODE.PASSWORD_HASH_FAILED, "Password hash operation failed")
        end
        query = query:set("password_hash", password_hash)
    end

    if update_data.status then
        local status_valid, status_err = consts.validate_user_status(update_data.status)
        if not status_valid then
            return nil, consts.new_error(consts.ERROR_CODE.INVALID_FIELD_VALUE, { message = status_err, details = { field = "status" } })
        end
        query = query:set("status", update_data.status)
    end

    query = query:set("updated_at", time.now():utc():format_rfc3339())

    local account, account_err = bot_accounts.find_in(db, user_id)
    if account_err then return nil, account_err end
    local bot = account and bot_accounts.is_bot(account)
    if bot and update_data.email and update_data.email ~= account.email then
        return nil, consts.new_error(consts.ERROR_CODE.INVALID_FIELD_VALUE, {
            message = "bot account address is immutable", details = {field = "email"},
        })
    end

    local executor = query:run_with(db)
    local result, err = executor:exec()

    if err then
        return nil, consts.propagate_error(err, consts.ERROR_CODE.DB_OPERATION_FAILED, consts.ERROR.DB_OPERATION_FAILED)
    end

    if result.rows_affected == 0 then
        return nil, consts.new_error(consts.ERROR_CODE.USER_NOT_FOUND)
    end

    if bot then
        local _, audit_err = bot_accounts.record_in(db, user_id, "update", {
            full_name = update_data.full_name, status = update_data.status, email = update_data.email,
        })
        if audit_err then return nil, audit_err end
    end

    return {
        user_id = user_id,
        updated = true,
        rows_affected = result.rows_affected
    }
end

function M.update(user_id, update_data)
    local db, err = get_db()
    if err then return nil, err end
    local tx, tx_err = db:begin()
    if tx_err or not tx then
        db:release()
        return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(tx_err)
    end
    local result, update_err = M.update_in(tx, user_id, update_data)
    if update_err then
        tx:rollback()
        db:release()
        return nil, update_err
    end
    if update_data.password or update_data.status then
        local invalidated, invalidate_err = session_index.invalidate_user_in(tx, user_id, {revoke_delegations = true})
        if invalidate_err then
            tx:rollback()
            db:release()
            return nil, invalidate_err
        end
        result.sessions_revoked = invalidated.revoked
    end
    local _, commit_err = tx:commit()
    if commit_err then
        tx:rollback()
        db:release()
        return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(commit_err)
    end
    db:release()
    return result, nil
end

local function disable_in(tx, user_id, bot)
    local changed, change_err = sql.builder.update("app_users")
        :set("status", consts.USER_STATUS.INACTIVE)
        :set("updated_at", time.now():utc():format_rfc3339())
        :where("user_id = ?", user_id):run_with(tx):exec()
    if change_err then return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(change_err) end
    if not changed or changed.rows_affected == 0 then return nil, consts.ERROR.USER_NOT_FOUND end
    local invalidated, invalidate_err = session_index.invalidate_user_in(tx, user_id, {revoke_delegations = true})
    if invalidate_err then return nil, invalidate_err end
    if bot then
        local _, audit_err = bot_accounts.record_in(tx, user_id, "disable", {status = consts.USER_STATUS.INACTIVE})
        if audit_err then return nil, audit_err end
    end
    return {user_id = user_id, sessions_revoked = invalidated.revoked, retained = bot and true or nil}, nil
end

function M.delete_if_exists(user_id)
    if not user_id or user_id == "" then
        return nil, consts.ERROR.MISSING_REQUIRED_FIELD .. "user_id"
    end

    local db, err = get_db()
    if err then
        return nil, err
    end

    local tx, tx_err = db:begin()
    if tx_err or not tx then
        db:release()
        return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(tx_err)
    end

    -- Invalidate first while the account row still exists. This removes matching
    -- token-store/index rows and advances its generation in the same transaction
    -- as the destructive account change.
    local present, present_err = sql.builder.select("user_id", support.BOT_ACCOUNT_PREDICATE .. " AS bot_account")
        :from("app_users"):where("user_id = ?", user_id):limit(1):run_with(tx):query()
    if present_err then
        tx:rollback(); db:release()
        return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(present_err)
    end
    if present and present[1] and bot_accounts.is_bot(present[1]) then
        local result, disable_err = disable_in(tx, user_id, true)
        if disable_err then
            tx:rollback(); db:release()
            return nil, disable_err
        end
        local _, commit_err = tx:commit()
        if commit_err then
            tx:rollback(); db:release()
            return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(commit_err)
        end
        db:release()
        result.deleted = false
        result.rows_affected = 0
        result.group_rows_affected = 0
        return result, nil
    end
    local invalidated = { revoked = 0 }
    if present and present[1] then
        local invalidate_err
        invalidated, invalidate_err = session_index.invalidate_user_in(tx, user_id, {revoke_delegations = true})
        if invalidate_err then
            tx:rollback(); db:release()
            return nil, invalidate_err
        end
    end

    -- Do not rely on a driver's foreign-key pragma for group cleanup. Both deletes
    -- commit as one idempotent unit, including in SQLite harnesses and host DBs where
    -- FK enforcement policy differs.
    local group_result, group_err = sql.builder.delete("app_user_groups")
        :where("user_id = ?", user_id)
        :run_with(tx):exec()
    if group_err then
        tx:rollback()
        db:release()
        return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(group_err)
    end

    local result, delete_err = sql.builder.delete("app_users")
        :where("user_id = ?", user_id)
        :run_with(tx):exec()
    if delete_err then
        tx:rollback()
        db:release()
        return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(delete_err)
    end

    local _, commit_err = tx:commit()
    if commit_err then
        tx:rollback()
        db:release()
        return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(commit_err)
    end
    db:release()

    return {
        user_id = user_id,
        deleted = result.rows_affected > 0,
        rows_affected = result.rows_affected,
        group_rows_affected = group_result.rows_affected,
        sessions_revoked = invalidated.revoked,
    }
end

function M.delete(user_id)
    local result, err = M.delete_if_exists(user_id)
    if err then return nil, err end
    if not result or (not result.deleted and not result.retained) then
        return nil, consts.ERROR.USER_NOT_FOUND
    end
    return result, nil
end

-- Fence an asynchronous lifecycle deletion synchronously: make the account
-- inactive and invalidate every session in one transaction before its event is
-- appended. A reporting failure leaves a safely inactive account that can retry.
function M.prepare_delete(user_id)
    if not user_id or user_id == "" then
        return nil, consts.ERROR.MISSING_REQUIRED_FIELD .. "user_id"
    end
    local db, db_err = get_db()
    if db_err or not db then return nil, db_err end
    local tx, tx_err = db:begin()
    if tx_err or not tx then
        db:release()
        return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(tx_err)
    end
    local account, account_err = bot_accounts.find_in(tx, user_id)
    if account_err then
        tx:rollback(); db:release()
        return nil, account_err
    end
    local result, disable_err = disable_in(tx, user_id, account and bot_accounts.is_bot(account))
    if disable_err then
        tx:rollback(); db:release()
        return nil, disable_err
    end
    local _, commit_err = tx:commit()
    if commit_err then
        tx:rollback(); db:release()
        return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(commit_err)
    end
    db:release()
    return result, nil
end


return M
