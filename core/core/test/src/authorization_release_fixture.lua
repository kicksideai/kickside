local M = {}
M.ID = "018fa746-bd62-7000-a000-000000000001"
function M.reset(stage: string, primary: error?, secondary: error?)
    M.stage, M.primary, M.secondary = stage, primary, secondary
    M.reads, M.releases, M.opens = 0, 0, 0
end
function M.query(...)
    M.reads = M.reads + 1
    if M.stage == "read" then return nil, M.primary end
    if M.stage == "missing_rows" then return nil, nil end
    if M.stage == "scalar_rows" then return true, nil end
    if M.stage == "scalar_row" then return {true}, nil end
    if M.stage == "sparse_rows" then return {[2] = {thread_class = "guard_class"}}, nil end
    if M.stage == "empty_rows" then return {}, nil end
    return {{thread_class = "guard_class"}}, nil
end
function M.database(): any
    return {query = M.query, release = function()
        M.releases = M.releases + 1
        if M.stage == "missing_release" then return nil, nil end
        return M.secondary and nil or true, M.secondary
    end}
end
function M.open_db(): (any, error?) M.opens = M.opens + 1; return M.database(), nil end
function M.get(id: string): (any, error?)
    if id == "guard:event" then return {meta = {type = "kickside.core.threads.event"}}, nil end
    return {kind = "contract.binding", meta = {events = {input = {}, output = {{type = "guard:event", system_only = false}}}}}, nil
end
function M.list_system(...): (any, error?) return {{impl_id = "guard:component"}}, nil end
function M.scope(): any return {} end
function M.can(...): boolean return true end
function M.actor_id(): string return "guard_actor" end
function M.is_maintenance_actor(): boolean return false end
return M
