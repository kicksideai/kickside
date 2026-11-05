local sql = require("sql")
local ctx = require("ctx")
local funcs = require("funcs")

local function handle(_request: any): any
    local cid = ctx.get("component_id")
    local db, open_err = sql.get("app:db")
    if open_err or not db then return { success = false, error = tostring(open_err) } end
    local _, create_err = db:execute([[CREATE TABLE IF NOT EXISTS retention_cleanup_entry
        (component_id TEXT PRIMARY KEY, calls INTEGER NOT NULL)]])
    if create_err then db:release(); return { success = false, error = tostring(create_err) } end
    local entered, enter_err = db:execute([[INSERT INTO retention_cleanup_entry(component_id,calls)
        VALUES ($1,1) ON CONFLICT (component_id) DO UPDATE SET calls=retention_cleanup_entry.calls+1]], { cid })
    local rows, read_err = db:query("SELECT calls FROM retention_cleanup_entry WHERE component_id=$1", { cid })
    db:release()
    if read_err then return { success = false, error = tostring(read_err) } end
    if enter_err or not entered then return { success = false, error = tostring(enter_err) } end
    if tonumber(rows[1].calls) == 1 then
        local result, err = funcs.call("kickside.component:retention", {
            change = { kind = "pin_advanced", owner_locator = { kind = "component", id = cid } },
        })
        if err or not result or result.success ~= true then
            return { success = false, error = tostring(err or (result and result.error)) }
        end
        if result.deleted ~= 0 then return { success = false, error = "retention enters active cleanup" } end
    end
    return { success = true }
end

return { handle = handle }
