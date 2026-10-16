local consts = require("consts")

local M = {}

function M.body(err: any): { [string]: any }
    if type(err) ~= "userdata" then
        return { success = false, error = tostring(err) }
    end
    local details = err:details()
    return {
        success = false,
        error = err:message(),
        kind = err:kind(),
        code = type(details) == "table" and details.code or nil,
        retryable = err:retryable(),
        details = details,
    }
end

function M.status(err: any): integer
    if consts.has_error_code(err, consts.ERROR_CODE.USER_NOT_FOUND) then return 404 end
    if consts.has_error_code(err, consts.ERROR_CODE.USER_ALREADY_EXISTS) then return 400 end
    if consts.has_error_code(err, consts.ERROR_CODE.MISSING_REQUIRED_FIELD) then return 400 end
    if consts.has_error_code(err, consts.ERROR_CODE.INVALID_FIELD_VALUE) then return 400 end
    return 500
end

return M
