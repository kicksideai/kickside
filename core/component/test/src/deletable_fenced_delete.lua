-- Harness deletable cleanup that stands in for a consumer writing to the
-- component's backing data while the delete runs: inside its own transaction it
-- asks the component fence whether the write may land. Cleanup succeeds only
-- when the fence refuses it as NOT_FOUND.
local sql = require("sql")
local ctx = require("ctx")
local component = require("component")

local DB = "app:db"

local function handle(_request: any): any
    local component_id = ctx.get("component_id")
    if type(component_id) ~= "string" or component_id == "" then
        return { success = false, error = "component_id is required" }
    end
    local db, err = sql.get(DB)
    if err or not db then return { success = false, error = tostring(err or "database unavailable") } end
    local tx, tx_err = db:begin()
    if tx_err or not tx then
        db:release()
        return { success = false, error = tostring(tx_err) }
    end
    local fence_err = component.fence(tx, component_id :: string, DB)
    tx:rollback()
    db:release()
    if fence_err == nil then
        return { success = false, error = "the fence admitted a write while the component was being deleted" }
    end
    if not errors.is(fence_err, errors.NOT_FOUND) then
        return { success = false, error = "the fence failed: " .. tostring(fence_err) }
    end
    return { success = true }
end

return { handle = handle }
