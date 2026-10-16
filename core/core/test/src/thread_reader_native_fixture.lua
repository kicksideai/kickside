local sql = require("sql")
local json = require("json")
local M: any = {}
function M.reset(route: any, source: any)
    M.stage, M.fail_at, M.source = route.stage, route.fail_at or 1, source
    M.queries, M.missing, M.proof = 0, false, nil
    M.row = {id = "thread", component_id = "component", thread_class = "reader", attrs = "{}",
        max_pruned_seq = 0, event_count = 1, seq = 1, subject_version = 1}
end
function M.outcome(stage: string, value: any): (any, error?)
    if M.stage == stage then
        if M.missing then return M.proof, nil end
        return nil, M.source
    end
    return value, nil
end
function M.select(...: any): any
    local native: any = sql.builder.select(...)
    local wrapper: any = {}
    setmetatable(wrapper, {__index = function(_self: any, method: string): any
        return function(_query: any, ...: any): any
            native = native[method](native, ...)
            return wrapper
        end
    end})
    function wrapper:run_with(_db: any): any
        return {query = function(_self: any): (any, error?)
            M.queries = M.queries + 1
            if M.queries == M.fail_at then return M.outcome("query", {M.row}) end
            return {M.row}, nil
        end}
    end
    return wrapper
end
function M.database(): any
    return {type = function(_self: any): (any, error?) return M.outcome("type", sql.type.SQLITE) end}
end
function M.decode(raw: any): (any, error?)
    if M.stage == "decode" then return M.outcome("decode", nil) end
    return json.decode(raw)
end
function M.has_access(...: any): (any, error?) return M.outcome("access", true) end
function M.list_thread_components(...: any): (any, error?, any)
    local ids, err = M.outcome("scope", {"component"})
    return ids, err, {}
end
function M.validate_subject(_subject: any): error?
    if M.stage == "subject_shape" then return M.source end
    return nil
end
function M.version(...: any): (any, error?) return M.outcome("subject_version", 1) end
return M
