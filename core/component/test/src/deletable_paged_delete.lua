-- A kind that can retire only two backing rows per delete call. Its typed
-- partial result asks the component retention slot to retry the next page.
local ctx = require("ctx")
local sql = require("sql")

local function handle(): any
    local id = ctx.get("component_id")
    local db, open_err = sql.get("app:db")
    if open_err or not db then return { success = false, error = open_err } end
    local rows, read_err = db:query(
        "SELECT row_id FROM paged_cleanup_rows WHERE component_id=$1 ORDER BY row_id LIMIT 3", { id })
    if read_err or type(rows) ~= "table" then
        db:release()
        return { success = false, error = read_err or errors.new({ message = "missing page", kind = errors.INTERNAL }) }
    end
    for index = 1, math.min(#rows, 2) do
        local _, delete_err = db:execute("DELETE FROM paged_cleanup_rows WHERE component_id=$1 AND row_id=$2",
            { id, rows[index].row_id })
        if delete_err then db:release(); return { success = false, error = delete_err } end
    end
    db:release()
    if #rows > 2 then
        return { success = false, error = errors.new({ message = "backing rows need another page",
            kind = errors.CONFLICT, retryable = true, details = { cleanup_pending = true, needs_continue = true } }) }
    end
    return { success = true }
end

return { handle = handle }
