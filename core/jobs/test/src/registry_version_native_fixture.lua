local M: any = {}
function M.reset(stage, source) M.stage, M.source = stage, source end
function M.current_version()
    if M.stage == "dependency" then return nil, M.source end
    if M.stage == "missing" then return nil, nil end
    if M.stage == "method" then return {}, nil end
    return {id = function()
        if M.stage == "boolean" then return false end
        if M.stage == "numeric" then return 17 end
        if M.stage == "empty" then return "" end
        return "fixture-version"
    end}, nil
end
return M
