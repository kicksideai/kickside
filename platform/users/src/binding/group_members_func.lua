local user_groups_repo = require("user_groups_repo")

-- kickside.contract:group_members implementation, near users. Expands a security
-- group into its member user ids -- the reverse of scope_resolver's user->groups
-- -- so lower layers (the component-scoped realtime fanout) can notify a group's
-- members without importing the users schema. Pages through the whole membership.
local M = {}

local PAGE = 500
-- Defensive bound so a pathological membership/backend can never spin forever.
local MAX_PAGES = 2000

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

function M.members(args: any): (any?, any?)
    local group_id = type(args) == "table" and trim((args :: any).group_id) or ""
    if group_id == "" then
        return { group_id = "", user_ids = {}, error = "group_id is required" }
    end

    if args.limit ~= nil then
        if type(args.limit) ~= "number" or args.limit % 1 ~= 0 or args.limit < 1 or args.limit > 128
            or (args.cursor ~= nil and type(args.cursor) ~= "string") then
            return nil, errors.new({ kind = errors.INVALID, message = "group members requires limit 1..128 and a string cursor" })
        end
        return user_groups_repo.get_group_member_page(group_id, args.limit :: integer, args.cursor)
    end

    local user_ids: { string } = {}
    local seen: { [string]: boolean } = {}
    local offset = 0
    for _ = 1, MAX_PAGES do
        local result, err = user_groups_repo.get_group_users(group_id, { limit = PAGE, offset = offset })
        if err or not result then
            return { group_id = group_id, user_ids = user_ids, error = tostring(err or "lookup failed") }
        end
        local rows = (result :: any).users or {}
        for _, row in ipairs(rows) do
            local uid = type(row.user_id) == "string" and row.user_id or ""
            if uid ~= "" and not seen[uid] then
                seen[uid] = true
                table.insert(user_ids, uid)
            end
        end
        if #rows < PAGE then break end
        offset = offset + PAGE
    end

    return { group_id = group_id, user_ids = user_ids }
end

return M
