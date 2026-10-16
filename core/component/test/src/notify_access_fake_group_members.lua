local sql = require("sql")

-- Harness-local kickside.contract:group_members. Returns the members the test
-- seeded into kickside_component_notify_group_members for the requested group, so
-- component.notify_access's group expansion is exercised without the users module.
local M = {}

local DB = "app:db"

function M.members(args: any): any
    args = args or {}
    local group_id = tostring(args.group_id or "")
    if group_id == "" then return { group_id = "", user_ids = {} } end

    local db, db_err = sql.get(DB)
    if db_err then return nil, db_err end
    local rows, err = db:query(
        "SELECT user_id FROM kickside_component_notify_group_members WHERE group_id = $1 ORDER BY user_id",
        { group_id }
    )
    db:release()
    if err then return nil, errors.new({ kind = errors.UNAVAILABLE, retryable = true, message = "membership query fails", details = { code = "test_members_unavailable" } }) end

    local user_ids: { string } = {}
    for _, row in ipairs(rows or {}) do
        user_ids[#user_ids + 1] = tostring(row.user_id)
    end
    return { group_id = group_id, user_ids = user_ids }
end

return M
