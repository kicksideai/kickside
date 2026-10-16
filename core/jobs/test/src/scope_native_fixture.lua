local sql = require("sql")
local error_envelope = require("error_envelope")
local M: any = {}
function M.reset(route, stage, source, release_source)
    M.route, M.stage, M.source, M.release_source = route, stage, source, release_source
    M.missing, M.value, M.durable = false, nil, false
    M.opens, M.releases, M.operations, M.effects = 0, 0, 0, 0
end
function M.result(stage, value)
    if stage == M.stage then
        if M.missing then return M.value, nil end
        return nil, M.source
    end
    return value, nil
end
function M.db_id() return "app:db" end
function M.get(...)
    M.opens = M.opens + 1
    return M.result("get", M.database())
end
function M.database(): any
    local db: any = {}
    function db:type() return M.result("type", sql.type.SQLITE) end
    function db:release()
        M.releases = M.releases + 1
        if M.release_source then return nil, M.release_source end
        return M.result("release", true)
    end
    return db
end
local function operation(value)
    M.operations = M.operations + 1
    if M.stage == "operation" then return nil, M.source end
    if M.route == "sweep" or M.route == "page" then M.effects = M.effects + 1 end
    if M.durable then
        local db, err = sql.get("app:db")
        if err then return nil, err end
        if not db then return nil, errors.new({kind = errors.INTERNAL, retryable = false, message = "scope probe has no database"}) end
        local _, write_err = db:execute("UPDATE native_scope_effect SET n=n+1 WHERE id=$1", {"effect"})
        local _, release_err = db:release()
        if write_err and release_err then return nil, error_envelope.wrap_secondary(release_err, write_err, "scope effect release failed") end
        if write_err then return nil, write_err end
        if release_err then return nil, release_err end
    end
    return value, nil
end
function M.get_job(...) return operation({id = "job"}) end
function M.job_still_running(...) return operation(true) end
function M.sweep(...) return operation({processed = 1}) end
function M.page(...) return operation({processed = 1, done = true}) end
return M
