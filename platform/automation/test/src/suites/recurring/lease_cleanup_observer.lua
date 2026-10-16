-- Test-only retention owner runs after Component's hook. Its messages are
-- barriers on committed state, never a polling driver of production cleanup.
local sql = require("sql")
local process = require("process")
local M = {}
function M.run(): (table?, error?)
    local pid = process.registry.lookup("kickside.automation.recurring.fixture:delete_observer")
    if not pid then return { success = true, deleted = 0 }, nil end
    local db, open_err = sql.get("app:db")
    if open_err or not db then return nil, open_err end
    local rows, read_err = db:query([[SELECT w.component_id,w.phase,c.component_id AS present
        FROM recurring_cleanup_watch w LEFT JOIN kickside_components c ON CAST(c.component_id AS TEXT)=w.component_id]])
    if read_err then db:release(); return nil, read_err end
    for _, row in ipairs(rows or {}) do
        local phase = row.present == nil and "removed" or "held"
        if row.phase ~= phase then
            local _, update_err = db:execute("UPDATE recurring_cleanup_watch SET phase=$1 WHERE component_id=$2",
                { phase, row.component_id })
            if update_err then db:release(); return nil, update_err end
            local _, send_err = process.send(pid, "recurring.cleanup.observed", { id = row.component_id, phase = phase })
            if send_err then db:release(); return nil, send_err end
        end
    end
    db:release()
    return { success = true, deleted = 0 }, nil
end
return M
