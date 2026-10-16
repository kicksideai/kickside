local native = require("native")
local transition = require("transition")
local job_types = require("job_types")
local M: any = {NULL = native.NULL}
function M.reset(route, stage, source)
    M.route, M.stage, M.source = route, stage, source
    M.missing, M.value, M.primary = false, nil, nil
    M.queries, M.updates, M.rollbacks, M.commits, M.notifications = 0, 0, 0, 0, 0
end
function M.result(stage, value)
    if stage == M.stage then
        if M.missing then return M.value, nil end
        return nil, M.source
    end
    if stage == "size" and M.primary then return nil, M.primary end
    return value, nil
end
function M.policy() return M.result("policy", {worker_claim_batch = 16, max_row_bytes = 4096, lease_timeout_seconds = 45}) end
function M.now_string(...) return "2026-10-10T00:00:00Z" end
function M.future_string(...) return "2026-10-10T00:01:00Z" end
function M.rows_affected(value) return transition.rows_affected(value) end
function M.check_update(...): error? local _, err = M.result("size", true); return err end
function M.clear(...): error? local _, err = M.result("marker", true); return err end
function M.finalize_job_run(...): error? local _, err = M.result("finalize", true); return err end
function M.child_alive(...) return M.result("alive", M.route == "live") end
function M.notify(...)
    M.notifications = M.notifications + 1
    return M.result("notify", true)
end
local function row()
    return {id = "job", job_id = "job", lease_token = "token", execution_seq = 1,
        last_error = job_types.TERMINATION_PENDING_PREFIX .. "token", owner_kind = "thread", owner_id = "thread"}
end
function M.database(): any
    local db: any = {}
    function db:begin() return M.result("begin", self) end
    function db:rollback() M.rollbacks = M.rollbacks + 1; return M.result("rollback", true) end
    function db:commit() M.commits = M.commits + 1; return M.result("commit", true) end
    function db:query(...)
        M.queries = M.queries + 1
        if M.route == "many" and M.queries == 1 then return M.result("lookup", {row()}) end
        return M.result("history", {{id = "run", status = "running", lease_token = "token", started_at_unix = 1}})
    end
    return db
end
function M.builder(): any
    local q: any = {}
    function q:from(...) return self end
    function q:where(...) return self end
    function q:order_by(...) return self end
    function q:limit(...) return self end
    function q:suffix(...) return self end
    function q:set(...) return self end
    function q:run_with(...) return self end
    function q:query() return M.result("lookup", {row()}) end
    function q:exec()
        M.updates = M.updates + 1
        local stage = (M.route == "one" or M.route == "many" or M.updates == 2) and "history_update" or "update"
        return M.result(stage, {rows_affected = 1})
    end
    return q
end
return M
