local M = {}
local stored = {marker = "kept"}
function M.reset(stage: string, source: error?) M.stage, M.source, M.validations, M.rows = stage, source, 0, 0 end
function M.context(...)
    if M.stage == "read" then return nil, M.source end
    if M.stage == "missing_context" then return nil, nil end
    if M.stage == "scalar_context" then return "opaque", nil end
    if M.stage == "absent" then return {}, nil end
    return {_execution_identity = stored}, nil
end
function M.validate(...)
    M.validations = M.validations + 1
    if M.stage == "validate" then return false, M.source end
    if M.stage == "validate_success_error" then return true, M.source end
    if M.stage == "missing_validation" then return false, nil end
    return true, nil
end
function M.to_row(...)
    M.rows = M.rows + 1
    if M.stage == "row" then return nil, M.source end
    if M.stage == "missing_row" then return nil, nil end
    if M.stage == "scalar_row" then return "opaque", nil end
    return {actor_id = "actor", marker = "kept"}, nil
end
return M
