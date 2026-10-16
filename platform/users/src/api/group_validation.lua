local contract = require("contract")
local security = require("security")
local errors = require("errors")

local M = {}

local SCOPES_CONTRACT = "kickside.contract:security_scopes"

local function invalid(message: string): error
    return (errors.new({ kind = errors.INVALID, message = message, retryable = false,
        details = { code = "GROUPS_INVALID" } }) :: error)
end

local function unavailable(message: string): error
    return (errors.new({ kind = errors.UNAVAILABLE, message = message, retryable = false,
        details = { code = "GROUP_CATALOG_UNAVAILABLE" } }) :: error)
end

local function assignable_ids(): ({ [string]: boolean }?, error?)
    local def, get_err = contract.get(SCOPES_CONTRACT)
    if get_err then return nil, (errors.wrap(get_err, "security scope catalog unavailable") :: error) end
    if not def then return nil, unavailable("security scope catalog unavailable") end
    local builder: any = def
    local actor = security.actor()
    if actor then builder = builder:with_actor(actor):with_scope(security.scope()) end
    local inst, open_err = builder:open()
    if open_err then return nil, (errors.wrap(open_err, "security scope catalog open failed") :: error) end
    if not inst then return nil, unavailable("security scope catalog open failed") end
    -- Mutation validation must use the same non-internal catalog the editor
    -- presents. System ingress/runtime scopes are not assignable user groups.
    local result: any, list_err = inst:list({ include_internal = false })
    if list_err then return nil, (errors.wrap(list_err, "security scope catalog list failed") :: error) end
    if type(result) ~= "table" or type(result.scopes) ~= "table" then
        return nil, unavailable("security scope catalog returns no scopes")
    end
    local ids: { [string]: boolean } = {}
    for _, scope in ipairs(result.scopes :: { any }) do
        if type((scope :: any).id) == "string" then ids[(scope :: any).id] = true end
    end
    return ids, nil
end

-- Returns (valid, error, internal). `internal` distinguishes catalog failures
-- from malformed/unknown user input for the HTTP adapters.
function M.validate(groups: any): (boolean, error?, boolean?)
    if type(groups) ~= "table" then return false, invalid("groups array is required"), false end
    local count = #(groups :: { any })
    for key, _ in pairs(groups :: { [any]: any }) do
        if type(key) ~= "number" or key % 1 ~= 0 or key < 1 or key > count then
            return false, invalid("groups must be an array"), false
        end
    end
    local seen: { [string]: boolean } = {}
    for _, group in ipairs(groups :: { any }) do
        if type(group) ~= "string" or group == "" then
            return false, invalid("each group must be a non-empty string"), false
        end
        if seen[group] then return false, invalid("duplicate group: " .. group), false end
        seen[group] = true
    end
    local ids, ids_err = assignable_ids()
    if not ids then return false, ids_err, true end
    for _, group in ipairs(groups :: { string }) do
        if not ids[group] then return false, invalid("unknown group: " .. group), false end
    end
    return true, nil, nil
end

return M
