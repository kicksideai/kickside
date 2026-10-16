local env = require("env")
local security = require("security")
local user_groups_repo = require("user_groups_repo")

local function run(input)
    local value, err = env.get(input.key)
    if err then return nil, err end
    if input.read_groups then
        local actor = security.actor()
        local membership, membership_err = user_groups_repo.get_user_groups(actor:id())
        if membership_err then return nil, membership_err end
        return { resource = value, groups = membership.groups }, nil
    end
    return { resource = value }, nil
end
return { run = run }
