local M = {}
function M.reset(stage: string, source: error?, secondary: error?, present: boolean?)
    M.stage, M.source, M.secondary, M.present = stage, source, secondary, present
    M.opens, M.reads, M.releases, M.effects = 0, 0, 0, 0
end
function M.open_db(): (any, error?)
    M.opens = M.opens + 1
    if M.stage == "open" then return nil, M.source end
    return {release = function()
        M.releases = M.releases + 1
        if M.stage == "release" then return nil, M.source end
        return nil, M.secondary
    end}, nil
end
function M.get(...)
    M.reads = M.reads + 1
    if M.stage == "read" then return nil, M.source, M.present == true end
    if M.stage == "missing" then return nil, nil, false end
    return {id = "thread", marker = "kept"}, nil, true
end
function M.effect(...)
    M.effects = M.effects + 1
    return nil, errors.new({kind = errors.INTERNAL, retryable = false, message = "unexpected effect after lookup failure", details = {code = "unexpected_lookup_effect"}})
end
return M
