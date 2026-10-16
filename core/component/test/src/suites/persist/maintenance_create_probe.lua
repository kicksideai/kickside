local sql = require("sql")
local ops = require("ops")
local placement_ops = require("placement_ops")

local function run(component_id: string): any
    local d, db_err = sql.get("app:db")
    if db_err or not d then error("probe db: " .. tostring(db_err)) end
    local tx, begin_err = d:begin()
    if begin_err or not tx then d:release(); error("probe tx: " .. tostring(begin_err)) end
    local _, err = placement_ops.create_component(tx, d, {
        type = ops.COMMAND_TYPES.CREATE_COMPONENT,
        payload = { component_id = component_id, impl_id = "kickside.test:security", actor_id = "system:automation" },
    })
    if err then tx:rollback() else tx:commit() end
    d:release()
    if err then return { created = false, kind = (err :: any):kind(), message = tostring(err) } end
    return { created = true }
end

return { run = run }
