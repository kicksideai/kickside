local delegation = require("delegation")
local http = require("http")
local json = require("json")
local api_errors = require("api_errors")
local M = {save = delegation.save, revoke = delegation.revoke, list = delegation.list}

local function handler(operation: (any) -> (any?, error?), writes: boolean)
    local res, req, context_err = api_errors.context()
    if context_err then return nil, context_err end
    local prepare_err = api_errors.prepare(res)
    if prepare_err then return nil, prepare_err end
    local args = {}
    if writes then
        local body, body_err = req:body()
        if body_err then return api_errors.write(res, http.STATUS.BAD_REQUEST, api_errors.invalid("invalid request body", "body", body_err)) end
        local decoded, decode_err = json.decode(body)
        if decode_err or type(decoded) ~= "table" then
            return api_errors.write(res, http.STATUS.BAD_REQUEST, api_errors.invalid("invalid JSON body", "body", decode_err))
        end
        args = decoded
    end
    local result, err = operation(args)
    if err then
        local status = errors.is(err, errors.PERMISSION_DENIED) and http.STATUS.FORBIDDEN or http.STATUS.BAD_REQUEST
        if err:retryable() then status = http.STATUS.INTERNAL_ERROR end
        return api_errors.write(res, status, err)
    end
    return api_errors.respond(res, http.STATUS.OK, result :: { [string]: any }, writes)
end

function M.handler_save() return handler(M.save, true) end
function M.handler_revoke() return handler(M.revoke, true) end
function M.handler_list() return handler(M.list, false) end
return M
