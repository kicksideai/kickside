local user_repo = require("user_repo")
local user_groups_repo = require("user_groups_repo")

local M = {}

local EXECUTION_SCOPE = "wippy.security:process"

local function email_local_part(user_id: string): string
    return string.lower(user_id:gsub("[^%w%._%+%-]", "_"))
end

function M.ensure_user(user_id: string): ()
    if user_id == "" then return end

    local user, lookup_err = user_repo.get(user_id)
    if not user then
        if lookup_err ~= "User not found" then
            error("could not look up Inbox test user " .. user_id .. ": " .. tostring(lookup_err))
        end

        local created, create_err = user_repo.create_passwordless({
            user_id = user_id,
            email = email_local_part(user_id) .. "@inbox.test.local",
            full_name = user_id,
        })
        if not created then
            -- A prior harness run may already have left this fixed fixture in the DB.
            user = user_repo.get(user_id)
            if not user then
                error("could not create Inbox test user " .. user_id .. ": " .. tostring(create_err))
            end
        end
    end

    local assigned, assign_err = user_groups_repo.assign_user_to_group(user_id, EXECUTION_SCOPE)
    if assign_err or not assigned then
        error("could not assign Inbox test user " .. user_id .. " to " .. EXECUTION_SCOPE .. ": " .. tostring(assign_err))
    end
end

return M
