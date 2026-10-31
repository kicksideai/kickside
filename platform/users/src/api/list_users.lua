local http = require("http")
local security = require("security")
local user_repo = require("user_repo")
local user_groups_repo = require("user_groups_repo")
local logger = require("logger")

local log = logger:named("list_users")

local M = {}

-- Swappable repository seams so the process logic is testable without HTTP.
M._user_repo = user_repo
M._user_groups_repo = user_groups_repo

-- process lists users and attaches each user's security groups. A groups lookup
-- error is propagated as a 500, never swallowed to {}, so the caller cannot treat
-- "error" as "no groups" and save a wiped membership. Returns (status, body) the
-- HTTP shell writes verbatim.
function M.process(limit: number, offset: number, options: any?): (number, any)
    local users, err = M._user_repo.list({ limit = limit, offset = offset, bot_accounts = options and options.bot_accounts })
    if err then
        return http.STATUS.INTERNAL_ERROR, { success = false, error = err }
    end

    local user_ids = {}
    for _, user in ipairs(users) do user_ids[#user_ids + 1] = user.user_id end
    local memberships, groups_err = M._user_groups_repo.get_user_groups_batch(user_ids)
    if groups_err then
        log:error("failed to load user groups", { user_count = #user_ids, error = groups_err })
        return http.STATUS.INTERNAL_ERROR, { success = false, error = groups_err }
    end
    for _, user in ipairs(users) do
        user.security_groups = memberships[user.user_id] or {}
    end

    return http.STATUS.OK, { success = true, users = users, limit = limit, offset = offset, count = #users }
end

function M.handler()
    local res = http.response()
    res:set_content_type(http.CONTENT.JSON)
    if not security.actor() or not security.can("access", "kickside.users.api:list_users.endpoint") then
        res:set_status(http.STATUS.FORBIDDEN)
        res:write_json({ success = false, error = "access denied" })
        return
    end

    local req = http.request()
    local limit = tonumber(req and req:query("limit")) or 100
    if limit < 1 then limit = 1 elseif limit > 100 then limit = 100 end
    local offset = tonumber(req and req:query("offset")) or 0
    if offset < 0 then offset = 0 end

    local status, body = M.process(limit, offset)
    res:set_status(status)
    res:write_json(body)
end

return M
