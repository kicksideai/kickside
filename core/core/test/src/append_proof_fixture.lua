local M = {}
function M.reset(stage: string, source: error?)
    M.stage, M.source, M.queries, M.inserts, M.executes = stage, source, 0, 0, 0
end
local function reply(stage: string, value: any): (any, error?)
    if M.stage == "missing_" .. stage then return nil, nil end
    if M.stage == "invalid_" .. stage then return true, nil end
    if M.stage == "invalid_row_" .. stage then return {true}, nil end
    if M.stage == "sparse_" .. stage then return {[2] = {id = "event", seq = 1}}, nil end
    if M.stage == "missing_count_" .. stage then return {}, nil end
    if M.stage == "negative_count_" .. stage then return {rows_affected = -1}, nil end
    if M.stage == "large_count_" .. stage then return {rows_affected = 2}, nil end
    if M.stage == "zero_count_" .. stage then return {rows_affected = 0}, nil end
    if M.stage == "fractional_count_" .. stage then return {rows_affected = 0.5}, nil end
    if M.stage == "empty_thread" and stage == "thread" then return {}, nil end
    if M.stage == "multiple_thread" and stage == "thread" then return {{event_count = 0},{event_count = 0}}, nil end
    if M.stage == "empty_dialect" and stage == "dialect" then return "", nil end
    return value, nil
end
function M.transaction(): any
    return {db_type = function()
        if M.stage == "dialect" then return nil, M.source end
        return reply("dialect", "sqlite")
    end, query = function(...)
        M.queries = M.queries + 1
        local stage = ({"thread", "ids", "external", "sequences"})[M.queries]
        if type(stage) ~= "string" then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "append proof fixture receives an undeclared query"})) end
        if M.stage == stage then return nil, M.source end
        if stage == "thread" then return reply(stage, {{event_count = 0, max_pruned_seq = 0}}) end
        return reply(stage, {})
    end, execute = function(...)
        M.executes = M.executes + 1
        local stage = M.executes == 1 and "subject_write" or "head"
        if M.stage == stage then return nil, M.source end
        return reply(stage, {rows_affected = 1})
    end}
end
function M.insert(...): (any, error?)
    M.inserts = M.inserts + 1
    if M.stage == "insert" then return nil, M.source end
    return reply("insert", {rows_affected = 1})
end
function M.created_at(...): (string?, error?)
    if M.stage == "created_at" then return nil, M.source end
    return "2026-10-11T00:00:00Z", nil
end
local builder = {}
function builder:columns(...) return self end
function builder:values(...) return self end
function builder:run_with(...) return self end
function builder:exec(...) return M.insert(...) end
function M.insert_builder(...) return builder end
function M.version(...): (integer?, error?) return 0, nil end
function M.policy(): (any, error?) return reply("policy", {max_row_bytes = 1048576}) end
function M.wake(...): (any, error?)
    if M.stage == "missing_generation" then return {}, nil end
    if M.stage == "invalid_generation" then return {demand_generation = true}, nil end
    return reply("wake", {demand_generation = 1, touched_count = 0})
end
return M
