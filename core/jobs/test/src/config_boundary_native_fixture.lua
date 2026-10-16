local M: any = {sequence = 0}
function M.reset(stage, source, meta)
    M.stage, M.source, M.meta = stage, source, meta
    M.sequence = M.sequence + 1
end
function M.current_version()
    if M.stage == "version" then return nil, M.source end
    if M.stage == "version_missing" then return nil, nil end
    return {id = function() return "config-boundary-" .. tostring(M.sequence) end}, nil
end
function M.get(id)
    local stage = id == "kickside.core.jobs:db_config" and "database"
        or id == "kickside.core.jobs:process_config" and "host" or "policy"
    if M.stage == stage then return nil, M.source end
    if M.stage == stage .. "_missing" then return nil, nil end
    if M.stage == stage .. "_malformed" then return {meta = {db_id = false, host_id = false}}, nil end
    if stage == "database" then return {meta = {db_id = "fixture-db"}}, nil end
    if stage == "host" then return {meta = {host_id = "fixture-host"}}, nil end
    return {meta = M.meta}, nil
end
return M
