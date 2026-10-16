local M = {}
M.ID = "018fa746-bd62-7000-a000-000000000001"
function M.reset(stage: string, source: error?)
    M.stage, M.source, M.reads, M.lookups = stage, source, 0, 0
end
function M.query(...)
    M.reads = M.reads + 1
    if M.stage == "read" then return nil, M.source end
    return {{id = M.ID, component_id = M.ID, thread_class = "guard_class"}}, nil
end
function M.database(): any return {query = M.query} end
function M.get(id: string): (any, error?)
    M.lookups = M.lookups + 1
    if (M.stage == "kind" and id == "guard:component") or (M.stage == "event" and id == "guard:event")
        or (M.stage == "output" and id == "guard:output") then return nil, M.source end
    if M.stage == "absent_kind" and id == "guard:component" then return nil, nil end
    if M.stage == "absent_event" and id == "guard:event" then return nil, nil end
    if id == "guard:event" then
        return {meta = {type = "kickside.core.threads.event", output_kind = "guard:output"}}, nil
    end
    return {kind = "contract.binding", meta = {class = {"guard_class"}, events = {
        input = {{type = "guard:input"}}, output = id == "guard:output" and {{type = "guard:event", system_only = false}} or {}}}}, nil
end
function M.list_system(...): (any, error?) return {{impl_id = "guard:component"}}, nil end
function M.validate_access(...): (any, error?) return true, nil end
function M.scope(): any return {} end
function M.can(...): boolean return true end
function M.actor_id(): string return "guard_actor" end
function M.is_maintenance_actor(): boolean return false end
return M
