local M = {}
function M.reset(stage: string, source: error?)
    M.stage, M.source = stage, source
    M.reads, M.lists, M.releases, M.appends, M.emits = 0, 0, 0, 0, 0
end
function M.open_db(): (any, error?)
    return {release = function() M.releases = M.releases + 1; return true, nil end,
        query = function()
            M.reads = M.reads + 1
            if M.stage == "read" then return nil, M.source end
            if M.stage == "missing_rows" then return nil, nil end
            if M.stage == "scalar_rows" then return true, nil end
            if M.stage == "scalar_row" then return {true}, nil end
            if M.stage == "sparse_rows" then return {[2] = {id = "thread", thread_class = "lifecycle"}}, nil end
            if M.stage == "keyed_rows" then return {named = {id = "thread", thread_class = "lifecycle"}}, nil end
            if M.stage == "extra_rows" then return {{id = "thread", thread_class = "lifecycle"}, {id = "other", thread_class = "lifecycle"}}, nil end
            if M.stage == "class_mismatch" then return {{id = "thread", thread_class = "other"}}, nil end
            return {{id = "thread", thread_class = "lifecycle"}}, nil
        end}, nil
end
function M.list_system(...): (any, error?)
    M.lists = M.lists + 1
    if M.stage == "list" then return nil, M.source end
    if M.stage == "missing_components" then return nil, nil end
    if M.stage == "scalar_components" then return true, nil end
    if M.stage == "scalar_component" then return {true}, nil end
    if M.stage == "sparse_components" then return {[2] = {impl_id = "kickside.core.lifecycle:system_lifecycle"}}, nil end
    if M.stage == "keyed_components" then return {named = {impl_id = "kickside.core.lifecycle:system_lifecycle"}}, nil end
    if M.stage == "extra_components" then return {{impl_id = "kickside.core.lifecycle:system_lifecycle"}, {impl_id = "kickside.core.lifecycle:system_lifecycle"}}, nil end
    if M.stage == "empty_components" then return {}, nil end
    if M.stage == "impl_mismatch" then return {{impl_id = "other"}}, nil end
    return {{impl_id = "kickside.core.lifecycle:system_lifecycle"}}, nil
end
function M.ingest(db: any, writes: table[], ...): (any, error?)
    M.appends = M.appends + 1
    return {{thread_id = writes[1].thread_id, inserted = 1, duplicates = 0, max_seq = 1, events = {}}}, nil
end
function M.emit(...): error? M.emits = M.emits + 1; return nil end
function M.args(): table
    return {thread_id = "thread", audit = true,
        audit_thread = {impl_id = "kickside.core.lifecycle:system_lifecycle", thread_class = "lifecycle", audience_principal = {kind = "user", id = "principal"}},
        events = {{type = "kickside.lifecycle.events:principal.deleted", role = "system", body_json = "{}", external = {external_source = "lifecycle", external_id = "event"}}}}
end
return M
