local funcs = require("funcs")
local security = require("security")

local M = {}

local CREATE_USER = "kickside.users.provisioning:provisioning_create_passwordless_user"
local GET_USER = "kickside.users.provisioning:provisioning_get_user"
local COMPLETE_USER = "kickside.users.provisioning:provisioning_complete_passwordless_user"
local USER_GROUP = "app.security:user"
local PROCESS_SCOPE = "wippy.security:process"

local cache: { [string]: string } = {}

local function email_for(label: string): string
    local safe = tostring(label or "user"):lower():gsub("[^a-z0-9_.+-]", "_")
    if safe == "" then safe = "user" end
    return safe .. "@skills.test.local"
end

function M.user_id(label: string): (string?, string?)
    if cache[label] then return cache[label], nil end

    local email = email_for(label)
    local created, cerr = funcs.new():call(CREATE_USER, {
        email = email,
        full_name = label,
    })
    local created_user_id = type(created) == "table" and (created :: any).user_id or nil
    local user_id: string? = nil
    if type(created_user_id) == "string" then user_id = created_user_id end
    if (not user_id or user_id == "") and (cerr or (type(created) == "table" and (created :: any).ok == false)) then
        local existing, gerr = funcs.new():call(GET_USER, { identifier = email })
        if gerr then return nil, tostring(gerr) end
        if type(existing) == "table" and type((existing :: any).user) == "table" then
            user_id = tostring((existing :: any).user.user_id or "")
        end
    end
    if not user_id or user_id == "" then
        return nil, "failed to provision test user " .. label .. ": " .. tostring(cerr or (created and (created :: any).error))
    end

    local completed, cerr = funcs.new():call(COMPLETE_USER, {
        identifier = user_id,
        default_group = USER_GROUP,
        source = "skills-test",
        group_ids = {},
    })
    if cerr then return nil, tostring(cerr) end
    if type(completed) ~= "table" or (completed :: any).ok ~= true then
        return nil, tostring(type(completed) == "table" and (completed :: any).error or "user provisioning did not complete")
    end

    cache[label] = user_id
    return user_id, nil
end

function M.executor(label: string, context: any?): (any, string)
    local user_id, err = M.user_id(label)
    if err or not user_id then error(err or "failed to provision test user") end
    local actor: any = security.new_actor(user_id, {})
    local scope: any = security.named_scope(PROCESS_SCOPE)
    local exec: any = funcs.new():with_actor(actor):with_scope(scope)
    if context then exec = exec:with_context(context) end
    return exec, user_id
end

return M
