local errors = require("errors")
local error_envelope = require("error_envelope")
local consts = require("user_consts")
local support = require("user_repo_support")
local bot_accounts = require("bot_accounts_repo")
local M = {}

function M.check_in(db, identifier)
    local user, err = bot_accounts.find_in(db, identifier)
    if err then
        if err:kind() == "" then
            return nil, consts.new_error(consts.ERROR_CODE.DB_OPERATION_FAILED, {
                message = "credential eligibility lookup failed: " .. tostring(err),
                details = {cause = error_envelope.encode(err)},
            })
        end
        local details = err:details()
        if details and details.code ~= nil then return nil, err end
        return nil, error_envelope.wrap(err, "credential eligibility lookup failed", {
            code = consts.ERROR_CODE.DB_OPERATION_FAILED,
        })
    end
    if not user then return nil, consts.new_error(consts.ERROR_CODE.USER_NOT_FOUND) end
    if bot_accounts.is_bot(user) then
        return nil, errors.new({kind = errors.PERMISSION_DENIED, retryable = false,
            message = consts.ERROR.AUTHENTICATION_FAILED,
            details = {code = "account_credential_ineligible"}})
    end
    return true, nil
end

function M.check(identifier)
    local db, db_err = support.get_db()
    if db_err or not db then return nil, db_err end
    local eligible, err = M.check_in(db, identifier)
    db:release()
    return eligible, err
end

return M
