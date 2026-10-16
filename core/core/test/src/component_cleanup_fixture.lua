local sql = require("sql")
local M: any = {}
function M.reset(method: string, stage: string, primary: error, secondary: error?)
    M.method, M.stage, M.primary, M.secondary, M.effect_id = method, stage, primary, secondary, nil
    M.release_source, M.emits, M.existing, M.completions, M.appends, M.stamps = nil, 0, false, 0, 0, 0
    M.opens, M.registers, M.removes, M.releases, M.reads = 0, 0, 0, 0, 0
end
function M.release(): (boolean, error?)
    M.releases = M.releases + 1
    if M.release_source and not ((M.method == "ensure_thread" or M.method == "emit" or M.existing) and M.opens == 1) then return false, M.release_source end
    return true, nil
end
function M.emit(...): error?
    M.emits = M.emits + 1
    if M.stage == "notify" then return M.primary end
    return nil
end
function M.stamp(...): error?
    M.stamps = M.stamps + 1
    if M.stage == "marker" then return M.primary end
    return nil
end
function M.open_db(): (any, error?)
    M.opens = M.opens + 1
    if M.removes > 0 or (M.method == "ensure_thread" and M.opens == 1) or (M.method == "upsert" and M.opens <= 2) then return {release = M.release}, nil end
    if M.stage == "open" then return nil, M.primary end
    return {release = M.release}, nil
end
function M.register(params: table, ...: any): (string?, error?)
    M.registers = M.registers + 1
    if M.effect_id then
        local db, err = sql.get("app:db")
        if err then return nil, err end
        if not db then return nil, errors.new({kind = errors.INTERNAL, retryable = false, message = "registration guard database absent"}) end
        local _, write_err = db:execute("UPDATE kickside_thread SET component_id = component_id || 'x' WHERE id=$1", {M.effect_id})
        local _, release_err = db:release()
        if release_err then return nil, release_err end
        if write_err then return nil, write_err end
    end
    return params.id or params.component_id, nil
end
function M.ensure(params: table, ...: any): (string?, boolean?, error?)
    local id, err = M.register(params)
    return id, err == nil, err
end
function M.remove(...): error?
    M.removes = M.removes + 1
    return M.secondary
end
function M.get(...)
    M.reads = M.reads + 1
    if M.existing then return {id = "thread", marker = "kept"}, nil, true end
    if M.removes > 0 or (M.stage == "attach_cleanup" and M.opens >= 3) then return {id = "thread", marker = "peer"}, nil, true end
    return nil, nil, false
end
function M.identity(...): (any, error?)
    if M.stage == "identity" then return nil, M.primary end
    return {system = false}, nil
end
function M.attach(...): (any, error?)
    if M.stage == "healthy" or M.stage == "marker" or M.stage == "notify" then return {thread = {id = "thread", thread_class = "class"}, component_id = "thread"}, nil end
    return nil, M.primary
end
function M.complete(...): error?
    M.completions = M.completions + 1
    if M.stage == "complete" then return M.primary end
    return nil
end
function M.append(...): (any, error?)
    M.appends = M.appends + 1
    return {thread_id = "thread", max_seq = 1}, nil
end
return M
