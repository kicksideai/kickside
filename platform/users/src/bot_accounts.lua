local security = require("security")
local funcs = require("funcs")
local groups = require("group_validation")
local admin = require("admin_repo")
local consts = require("user_consts")
local M = {}

local function invalid(message: string): error
    return errors.new({kind = errors.INVALID, retryable = false, message = message}) :: error
end

function M.create(data)
    if not security.actor() or not security.can("access", "kickside.users.api:bot_accounts_create.endpoint") then
        return nil, errors.new({kind = errors.PERMISSION_DENIED, retryable = false, message = "access denied"})
    end
    if type(data) ~= "table" then return nil, invalid("Bot account details are required") end
    for key in pairs(data) do
        if key ~= "full_name" and key ~= "groups" then return nil, invalid("Unsupported bot account field: " .. tostring(key)) end
    end
    if type(data.full_name) ~= "string" or data.full_name:match("^%s*$") then return nil, invalid("A display name is required") end
    local name_valid, name_err = consts.validate_full_name(data.full_name)
    if not name_valid then return nil, invalid(tostring(name_err)) end
    local valid, validation_err = groups.validate(data.groups)
    if not valid then return nil, validation_err end
    local ready, readiness_err = funcs.call("kickside.users.binding:credential_readiness", {})
    if readiness_err then return nil, readiness_err end
    if ready ~= true then
        return nil, errors.new({kind = errors.INTERNAL, retryable = false, message = "Credential readiness returns no decision"})
    end
    return admin.create_bot(data.full_name, data.groups)
end

return M
