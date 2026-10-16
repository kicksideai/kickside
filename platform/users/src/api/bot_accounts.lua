local http = require("http")
local json = require("json")
local security = require("security")
local bot_accounts = require("bot_accounts")
local list_users = require("list_users")
local http_errors = require("http_errors")
local error_response = require("error_response")
local M = {}

local function authorized(endpoint)
    local res = http.response()
    res:set_content_type(http.CONTENT.JSON)
    if not security.actor() or not security.can("access", endpoint) then
        res:set_status(http.STATUS.FORBIDDEN)
        res:write_json({success = false, error = "access denied"})
        return nil
    end
    return res
end

function M.create()
    local res = authorized("kickside.users.api:bot_accounts_create.endpoint")
    if not res then return end
    local data, decode_err = json.decode(http.request():body() or "")
    if decode_err then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({success = false, error = "Invalid JSON: " .. tostring(decode_err)})
        return
    end
    local user, err = bot_accounts.create(data)
    if err then
        local status = http_errors.classify(err)
        res:set_status(status)
        res:write_json(error_response.body(err))
        return
    end
    res:set_status(http.STATUS.CREATED)
    res:write_json({success = true, user = user})
end

function M.list()
    local res = authorized("kickside.users.api:bot_accounts_list.endpoint")
    if not res then return end
    local req = http.request()
    local limit = math.max(1, math.min(100, tonumber(req:query("limit")) or 100))
    local offset = math.max(0, tonumber(req:query("offset")) or 0)
    local status, body = list_users.process(limit, offset, {bot_accounts = true})
    res:set_status(status)
    res:write_json(body)
end

return M
