local sql = require("sql")
local security = require("security")
local uuid = require("uuid")
local time = require("time")
local json = require("json")
local consts = require("user_consts")
local support = require("user_repo_support")
local M = {}

function M.is_bot(row)
    return row.bot_account == true or tonumber(row.bot_account) == 1
end

function M.find_in(db, identifier)
    if type(identifier) ~= "string" or identifier == "" then
        return nil, consts.new_error(consts.ERROR_CODE.MISSING_REQUIRED_FIELD, {
            message = consts.ERROR.MISSING_REQUIRED_FIELD .. "identifier",
        })
    end
    return support.find_user(db, identifier, identifier:lower(), {
        "user_id", "email", support.BOT_ACCOUNT_PREDICATE .. " AS bot_account",
    })
end

function M.record_in(db, user_id, operation, payload)
    local actor = security.actor()
    if not actor or actor:id() == "" then
        return nil, errors.new({kind = errors.PERMISSION_DENIED, retryable = false,
            message = "bot lifecycle audit requires an initiating actor"})
    end
    local encoded, encode_err = json.encode(payload)
    if encode_err then return nil, encode_err end
    local _, err = sql.builder.insert("app_user_bot_audit"):set_map({
        audit_id = uuid.v4(), user_id = user_id, actor_id = actor:id(), operation = operation,
        payload = encoded, created_at = time.now():utc():format_rfc3339(),
    }):run_with(db):exec()
    if err then
        return nil, consts.propagate_error(err, consts.ERROR_CODE.DB_OPERATION_FAILED,
            "bot lifecycle audit write failed")
    end
    return true, nil
end

return M
