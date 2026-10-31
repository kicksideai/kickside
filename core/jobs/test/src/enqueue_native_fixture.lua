local json = require("json")
local policy = require("config")
local M: any = {}
function M.reset(route, stage, source)
    M.route, M.stage, M.source, M.missing, M.primary = route, stage, source, false, nil
    M.value, M.queries, M.inserts, M.rollbacks, M.commits = nil, 0, 0, 0, 0
end
function M.result(stage, value)
    if M.stage == stage then
        if M.missing then return M.value, nil end
        return nil, M.source
    end
    if stage == "lookup" and M.primary then return nil, M.primary end
    return value, nil
end
function M.policy() return M.result("policy", policy.policy()) end
function M.normalize(value) return M.result("trace", value) end
function M.check(...) if M.stage == "size" then return M.source end; return nil end
M.check_job_insert = M.check
function M.admit(...) if M.stage == "fence" then return M.source end; return nil end
function M.encode(value) if M.stage == "encode" then return M.result("encode", nil) end; return json.encode(value) end
function M.decode(value) if M.stage == "decode" then return M.result("decode", nil) end; return json.decode(value) end
function M.now(...) return "2026-10-10T00:00:00.000000Z" end
function M.parse(...) return M.result("parse", {}) end
function M.format(...) return M.now() end
function M.existing()
    return {id = "existing", job_type = "guard", payload = "{}", owner_kind = "test", owner_id = "owner"}
end
function M.query()
    M.queries = M.queries + 1
    local stage = M.queries == 1 and "lookup" or "conflict"
    local rows = (M.route == "existing" or M.queries > 1) and {M.existing()} or {}
    return M.result(stage, rows)
end
function M.insert()
    M.inserts = M.inserts + 1
    return M.result("insert", {rows_affected = M.route == "race" and 0 or 1})
end
function M.executor(): any
    local tx: any = {}
    function tx:db_type() return "sqlite", nil end
    function tx:rollback() M.rollbacks = M.rollbacks + 1; return M.result("rollback", true) end
    function tx:commit() M.commits = M.commits + 1; return M.result("commit", true) end
    return tx
end
function M.database(): any
    local db: any = {}
    function db:begin() return M.result("begin", M.executor()) end
    return db
end
function M.resolve_from(...) return M.policy() end
return M
