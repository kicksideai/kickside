local sql = require("sql")
local json = require("json")
local M = {stage = "", source = nil, dbtype = "", existing = false,
    queries = 0, writes = 0, encodes = 0, begins = 0, commits = 0, rollbacks = 0, notifications = 0}
function M.reset(dbtype: string, stage: string, source: any, existing: boolean)
    M.dbtype, M.stage, M.source, M.existing = dbtype, stage, source, existing
    M.rollback_source, M.effect_id, M.proof_stage, M.proof = nil, nil, nil, nil
    M.body = '{"meta":{"worker_ref":"func://app:test_count_worker","worker_runtime":"func","worker_input_mode":"cursor_only"}}'
    M.retention_notifications = 0
    M.enqueue_value = "job"
    M.queries, M.writes, M.encodes, M.begins, M.commits, M.rollbacks, M.notifications = 0, 0, 0, 0, 0, 0, 0
end
local function query(): (any, error?)
    M.queries = M.queries + 1
    if M.proof_stage == "query_" .. tostring(M.queries) then return M.proof, nil end
    if M.stage == "query_" .. tostring(M.queries) then return nil, M.source end
    if M.queries == 1 then return {{id = "thread", event_count = 0, max_pruned_seq = 0}}, nil end
    if not M.existing then return {}, nil end
    if M.queries == 2 then return {{id = "projection", body = M.body}}, nil end
    return {{id = "cursor", last_seq = 0, generation = 1, job_id = "job"}}, nil
end
local function exec(): (any, error?)
    M.writes = M.writes + 1
    if M.proof_stage == "write_" .. tostring(M.writes) then return M.proof, nil end
    if M.stage == "write_" .. tostring(M.writes) then return nil, M.source end
    return {rows_affected = 1}, nil
end
local function builder(method: string, ...: any): any
    local native: any = sql.builder[method](...)
    local wrapper: any = {}
    setmetatable(wrapper, {__index = function(_self: any, name: string): any
        return function(_query: any, ...: any): any
            native = native[name](native, ...)
            return wrapper
        end
    end})
    function wrapper:run_with(_db: any): any return {query = query, exec = exec} end
    return wrapper
end
function M.select(...: any): any return builder("select", ...) end
function M.insert(...: any): any return builder("insert", ...) end
function M.update(...: any): any return builder("update", ...) end
function M.encode(value: any): (any, error?)
    M.encodes = M.encodes + 1
    if M.stage == "encode_" .. tostring(M.encodes) then return nil, M.source end
    return json.encode(value)
end
local function completion(stage: string, value: any): (any, error?)
    if M.proof_stage == stage then return M.proof, nil end
    if M.stage == stage then return nil, M.source end
    return value, nil
end
local function durable_effect()
    if not M.effect_id then return end
    local db, err = sql.get("app:db")
    if err then error(err) end
    if not db then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "registration guard database absent"})) end
    local _, write_err = db:execute("UPDATE kickside_thread SET component_id=component_id || 'x' WHERE id=$1", {M.effect_id})
    local _, close_err = db:release()
    if write_err then error(write_err) end
    if close_err then error(close_err) end
end
function M.database(): any
    local tx = {
        commit = function(_self: any): (any, error?)
            M.commits = M.commits + 1
            durable_effect()
            return completion("commit", true)
        end,
        rollback = function(_self: any): (any, error?)
            M.rollbacks = M.rollbacks + 1
            if M.rollback_source then return nil, M.rollback_source end
            return completion("rollback", true)
        end,
    }
    return {
        type = function(_self: any): (any, error?)
            return completion("type", M.dbtype)
        end,
        begin = function(_self: any): (any, error?)
            M.begins = M.begins + 1
            return completion("begin", tx)
        end,
    }
end
function M.enqueue_job(...: any): (any, error?)
    if M.stage == "enqueue" then return M.enqueue_value, M.source end
    return "job", nil
end
function M.nudge_workers(...: any): (any, error?)
    M.notifications = M.notifications + 1
    return completion("nudge", 0)
end
function M.notify(...: any): (any, error?)
    M.retention_notifications = M.retention_notifications + 1
    return completion("retention", false)
end
return M
