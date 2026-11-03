-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local function add_fields(db, engine)
    local query = engine == "sqlite" and "PRAGMA table_info(workflow_def_nodes)"
        or "SELECT column_name AS name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'workflow_def_nodes'"
    local columns, read_err = db:query(query)
    if read_err then error("read workflow node columns: " .. tostring(read_err)) end
    local present = {}
    for _, column in ipairs(columns or {}) do present[column.name] = true end
    for _, field in ipairs({ "retry_policy", "start_to_close_timeout", "schedule_to_close_timeout" }) do
        if not present[field] then
            local _, err = db:execute("ALTER TABLE workflow_def_nodes ADD COLUMN " .. field .. " TEXT NOT NULL DEFAULT 'null'")
            if err then error("add workflow node " .. field .. ": " .. tostring(err)) end
        end
    end
end

return require("migration").define(function()
    migration("07 retry policy", function()
        for _, engine in ipairs({ "sqlite", "postgres" }) do
            database(engine, function()
                up(function(db) add_fields(db, engine) end)
            end)
        end
    end)
end)
