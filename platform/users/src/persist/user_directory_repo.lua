local sql = require("sql")
local support = require("user_repo_support")

local M = {}

function M.search(options: any): (any?, any?)
    local db, db_err = support.get_db()
    if db_err or not db then return nil, db_err end
    local fragment = options.query:lower():gsub("([\\%%_])", "\\%1")
    local pattern = "%" .. fragment .. "%"
    local query = sql.builder.select("user_id", "email", "full_name", "created_at")
        :from("app_users")
        :where("status = ?", "active")
        :where("(LOWER(COALESCE(full_name, '')) LIKE ? ESCAPE '\\'"
            .. " OR LOWER(COALESCE(email, '')) LIKE ? ESCAPE '\\'"
            .. " OR LOWER(user_id) LIKE ? ESCAPE '\\')", pattern, pattern, pattern)
        :order_by("created_at DESC, user_id DESC")
        :limit(options.limit + 1)
    if options.after then
        query = query:where("(created_at < ? OR (created_at = ? AND user_id < ?))",
            options.after.created_at, options.after.created_at, options.after.user_id)
    end
    local rows, err = query:run_with(db):query()
    db:release()
    if err then return nil, err end
    local has_more = #rows > options.limit
    if has_more then rows[#rows] = nil end
    local last = rows[#rows]
    return { users = rows, has_more = has_more,
        next_after = has_more and { created_at = last.created_at, user_id = last.user_id } or nil }, nil
end

return M
