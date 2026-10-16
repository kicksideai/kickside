-- Test deletable that fails once per component id so reaper retry behavior
-- exercises the real component.system_delete path across function boundaries.

local ctx = require("ctx")
local sql = require("sql")

local TABLE = "kickside_test_lifecycle_reaper_retry"

local function handle(_request: any): any
    local component_id = ctx.get("component_id")
    if type(component_id) ~= "string" or component_id == "" then
        return { success = false, error = "component_id is required" }
    end

    local db, db_err = sql.get("app:db")
    if db_err or not db then
        return { success = false, error = tostring(db_err or "database unavailable") }
    end
    local _, create_err = db:execute("CREATE TABLE IF NOT EXISTS " .. TABLE .. " (component_id TEXT PRIMARY KEY)")
    if create_err then
        db:release()
        return { success = false, error = tostring(create_err) }
    end

    local rows, query_err = db:query("SELECT component_id FROM " .. TABLE .. " WHERE component_id=$1", { component_id })
    if query_err then
        db:release()
        return { success = false, error = tostring(query_err) }
    end
    if rows and #rows > 0 then
        local _, delete_err = db:execute("DELETE FROM " .. TABLE .. " WHERE component_id=$1", { component_id })
        db:release()
        if delete_err then return { success = false, error = tostring(delete_err) } end
        return { success = true }
    end

    local _, insert_err = db:execute("INSERT INTO " .. TABLE .. " (component_id) VALUES ($1)", { component_id })
    db:release()
    if insert_err then return { success = false, error = tostring(insert_err) } end
    return { success = false, error = "first cleanup attempt fails for retry coverage" }
end

return { handle = handle }
