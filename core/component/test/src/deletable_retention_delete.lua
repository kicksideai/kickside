local sql = require("sql")
local ctx = require("ctx")
local funcs = require("funcs")

local function handle(_request: any): any
    local cid = ctx.get("component_id")
    local db, open_err = sql.get("app:db")
    if open_err or not db then return { success = false, error = tostring(open_err) } end
    local _, create_err = db:execute([[CREATE TABLE IF NOT EXISTS retention_cleanup_entry
        (component_id TEXT PRIMARY KEY)]])
    if create_err then db:release(); return { success = false, error = tostring(create_err) } end
    local entered, enter_err = db:execute([[INSERT INTO retention_cleanup_entry(component_id)
        VALUES ($1) ON CONFLICT (component_id) DO NOTHING]], { cid })
    db:release()
    if enter_err or not entered then return { success = false, error = tostring(enter_err) } end
    if entered.rows_affected == 1 then
        local result, err = funcs.call("kickside.component:retention", {
            change = { kind = "pin_advanced", owner_locator = { kind = "component", id = cid } },
        })
        if err or not result or result.success ~= true then
            return { success = false, error = tostring(err or (result and result.error)) }
        end
        if result.deleted ~= 0 or result.needs_continue then
            return { success = false, error = "retention enters an active delete" }
        end
        local token = ctx.get("lease_token")
        if type(token) ~= "string" or token == "" then return { success = false, error = "missing delete lease context" } end
    end
    return { success = true }
end

return { handle = handle }
