local http = require("http")
local sql = require("sql")

local DB_RESOURCE = "app:db"
local PROBE_QUERY = "SELECT 1"

local function probe_database(sql_module)
    local db, get_err = sql_module.get(DB_RESOURCE)
    if get_err or not db then
        if db and db.release then
            db:release()
        end
        return false
    end

    local _, query_err = db:query(PROBE_QUERY)
    db:release()
    return query_err == nil
end

local function handler()
    local res = http.response()
    if not res then
        return nil, "Failed to get HTTP context"
    end

    res:set_content_type("application/json")
    if not probe_database(sql) then
        res:set_status(http.STATUS.SERVICE_UNAVAILABLE)
        res:write_json({ status = "unhealthy" })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json({ status = "healthy" })
end

return {
    handler = handler,
    probe_database = probe_database,
}
